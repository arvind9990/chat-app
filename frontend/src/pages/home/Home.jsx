import "./Home.css";
import { useEffect, useContext, useState, useRef } from "react";
import ChatHeader from "../../components/chat-header/ChatHeader";
import ChatMain from "../../components/chat-main/ChatMain";
import CallModal from "../../components/call-modal/CallModal";
import { io } from "socket.io-client";
import loggedInUserContext from "../../context/loggedInUserContext";
import onlineUsersContext from "../../context/OnlineUsersContext";

const socket = io(import.meta.env.VITE_BACKEND_URL);

const ringtone = new Audio("https://res.cloudinary.com/dzfqys9wk/video/upload/WhatsApp_Audio_2026-05-11_at_7.50.08_AM_bmzszh.mp3");
ringtone.loop = true;

function Home() {
  const [onlineusers, setOnlineUsers] = useState([]);
  const { loggedInUser } = useContext(loggedInUserContext);

  const [callState, setCallState] = useState(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerRef = useRef(null);
  const iceCandidateQueue = useRef([]);
  const callStateRef = useRef(null);
  const endCallRef = useRef(null);

  useEffect(() => {
    callStateRef.current = callState;
  }, [callState]);

  // ServiceWorker + Notification setup
  useEffect(() => {
    const setup = async () => {
      if ("serviceWorker" in navigator) {
        try {
          await navigator.serviceWorker.register("/sw.js");
        } catch (e) {}
      }
      if (Notification.permission !== "granted") {
        await Notification.requestPermission();
      }
    };
    setup();
  }, []);

  const showNotification = (title, body, icon) => {
    if (Notification.permission === "granted") {
      navigator.serviceWorker.ready.then((reg) => {
        reg.showNotification(title, {
          body,
          icon: icon || "/vite.svg",
          badge: "/vite.svg",
          vibrate: [500, 300, 500],
        });
      }).catch(() => {
        new Notification(title, {
          body,
          icon: icon || "/vite.svg",
        });
      });
    }
  };

  const vibratePhone = () => {
    if (navigator.vibrate) {
      navigator.vibrate([500, 300, 500, 300, 500]);
    }
  };

  const stopVibrate = () => {
    if (navigator.vibrate) {
      navigator.vibrate(0);
    }
  };

  const createPeer = (targetId) => {
    const peer = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
        {
          urls: "turn:openrelay.metered.ca:80",
          username: "openrelayproject",
          credential: "openrelayproject",
        },
        {
          urls: "turn:openrelay.metered.ca:443",
          username: "openrelayproject",
          credential: "openrelayproject",
        },
      ],
    });

    peer.onicecandidate = (e) => {
      if (e.candidate && targetId) {
        socket.emit("ice-candidate", { to: targetId, candidate: e.candidate });
      }
    };

    peer.ontrack = (e) => {
      if (remoteVideoRef.current && e.streams[0]) {
        remoteVideoRef.current.srcObject = e.streams[0];
        remoteVideoRef.current.play().catch(() => {});
      }
    };

    return peer;
  };

  const drainQueue = async (peer) => {
    while (iceCandidateQueue.current.length > 0) {
      const candidate = iceCandidateQueue.current.shift();
      try {
        await peer.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (e) {}
    }
  };

  const endCall = () => {
    ringtone.pause();
    ringtone.currentTime = 0;
    stopVibrate();

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
    const current = callStateRef.current;
    if (current?.from) socket.emit("call-ended", { to: current.from });
    else if (current?.to) socket.emit("call-ended", { to: current.to });
    iceCandidateQueue.current = [];
    setCallState(null);
  };

  endCallRef.current = endCall;

  useEffect(() => {
    socket.emit("join-room", loggedInUser._id);

    socket.on("online", (onlineUsers) => setOnlineUsers(onlineUsers));
    socket.on("offline", (filteredIds) => setOnlineUsers(filteredIds));

    socket.on("received-message", (data) => {
      showNotification(
        "💬 New Message — Arvi Chat",
        data.message || "📷 Image received",
        null
      );
    });

    socket.on("incoming-call", (data) => {
      iceCandidateQueue.current = [];
      ringtone.play().catch(() => {});
      vibratePhone();
      showNotification(
        `📞 Incoming ${data.callType === "video" ? "Video" : "Audio"} Call`,
        `${data.callerName} is calling you...`,
        data.callerPic
      );
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
      ringtone.pause();
      ringtone.currentTime = 0;
      stopVibrate();
      if (peerRef.current) {
        try {
          await peerRef.current.setRemoteDescription(
            new RTCSessionDescription(data.answer)
          );
          await drainQueue(peerRef.current);
          setCallState((prev) => ({ ...prev, direction: "active" }));
        } catch (e) {}
      }
    });

    socket.on("call-rejected", () => endCallRef.current());
    socket.on("call-ended", () => endCallRef.current());

    socket.on("ice-candidate", async (data) => {
      if (!data.candidate) return;
      if (peerRef.current?.remoteDescription) {
        try {
          await peerRef.current.addIceCandidate(
            new RTCIceCandidate(data.candidate)
          );
        } catch (e) {}
      } else {
        iceCandidateQueue.current.push(data.candidate);
      }
    });

    return () => {
      socket.off("online");
      socket.off("offline");
      socket.off("received-message");
      socket.off("incoming-call");
      socket.off("call-accepted");
      socket.off("call-rejected");
      socket.off("call-ended");
      socket.off("ice-candidate");
    };
  }, []);

  const handleStartCall = async (callType, targetUser) => {
    if (!targetUser) return;
    try {
      const constraints = callType === "video"
        ? { video: true, audio: true }
        : { video: false, audio: true };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
        localVideoRef.current.play().catch(() => {});
      }

      const peer = createPeer(targetUser.id);
      peerRef.current = peer;
      stream.getTracks().forEach((track) => peer.addTrack(track, stream));

      const offer = await peer.createOffer();
      await peer.setLocalDescription(offer);

      socket.emit("call-user", {
        to: targetUser.id,
        from: loggedInUser._id,
        offer,
        callType,
        callerName: loggedInUser.username,
        callerPic: loggedInUser.file,
      });

      setCallState({
        type: callType,
        direction: "outgoing",
        callerName: targetUser.username,
        callerPic: targetUser.file,
        to: targetUser.id,
      });
    } catch (err) {
      alert("Camera/mic access nahi mila.");
    }
  };

  const acceptCall = async () => {
    ringtone.pause();
    ringtone.currentTime = 0;
    stopVibrate();
    if (!callStateRef.current) return;
    const cs = callStateRef.current;
    try {
      const constraints = cs.type === "video"
        ? { video: true, audio: true }
        : { video: false, audio: true };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
        localVideoRef.current.play().catch(() => {});
      }

      const peer = createPeer(cs.from);
      peerRef.current = peer;
      stream.getTracks().forEach((track) => peer.addTrack(track, stream));

      await peer.setRemoteDescription(new RTCSessionDescription(cs.offer));
      await drainQueue(peer);

      const answer = await peer.createAnswer();
      await peer.setLocalDescription(answer);

      socket.emit("call-accepted", { to: cs.from, answer });
      setCallState((prev) => ({ ...prev, direction: "active" }));
    } catch (err) {
      alert("Camera/mic access nahi mila.");
    }
  };

  const rejectCall = () => {
    ringtone.pause();
    ringtone.currentTime = 0;
    stopVibrate();
    socket.emit("call-rejected", { to: callStateRef.current?.from });
    setCallState(null);
  };

  return (
    <div className="home">
      <ChatHeader socket={socket} />
      <onlineUsersContext.Provider value={{ onlineusers, setOnlineUsers }}>
        <ChatMain socket={socket} onStartCall={handleStartCall} />
      </onlineUsersContext.Provider>

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

export default Home