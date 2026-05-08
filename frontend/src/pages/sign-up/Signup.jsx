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
          <span>
            {submitted && userNameRef.current.value === ""
              ? "username is required"
              : null}
          </span>
        </div>
        <div>
          <input type="email" ref={emailRef} placeholder="Email Id" />
          <span>
            {submitted && emailRef.current.value === ""
              ? "email is required"
              : null}
          </span>
        </div>

        <div>
          <input type="password" ref={passwordRef} placeholder="Password" />
          <span>
            {submitted && passwordRef.current.value === ""
              ? "password is required"
              : null}
          </span>
        </div>

        <div>
          <input type="text" ref={cityRef} placeholder="City" />
          <span>
            {submitted && cityRef.current.value === ""
              ? "city is required"
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
          <input type="file" ref={fileRef} />
        </div>

        <div style={{ textAlign: "center" }}>
          <button
            type="button"
            // disabled
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