/*  src/controllers/authController.js  */
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
// import any models or helpers you already use, e.g. User

/* ─────────────────────────  REGISTER  ───────────────────────── */
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // example: basic validation
    if (!name || !email || !password)
      return res.status(400).json({ message: "All fields are required" });

    // hash password, save user, etc. (your existing logic here)

    return res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error("Register error:", err);
    return res.status(500).json({ message: "Server error during registration" });
  }
};

/* ───────────────────────────  LOGIN  ────────────────────────── */
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    // your existing login logic (find user, compare pw, issue token, etc.)
    return res.status(200).json({ message: "Login successful" });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Server error during login" });
  }
};

/* ────────────────────────  FORGOT PASSWORD  ─────────────────── */
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    // your existing forgot‑password logic
    return res.status(200).json({ message: "Reset link sent" });
  } catch (err) {
    console.error("Forgot‑password error:", err);
    return res.status(500).json({ message: "Server error during password reset" });
  }
};

/* ───────────────────────────  LOGOUT  ───────────────────────── */
export const logoutUser = async (req, res) => {
  try {
    /* 
       If you’re using:
       – HTTP‑only auth cookie  → clear it
       – Server sessions        → destroy session
       – Pure JWT in localStorage → nothing to clear server‑side (but we’ll still respond 200)
    */

    // Example for cookie‑based auth:
    res.clearCookie("token", {
      httpOnly: true,
      sameSite: "none",
      secure: true,     // keep if your site is HTTPS
    });

    return res.status(200).json({ message: "Logged out successfully" });
  } catch (err) {
    console.error("Logout error:", err);
    return res.status(500).json({ message: "Server error during logout" });
  }
};
