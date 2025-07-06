/*  backend/models/User.js  */
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    /* Firebase UID is stored directly as _id (string) */
    _id: { type: String },

    name:     { type: String, required: true },
    email:    { type: String, required: true, unique: true },  // ← the only email index
    password: { type: String, default: "placeholder", select: false },
    avatar:   { type: String, default: "" },

    bio: { type: String, default: "" },

    /* Skill arrays */
    skillsOffered: [String],
    skillsNeeded:  [String],

    /* Social */
    followers: [{ type: String, ref: "User" }],
    following: [{ type: String, ref: "User" }],

    /* Artwork posts */
    posts: [
      {
        image:   String,
        caption: String,
      },
    ],

    /* Admin flag */
    isAdmin: { type: Boolean, default: false },
  },
  { timestamps: true }
);

/* ---------- Indexes ---------- */
// email already has a unique index via the field option above
userSchema.index({ name: 1 }); // for quick lookup by name

export default mongoose.model("User", userSchema);
