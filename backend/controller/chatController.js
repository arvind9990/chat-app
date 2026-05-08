const Chat = require("../model/chatModel.js");
const cloudinary = require("../routes/cloudinary");
const streamifier = require("streamifier");

function createNewMessage(req, res) {
  const newMessage = req.body;
  const message = new Chat(newMessage);
  message
    .save()
    .then((resp) => {
      // Return the saved message so frontend gets _id + timestamps
      res.send({ ok: true, result: resp });
    })
    .catch((error) => {
      console.log(error);
      res.send({ ok: false, error: "Failed to Send Message" });
    });
}

function getAllMessage(req, res) {
  const ids = req.params;
  Chat.find({ userIds: { $all: [ids.userId1, ids.userId2] } })
    .sort({ createdAt: 1 })
    .then((resp) => {
      if (resp.length > 0) {
        res.json({ ok: true, result: resp });
      } else {
        throw Error("No Chats between this two users");
      }
    })
    .catch((error) => {
      res.json({ ok: false, error: error.message });
    });
}

function sendImage(req, res) {
  try {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "chat_images" },
      async (error, result) => {
        if (error) return res.status(500).json({ ok: false, error });
        const message = new Chat({
          userIds: [req.body.userId1, req.body.userId2],
          message: result.secure_url,
          type: "image",
          senderId: req.body.senderId,
        });
        await message.save();
        res.json({ ok: true, result: message });
      }
    );
    streamifier.createReadStream(req.file.buffer).pipe(stream);
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
}

function deleteMessage(req, res) {
  const { messageId } = req.params;
  Chat.findByIdAndUpdate(messageId, { isDeleted: true }, { new: true })
    .then((updatedMessage) => {
      if (!updatedMessage) {
        return res.json({ ok: false, error: "Message not found" });
      }
      res.json({ ok: true, result: updatedMessage });
    })
    .catch((error) => {
      console.log(error);
      res.json({ ok: false, error: "Failed to delete message" });
    });
}

// ADD - Mark messages as seen
function markMessagesSeen(req, res) {
  const { userId1, userId2 } = req.params;
  Chat.updateMany(
    { userIds: { $all: [userId1, userId2] }, senderId: userId2, seen: false },
    { seen: true }
  )
    .then(() => {
      res.json({ ok: true });
    })
    .catch((error) => {
      res.json({ ok: false, error: error.message });
    });
}

module.exports = {
  createNewMessage,
  getAllMessage,
  sendImage,
  deleteMessage,
  markMessagesSeen,
};