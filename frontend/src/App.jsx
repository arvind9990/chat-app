import { useState } from "react";
import { ToastContainer } from "react-toastify";
import MyRoutes from "./components/routes/MyRoutes.jsx";
import authContext from "./context/authContext.js";
import loggedInUserContext from "./context/loggedInUserContext.js";

const AuthContext = authContext;
const LoggedInUserContext = loggedInUserContext;

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState(null);

  const login = () => setIsLoggedIn(true);
  const logout = () => {
    setIsLoggedIn(false);
    setLoggedInUser(null);
  };

  return (
    <div style={{ height: "100dvh", width: "100vw", overflow: "hidden" }}>
      <ToastContainer />
      <LoggedInUserContext.Provider value={{ loggedInUser, setLoggedInUser }}>
        <AuthContext.Provider value={{ isLoggedIn, login, logout }}>
          <MyRoutes isLoggedIn={isLoggedIn} />
        </AuthContext.Provider>
      </LoggedInUserContext.Provider>
    </div>
  );
}

export default App;