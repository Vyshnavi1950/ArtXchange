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

/* ──────────────── Load env & database ──────────────── */
dotenv.config();
connectDB();

/* ─────────────── Firebase Admin Setup ─────────────── */
let serviceAccount;

if (process.env.FIREBASE_SERVICE_ACCOUNT_B64) {
  // Preferred: base‑64 encoded env var ⇒ safe, no escaping problems
  const decoded = Buffer.from(
    process.env.FIREBASE_SERVICE_ACCOUNT_B64,
    "base64"
  ).toString("utf8");
  serviceAccount = JSON.parse(decoded);

} else if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  // Accept raw/minified JSON stored directly in an env var (\n escaped)
  serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

} else {
  // Local development fallback (file is git‑ignored)
  serviceAccount = JSON.parse(
    fs.readFileSync("serviceAccountKey.json", "utf8")
  );
}

admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });

/* ──────────────── Path helpers ──────────────── */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* ───────────────── Express app ───────────────── */
const app = express();

/* ─────────────────── CORS ────────────────────── */
const DEFAULT_ORIGINS = [
  "http://localhost:5173",
  "https://art-xchange2.vercel.app", // production frontend
];

const CLIENT_ORIGINS = process.env.CLIENT_ORIGINS
  ? process.env.CLIENT_ORIGINS.split(",").map((o) => o.trim()).concat(DEFAULT_ORIGINS)
  : DEFAULT_ORIGINS;

app.use(
  cors({
    origin(origin, cb) {
      if (!origin) return cb(null, true); // allow server‑to‑server / Postman
      const allowed = CLIENT_ORIGINS.some((o) => origin.startsWith(o));
      return allowed ? cb(null, true) : cb(new Error(`Not allowed by CORS: ${origin}`));
    },
    credentials: true,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
// Fast‑track preflight requests
app.options("*", cors());

/* ─────────────── global middleware ─────────────── */
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());
app.use(passport.initialize());
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

/* ─────────────────── Routes ─────────────────── */
app.get("/", (_, res) => res.send("ArtXchange API running"));

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/matches", matchRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/schedule", scheduleRoutes);

// ⬇ Temporary alias while the frontend migrates to /api/auth/* base URL
app.use("/auth", authRoutes); // TODO: remove once frontend updated

/* ─────────────── Start Server + WebSockets ─────────────── */
const PORT = process.env.PORT || 5000;
const httpServer = http.createServer(app);

initSocket(httpServer);

httpServer.listen(PORT, () =>
  console.log(`[Server] HTTP + WS listening on :${PORT}`)
);
