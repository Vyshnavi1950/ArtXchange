import mongoose from "mongoose";

const matchSchema = new mongoose.Schema(
  {
    participants: [{ type: String, ref: "User", required: true }], // two UIDs
    skill:        { type: String, required: true },

    scheduledFor: { type: Date,  default: null },
    durationMin:  { type: Number, default: 60 },

    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "completed"],
      default: "pending",
    },

    videoRoom: { type: String, default: "" }, // WebRTC room id
  },
  { timestamps: true }
);

export default mongoose.model("Match", matchSchema);
