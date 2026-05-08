import { useState, useContext } from "react";
import "./Signin.css";
import { Link, useNavigate } from "react-router-dom";
import { signin } from "./Signin.js";
import authContext from "../../context/authContext";
import loggedInUserContext from "../../context/loggedInUserContext";

function Signin() {
  const navigate = useNavigate();
  const { login } = useContext(authContext);
  const { setLoggedInUser } = useContext(loggedInUserContext);
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState({ email: "", password: "" });

  return (
    <div className="signin-container">
      <form className="signin-form">
        <h2>Sign In</h2>

        <div>
          <input
            type="email"
            value={credentials.email}
            placeholder="Email Id"
            onChange={(e) => {
              setCredentials({ ...credentials, email: e.target.value });
            }}
          />
          <span style={{ color: "red" }}>{error.email}</span>
        </div>

        <div>
          <input
            type="password"
            value={credentials.password}
            placeholder="Password"
            onChange={(e) => {
              setCredentials({ ...credentials, password: e.target.value });
            }}
          />
          <span style={{ color: "red" }}>{error.password}</span>
        </div>

        <div style={{ textAlign: "center" }}>
          <button
            type="button"
            onClick={() => {
              signin(
                credentials,
                error,
                setError,
                navigate,
                login,
                setLoggedInUser
              );
            }}
          >
            Sign In
          </button>
        </div>

        <div className="forgot-password">
          <span>
            Don't you have account ? <Link to="/sign-up">Signup</Link>
          </span>
          <span>
            <Link to="/forgot-password">Forgot password</Link>
          </span>
        </div>
      </form>
    </div>
  );
}

export default Signin;