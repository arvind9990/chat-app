import React from "react";
import { Link } from "react-router-dom";
function Pagenotfound() {
  return (
    <div style={{ width: "1200px", margin: "30px auto", textAlign: "center" }}>
      <Link to="/" style={{ fontSize: "32px" }}>
        Switch To Home / Login Page
      </Link>
      <br />
      <br />
      <img
        src="https://img.freepik.com/free-vector/neon-glitch-background_52683-3078.jpg"
        alt=""
        width="90%"
        height="500"
      />
    </div>
  );
}

export default Pagenotfound;