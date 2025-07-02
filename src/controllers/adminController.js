import User  from "../models/User.js";
import Match from "../models/Match.js";

export const requireAdmin = (req, _res, next) => {
  if (!req.user?.isAdmin) return next({ status: 403, msg: "Admins only" });
  next();
};

/* ---- Users ---- */
export const listUsers = async (_req, res) => {
  const users = await User.find().select("name email isAdmin createdAt");
  res.json(users);
};

export const toggleAdmin = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ msg: "User not found" });
  user.isAdmin = !user.isAdmin;
  await user.save();
  res.json(user);
};

export const deleteUser = async (req, res) => {
  await User.deleteOne({ _id: req.params.id });
  res.json({ msg: "User deleted" });
};

/* ---- Matches ---- */
export const listMatches = async (_req, res) => {
  const matches = await Match.find().populate("participants", "name email");
  res.json(matches);
};

export const forceDeleteMatch = async (req, res) => {
  await Match.deleteOne({ _id: req.params.id });
  res.json({ msg: "Match removed" });
};
