import { useRef, useContext, useEffect, useState } from "react";
import "./ChatAreaFooter.css";
import axios from "axios";
import { toast } from "react-toastify";
import allChatContext from "../../context/allChatContext";
import loggedInUserContext from "../../context/loggedInUserContext";
import startChatContext from "../../context/startChatContext";
import EmojiPicker from "emoji-picker-react";

function ChatAreaFooter({ socket }) {
  const messageRef = useRef(null);
  const imageRef = useRef(null);
  const [showEmoji, setShowEmoji] = useState(false);
  const { loggedInUser } = useContext(loggedInUserContext);
  const { startChatUserData } = useContext(startChatContext);
  const { setAllChats } = useContext(allChatContext);

  useEffect(() => {
    const handleReceived = (data) => {
      setAllChats((prevAllMessages) =>
        prevAllMessages ? [...prevAllMessages, data] : [data]
      );
    };

    socket.on("received-message", handleReceived);

    return () => {
      socket.off("received-message", handleReceived);
    };
  }, []);

  const sendMessage = () => {
    if (messageRef.current.value === "") {
      toast.error("Please Enter the Message", { autoClose: 1500 });
      return;
    }
    const msgText = messageRef.current.value;
    axios
      .post(`${import.meta.env.VITE_BACKEND_URL}/api/chats/new-message`, {
        userIds: [loggedInUser._id, startChatUserData.id],
        message: msgText,
        senderId: loggedInUser._id,
      })
      .then((res) => {
        if (res.data.ok) {
          const savedMessage = res.data.result;
          socket.emit("send-message", savedMessage);
          setAllChats((prev) => prev ? [...prev, savedMessage] : [savedMessage]);
          messageRef.current.value = "";
          setShowEmoji(false);
        } else {
          throw Error(res.data.error);
        }
      })
      .catch((error) => {
        toast.error(error.message, { autoClose: 1500 });
      });
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("image", file);
    formData.append("userId1", loggedInUser._id);
    formData.append("userId2", startChatUserData.id);
    formData.append("senderId", loggedInUser._id);
    axios
      .post(`${import.meta.env.VITE_BACKEND_URL}/api/chats/send-image`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((res) => {
        if (res.data.ok) {
          socket.emit("send-message", res.data.result);
          setAllChats((prev) => prev ? [...prev, res.data.result] : [res.data.result]);
          toast.success("Image Sent!", { autoClose: 1000 });
        } else {
          throw Error(res.data.error);
        }
      })
      .catch((error) => {
        toast.error(error.message, { autoClose: 1000 });
      });
  };

  return (
    <div className="chat-area-footer">
      <div className="emoji">
        <EmojiPicker
          onEmojiClick={(event) => { messageRef.current.value = messageRef.current.value + event.emoji; }}
          open={showEmoji}
          width={800}
          style={{ borderRadius: "12px", boxShadow: "0 8px 24px rgba(0,0,0,0.6)", padding: "8px", margin: "auto" }}
        />
      </div>
      <input
        ref={messageRef}
        type="text"
        placeholder="enter message"
        onKeyDown={(e) => { if (e.key === "Enter") sendMessage(); }}
      />
      <input type="file" accept="image/*" ref={imageRef} style={{ display: "none" }} onChange={handleImageChange} />
      <div className="chat-area-footer-icons">
        <i className="bi bi-image-fill" onClick={() => imageRef.current.click()}></i>
        <i className="bi bi-emoji-heart-eyes-fill" onClick={() => setShowEmoji(!showEmoji)}></i>
        <i className="bi bi-send-check" onClick={sendMessage}></i>
      </div>
    </div>
  );
}

export default ChatAreaFooter;