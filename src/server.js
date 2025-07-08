/* ─────────── server.js  ─────────── */
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import http from "http";
import cookieParser from "cookie-parser";
import { fileURLToPath } from "url";
import fs from "fs";
import passport from "passport";
import admin from "firebase-admin";
import { Buffer } from "buffer";

import "./config/passport.js";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import matchRoutes from "./routes/matchRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import scheduleRoutes from "./routes/scheduleRoutes.js";
import initSocket from "./socket.js";

/* ─────────── env + DB ─────────── */
dotenv.config();
connectDB();

/* ─────────── Firebase Admin ─────────── */
let serviceAccount;
if (process.env.FIREBASE_SERVICE_ACCOUNT_B64) {
  serviceAccount = JSON.parse(
    Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_B64, "base64").toString("utf8")
  );
} else if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
} else {
  serviceAccount = JSON.parse(fs.readFileSync("serviceAccountKey.json", "utf8"));
}
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });

/* ─────────── path helpers ─────────── */
const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

/* ─────────── Express app ─────────── */
const app = express();

/* ─────────── CORS (final, working) ─────────── */
const defaultOrigins = [
  "http://localhost:5173",
  "https://artxchange2.vercel.app",
];

const allowedOrigins = process.env.CLIENT_ORIGINS
  ? defaultOrigins.concat(
      process.env.CLIENT_ORIGINS.split(",").map((s) => s.trim())
    )
  : defaultOrigins;

app.use(
  cors({
    origin: (origin, cb) => {
      // allow Postman / curl with no Origin
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
      console.error("⛔  CORS blocked:", origin);
      cb(new Error(`CORS: ${origin} not allowed`));
    },
    credentials: true,
  })
);

/* (optional) simple logger to confirm origins during dev */
app.use((req, _, next) => {
  if (req.headers.origin) console.log("🔗  Origin:", req.headers.origin);
  next();
});

/* ─────────── middleware ─────────── */
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());
app.use(passport.initialize());
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

/* ─────────── routes ─────────── */
app.get("/", (_, res) => res.send("ArtXchange API running"));
app.use("/api/auth",      authRoutes);
app.use("/api/users",     userRoutes);
app.use("/api/matches",   matchRoutes);
app.use("/api/admin",     adminRoutes);
app.use("/api/chat",      chatRoutes);
app.use("/api/schedule",  scheduleRoutes);
app.use("/auth", authRoutes); // legacy alias

/* ─────────── start HTTP + WS ─────────── */
const PORT = process.env.PORT || 5000;
const httpServer = http.createServer(app);
initSocket(httpServer);

httpServer.listen(PORT, () =>
  console.log(`[Server] HTTP + WS listening on :${PORT}`)
);
