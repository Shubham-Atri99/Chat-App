import express from "express";
import 'dotenv/config';
import { createServer } from "http";
import { Server } from "socket.io";

import chatrouter from "./routes/chatsroute.js";
import connectMongo from "./connection.js";
import userrouter from "./routes/userRoute.js";
import messageRouter from "./routes/messagesroute.js";

const app = express();
const port = process.env.PORT || 4069;

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173", // your frontend origin
    methods: ["GET", "POST"],
  },
});

// Connect to MongoDB
connectMongo("mongodb://localhost:27017/fullStack2")
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ Mongo error:", err));

// Middlewares
app.use(express.json());
app.get("/", (req, res) => res.send("API running"));
app.use("/api/chat", chatrouter);
app.use("/api/user", userrouter);
app.use("/api/message", messageRouter);

// ------------------- SOCKET.IO -------------------
io.on("connection", (socket) => {
  console.log("🔌 User connected:", socket.id);

  // Setup user room
  socket.on("setup", (userData) => {
    socket.join(userData._id);
    socket.emit("connected");
  });

  // Join chat room
  socket.on("join chat", (roomId) => {
    socket.join(roomId);
    console.log("👥 Joined room:", roomId);
  });

  // Typing indicator
  socket.on("typing", ({ room, user }) => {
    socket.to(room).emit("typing", { user, room });
  });

  socket.on("stop typing", (room) => {
    socket.to(room).emit("stop typing", room);
  });

  // Handle new message
  socket.on("new message", (message) => {
    const chat = message.chat;
    if (!chat.users) return;

    chat.users.forEach((u) => {
      if (u._id !== message.sender._id) {
        // Send to user for live update
        socket.to(u._id).emit("message received", message);

        // Also send as notification
        socket.to(u._id).emit("notification", message);
      }
    });
  });

  // Disconnect
  socket.on("disconnect", () => {
    console.log("🚪 User disconnected");
  });
});

// Start server
httpServer.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});
