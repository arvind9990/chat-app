import "./Home.css";
import { useEffect, useContext, useState } from "react";
import ChatHeader from "../../components/chat-header/ChatHeader";
import ChatMain from "../../components/chat-main/ChatMain";
import { io } from "socket.io-client";
import loggedInUserContext from "../../context/loggedInUserContext";
import onlineUsersContext from "../../context/OnlineUsersContext";

const socket = io(import.meta.env.VITE_BACKEND_URL);

function Home() {
  const [onlineusers, setOnlineUsers] = useState([]);
  const { loggedInUser } = useContext(loggedInUserContext);

  useEffect(() => {
    socket.emit("join-room", loggedInUser._id);
    socket.on("online", (onlineUsers) => {
      setOnlineUsers(onlineUsers);
    });

    socket.on("offline", (filteredIds) => {
      setOnlineUsers(filteredIds);
    });
  }, []);

  return (
    <div className="home">
      <ChatHeader socket={socket} />
      <onlineUsersContext.Provider value={{ onlineusers, setOnlineUsers }}>
        <ChatMain socket={socket} />
      </onlineUsersContext.Provider>
    </div>
  );
}

export default Home;