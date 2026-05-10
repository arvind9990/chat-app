const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  gender: { type: String, required: true },
  city: { type: String, required: true },
  file: { type: String, required: true },
  blockedUsers: [{ type: String, default: [] }],
});

const User = mongoose.model("user", UserSchema);
module.exports = User;