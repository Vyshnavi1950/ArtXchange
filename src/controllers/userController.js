/*  backend/src/controllers/userController.js  */
import User from "../models/User.js";

/* ---------------- Helper ---------------- */
const BASE = process.env.SERVER_URL || "http://localhost:5000";
const fullUrl = (rel) => (rel?.startsWith("http") ? rel : `${BASE}${rel}`);

/* ---------------- Current user ---------------- */
export const getProfile = (req, res) => res.json(req.user);

/* ---------------- Public profile by ID ---------------- */
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ msg: "User not found" });
    res.json(user);
  } catch (err) {
    console.error("getUserById error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

/* ---------------- Explore (UID‑only) ---------------- */
export const exploreUsers = async (req, res) => {
  try {
    const page   = Number(req.query.page  || 1);
    const limit  = Number(req.query.limit || 12);
    const skill  = (req.query.skill || "").trim();
    const userId = req.query.userId || null;

    const filter = { _id: { $type: "string" } };   // only Firebase‑UID docs
    if (userId) filter._id.$ne = userId;           // exclude current user

    if (skill) {
      const regex = new RegExp(skill, "i");
      filter.$or = [
        { name:          regex },
        { bio:           regex },
        { skillsOffered: regex },
        { skillsNeeded:  regex },
      ];
    }

    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find(filter)
        .sort({ _id: 1 })
        .skip(skip)
        .limit(limit)
        .select("name avatar skillsOffered")
        .lean(),
      User.countDocuments(filter),
    ]);

    res.json({ users, total });
  } catch (err) {
    console.error("exploreUsers error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

/* ---------------- Update profile ---------------- */
export const updateProfile = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ msg: "Unauthorized" });

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ msg: "User not found" });

    /* avatar (optional) */
    if (req.file) user.avatar = `/uploads/${req.file.filename}`;

    /* simple text fields */
    if (req.body.name !== undefined) user.name = req.body.name;
    if (req.body.bio  !== undefined) user.bio  = req.body.bio;

    /* skills – accept old and new keys */
    const teach =
      req.body.skillsTeach   ?? req.body.skillsOffered ?? undefined;
    const learn =
      req.body.skillsLearn   ?? req.body.skillsNeeded  ?? undefined;

    const toArray = (s) =>
      (s || "")
        .split(",")
        .map((v) => v.trim())
        .filter(Boolean);

    if (teach !== undefined) user.skillsOffered = toArray(teach);
    if (learn !== undefined) user.skillsNeeded  = toArray(learn);

    await user.save();
    res.json(user);
  } catch (err) {
    console.error("updateProfile error:", err);
    res.status(500).json({ msg: "Update failed" });
  }
};

/* ---------------- Artwork posts ---------------- */
export const addPost = async (req, res) => {
  if (!req.user) return res.status(401).json({ msg: "Unauthorized" });
  if (!req.file) return res.status(400).json({ msg: "No image uploaded" });

  const post = {
    image: `/uploads/${req.file.filename}`,
    caption: req.body.caption || "",
  };

  req.user.posts ??= [];
  req.user.posts.push(post);
  await req.user.save();

  res.status(201).json({ ...post, image: fullUrl(post.image) });
};

export const deletePost = async (req, res) => {
  if (!req.user) return res.status(401).json({ msg: "Unauthorized" });

  const idx = Number(req.params.id);
  if (Number.isNaN(idx) || idx < 0 || idx >= req.user.posts.length)
    return res.status(400).json({ msg: "Invalid post index" });

  req.user.posts.splice(idx, 1);
  await req.user.save();
  res.json({ msg: "Deleted" });
};

/* ---------------- Follow / Unfollow ---------------- */
export const followUser = async (req, res) => {
  const meId = req.user._id;
  const targetId = req.params.id;
  if (meId === targetId)
    return res.status(400).json({ msg: "Cannot follow yourself" });

  await Promise.all([
    User.updateOne({ _id: meId },     { $addToSet: { following: targetId } }),
    User.updateOne({ _id: targetId }, { $addToSet: { followers: meId   } }),
  ]);
  res.json({ msg: "Followed" });
};

export const unfollowUser = async (req, res) => {
  const meId = req.user._id;
  const targetId = req.params.id;
  await Promise.all([
    User.updateOne({ _id: meId },     { $pull: { following: targetId } }),
    User.updateOne({ _id: targetId }, { $pull: { followers: meId   } }),
  ]);
  res.json({ msg: "Unfollowed" });
};
/* ───────── find user by e‑mail (for scheduling) ───────── */
export const getUserByEmail = async (req, res) => {
  try {
    const email = decodeURIComponent(req.params.email);
    const user  = await User.findOne({ email }).select("-password");
    if (!user) return res.status(404).json({ msg: "User not found" });
    res.json(user);
  } catch (err) {
    console.error("getUserByEmail error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};
