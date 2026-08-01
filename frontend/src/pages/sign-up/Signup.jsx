import { useState } from "react";
import "./Signup.css";
import { Link, useNavigate } from "react-router-dom";
import { signup } from "./Signup";

function Signup() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    city: "",
    gender: "male",
    file: null,
  });
  const navigate = useNavigate();

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const errors = {
    username: submitted && !form.username.trim() ? "Username is required" : "",
    email:
      submitted && !form.email.trim()
        ? "Email is required"
        : submitted && !form.email.endsWith("@gmail.com")
          ? "Only Gmail allowed (@gmail.com)"
          : "",
    password: submitted && !form.password ? "Password is required" : "",
    city: submitted && !form.city.trim() ? "City is required" : "",
    file: submitted && !form.file ? "Profile photo is required" : "",
  };

  const handleSubmit = () => {
    setSubmitted(true);
    signup(form, navigate);
  };

  return (
    <div className="signup-container">
      <form className="signup-form">
        <h2>Sign Up</h2>

        <div>
          <input
            type="text"
            placeholder="Username"
            value={form.username}
            onChange={(e) => handleChange("username", e.target.value)}
          />
          {errors.username && <span style={{ color: "red", fontSize: "12px" }}>{errors.username}</span>}
        </div>

        <div>
          <input
            type="email"
            placeholder="Email Id "
            value={form.email}
            onChange={(e) => handleChange("email", e.target.value)}
          />
          {errors.email && <span style={{ color: "red", fontSize: "12px" }}>{errors.email}</span>}
        </div>

        <div>
          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => handleChange("password", e.target.value)}
          />
          {errors.password && <span style={{ color: "red", fontSize: "12px" }}>{errors.password}</span>}
        </div>

        <div>
          <input
            type="text"
            placeholder="City"
            value={form.city}
            onChange={(e) => handleChange("city", e.target.value)}
          />
          {errors.city && <span style={{ color: "red", fontSize: "12px" }}>{errors.city}</span>}
        </div>

        <div>
          <select id="gender" value={form.gender} onChange={(e) => handleChange("gender", e.target.value)}>
            <option value="male">male</option>
            <option value="female">female</option>
            <option value="other">other</option>
          </select>
        </div>

        <div>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleChange("file", e.target.files[0])}
          />
          {errors.file && <span style={{ color: "red", fontSize: "12px" }}>{errors.file}</span>}
        </div>

        <div style={{ textAlign: "center" }}>
          <button type="button" onClick={handleSubmit}>
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