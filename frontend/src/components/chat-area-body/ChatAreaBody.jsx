import { useContext, useEffect, useRef } from "react";
import "./ChatAreaBody.css";
import allChatContext from "../../context/allChatContext";
import loggedInUserContext from "../../context/loggedInUserContext";
import startChatContext from "../../context/startChatContext";

function ChatAreaBody() {
  const { allChats } = useContext(allChatContext);
  const { loggedInUser } = useContext(loggedInUserContext);
  const { startChatUserData } = useContext(startChatContext);
  const bottomRef = useRef(null);

  useEffect(() => {
    const scrollToBottom = () => {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    scrollToBottom();

    const images = document.querySelectorAll(".chat-area-body img");
    images.forEach((img) => img.addEventListener("load", scrollToBottom));

    return () => {
      images.forEach((img) => img.removeEventListener("load", scrollToBottom));
    };
  }, [allChats]);

  if (!startChatUserData) {
    return (
      <div className="chat-area-body empty-state">
        <p>Select a user to start chatting</p>
      </div>
    );
  }

  return (
    <div className="chat-area-body">
      {allChats && allChats.length > 0 ? (
        allChats.map((message) => {
          const isSender = message.senderId === loggedInUser?._id;
          const messageClass = isSender ? "senderMessage" : "receiverMessage";

          return (
            <div key={message._id || `${message.senderId}-${message.createdAt}`} className={`message ${messageClass}`}>
              {message.type === "image" ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <img
                    src={message.message}
                    alt="sent chat"
                    style={{ maxWidth: "240px", borderRadius: "12px" }}
                  />
                  <a
                    href={message.message}
                    download={`chat-image-${message._id || Date.now()}.png`}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      fontSize: "12px",
                      color: "#0b57d0",
                      textDecoration: "underline",
                      alignSelf: isSender ? "flex-end" : "flex-start",
                    }}
                  >
                    Download image
                  </a>
                </div>
              ) : (
                <span>{message.message}</span>
              )}
            </div>
          );
        })
      ) : (
        <div className="chat-area-body empty-state">
          <p1>No messages yet!</p1>
          <p2>Start a conversation!</p2>
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  );
}

export default ChatAreaBody;