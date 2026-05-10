const { Router } = require("express");
const {
  getAllUsers,
  updateUser,
  deleteUser,
} = require("../controller/userController.js");

const route = Router();

route.get("/get-all-users/:id", getAllUsers);
route.put("/update-user/:id", updateUser);
route.delete("/delete-user/:loggedInUserId/:targetUserId", deleteUser);

module.exports = route;