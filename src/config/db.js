import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("[DB] MongoDB connected ✅");
  } catch (err) {
    console.error("[DB] Connection error →", err.message);
    process.exit(1);
  }
};

export default connectDB;
