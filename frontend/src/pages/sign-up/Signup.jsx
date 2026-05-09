import { useRef, useState } from "react";
import "./Signup.css";
import { Link, useNavigate } from "react-router-dom";
import { signup } from "./Signup";

function Signup() {
  let [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();
  let userNameRef = useRef(null);
  let passwordRef = useRef(null);
  let emailRef = useRef(null);
  let genderRef = useRef(null);
  let cityRef = useRef(null);
  let fileRef = useRef(null);

  return (
    <div className="signup-container">
      <form className="signup-form">
        <h2>Sign Up</h2>

        <div>
          <input type="text" placeholder="Username" ref={userNameRef} />
          <span style={{ color: "red", fontSize: "12px" }}>
            {submitted && userNameRef.current?.value === ""
              ? "Username is required"
              : null}
          </span>
        </div>

        <div>
          <input type="email" ref={emailRef} placeholder="Email Id (@gmail.com only)" />
          <span style={{ color: "red", fontSize: "12px" }}>
            {submitted && emailRef.current?.value === ""
              ? "Email is required"
              : submitted && !emailRef.current?.value.endsWith("@gmail.com")
              ? "Only Gmail allowed (@gmail.com)"
              : null}
          </span>
        </div>

        <div>
          <input type="password" ref={passwordRef} placeholder="Password" />
          <span style={{ color: "red", fontSize: "12px" }}>
            {submitted && passwordRef.current?.value === ""
              ? "Password is required"
              : null}
          </span>
        </div>

        <div>
          <input type="text" ref={cityRef} placeholder="City" />
          <span style={{ color: "red", fontSize: "12px" }}>
            {submitted && cityRef.current?.value === ""
              ? "City is required"
              : null}
          </span>
        </div>

        <div>
          <select id="gender" ref={genderRef}>
            <option value="male">male</option>
            <option value="female">female</option>
            <option value="other">other</option>
          </select>
        </div>

        <div>
          <input type="file" ref={fileRef} accept="image/*" />
          <span style={{ color: "red", fontSize: "12px" }}>
            {submitted && fileRef.current?.files.length === 0
              ? "Profile photo is required"
              : null}
          </span>
        </div>

        <div style={{ textAlign: "center" }}>
          <button
            type="button"
            onClick={() => {
              setSubmitted(true);
              signup(
                userNameRef,
                passwordRef,
                emailRef,
                cityRef,
                genderRef,
                navigate,
                fileRef,
              );
            }}
          >
            Sign Up
          </button>
        </div>

        <div style={{ textAlign: "center", marginTop: "7px" }}>
          Do you have account ?{" "}
          <Link
            style={{
              color: "green",
              fontWeight: "bold",
              textDecoration: "none",
            }}
            to="/"
          >
            Sign In
          </Link>
        </div>
      </form>
    </div>
  );
}

export default Signup;