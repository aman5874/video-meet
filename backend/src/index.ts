import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

// Use CORS middleware to allow cross-origin requests
app.use(cors());

// Create an HTTP server
const server = createServer(app);

// Initialize Socket.io with CORS options
const io = new Server(server, {
  cors: {
    origin: "*", // Allow all origins; update this in production to restrict origins
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join-room", (roomId, userId, userName) => {
    console.log(`${userName} joining room ${roomId} with ID ${userId}`);
    
    socket.join(roomId);
    socket.data.userName = userName;
    socket.data.roomId = roomId;
    socket.data.userId = userId;

    // Emit to all clients in the room except the sender
    socket.to(roomId).emit("user-connected", userId, userName);
    
    // Get current participants in the room
    const room = io.sockets.adapter.rooms.get(roomId);
    const participants = Array.from(room || []).map(socketId => {
      const socket = io.sockets.sockets.get(socketId);
      return {
        userId: socket?.data.userId,
        userName: socket?.data.userName || 'Anonymous'
      };
    });
    
    // Send current participants to the new user
    socket.emit("participants-list", participants);

    // Announce user joined in chat
    socket.to(roomId).emit("chat-message", {
      type: 'system',
      content: `${userName} joined the meeting`,
      userId: 'system',
      userName: 'System'
    });
  });

  // Handle chat messages
  socket.on("chat-message", (data: { 
    roomId: string; 
    message: string;
    userName: string;
  }) => {
    console.log(`Chat message in room ${data.roomId} from ${data.userName}: ${data.message}`);
    
    // Emit to everyone in the room including sender
    io.to(data.roomId).emit("chat-message", {
      type: 'user',
      content: data.message,
      userId: socket.data.userId,
      userName: data.userName
    });
  });

  socket.on("disconnect", () => {
    const { roomId, userName, userId } = socket.data;
    if (roomId) {
      console.log(`${userName} leaving room ${roomId}`);
      socket.to(roomId).emit("user-disconnected", userId, userName);

      // Announce user left in chat
      socket.to(roomId).emit("chat-message", {
        type: 'system',
        content: `${userName} left the meeting`,
        userId: 'system',
        userName: 'System'
      });
    }
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
