/*  src/controllers/authController.js  */
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import admin from "firebase-admin";          // Firebase Admin initialised in server.js
import User from "../models/User.js";

/* ─── env & helpers ─── */
const { JWT_SECRET, FRONTEND_URL = "http://localhost:5173", NODE_ENV } = process.env;
if (!JWT_SECRET) throw new Error("JWT_SECRET env variable is missing");

const IS_PROD = NODE_ENV === "production";

const signToken = (id) =>
  jwt.sign({ userId: id }, JWT_SECRET, { expiresIn: "7d", algorithm: "HS256" });

// backend/src/controllers/authController.js

const cookieOpts = {
  httpOnly: true,
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  secure: process.env.NODE_ENV === "production",
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: "/",
};



/* ─── Register ─── */
export const registerUser = async (req, res) => {
  try {
    const { name, email = "", password } = req.body;
    if (!name || !email.trim() || !password)
      return res.status(400).json({ msg: "All fields are required" });

    const normEmail = email.trim().toLowerCase();
    if (await User.findOne({ email: normEmail }))
      return res.status(409).json({ msg: "User already exists" });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      name: name.trim(),
      email: normEmail,
      password: hashed,
      avatar: req.file?.path ?? "",
    });

    res.status(201).json({ msg: "User registered", user: { id: user._id, name, email: normEmail } });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ msg: "Server error during registration" });
  }
};

/* ─── Login (email + password) ─── */
export const loginUser = async (req, res) => {
  try {
    const { email = "", password } = req.body;
    const normEmail = email.trim().toLowerCase();

    const user = await User.findOne({ email: normEmail });
    if (!user) return res.status(404).json({ msg: "Email not registered" });

    if (!user.password)
      return res
        .status(400)
        .json({ msg: "Account uses social login. Use Google sign‑in." });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ msg: "Incorrect password" });

    res.cookie("token", signToken(user._id), cookieOpts);
    res.json({ msg: "Login successful", user: { id: user._id, name: user.name, email: normEmail } });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ msg: "Server error during login" });
  }
};

/* ─── Logout ─── */
export const logoutUser = (_req, res) => {
  try {
    res.clearCookie("token", { ...cookieOpts, maxAge: 0 });
    res.json({ msg: "Logged out" });
  } catch (err) {
    console.error("Logout error:", err);
    res.status(500).json({ msg: "Server error during logout" });
  }
};

/* ─── Forgot password (stub) ─── */
export const forgotPassword = async (req, res) => {
  try {
    const { email = "" } = req.body;
    const normEmail = email.trim().toLowerCase();

    if (!(await User.findOne({ email: normEmail })))
      return res.status(404).json({ msg: "Email not registered" });

    // TODO: real e‑mail reset flow
    res.json({ msg: "Password‑reset link sent (mock)" });
  } catch (err) {
    console.error("Forgot‑password error:", err);
    res.status(500).json({ msg: "Server error during password reset" });
  }
};

/* ─── Google OAuth callback (Passport) ─── */
export const googleCallback = async (req, res) => {
  try {
    const g = req.user; // populated by passport‑google
    let user = await User.findOne({ email: g.email });

    if (!user) {
      user = await User.create({
        name: g.displayName,
        email: g.email,
        avatar: g.photo,
        password: "", // empty ⇒ social login
      });
    }

    res.cookie("token", signToken(user._id), cookieOpts);
    res.redirect(FRONTEND_URL);
  } catch (err) {
    console.error("Google callback error:", err);
    res.status(500).send("Google authentication failed");
  }
};

/* ─── Firebase ID‑token exchange ─── */
export const firebaseAuth = async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken) return res.status(400).json({ msg: "No idToken provided" });

    const decoded = await admin.auth().verifyIdToken(idToken);

    let user = await User.findOne({ email: decoded.email });
    if (!user) {
      user = await User.create({
        name: decoded.name || decoded.email.split("@")[0],
        email: decoded.email,
        avatar: decoded.picture || "",
        password: "", // social login
      });
    }

    res.cookie("token", signToken(user._id), cookieOpts);
    res.json({ msg: "Firebase login successful" });
  } catch (err) {
    console.error("Firebase auth error:", err);
    res.status(401).json({ msg: "Invalid Firebase token" });
  }
};
