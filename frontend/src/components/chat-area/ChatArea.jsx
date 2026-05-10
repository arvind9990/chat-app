import React from "react";
import "./ChatArea.css";
import ChatAreaHeader from "../chat-area-header/ChatAreaHeader";
import ChatAreaBody from "../chat-area-body/ChatAreaBody";
import ChatAreaFooter from "../chat-area-footer/ChatAreaFooter";

function ChatArea({ socket, onStartCall }) {
  return (
    <div className="chat-area">
      <ChatAreaHeader socket={socket} onStartCall={onStartCall} />
      <ChatAreaBody socket={socket} />
      <ChatAreaFooter socket={socket} />
    </div>
  );
}

export default ChatArea;