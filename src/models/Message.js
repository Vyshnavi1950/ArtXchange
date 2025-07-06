import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    /* Sorted pair of user IDs, e.g. "A|B"  */
    room: { type: String, required: true },

    participants: {
      type: [String],           // ["uidA", "uidB"]
      validate: a => a.length === 2,
      required: true,
    },

    from: { type: String, ref: "User", required: true },
    to:   { type: String, ref: "User", required: true },

    text: { type: String, required: true },
    seen: { type: Boolean, default: false },
  },
  { timestamps: true }
);

/* Auto‑fill room before validation */
messageSchema.pre("validate", function (next) {
  if (!this.room && Array.isArray(this.participants) && this.participants.length === 2) {
    this.participants.sort();                // [A,B] === [B,A]
    this.room = this.participants.join("|"); // "A|B"
  }
  next();
});

export default mongoose.model("Message", messageSchema);
