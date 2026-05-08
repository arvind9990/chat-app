const { Router } = require("express");
const {
  createNewMessage,
  getAllMessage,
  sendImage,
  deleteMessage,
  markMessagesSeen,
} = require("../controller/chatController");
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });

const route = Router();

route.post("/new-message", createNewMessage);
route.get("/get-all-messages/:userId1/:userId2", getAllMessage);
route.post("/send-image", upload.single("image"), sendImage);
route.delete("/delete-message/:messageId", deleteMessage);

// ADD - Mark seen route
route.put("/mark-seen/:userId1/:userId2", markMessagesSeen);

module.exports = route;