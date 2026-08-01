import "./Home.css";
import { useCallback, useEffect, useContext, useState, useRef } from "react";
import ChatHeader from "../../components/chat-header/ChatHeader";
import ChatMain from "../../components/chat-main/ChatMain";
import CallModal from "../../components/call-modal/CallModal";
import { io } from "socket.io-client";
import loggedInUserContext from "../../context/loggedInUserContext";
import onlineUsersContext from "../../context/OnlineUsersContext";

const OnlineUsersContext = onlineUsersContext;
const socket = io(import.meta.env.VITE_BACKEND_URL);

const ringtone = new Audio("https://res.cloudinary.com/dzfqys9wk/video/upload/WhatsApp_Audio_2026-05-11_at_7.50.08_AM_bmzszh.mp3");
ringtone.loop = true;

function Home() {
  const [onlineusers, setOnlineUsers] = useState([]);
  const { loggedInUser } = useContext(loggedInUserContext);

  const [callState, setCallState] = useState(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const localStreamRef = useRef(null);
  const remoteStreamRef = useRef(null);
  const peerRef = useRef(null);
  const iceCandidateQueue = useRef([]);
  const callStateRef = useRef(null);
  const endCallRef = useRef(null);

  useEffect(() => {
    callStateRef.current = callState;
  }, [callState]);

  // Reattach both streams when call becomes active
  useEffect(() => {
    if (callState?.direction === "active") {
      if (localStreamRef.current && localVideoRef.current) {
        localVideoRef.current.srcObject = localStreamRef.current;
        localVideoRef.current.play().catch(() => {});
      }
      if (remoteStreamRef.current && remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = remoteStreamRef.current;
        remoteVideoRef.current.play().catch(() => {});
      }
    }
  }, [callState?.direction]);

  // ServiceWorker + Notification
  useEffect(() => {
    const setup = async () => {
      if ("serviceWorker" in navigator) {
        try {
          await navigator.serviceWorker.register("/sw.js");
        } catch (error) {
          console.error("Service worker registration failed:", error);
        }
      }
      if (Notification.permission !== "granted") {
        await Notification.requestPermission();
      }
    };
    setup();
  }, []);

  const showNotification = useCallback((title, body, icon) => {
    if (Notification.permission === "granted") {
      navigator.serviceWorker.ready
        .then((reg) => {
          reg.showNotification(title, {
            body,
            icon: icon || "/vite.svg",
            badge: "/vite.svg",
            vibrate: [500, 300, 500],
          });
        })
        .catch(() => {
          new Notification(title, { body, icon: icon || "/vite.svg" });
        });
    }
  }, []);

  const vibratePhone = useCallback(() => {
    if (navigator.vibrate) navigator.vibrate([500, 300, 500, 300, 500]);
  }, []);

  const stopVibrate = useCallback(() => {
    if (navigator.vibrate) navigator.vibrate(0);
  }, []);

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
      console.log("ontrack fired", e.streams);
      if (e.streams && e.streams[0]) {
        remoteStreamRef.current = e.streams[0];
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = e.streams[0];
          remoteVideoRef.current.play().catch(() => {});
        }
      }
    };

    peer.onconnectionstatechange = () => {
      console.log("Connection state:", peer.connectionState);
    };

    peer.onicegatheringstatechange = () => {
      console.log("ICE gathering:", peer.iceGatheringState);
    };

    return peer;
  };

  const drainQueue = async (peer) => {
    while (iceCandidateQueue.current.length > 0) {
      const candidate = iceCandidateQueue.current.shift();
      try {
        await peer.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (e) {
        console.error("drain queue error:", e);
      }
    }
  };

  const endCall = useCallback(() => {
    ringtone.pause();
    ringtone.currentTime = 0;
    stopVibrate();

    if (peerRef.current) {
      peerRef.current.close();
      peerRef.current = null;
    }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
    }
    if (remoteStreamRef.current) {
      remoteStreamRef.current.getTracks().forEach((t) => t.stop());
      remoteStreamRef.current = null;
    }
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;

    const current = callStateRef.current;
    if (current?.from) socket.emit("call-ended", { to: current.from });
    else if (current?.to) socket.emit("call-ended", { to: current.to });
    iceCandidateQueue.current = [];
    setCallState(null);
  }, [stopVibrate]);

  useEffect(() => {
    endCallRef.current = endCall;
  }, [endCall]);

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
      remoteStreamRef.current = null;
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
        } catch (e) {
          console.error("call-accepted error:", e);
        }
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
        } catch (e) {
          console.error("ICE candidate error:", e);
        }
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
  }, [loggedInUser?._id, showNotification, socket, stopVibrate, vibratePhone]);

  // Outgoing call
  const handleStartCall = async (callType, targetUser) => {
    if (!targetUser) return;
    try {
      const constraints =
        callType === "video"
          ? { video: true, audio: true }
          : { video: false, audio: true };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      localStreamRef.current = stream;

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
      console.error("handleStartCall error:", err);
      alert("Camera/mic access nahi mila.");
    }
  };

  // Accept incoming call — FIXED ORDER
  const acceptCall = async () => {
    ringtone.pause();
    ringtone.currentTime = 0;
    stopVibrate();
    if (!callStateRef.current) return;
    const cs = callStateRef.current;
    try {
      const constraints =
        cs.type === "video"
          ? { video: true, audio: true }
          : { video: false, audio: true };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      localStreamRef.current = stream;

      const peer = createPeer(cs.from);
      peerRef.current = peer;

      // Step 1: Remote description pehle set karo
      await peer.setRemoteDescription(new RTCSessionDescription(cs.offer));

      // Step 2: Tracks add karo
      stream.getTracks().forEach((track) => peer.addTrack(track, stream));

      // Step 3: ICE queue drain karo
      await drainQueue(peer);

      // Step 4: Answer banao
      const answer = await peer.createAnswer();
      await peer.setLocalDescription(answer);

      socket.emit("call-accepted", { to: cs.from, answer });
      setCallState((prev) => ({ ...prev, direction: "active" }));
    } catch (err) {
      console.error("acceptCall error:", err);
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
      <OnlineUsersContext.Provider value={{ onlineusers, setOnlineUsers }}>
        <ChatMain socket={socket} onStartCall={handleStartCall} />
      </OnlineUsersContext.Provider>

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

export default Home;