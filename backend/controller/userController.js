const User = require("../model/authModel");
const cloudinary = require('cloudinary').v2;

function getAllUsers(req, res) {
  const loggedInUserId = req.params.id;

  User.find({ _id: { $ne: loggedInUserId } })
    .then((users) => {
      res.json({ ok: true, result: users });
    })
    .catch((error) => {
      res.json({ ok: false, error: "Failed to Access All Users Data" });
    });
}

function updateUser(req, res) {
  User.updateOne({ _id: req.params.id }, { $set: req.body })
    .then((data) => {
      console.log(data);
      res.send({ ok: true, result: "user-updated" });
    })
    .catch((error) => {
      res.send({ ok: false, error: "failed to update data", error });
    });
}

// FIXED - Don't delete from DB, just hide from frontend
function deleteUser(req, res) {
  res.json({ ok: true, result: "User hidden successfully" });
}

module.exports = { getAllUsers, updateUser, deleteUser };