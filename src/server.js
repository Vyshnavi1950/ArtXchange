/* backend/src/server.js */
import express from "express";
import cors    from "cors";
import dotenv  from "dotenv";
import path    from "path";
import { fileURLToPath } from "url";
import http    from "http";

/* ---- Firebase Admin (unchanged) ---- */
import admin from "firebase-admin";
import { createRequire } from "module";
const require        = createRequire(import.meta.url);
const serviceAccount = require("../serviceAccountKey.json");
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });

/* ---- Resolve __dirname (ESM) ---- */
const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

/* ---- Local imports ---- */
import connectDB   from "./config/db.js";
import authRoutes  from "./routes/authRoutes.js";
import userRoutes  from "./routes/userRoutes.js";
import matchRoutes from "./routes/matchRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import chatRoutes  from "./routes/chatRoutes.js";   // REST history
import scheduleRoutes from "./routes/scheduleRoutes.js";
import initSocket  from "./socket.js";              // Socket.IO init fn

/* ---- Init ---- */
dotenv.config();
connectDB();

const app = express();
app.use(cors({ origin: "*" }));
app.use(express.json());

/* ---- Static uploads ---- */
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

/* ---- API routes ---- */
app.use("/api/auth",     authRoutes);
app.use("/api/users",    userRoutes);
app.use("/api/matches",  matchRoutes);
app.use("/api/admin",    adminRoutes);
app.use("/api/chat",     chatRoutes);      // chat history
app.use("/api/schedule", scheduleRoutes);

/* ---- Root ---- */
app.get("/", (_, res) => res.send("ArtXchange API running"));

/* ---- Start HTTP & Socket.IO ---- */
const PORT = process.env.PORT || 5000;
const httpServer = http.createServer(app);
initSocket(httpServer);                   // 💬 live sockets

httpServer.listen(PORT, () =>
  console.log(`[Server] HTTP + WS running on :${PORT}`)
);
