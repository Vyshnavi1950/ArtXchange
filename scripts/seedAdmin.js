import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";
import connectDB from "../config/db.js";

dotenv.config();
await connectDB();

const adminUID = "llRl1NXm2XgP9OVwI5Lvodd2AtA3"; // ✅ Use your Firebase UID here
const adminEmail = "vyshnaviyalamati@gmail.com"; // ✅ Your admin email

try {
  const existing = await User.findById(adminUID);

  if (existing) {
    existing.isAdmin = true;
    await existing.save();
    console.log("✅ Admin privileges granted to existing user.");
  } else {
    await User.create({
      _id: adminUID,
      name: "Super Admin",
      email: adminEmail,
      password: "placeholder", // not used (Firebase)
      avatar: "",
      isAdmin: true,
      skillsOffered: [],
      skillsNeeded: [],
      followers: [],
      following: [],
      posts: [],
    });
    console.log("✅ Admin user seeded.");
  }
} catch (err) {
  console.error("❌ Failed to seed admin:", err.message);
} finally {
  mongoose.disconnect();
}
