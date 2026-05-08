import { Link } from "react-router-dom";
import { useContext } from "react";
import "./UpdateProfile.css";
import axios from "axios";
import loggedInUserContext from "../../context/loggedInUserContext.js";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

function UpdateProfile() {
  const { loggedInUser, setLoggedInUser } = useContext(loggedInUserContext);
  const naviagte = useNavigate();
  const updateUser = () => {
    const updatedData = {
      ...loggedInUser,
    };

    delete updatedData._id;
    axios
      .put(
        `http://localhost:3000/api/users/update-user/${loggedInUser._id}`,
        updatedData,
      )
      .then((res) => {
        if (res.data.ok) {
          toast.success("Updated User Data", { autoClose: 1500 });
          naviagte("/profile");
        } else {
          throw Error();
        }
      })
      .catch((error) => {
        toast.error("Failed to Update", { autoClose: 2000 });
      });
  };

  return (
    <div className="updateprofile-container">
      <form className="updateprofile-form">
        <h2>Update Profile </h2>

        <div>
          <input
            type="text"
            placeholder="Username"
            value={loggedInUser.username}
            onChange={(e) => {
              setLoggedInUser({ ...loggedInUser, username: e.target.value });
            }}
          />
        </div>
        <div>
          <input
            type="email"
            placeholder="Email Id"
            value={loggedInUser.email}
            onChange={(e) => {
              setLoggedInUser({ ...loggedInUser, email: e.target.value });
            }}
          />
        </div>

        <div>
          <input
            type="password"
            placeholder="Password"
            value={loggedInUser.password}
            onChange={(e) => {
              setLoggedInUser({ ...loggedInUser, password: e.target.value });
            }}
          />
        </div>

        <div>
          <input
            type="text"
            placeholder="City"
            value={loggedInUser.city}
            onChange={(e) => {
              setLoggedInUser({ ...loggedInUser, city: e.target.value });
            }}
          />
        </div>

        <div>
          <select
            id="gender"
            value={loggedInUser.gender}
            onChange={(e) => {
              setLoggedInUser({ ...loggedInUser, gender: e.target.value });
            }}
          >
            <option value="male">male</option>
            <option value="female">female</option>
            <option value="other">other</option>
          </select>
        </div>

        <div style={{ textAlign: "center" }}>
          <button type="button" onClick={updateUser}>
            Update Profile
          </button>
        </div>
        <div style={{ textAlign: "center" }}>
          <Link to="/profile">
            {" "}
            <button type="button">Back to Profile Page</button>
          </Link>
        </div>
      </form>
    </div>
  );
}

export default UpdateProfile;