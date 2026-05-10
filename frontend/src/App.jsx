import { useState } from "react";
import { ToastContainer } from "react-toastify";
import MyRoutes from "./components/routes/MyRoutes.jsx";
import authContext from "./context/authContext.js";
import loggedInUserContext from "./context/loggedInUserContext.js";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState(null);

  const login = () => setIsLoggedIn(true);
  const logout = () => {
    setIsLoggedIn(false);
    setLoggedInUser(null);
  };

  console.log("App loggedInUser:", loggedInUser);

  return (
    <div style={{ height: "100dvh", width: "100vw", overflow: "hidden" }}>
      <ToastContainer />
      <loggedInUserContext.Provider value={{ loggedInUser, setLoggedInUser }}>
        <authContext.Provider value={{ isLoggedIn, login, logout }}>
          <MyRoutes isLoggedIn={isLoggedIn} />
        </authContext.Provider>
      </loggedInUserContext.Provider>
    </div>
  );
}

export default App;