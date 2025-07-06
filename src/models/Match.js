/*  backend/models/Match.js  */
import mongoose from "mongoose";

const matchSchema = new mongoose.Schema(
  {
    // Always exactly two user IDs (order-independent)
    participants: {
      type: [String],
      ref: "User",
      required: true,
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.length === 2,
        message: "Match must contain exactly two participants",
      },
    },

    // The one who initiated the match
    initiator: {
      type: String,
      ref: "User",
      required: true,
    },

    // The skill they’re trying to learn or share
    skill: {
      type: String,
      required: true,
    },

    // Current status of the match
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "completed", "expired"],
      default: "pending",
    },

    // Optional scheduling info
    scheduledFor: {
      type: Date,
      default: null,
    },
    durationMin: {
      type: Number,
      default: 60,
    },
    videoRoom: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

/* ───── Pre-save hook: always sort participants ───── */
matchSchema.pre("save", function (next) {
  if (Array.isArray(this.participants) && this.participants.length === 2) {
    this.participants.sort(); // so [A,B] === [B,A]
  }
  next();
});

/* ───── Unique index to prevent duplicate active matches ─────
   Only allows 1 pending/accepted match per skill + user pair.
   Rejected/completed ones can have new attempts later.
---------------------------------------------------------------- */
matchSchema.index(
  { participants: 1, skill: 1, status: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: { $in: ["pending", "accepted"] },
    },
  }
);

export default mongoose.model("Match", matchSchema);
