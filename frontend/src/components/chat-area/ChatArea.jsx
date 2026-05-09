import React from "react";
import "./ChatArea.css";
import ChatAreaHeader from "../chat-area-header/ChatAreaHeader";
import ChatAreaBody from "../chat-area-body/ChatAreaBody";
import ChatAreaFooter from "../chat-area-footer/ChatAreaFooter";
import CallModal from "../call-modal/CallModal";
import { useContext, useState, useRef, useEffect } from "react";
import loggedInUserContext from "../../context/loggedInUserContext";
import startChatContext from "../../context/startChatContext";


function ChatArea({ socket }) {
  const { loggedInUser } = useContext(loggedInUserContext);
  const { startChatUserData } = useContext(startChatContext);

  const [callState, setCallState] = useState(null);
  // callState = { type: 'audio'|'video', direction: 'outgoing'|'incoming', callerName, callerPic, offer }

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerRef = useRef(null);

  const createPeer = () => {
    const peer = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    peer.onicecandidate = (e) => {
      if (e.candidate && startChatUserData) {
        socket.emit("ice-candidate", {
          to: startChatUserData.id,
          candidate: e.candidate,
        });
      }
    };

    peer.ontrack = (e) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = e.streams[0];
      }
    };

    return peer;
  };

  // Outgoing call
  const handleStartCall = async (callType) => {
    if (!startChatUserData) return;

    const constraints =
      callType === "video"
        ? { video: true, audio: true }
        : { video: false, audio: true };

    const stream = await navigator.mediaDevices.getUserMedia(constraints);

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = stream;
    }

    const peer = createPeer();
    peerRef.current = peer;

    stream.getTracks().forEach((track) => peer.addTrack(track, stream));

    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);

    socket.emit("call-user", {
      to: startChatUserData.id,
      from: loggedInUser._id,
      offer,
      callType,
      callerName: loggedInUser.username,
      callerPic: loggedInUser.file,
    });

    setCallState({
      type: callType,
      direction: "outgoing",
      callerName: startChatUserData.username,
      callerPic: startChatUserData.file,
    });
  };

  // Incoming call
  useEffect(() => {
    socket.on("incoming-call", async (data) => {
      setCallState({
        type: data.callType,
        direction: "incoming",
        callerName: data.callerName,
        callerPic: data.callerPic,
        offer: data.offer,
        from: data.from,
      });
    });

    socket.on("call-accepted", async (data) => {
      if (peerRef.current) {
        await peerRef.current.setRemoteDescription(
          new RTCSessionDescription(data.answer)
        );
      }
    });

    socket.on("call-rejected", () => {
      endCall();
    });

    socket.on("call-ended", () => {
      endCall();
    });

    socket.on("ice-candidate", async (data) => {
      if (peerRef.current && data.candidate) {
        await peerRef.current.addIceCandidate(
          new RTCIceCandidate(data.candidate)
        );
      }
    });

    return () => {
      socket.off("incoming-call");
      socket.off("call-accepted");
      socket.off("call-rejected");
      socket.off("call-ended");
      socket.off("ice-candidate");
    };
  }, [socket]);

  // Accept call
  const acceptCall = async () => {
    if (!callState) return;

    const constraints =
      callState.type === "video"
        ? { video: true, audio: true }
        : { video: false, audio: true };

    const stream = await navigator.mediaDevices.getUserMedia(constraints);

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = stream;
    }

    const peer = createPeer();
    peerRef.current = peer;

    stream.getTracks().forEach((track) => peer.addTrack(track, stream));

    await peer.setRemoteDescription(
      new RTCSessionDescription(callState.offer)
    );

    const answer = await peer.createAnswer();
    await peer.setLocalDescription(answer);

    socket.emit("call-accepted", {
      to: callState.from,
      answer,
    });

    setCallState((prev) => ({ ...prev, direction: "active" }));
  };

  // Reject call
  const rejectCall = () => {
    socket.emit("call-rejected", { to: callState.from });
    setCallState(null);
  };

  // End call
  const endCall = () => {
    if (peerRef.current) {
      peerRef.current.close();
      peerRef.current = null;
    }
    if (localVideoRef.current && localVideoRef.current.srcObject) {
      localVideoRef.current.srcObject
        .getTracks()
        .forEach((track) => track.stop());
      localVideoRef.current.srcObject = null;
    }
    if (remoteVideoRef.current && remoteVideoRef.current.srcObject) {
      remoteVideoRef.current.srcObject
        .getTracks()
        .forEach((track) => track.stop());
      remoteVideoRef.current.srcObject = null;
    }
    if (callState?.from) {
      socket.emit("call-ended", { to: callState.from });
    } else if (startChatUserData) {
      socket.emit("call-ended", { to: startChatUserData.id });
    }
    setCallState(null);
  };

  return (
    <div className="chat-area">
      <ChatAreaHeader socket={socket} onStartCall={handleStartCall} />
      <ChatAreaBody socket={socket} />
      <ChatAreaFooter socket={socket} />

      {/* Call Modal */}
      {callState && (
        <CallModal
          callState={callState}
          onAccept={acceptCall}
          onReject={rejectCall}
          onEnd={endCall}
          localVideoRef={localVideoRef}
          remoteVideoRef={remoteVideoRef}
        />
      )}
    </div>
  );
}

export default ChatArea;