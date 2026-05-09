import { useContext, useState, useEffect, useRef } from "react";
import "./ChatAreaBody.css";
import allChatContext from "../../context/allChatContext";
import loggedInUserContext from "../../context/loggedInUserContext";
import startChatContext from "../../context/startChatContext";
import axios from "axios";
import { toast } from "react-toastify";

const isImageUrl = (text) => {
  return (
    /\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i.test(text) ||
    text.includes("cloudinary.com")
  );
};

const formatTime = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

function ChatAreaBody({ socket }) {
  const { allChats, setAllChats } = useContext(allChatContext);
  const { loggedInUser } = useContext(loggedInUserContext);
  const { startChatUserData } = useContext(startChatContext);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [allChats]);

  useEffect(() => {
    if (!startChatUserData || !loggedInUser) return;
    axios
      .put(`${import.meta.env.VITE_BACKEND_URL}/api/chats/mark-seen/${loggedInUser._id}/${startChatUserData.id}`)
      .then(() => {
        socket.emit("messages-seen", {
          senderId: startChatUserData.id,
          receiverId: loggedInUser._id,
        });
        setAllChats((prev) =>
          prev ? prev.map((chat) =>
            chat.senderId === startChatUserData.id ? { ...chat, seen: true } : chat
          ) : prev
        );
      })
      .catch(() => {});
  }, [startChatUserData, allChats?.length]);

  useEffect(() => {
    if (!socket) return;
    socket.on("messages-seen-ack", ({ seenBy }) => {
      if (seenBy === startChatUserData?.id) {
        setAllChats((prev) =>
          prev ? prev.map((chat) =>
            chat.senderId === loggedInUser._id ? { ...chat, seen: true } : chat
          ) : prev
        );
      }
    });
    return () => socket.off("messages-seen-ack");
  }, [socket, startChatUserData]);

  const handleDelete = (messageId) => {
    axios
      .delete(`${import.meta.env.VITE_BACKEND_URL}/api/chats/delete-message/${messageId}`)
      .then((res) => {
        if (res.data.ok) {
          setAllChats((prev) =>
            prev.map((chat) =>
              chat._id === messageId ? { ...chat, isDeleted: true } : chat
            )
          );
          toast.success("Message deleted", { autoClose: 1200 });
        } else {
          throw Error(res.data.error);
        }
      })
      .catch((error) => {
        toast.error(error.message, { autoClose: 1500 });
      })
      .finally(() => {
        setConfirmDeleteId(null);
      });
  };

  return (
    <div className="chat-area-body">
      {allChats && allChats.map((singleChat) => {
        const isSender = singleChat.senderId === loggedInUser._id;
        if (singleChat.isDeleted) return null;
        return (
          <div
            key={singleChat._id}
            className={isSender ? "senderMessage message" : "receiverMessage message"}
            style={{ position: "relative" }}
          >
            {isImageUrl(singleChat.message) ? (
              <img src={singleChat.message} alt="sent image" style={{ maxWidth: "250px", borderRadius: "8px" }} />
            ) : (
              <span>{singleChat.message}</span>
            )}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "4px", marginTop: "4px" }}>
              <span style={{ fontSize: "10px", opacity: 0.65, color: isSender ? "#fff" : "#555" }}>
                {singleChat.createdAt ? formatTime(singleChat.createdAt) : ""}
              </span>
              {isSender && (
                <span style={{ fontSize: "13px", lineHeight: 1 }}>
                  {singleChat.seen ? (
                    <svg width="18" height="11" viewBox="0 0 18 11" fill="none">
                      <path d="M1 5.5L4.5 9L10 2" stroke="#4FC3F7" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M6 5.5L9.5 9L15 2" stroke="#4FC3F7" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  ) : (
                    <svg width="12" height="11" viewBox="0 0 12 11" fill="none">
                      <path d="M1 5.5L4.5 9L11 2" stroke="rgba(255,255,255,0.6)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </span>
              )}
            </div>
            {isSender && (
              <span
                onClick={() => setConfirmDeleteId(singleChat._id)}
                title="Delete message"
                style={{
                  position: "absolute", top: "-8px", right: "-8px",
                  background: "#cc2222", color: "#fff", borderRadius: "50%",
                  width: "20px", height: "20px", fontSize: "11px",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", opacity: 0, transition: "opacity 0.2s",
                }}
                className="delete-btn"
              >✕</span>
            )}
            {confirmDeleteId === singleChat._id && (
              <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 }}>
                <div style={{ background: "#fff", borderRadius: "12px", padding: "24px 28px", textAlign: "center", minWidth: "220px", boxShadow: "0 8px 24px rgba(0,0,0,0.2)" }}>
                  <p style={{ marginBottom: "16px", fontWeight: 500 }}>Delete this message?</p>
                  <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
                    <button onClick={() => setConfirmDeleteId(null)} style={{ padding: "7px 20px", borderRadius: "20px", border: "1px solid #ccc", background: "transparent", cursor: "pointer", fontWeight: 500 }}>Cancel</button>
                    <button onClick={() => handleDelete(singleChat._id)} style={{ padding: "7px 20px", borderRadius: "20px", border: "none", background: "#cc2222", color: "#fff", cursor: "pointer", fontWeight: 500 }}>Delete</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
      <div ref={bottomRef} />
      <style>{`.message:hover .delete-btn { opacity: 1 !important; }`}</style>
    </div>
  );
}

export default ChatAreaBody;