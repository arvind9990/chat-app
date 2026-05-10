const User = require("../model/authModel");
const Chat = require("../model/chatModel");

function getAllUsers(req, res) {
  const loggedInUserId = req.params.id;
  User.findById(loggedInUserId)
    .then((loggedInUser) => {
      const blockedList = loggedInUser?.blockedUsers || [];
      return User.find({
        _id: { $ne: loggedInUserId, $nin: blockedList },
      });
    })
    .then((users) => {
      res.json({ ok: true, result: users });
    })
    .catch((error) => {
      console.log(error);
      res.json({ ok: false, error: "Failed to Access All Users Data" });
    });
}

function updateUser(req, res) {
  User.updateOne({ _id: req.params.id }, { $set: req.body })
    .then(() => {
      res.send({ ok: true, result: "user-updated" });
    })
    .catch((error) => {
      res.send({ ok: false, error: "failed to update data" });
    });
}

async function deleteUser(req, res) {
  try {
    const { loggedInUserId, targetUserId } = req.params;
    if (!loggedInUserId || !targetUserId) {
      return res.json({ ok: false, error: "Missing user IDs" });
    }
    await User.updateOne(
      { _id: loggedInUserId },
      { $addToSet: { blockedUsers: targetUserId } }
    );
    res.json({ ok: true, result: "User removed from your list" });
  } catch (error) {
    console.log(error);
    res.json({ ok: false, error: "Failed to remove user" });
  }
}

module.exports = { getAllUsers, updateUser, deleteUser };