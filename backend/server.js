require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { createServer } = require("http");
const { Server } = require("socket.io");

// ✅ FIXED PATH (IMPORTANT)
const createMongodbConnection = require("./backend/config/mongodbConnection");

const AuthRoute = require("./backend/routes/authRoute");
const UserRoute = require("./backend/routes/userRoute");
const ChatRoute = require("./backend/routes/chatRoute");

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

  socket.on("join-room", (userId) => {
    if (!onlineUsers.includes(userId)) {
      onlineUsers.push(userId);
    }

    io.emit("online", onlineUsers);

    if (userId) socket.join(userId);
  });

  socket.on("offline", (id) => {
    const filteredIds = onlineUsers.filter((userId) => userId != id);
    io.emit("offline", filteredIds);
  });

  socket.on("send-message", (data) => {
    if (data) {
      io.to(data.userIds[0])
        .to(data.userIds[1])
        .emit("received-message", data);
    }
  });

  socket.on("messages-seen", (data) => {
    io.to(data.senderId).emit("messages-seen-ack", {
      seenBy: data.receiverId,
    });
  });

  socket.on("call-user", (data) => {
    io.to(data.to).emit("incoming-call", data);
  });

  socket.on("call-accepted", (data) => {
    io.to(data.to).emit("call-accepted", data);
  });

  socket.on("call-rejected", () => {
    io.emit("call-rejected");
  });

  socket.on("call-ended", (data) => {
    io.to(data.to).emit("call-ended");
  });

  socket.on("ice-candidate", (data) => {
    io.to(data.to).emit("ice-candidate", data);
  });
});

const PORT = process.env.PORT || 5000;

// ✅ CONNECT DB FIRST
createMongodbConnection().then(() => {
  server.listen(PORT, () => {
    console.log(`🚀 Server Started on ${PORT}`);
  });
});