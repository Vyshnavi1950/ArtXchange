// backend/src/socket.js
import { Server } from "socket.io";
import admin from "firebase-admin";
import Message from "./models/Message.js";

export default function initSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: "*",  // Ideally restrict to your frontend origin in production
      methods: ["GET", "POST"],
    },
  });

  // Firebase token verification for every socket connection
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) throw new Error("Token missing");

      // Verify Firebase ID token
      const decoded = await admin.auth().verifyIdToken(token);

      // Attach decoded token (with uid etc.) to socket
      socket.user = decoded;

      return next();
    } catch (err) {
      console.error("Socket auth error:", err.message);
      return next(new Error("Authentication error"));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.user.uid; // Firebase UID from decoded token
    if (!userId) return socket.disconnect(true);

    socket.join(userId); // Join personal room for this user

    // Handle sending a chat message
    socket.on("chat:send", async ({ to, text }) => {
      if (!text?.trim()) return;

      try {
        const msg = await Message.create({
          from: userId,
          to,
          text,
        });

        // Emit message to recipient and sender rooms
        io.to(to).emit("chat:new", msg);
        io.to(userId).emit("chat:new", msg);
      } catch (err) {
        console.error("Failed to create/send message:", err);
      }
    });

    // Mark messages as seen
    socket.on("chat:seen", async ({ partnerId }) => {
      try {
        await Message.updateMany(
          { from: partnerId, to: userId, seen: false },
          { seen: true }
        );
      } catch (err) {
        console.error("Failed to update messages as seen:", err);
      }
    });

    socket.on("disconnect", () => {
      console.log(`Socket ${socket.id} for user ${userId} disconnected`);
    });
  });
}
