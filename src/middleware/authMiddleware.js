import admin from "firebase-admin";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

    if (!token) return res.status(401).json({ msg: "No token provided" });

    const decoded = await admin.auth().verifyIdToken(token);
    const firebaseUID = decoded.uid;

    // ✅ Try finding by UID (_id should be Firebase UID)
    let user = await User.findById(firebaseUID);

    if (!user) {
      // 🔍 Check if user exists with same email (possibly old ObjectId-based entry)
      const existing = await User.findOne({ email: decoded.email });

      if (existing) {
        // ⛔ Duplicate email with different _id → not allowed
        return res.status(409).json({
          msg: "UID mismatch: Email already exists with different ID. Contact support or delete old entry.",
        });
      }

      // ✅ No conflict → create new user
      user = await User.create({
        _id: firebaseUID,
        name: decoded.name || "Anonymous",
        email: decoded.email,
        password: "placeholder", // schema-required
        avatar: decoded.picture || "",
        skillsOffered: [],
        skillsNeeded: [],
        followers: [],
        following: [],
      });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error("❌ Auth Error:", err.message);
    res.status(401).json({ msg: "Unauthorized" });
  }
};
