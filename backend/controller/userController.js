const User = require("../model/authModel");
const Chat = require("../model/chatModel");
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
      res.send({ ok: true, result: "user-updated" });
    })
    .catch((error) => {
      res.send({ ok: false, error: "failed to update data" });
    });
}

async function deleteUser(req, res) {
  const userId = req.params.id;
  try {
    // User permanently delete karo
    await User.findByIdAndDelete(userId);

    // Us user ke saare chats bhi delete karo
    await Chat.deleteMany({ userIds: userId });

    res.json({ ok: true, result: "User permanently deleted" });
  } catch (error) {
    console.log(error);
    res.json({ ok: false, error: "Failed to delete user" });
  }
}

module.exports = { getAllUsers, updateUser, deleteUser };