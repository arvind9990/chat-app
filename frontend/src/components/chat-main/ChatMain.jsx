import { useState, useEffect } from "react";
import "./ChatMain.css";
import ChatAside from "../chat-aside/ChatAside.jsx";
import ChatArea from "../chat-area/ChatArea.jsx";
import allChatContext from "../../context/allChatContext.js";
import startChatContext from "../../context/startChatContext.js";

function ChatMain({ socket }) {
  const [startChatUserData, setStartChatUserData] = useState(null);
  const [allChats, setAllChats] = useState(null);
  const [showChat, setShowChat] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 480);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 480);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleSetStartChat = (data) => {
    setStartChatUserData(data);
    if (isMobile) setShowChat(true);
  };

  const handleBack = () => {
    setShowChat(false);
    setStartChatUserData(null);
    setAllChats(null);
  };

  return (
    <div className="chat-main">
      <allChatContext.Provider value={{ allChats, setAllChats }}>
        <startChatContext.Provider
          value={{
            startChatUserData,
            setStartChatUserData: handleSetStartChat,
          }}
        >
          {isMobile ? (
            <>
              {!showChat ? (
                <ChatAside socket={socket} />
              ) : (
                <div className="mobile-chat-wrapper">
                  <button className="back-btn" onClick={handleBack}>
                    ← Back
                  </button>
                  <ChatArea socket={socket} />
                </div>
              )}
            </>
          ) : (
            <>
              <ChatAside socket={socket} />
              <ChatArea socket={socket} />
            </>
          )}
        </startChatContext.Provider>
      </allChatContext.Provider>
    </div>
  );
}

export default ChatMain;