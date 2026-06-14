import { useEffect, useState } from "react";

function CallModal({
  callState,
  onAccept,
  onReject,
  onEnd,
  localVideoRef,
  remoteVideoRef,
}) {
  const [seconds, setSeconds] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const isIncoming = callState.direction === "incoming";
  const isVideo = callState.type === "video";

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    let timer;
    if (callState.direction === "active") {
      timer = setInterval(() => setSeconds((s) => s + 1), 1000);
    }
    return () => clearInterval(timer);
  }, [callState.direction]);

  const formatDuration = (s) => {
    const m = Math.floor(s / 60).toString().padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  };

  const videoHeight = isMobile ? "55vw" : "420px";
  const localW = isMobile ? "80px" : "130px";
  const localH = isMobile ? "60px" : "96px";

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.92)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 99999,
      padding: isMobile ? "10px" : "0",
    }}>
      <div style={{
        background: "#1a1a2e",
        borderRadius: "20px",
        padding: isMobile ? "14px" : "20px",
        textAlign: "center",
        width: "100%",
        maxWidth: isMobile ? "100%" : "780px",
        color: "#fff",
        boxShadow: "0 12px 40px rgba(0,0,0,0.6)",
      }}>

        {/* Caller info */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "12px",
          marginBottom: "12px",
        }}>
          <img
            src={callState.callerPic || "https://cdn-icons-png.flaticon.com/512/4122/4122823.png"}
            alt={callState.callerName}
            style={{
              width: isMobile ? "40px" : "48px",
              height: isMobile ? "40px" : "48px",
              borderRadius: "50%",
              objectFit: "cover",
              border: "2px solid #4FC3F7",
            }}
          />
          <div style={{ textAlign: "left" }}>
            <h3 style={{ margin: 0, fontSize: isMobile ? "15px" : "17px" }}>
              {callState.callerName}
            </h3>
            <p style={{ fontSize: "12px", color: "#aaa", margin: 0 }}>
              {isIncoming
                ? `Incoming ${isVideo ? "video" : "audio"} call...`
                : callState.direction === "outgoing"
                ? `Calling... (${isVideo ? "Video" : "Audio"})`
                : `${isVideo ? "Video" : "Audio"} call • ${formatDuration(seconds)}`}
            </p>
          </div>
        </div>

        {/* Active/Outgoing Video */}
        {isVideo && !isIncoming && (
          <div style={{
            position: "relative",
            width: "100%",
            marginBottom: "16px",
            borderRadius: "14px",
            overflow: "hidden",
            background: "#000",
          }}>
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              style={{
                width: "100%",
                height: videoHeight,
                objectFit: "cover",
                display: "block",
                borderRadius: "14px",
              }}
            />
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              style={{
                position: "absolute",
                bottom: "10px",
                right: "10px",
                width: localW,
                height: localH,
                borderRadius: "10px",
                objectFit: "cover",
                border: "2px solid #4FC3F7",
                background: "#222",
                boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
              }}
            />
          </div>
        )}

        {/* Incoming call placeholder */}
        {isVideo && isIncoming && (
          <div style={{
            width: "100%",
            height: isMobile ? "100px" : "120px",
            borderRadius: "14px",
            background: "#0d0d1a",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "16px",
            border: "1px solid #333",
          }}>
            <span style={{ fontSize: isMobile ? "32px" : "40px" }}>📹</span>
          </div>
        )}

        {/* Audio */}
        {!isVideo && (
          <>
            <audio ref={remoteVideoRef} autoPlay />
            <audio ref={localVideoRef} autoPlay muted />
          </>
        )}

        {/* Buttons */}
        <div style={{
          display: "flex",
          gap: "20px",
          justifyContent: "center",
          marginTop: "8px",
        }}>
          {isIncoming && (
            <button
              onClick={onAccept}
              style={{
                width: isMobile ? "52px" : "58px",
                height: isMobile ? "52px" : "58px",
                borderRadius: "50%",
                background: "#1D9E75",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 15px rgba(29,158,117,0.4)",
              }}
              title="Accept"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 10.5a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.62 0h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 7.91a16 16 0 0 0 6 6l.76-.76a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
            </button>
          )}

          <button
            onClick={isIncoming ? onReject : onEnd}
            style={{
              width: isMobile ? "52px" : "58px",
              height: isMobile ? "52px" : "58px",
              borderRadius: "50%",
              background: "#E24B4A",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 15px rgba(226,75,74,0.4)",
            }}
            title={isIncoming ? "Reject" : "End Call"}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M23.4 14.9l-4.1-1.7a1.5 1.5 0 0 0-1.7.4l-1.8 2.2a15.5 15.5 0 0 1-7.4-7.4L10.6 6.6a1.5 1.5 0 0 0 .4-1.7L9.3.8A1.5 1.5 0 0 0 7.6 0L2.1 1.4A1.5 1.5 0 0 0 1 2.9C1.6 14.5 9.7 22.5 21.1 23.1a1.5 1.5 0 0 0 1.5-1.1l1.4-5.4a1.5 1.5 0 0 0-.6-1.7z" fill="white" transform="rotate(135 12 12)"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export default CallModal;