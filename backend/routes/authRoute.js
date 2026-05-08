const { Router } = require("express");
const { createUser, signin } = require("../controller/authController.js");
const route = Router();

route.post("/sign-up", createUser);
// http://localhost:3000/api/auth/sign-up

route.post("/sign-in", signin);
// http://localhost:3000/api/auth/sign-in
module.exports = route;