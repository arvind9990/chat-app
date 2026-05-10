import { useState } from "react";
import "./ChatMain.css";
import ChatAside from "../chat-aside/ChatAside.jsx";
import ChatArea from "../chat-area/ChatArea.jsx";
import allChatContext from "../../context/allChatContext.js";
import startChatContext from "../../context/startChatContext.js";

function ChatMain({ socket, onStartCall }) {
  const [startChatUserData, setStartChatUserData] = useState(null);
  const [allChats, setAllChats] = useState(null);
  const [showChat, setShowChat] = useState(false);

  const isMobile = () => window.innerWidth <= 768;

  const handleSetStartChat = (data) => {
    setStartChatUserData(data);
    if (isMobile()) setShowChat(true);
  };

  const handleBack = () => {
    setShowChat(false);
    setStartChatUserData(null);
    setAllChats(null);
  };

  const handleStartCall = (callType) => {
    if (onStartCall && startChatUserData) {
      onStartCall(callType, startChatUserData);
    }
  };

  return (
    <allChatContext.Provider value={{ allChats, setAllChats }}>
      <startChatContext.Provider
        value={{
          startChatUserData,
          setStartChatUserData: handleSetStartChat,
        }}
      >
        <div className="chat-main">
          <div className={`aside-wrapper ${showChat ? "hide" : "show"}`}>
            <ChatAside socket={socket} />
          </div>
          <div className={`chat-wrapper ${showChat ? "show" : "hide-mobile"}`}>
            {showChat && isMobile() && (
              <button className="back-btn" onClick={handleBack}>
                ← Back
              </button>
            )}
            <ChatArea socket={socket} onStartCall={handleStartCall} />
          </div>
        </div>
      </startChatContext.Provider>
    </allChatContext.Provider>
  );
}

export default ChatMain;