const { Router } = require("express");
const {
  getAllUsers,
  updateUser,
  deleteUser,
} = require("../controller/userController.js");
const route = Router();

route.get("/get-all-users/:id", getAllUsers);
//http://localhost:3000/api/users/get-all-users/<id>

route.put("/update-user/:id", updateUser);
//http://localhost:3000/api/users/update-user/<id>

route.delete("/delete-user/:id", deleteUser);
//http://localhost:3000/api/users/delete-user/<id>

module.exports = route;