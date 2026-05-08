import React from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import Home from "../../pages/home/Home.jsx";
import Signin from "../../pages/sign-in/Signin.jsx";
import Signup from "../../pages/sign-up/Signup.jsx";
import Pagenotfound from "../../pages/page-not-found/Pagenotfound.jsx";
import Profile from "../../pages/profile/Profile.jsx";
import UpdateProfile from "../../pages/profile/UpdateProfile.jsx";

function MyRoutes({ isLoggedIn }) {
  return (
    <Routes>
      <Route path={"/"} element={isLoggedIn ? <Home /> : <Signin />} />
      <Route
        path={"/profile"}
        element={isLoggedIn ? <Profile /> : <Signin />}
      />

      <Route
        path={"/update-profile"}
        element={isLoggedIn ? <UpdateProfile /> : <Signin />}
      />
      <Route
        path={"/sign-up"}
        element={isLoggedIn ? <Navigate to="/" /> : <Signup />}
      />
      <Route path="*" element={<Pagenotfound />} />
    </Routes>
  );
}

export default MyRoutes;