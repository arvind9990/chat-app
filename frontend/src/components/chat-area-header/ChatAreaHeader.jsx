import { useContext, useState } from "react";
import startChatContext from "../../context/startChatContext";
import "./ChatAreaHeader.css";

function ChatAreaHeader({ socket, onStartCall }) {
  const { startChatUserData } = useContext(startChatContext);
  const [showBigImage, setShowBigImage] = useState(false);

  const handleCall = (callType) => {
    if (!startChatUserData) return;
    onStartCall(callType);
  };

  return (
    <div className="chat-area-header">
      <div className="leftHeaderPart">
        <img
          src={
            startChatUserData && startChatUserData.file
              ? startChatUserData.file
              : "https://cdn-icons-png.flaticon.com/512/4122/4122823.png"
          }
          alt={startChatUserData && startChatUserData.username}
          width={50}
          height={50}
          style={{ borderRadius: "50%", objectFit: "cover", cursor: "pointer" }}
          onClick={() => setShowBigImage(true)}
        />
        <h2>{startChatUserData && startChatUserData.username}</h2>
      </div>

      <div className="rightHeaderPart">
        {/* Audio call button */}
        <i
          className="bi bi-telephone-inbound-fill"
          style={{ cursor: "pointer", fontSize: "20px", marginRight: "12px" }}
          onClick={() => handleCall("audio")}
          title="Audio Call"
        ></i>
        {/* Video call button */}
        <i
          className="bi bi-camera-video-fill"
          style={{ cursor: "pointer", fontSize: "20px" }}
          onClick={() => handleCall("video")}
          title="Video Call"
        ></i>
      </div>

      {showBigImage && (
        <div
          onClick={() => setShowBigImage(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            cursor: "pointer",
          }}
        >
          <img
            src={
              startChatUserData && startChatUserData.file
                ? startChatUserData.file
                : "https://cdn-icons-png.flaticon.com/512/4122/4122823.png"
            }
            alt={startChatUserData && startChatUserData.username}
            style={{
              width: "300px",
              height: "300px",
              borderRadius: "50%",
              objectFit: "cover",
              border: "4px solid white",
            }}
          />
        </div>
      )}
    </div>
  );
}

export default ChatAreaHeader;