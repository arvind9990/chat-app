import React, { useContext, useState, useRef, useEffect, useCallback } from "react";
import "./ChatArea.css";
import ChatAreaHeader from "../chat-area-header/ChatAreaHeader";
import ChatAreaBody from "../chat-area-body/ChatAreaBody";
import ChatAreaFooter from "../chat-area-footer/ChatAreaFooter";
import CallModal from "../call-modal/CallModal";
import loggedInUserContext from "../../context/loggedInUserContext";
import startChatContext from "../../context/startChatContext";

function ChatArea({ socket }) {
  const { loggedInUser } = useContext(loggedInUserContext);
  const { startChatUserData } = useContext(startChatContext);

  const [callState, setCallState] = useState(null);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerRef = useRef(null);
  const startChatUserDataRef = useRef(startChatUserData);

  useEffect(() => {
    startChatUserDataRef.current = startChatUserData;
  }, [startChatUserData]);

  const createPeer = useCallback(() => {
    const peer = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
      ],
    });

    peer.onicecandidate = (e) => {
      if (e.candidate && startChatUserDataRef.current) {
        socket.emit("ice-candidate", {
          to: startChatUserDataRef.current.id,
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
  }, [socket]);

  const endCall = useCallback(() => {
    if (peerRef.current) {
      peerRef.current.close();
      peerRef.current = null;
    }
    if (localVideoRef.current?.srcObject) {
      localVideoRef.current.srcObject.getTracks().forEach((t) => t.stop());
      localVideoRef.current.srcObject = null;
    }
    if (remoteVideoRef.current?.srcObject) {
      remoteVideoRef.current.srcObject.getTracks().forEach((t) => t.stop());
      remoteVideoRef.current.srcObject = null;
    }
    setCallState((prev) => {
      if (prev?.from) {
        socket.emit("call-ended", { to: prev.from });
      } else if (startChatUserDataRef.current) {
        socket.emit("call-ended", { to: startChatUserDataRef.current.id });
      }
      return null;
    });
  }, [socket]);

  // Outgoing call
  const handleStartCall = async (callType) => {
    if (!startChatUserDataRef.current) return;

    try {
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
        to: startChatUserDataRef.current.id,
        from: loggedInUser._id,
        offer,
        callType,
        callerName: loggedInUser.username,
        callerPic: loggedInUser.file,
      });

      setCallState({
        type: callType,
        direction: "outgoing",
        callerName: startChatUserDataRef.current.username,
        callerPic: startChatUserDataRef.current.file,
      });
    } catch (err) {
      console.error("Camera/mic error:", err);
      alert("Camera ya microphone access nahi mila. Browser settings check karo.");
    }
  };

  // Socket listeners
  useEffect(() => {
    socket.on("incoming-call", (data) => {
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
      if (peerRef.current) {
        peerRef.current.close();
        peerRef.current = null;
      }
      if (localVideoRef.current?.srcObject) {
        localVideoRef.current.srcObject.getTracks().forEach((t) => t.stop());
        localVideoRef.current.srcObject = null;
      }
      setCallState(null);
    });

    socket.on("call-ended", () => {
      if (peerRef.current) {
        peerRef.current.close();
        peerRef.current = null;
      }
      if (localVideoRef.current?.srcObject) {
        localVideoRef.current.srcObject.getTracks().forEach((t) => t.stop());
        localVideoRef.current.srcObject = null;
      }
      if (remoteVideoRef.current?.srcObject) {
        remoteVideoRef.current.srcObject.getTracks().forEach((t) => t.stop());
        remoteVideoRef.current.srcObject = null;
      }
      setCallState(null);
    });

    socket.on("ice-candidate", async (data) => {
      if (peerRef.current && data.candidate) {
        try {
          await peerRef.current.addIceCandidate(
            new RTCIceCandidate(data.candidate)
          );
        } catch (e) {
          console.error("ICE candidate error:", e);
        }
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

    try {
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
    } catch (err) {
      console.error("Accept call error:", err);
      alert("Camera ya microphone access nahi mila.");
    }
  };

  const rejectCall = () => {
    socket.emit("call-rejected", { to: callState.from });
    setCallState(null);
  };

  return (
    <div className="chat-area">
      <ChatAreaHeader socket={socket} onStartCall={handleStartCall} />
      <ChatAreaBody socket={socket} />
      <ChatAreaFooter socket={socket} />

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