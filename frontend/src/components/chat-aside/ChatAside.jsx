import { useEffect, useContext, useState } from "react";
import "./ChatAside.css";
import ChatSearch from "../chat-search/ChatSearch.jsx";
import ChatListUser from "../chat-list-user/ChatListUser.jsx";
import { getAllUsers } from "./ChatAside.js";
import loggedInUserContext from "../../context/loggedInUserContext.js";
import onlineUsersContext from "../../context/OnlineUsersContext.js";

function ChatAside({ socket }) {
  const [allUsers, setAllUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedChatListComp, setSelectedChatListComp] = useState(null);
  const { loggedInUser } = useContext(loggedInUserContext);
  useContext(onlineUsersContext);

  useEffect(() => {
    if (!loggedInUser?._id) return;
    getAllUsers(loggedInUser._id, setAllUsers);
  }, [loggedInUser?._id]);

  useEffect(() => {
    if (!socket || !loggedInUser?._id) return;

    // Fix: Named handler to prevent memory leak
    const handleReceivedMessage = (data) => {
      const senderId = data.userIds.find((id) => id !== loggedInUser._id);
      setAllUsers((prevUsers) => {
        const senderIndex = prevUsers.findIndex((u) => u._id === senderId);
        if (senderIndex === -1) return prevUsers;
        const updatedUsers = [...prevUsers];
        const [senderUser] = updatedUsers.splice(senderIndex, 1);
        return [senderUser, ...updatedUsers];
      });
    };

    socket.on("received-message", handleReceivedMessage);
    return () => socket.off("received-message", handleReceivedMessage);
  }, [socket, loggedInUser?._id]);

  const handleUserDeleted = (deletedId) => {
    setAllUsers((prev) => prev.filter((u) => u._id !== deletedId));
  };

  const filteredUsers = allUsers.filter((user) =>
    user.username
      ? user.username.toLowerCase().includes(searchQuery.toLowerCase())
      : true
  );

  return (
    <div className="aside">
      <ChatSearch onSearch={setSearchQuery} />
      <section className="chat-list">
        {filteredUsers.length > 0 &&
          filteredUsers.map(function ({ username, email, _id, file }, index) {
            return (
              <ChatListUser
                index={index}
                id={_id}
                key={email}
                username={username}
                email={email}
                file={file}
                selectChatListComp={setSelectedChatListComp}
                selectedChatListComp={selectedChatListComp}
                onUserDeleted={handleUserDeleted}
              />
            );
          })}
        {filteredUsers.length === 0 && searchQuery !== "" && (
          <p style={{ textAlign: "center", color: "gray", marginTop: "20px" }}>
            No user found
          </p>
        )}
      </section>
    </div>
  );
}

export default ChatAside;