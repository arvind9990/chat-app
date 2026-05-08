import { useRef, useContext, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import startChatContext from "../../context/startChatContext";
import "./ChatListUser.css";
import loggedInUserContext from "../../context/loggedInUserContext";
import allChatContext from "../../context/allChatContext";
import onlineUsersContext from "../../context/OnlineUsersContext";

function ChatListUser({
  username,
  email,
  file,
  id,
  index,
  selectChatListComp,
  selectedChatListComp,
  onUserDeleted,
}) {
  const { onlineusers } = useContext(onlineUsersContext);
  const chatListContainerRef = useRef(null);
  const profileRef = useRef(null);
  const usernameRef = useRef(null);
  const emailRef = useRef(null);
  const { setStartChatUserData } = useContext(startChatContext);
  const { loggedInUser } = useContext(loggedInUserContext);
  const { setAllChats } = useContext(allChatContext);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const startChat = () => {
    selectChatListComp(index);
    setStartChatUserData({ username: username, email: email, id: id, file: file });
    getAllChats();
  };

  const getAllChats = () => {
    axios
      .get(
        `https://chat-app-cpw1.onrender.com`
      )
      .then((res) => {
        if (res.data.ok) {
          setAllChats(res.data.result);
        } else {
          setAllChats(null);
          throw Error(res.data.error);
        }
      })
      .catch((error) => {
        toast.error(error, { autoClose: 2000 });
      });
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    axios
      .delete(`https://chat-app-cpw1.onrender.com`)
      .then((res) => {
        if (res.data.ok) {
          toast.success("User removed", { autoClose: 1200 });
          if (onUserDeleted) onUserDeleted(id);
        } else {
          throw Error(res.data.error);
        }
      })
      .catch((error) => {
        toast.error(error.message, { autoClose: 1500 });
      })
      .finally(() => {
        setConfirmDelete(false);
      });
  };

  return (
    <>
      <div
        onClick={startChat}
        className="chat-list-user-container"
        ref={chatListContainerRef}
        style={{
          backgroundColor: selectedChatListComp === index ? "green" : "white",
          position: "relative",
        }}
      >
        <div className="chat-list-user-image">
          <div
            ref={profileRef}
            id="profile"
            style={{
              color: selectedChatListComp === index ? "green" : "white",
              fontWeight: "bold",
            }}
          >
            <div
              id="mode"
              style={{
                backgroundColor: onlineusers.includes(id) ? "green" : "red",
              }}
            ></div>
            {/* ADD - Show user's actual profile image */}
            <img
              src={file || "https://cdn-icons-png.flaticon.com/512/4122/4122823.png"}
              alt={username}
              width="50"
              height="50"
              style={{ borderRadius: "50%", objectFit: "cover" }}
            />
          </div>
        </div>
        <div className="chat-list-user-details">
          <div>
            <h3
              style={{
                color: selectedChatListComp === index ? "white" : "green",
              }}
              ref={usernameRef}
            >
              {username}
            </h3>
          </div>
          <div>
            <p
              style={{
                color:
                  selectedChatListComp === index
                    ? "white"
                    : "rgba(116, 110, 110, 1)",
                fontWeight: "bold",
                fontStyle: "italic",
              }}
              ref={emailRef}
            >
              {email}
            </p>
          </div>
        </div>

        <span
          onClick={(e) => {
            e.stopPropagation();
            setConfirmDelete(true);
          }}
          title="Remove user"
          style={{
            position: "absolute",
            right: "10px",
            top: "50%",
            transform: "translateY(-50%)",
            background: "#cc2222",
            color: "#fff",
            borderRadius: "50%",
            width: "22px",
            height: "22px",
            fontSize: "12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            opacity: 0,
            transition: "opacity 0.2s",
          }}
          className="user-delete-btn"
        >
          ✕
        </span>
      </div>

      {confirmDelete && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: "12px",
              padding: "24px 28px",
              textAlign: "center",
              minWidth: "220px",
              boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
            }}
          >
            <p style={{ marginBottom: "16px", fontWeight: 500 }}>
              Remove <strong>{username}</strong> from chat list?
            </p>
            <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
              <button
                onClick={() => setConfirmDelete(false)}
                style={{
                  padding: "7px 20px",
                  borderRadius: "20px",
                  border: "1px solid #ccc",
                  background: "transparent",
                  cursor: "pointer",
                  fontWeight: 500,
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                style={{
                  padding: "7px 20px",
                  borderRadius: "20px",
                  border: "none",
                  background: "#cc2222",
                  color: "#fff",
                  cursor: "pointer",
                  fontWeight: 500,
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .chat-list-user-container:hover .user-delete-btn {
          opacity: 1 !important;
        }
      `}</style>
    </>
  );
}

export default ChatListUser;
