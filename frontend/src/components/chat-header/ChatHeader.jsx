import { useContext } from "react";
import "./ChatHeader.css";
import authContext from "../../context/authContext";
import loggedInUserContext from "../../context/loggedInUserContext";
import { Link } from "react-router-dom";
function ChatHeader({ socket }) {
  const { logout } = useContext(authContext);
  const { loggedInUser } = useContext(loggedInUserContext);
  return (
    <div className="header">
      <div className="header-logo">
        <h1>
          <i className="bi bi-chat-fill"></i> Arvi Chat
        </h1>
      </div>
      <div className="header-profile">
        <h3>{loggedInUser.username.toUpperCase()}</h3>
        <Link to="/profile">
          <img
            src={loggedInUser.file}
            alt=""
            width={40}
            height={40}
            style={{ borderRadius: "50%", boxShadow: "0 0 10px black" }}
          />
        </Link>
        <button
          onClick={() => {
            socket.emit("offline", loggedInUser._id);
            logout();
          }}
        >
          Logout
        </button>
        {/* <i className="bi bi-power" onClick={logout}></i> */}
      </div>
    </div>
  );
}

export default ChatHeader;