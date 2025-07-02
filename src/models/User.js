/*  backend/models/User.js  */
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    /* Firebase UID is stored directly as _id (string) */
    _id: { type: String },

    name:     { type: String, required: true },
    email:    { type: String, required: true, unique: true },
    password: { type: String, default: "placeholder", select: false }, // not used
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
userSchema.index({ email: 1 }, { unique: true }); // enforce unique email
userSchema.index({ name: 1 });                    // speed up Explore search

export default mongoose.model("User", userSchema);
