import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema(
  {
    title:      { type: String, required: true },
    skill:      { type: String, required: true },
    dateStart:  { type: Date, required: true },
    dateEnd:    { type: Date, required: true },
    userA:      { type: String, ref: "User", required: true }, // Firebase UID
    userB:      { type: String, ref: "User", required: true },
    status:     { type: String, enum: ["upcoming", "done", "cancelled"], default: "upcoming" },
  },
  { timestamps: true }
);

export default mongoose.model("Session", sessionSchema);
