require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { createServer } = require("http");
const { Server } = require("socket.io");

const createMongodbConnection = require("./config/mongodbConnection.js");

const AuthRoute = require("./routes/authRoute.js");
const UserRoute = require("./routes/userRoute.js");
const ChatRoute = require("./routes/chatRoute.js");

const app = express();

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

app.use(express.json({ limit: "50mb" }));

app.use("/api/auth", AuthRoute);
app.use("/api/users", UserRoute);
app.use("/api/chats", ChatRoute);

const onlineUsers = [];

const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

io.on("connection", (socket) => {
  console.log("User Connected");

  // Online/offline
  socket.on("join-room", (userId) => {
    onlineUsers.push(userId);

    io.emit("online", onlineUsers);

    if (userId) {
      socket.join(userId);
    }
  });

  socket.on("offline", (id) => {
    const filteredIds = onlineUsers.filter(
      (userId) => userId != id
    );

    io.emit("offline", filteredIds);
  });

  // Chat messages
  socket.on("send-message", (data) => {
    if (data) {
      io.to(data.userIds[0])
        .to(data.userIds[1])
        .emit("received-message", data);
    }
  });

  // Seen messages
  socket.on("messages-seen", (data) => {
    io.to(data.senderId).emit(
      "messages-seen-ack",
      {
        seenBy: data.receiverId,
      }
    );
  });

  // Call features
  socket.on("call-user", (data) => {
    io.to(data.to).emit("incoming-call", data);
  });

  socket.on("call-accepted", (data) => {
    io.to(data.to).emit("call-accepted", data);
  });

  socket.on("call-rejected", (data) => {
    io.to(data.to).emit("call-rejected");
  });

  socket.on("call-ended", (data) => {
    io.to(data.to).emit("call-ended");
  });

  socket.on("ice-candidate", (data) => {
    io.to(data.to).emit("ice-candidate", data);
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server Started on ${PORT}`);

  createMongodbConnection();
});