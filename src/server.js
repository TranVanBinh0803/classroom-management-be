import "dotenv/config";
import express from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";

import { studentRoute } from "./routes/studentRoute";
import { instructorRoute } from "./routes/instructorRoute";
import { errorHandlingMiddleware } from "./middlewares/errorHandlingMiddleware";
import { authRoute } from "./routes/authRoute";
import { conversationRoute } from "./routes/conversationRoute";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "PATCH"],
    credentials: true,
  },
});

app.use(cors());
app.use(express.json());

app.use("/api/auths", authRoute);
app.use("/api/students", studentRoute);
app.use("/api/instructors", instructorRoute);
app.use("/api/conversations", conversationRoute);
app.use(errorHandlingMiddleware);

const userSocketMap = {};

io.on("connection", (socket) => {
  console.log("A user connected", socket.id);
  const userId = socket.handshake.query.userId;

  if (userId && userId !== "undefined") {
    userSocketMap[userId] = socket.id;
    io.emit("getOnlineUser", Object.keys(userSocketMap));
  }

  socket.on("join", (conversationId) => {
    socket.join(conversationId);
    console.log(`User ${userId} joined conversation ${conversationId}`);
  });

  socket.on("sendMessage", ({ conversationId, senderId, text }) => {
  socket.to(conversationId).emit("receiveMessage", {
    senderId,
    text,
    conversationId,
  });
  const room = io.sockets.adapter.rooms.get(conversationId);
});

  socket.on("leave", (conversationId) => {
    socket.leave(conversationId);
    console.log(`User ${userId} left conversation ${conversationId}`);
  });

  socket.on("typing", ({ conversationId, isTyping }) => {
    socket.to(conversationId).emit("userTyping", {
      userId,
      isTyping,
    });
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected", socket.id);
    delete userSocketMap[userId];
    io.emit("getOnlineUser", Object.keys(userSocketMap));
  });
});

const PORT = process.env.APP_PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
