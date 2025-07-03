/*  backend/src/server.js  */

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import http from "http";
import cookieParser from "cookie-parser";
import { fileURLToPath } from "url";

import passport from "passport";
import "./config/passport.js";

/* ───────────── Firebase Admin ───────────── */
import admin from "firebase-admin";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const serviceAccount = require("../serviceAccountKey.json");
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });

/* ───────────── Resolve __dirname (ESM) ───────────── */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* ───────────── Local Imports ───────────── */
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import matchRoutes from "./routes/matchRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import scheduleRoutes from "./routes/scheduleRoutes.js";
import initSocket from "./socket.js";

/* ───────────── Init App ───────────── */
dotenv.config();
connectDB();

const app = express();

/* ───────────── CORS Setup ───────────── */
const CLIENT_ORIGINS = [
  "http://localhost:5173",              // Vite local
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || CLIENT_ORIGINS.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

/* ───────────── Global Middleware ───────────── */
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());

/* ───────────── Static Uploads ───────────── */
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

/* ───────────── API Routes ───────────── */
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/matches", matchRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/schedule", scheduleRoutes);

/* ───────────── Root Route ───────────── */
app.get("/", (_, res) => res.send("ArtXchange API running"));

/* ───────────── Start Server ───────────── */
const PORT = process.env.PORT || 5000;
const httpServer = http.createServer(app);
initSocket(httpServer);

httpServer.listen(PORT, () =>
  console.log(`[Server] HTTP + WS running on :${PORT}`)
);
