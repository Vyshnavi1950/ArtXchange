import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const MONGO = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/artxchange";
await mongoose.connect(MONGO);

const User = mongoose.model("User", new mongoose.Schema({}, { strict: false }));

const { deletedCount } = await User.deleteMany({ _id: { $type: "objectId" } });
console.log("🗑️  Removed", deletedCount, "legacy ObjectId users");
process.exit();
