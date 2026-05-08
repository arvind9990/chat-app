import { useState } from "react";
import "./ChatMain.css";
import ChatAside from "../chat-aside/ChatAside.jsx";
import ChatArea from "../chat-area/ChatArea.jsx";
import allChatContext from "../../context/allChatContext.js";
import startChatContext from "../../context/startChatContext.js";

function ChatMain({ socket }) {
  const [startChatUserData, setStartChatUserData] = useState(null);
  const [allChats, setAllChats] = useState(null);

  return (
    <div className="chat-main">
      <allChatContext.Provider value={{ allChats, setAllChats }}>
        <startChatContext.Provider
          value={{ startChatUserData, setStartChatUserData }}
        >
          <ChatAside socket={socket} />
          <ChatArea socket={socket} />
        </startChatContext.Provider>
      </allChatContext.Provider>
    </div>
  );
}

export default ChatMain;