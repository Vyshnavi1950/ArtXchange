/*  src/controllers/authController.js  */
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js"; // ← make sure this path is correct

const JWT_SECRET = process.env.JWT_SECRET;
const FRONTEND_URL = process.env.FRONTEND_URL || "https://your-frontend.vercel.app";

/* ─────────────────────────  REGISTER  ───────────────────────── */
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ message: "All fields are required" });

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(409).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      name,
      email,
      password: hashedPassword,
      avatar: req.file?.path || "", // if you're using avatar upload
    });

    await user.save();
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

    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: "7d" });

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "none",
      secure: true,
    });

    return res.status(200).json({ message: "Login successful", user });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Server error during login" });
  }
};

/* ────────────────────────  FORGOT PASSWORD  ─────────────────── */
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ message: "Email not registered" });

    // You can implement your own token + email logic here
    return res.status(200).json({ message: "Reset link sent (mock)" });
  } catch (err) {
    console.error("Forgot-password error:", err);
    return res.status(500).json({ message: "Server error during password reset" });
  }
};

/* ───────────────────────────  LOGOUT  ───────────────────────── */
export const logoutUser = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      sameSite: "none",
      secure: true,
    });

    return res.status(200).json({ message: "Logged out successfully" });
  } catch (err) {
    console.error("Logout error:", err);
    return res.status(500).json({ message: "Server error during logout" });
  }
};

/* ───────────────  GOOGLE SIGN-IN CALLBACK HANDLER  ───────────── */
export const googleCallback = async (req, res) => {
  try {
    const googleUser = req.user; // populated by passport

    let user = await User.findOne({ email: googleUser.email });

    if (!user) {
      // create new user with data from Google
      user = new User({
        name: googleUser.displayName,
        email: googleUser.email,
        avatar: googleUser.photo, // if available from strategy
        password: "", // empty password for social login
      });
      await user.save();
    }

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: "7d" });

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "none",
      secure: true,
    });

    return res.redirect(FRONTEND_URL); // redirect to frontend home page
  } catch (err) {
    console.error("Google callback error:", err);
    return res.status(500).send("Google authentication failed");
  }
};
