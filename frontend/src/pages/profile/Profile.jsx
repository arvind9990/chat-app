import { useContext } from "react";
import "./Profile.css";
import { Link } from "react-router-dom";
import loggedInUserContext from "../../context/loggedInUserContext";

function Profile() {
  const { loggedInUser } = useContext(loggedInUserContext);
  return (
    <div className="profile">
      <div className="profile-container">
        <section className="profile-basic-details">
          <img src={loggedInUser.file} alt="" width={230} height={230} />
          <h2>{loggedInUser.username}</h2>

          <p>
            Lorem ipsum dolor sit, amet consectetur adipisicing elit. Id,
            expedita aspernatur obcaecati perferendis commodi aliquam iure
            illum, quod dolores sequi eligendi! Vel ipsam veritatis totam
            debitis eaque eos illum repellat.
          </p>
          <div className="profile-social-icons">
            <i class="bi bi-camera-video-off-fill"></i>
            <i class="bi bi-telephone-inbound-fill"></i>
            <i class="bi bi-chat-text-fill"></i>
          </div>
        </section>
        <section className="profile-detailed-details">
          <section>
            <h1>User Information</h1>
            <p style={{ fontStyle: "italic" }}>
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Corporis
              ducimus alias sequi praesentium
            </p>
          </section>

          <section>
            <div>
              <h2>User Name</h2>
              <p>{loggedInUser.username}</p>
            </div>
            <div>
              <h2>Password</h2>
              <p>{loggedInUser.password}</p>
            </div>
            <div>
              <h2>Gender</h2>
              <p>{loggedInUser.gender}</p>
            </div>
            <div>
              <h2>City</h2>
              <p>{loggedInUser.city}</p>
            </div>
            <div>
              <h2>Email Id</h2>
              <p>{loggedInUser.email}</p>
            </div>
            <div>
              <h2>Account Created On</h2>
              <p>{"..........."}</p>
            </div>
          </section>

          <section>
            <Link to="/update-profile">
              <button>Update Profile</button>
            </Link>
          </section>
        </section>
      </div>

      <div className="back-button">
        <Link to="/">
          <button>Back to Home Page</button>
        </Link>
      </div>
    </div>
  );
}

export default Profile;