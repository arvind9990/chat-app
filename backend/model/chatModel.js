const mongoose = require("mongoose");

const ChatSchema = new mongoose.Schema(
  {
    userIds: [
      { type: String, required: true },
      { type: String, required: true },
    ],
    message: {
      type: String,
    },
    senderId: {
      type: String,
    },
    type: {
      type: String,
      default: "text",
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    // ADD - seen status for double tick
    seen: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Chat = mongoose.model("chat", ChatSchema);

module.exports = Chat;