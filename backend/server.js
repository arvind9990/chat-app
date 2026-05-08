const express = require("express");
const cors = require("cors");
const { createServer } = require("http");
const { Server } = require("socket.io");
const createMongodbConnection = require("./config/mongodbConnection.js");
const AuthRoute = require("./routes/authRoute.js");
const UserRoute = require("./routes/userRoute.js");
const ChatRoute = require("./routes/chatRoute.js");

const app = express();
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use("/api/auth", AuthRoute);
app.use("/api/users", UserRoute);
app.use("/api/chats", ChatRoute);

const onlineUsers = [];
const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

io.on("connection", (socket) => {
  // Online/offline
  socket.on("join-room", (userId) => {
    onlineUsers.push(userId);
    io.emit("online", onlineUsers);
    if (userId) socket.join(userId);
  });

  socket.on("offline", (id) => {
    var filteredIds = onlineUsers.filter((userId) => userId != id);
    io.emit("offline", filteredIds);
  });

  // Chat messages
  socket.on("send-message", (data) => {
    if (data) {
      io.to(data.userIds[0]).to(data.userIds[1]).emit("received-message", data);
    }
  });

  // ADD - seen event: sender gets notified messages were read
  socket.on("messages-seen", (data) => {
    // data = { senderId, receiverId }
    io.to(data.senderId).emit("messages-seen-ack", {
      seenBy: data.receiverId,
    });
  });

  // ADD - WebRTC video/audio call signaling
  socket.on("call-user", (data) => {
    // data = { to, from, offer, callType, callerName, callerPic }
    io.to(data.to).emit("incoming-call", data);
  });

  socket.on("call-accepted", (data) => {
    // data = { to, answer }
    io.to(data.to).emit("call-accepted", data);
  });

  socket.on("call-rejected", (data) => {
    // data = { to }
    io.to(data.to).emit("call-rejected");
  });

  socket.on("call-ended", (data) => {
    // data = { to }
    io.to(data.to).emit("call-ended");
  });

  socket.on("ice-candidate", (data) => {
    // data = { to, candidate }
    io.to(data.to).emit("ice-candidate", data);
  });
});

server.listen(3000, () => {
  console.log("Server Started");
  createMongodbConnection();
});