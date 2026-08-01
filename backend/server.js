require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { createServer } = require("http");
const { Server } = require("socket.io");
const createMongodbConnection = require("./config/mongodbConnection");
const AuthRoute = require("./routes/authRoute");
const UserRoute = require("./routes/userRoute");
const ChatRoute = require("./routes/chatRoute");

const app = express();

const allowedOrigins = [
  process.env.FRONTEND_URL,
  "https://chat-app-1-cz6u.onrender.com",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
};

app.use(cors(corsOptions));

app.use(express.json({ limit: "50mb" }));
app.use("/api/auth", AuthRoute);
app.use("/api/users", UserRoute);
app.use("/api/chats", ChatRoute);

const onlineUsers = [];
const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`Origin ${origin} not allowed by Socket.IO CORS`));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("User Connected");

  socket.on("join-room", (userId) => {
    socket.userId = userId;
    if (!onlineUsers.includes(userId)) {
      onlineUsers.push(userId);
    }
    io.emit("online", onlineUsers);
    if (userId) socket.join(userId);
  });

  socket.on("offline", (id) => {
    const index = onlineUsers.indexOf(id);
    if (index > -1) onlineUsers.splice(index, 1);
    io.emit("offline", onlineUsers);
  });

  // Fix: disconnect pe bhi remove karo
  socket.on("disconnect", () => {
    if (socket.userId) {
      const index = onlineUsers.indexOf(socket.userId);
      if (index > -1) onlineUsers.splice(index, 1);
      io.emit("offline", onlineUsers);
    }
  });

  socket.on("send-message", (data) => {
    if (data) {
      const receiverId = data.userIds.find((id) => id !== data.senderId);
      io.to(receiverId).emit("received-message", data);
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

  socket.on("call-rejected", (data) => {
    if (data?.to) {
      io.to(data.to).emit("call-rejected");
    } else {
      io.emit("call-rejected");
    }
  });

  socket.on("call-ended", (data) => {
    io.to(data.to).emit("call-ended");
  });

  socket.on("ice-candidate", (data) => {
    io.to(data.to).emit("ice-candidate", data);
  });
});

const PORT = process.env.PORT || 5000;
createMongodbConnection()
  .then(() => {
    server.listen(PORT, () => {
      console.log(`🚀 Server Started on ${PORT}`);
    });
  })
  .catch((err) => console.log(err));