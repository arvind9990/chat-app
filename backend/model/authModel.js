const mongoose = require("mongoose");

//Create Schema
const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    require: true,
  },
  password: {
    type: String,
    require: true,
  },
  email: {
    type: String,
    require: true,
    unique: true,
  },

  gender: {
    type: String,
    require: true,
  },
  city: {
    type: String,
    require: true,
  },
  file: {
    type: String,
    require: true,
  },
});

//Create Model Class or Model Class represents Collection here
const User = mongoose.model("user", UserSchema);

module.exports = User;