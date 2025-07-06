/*  backend/src/socket.js  */
import { Server }  from "socket.io";
import admin       from "firebase-admin";
import Message     from "./models/Message.js";

/* Helper → sorted room id like "uidA|uidB" */
const roomId = (a, b) => [String(a), String(b)].sort().join("|");

export default function initSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: "*",                         // ⚠️ tighten in production
      methods: ["GET", "POST"],
    },
  });

  /* ───────── Auth middleware ───────── */
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) throw new Error("Token missing");

      socket.user = await admin.auth().verifyIdToken(token);
      next();
    } catch (err) {
      console.error("Socket auth error:", err.message);
      next(new Error("Authentication error"));
    }
  });

  /* ───────── Connection handler ───────── */
  io.on("connection", (socket) => {
    const uid = socket.user.uid;
    console.log("🔌 Socket connected:", socket.id, "uid:", uid);

    /* personal room, so we can emit directly */
    socket.join(uid);

    /* ---- chat:send ---- */
    socket.on("chat:send", async ({ to, text }) => {
      const clean = text?.trim();
      if (!clean) return;

      const participants = [uid, String(to)].sort();
      const room         = participants.join("|");

      try {
        const msg = await Message.create({
          participants,
          room,
          from: uid,
          to:   String(to),
          text: clean,
        });

        /* emit to both users (id rooms) */
        io.to(uid).emit("chat:new", msg);
        io.to(to).emit("chat:new", msg);
      } catch (err) {
        console.error("Message save error:", err.message);
      }
    });

    /* ---- chat:seen (mark partner’s messages as read) ---- */
    socket.on("chat:seen", async ({ partnerId }) => {
      try {
        await Message.updateMany(
          { from: partnerId, to: uid, seen: false },
          { $set: { seen: true } }
        );
      } catch (err) {
        console.error("chat:seen error:", err.message);
      }
    });

    socket.on("disconnect", () =>
      console.log(`🔌 Socket ${socket.id} (uid ${uid}) disconnected`)
    );
  });
}
