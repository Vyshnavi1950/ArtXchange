import User from "../models/User.js";
import Match from "../models/Match.js";

const randomRoom = () => Math.random().toString(36).slice(2, 10);

/* ---------- Suggest partners ---------- */
export const suggestMatches = async (req, res) => {
  const me = req.user;

  try {
    const teachMatches = await User.find({
      _id: { $ne: me._id },
      skillsNeeded: { $in: me.skillsOffered || [] },
    })
      .select("name avatar skillsNeeded skillsOffered email")
      .limit(10);

    const learnMatches = await User.find({
      _id: { $ne: me._id },
      skillsOffered: { $in: me.skillsNeeded || [] },
    })
      .select("name avatar skillsNeeded skillsOffered email")
      .limit(10);

    res.json({ teachMatches, learnMatches });
  } catch (err) {
    console.error("❌ suggestMatches error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

/* ---------- Request a match ---------- */
export const requestMatch = async (req, res) => {
  const meId = req.user._id;
  const { targetId, skill } = req.body;

  if (!targetId || !skill) {
    return res.status(400).json({ msg: "targetId & skill required" });
  }

  if (meId === targetId) {
    return res.status(400).json({ msg: "Cannot match with yourself" });
  }

  const exists = await Match.findOne({
    participants: { $all: [meId, targetId] },
    skill,
    status: "pending",
  });

  if (exists) {
    return res.json({ msg: "Match request already exists", match: exists });
  }

  const match = await Match.create({
    participants: [meId, targetId],
    skill,
  });

  res.status(201).json(match);
};

/* ---------- Accept / Reject a match ---------- */
export const respondMatch = async (req, res) => {
  const { id } = req.params;
  const { action } = req.body;

  if (!["accept", "reject"].includes(action)) {
    return res.status(400).json({ msg: "Invalid action" });
  }

  const match = await Match.findById(id);
  if (!match) return res.status(404).json({ msg: "Match not found" });

  if (!match.participants.includes(req.user._id)) {
    return res.status(403).json({ msg: "Not a participant" });
  }

  match.status = action === "accept" ? "accepted" : "rejected";
  await match.save();

  res.json(match);
};

/* ---------- Schedule a session ---------- */
export const scheduleMatch = async (req, res) => {
  const { id } = req.params;
  const { whenISO, durationMin = 60 } = req.body;

  const match = await Match.findById(id);
  if (!match) return res.status(404).json({ msg: "Match not found" });

  if (match.status !== "accepted") {
    return res.status(400).json({ msg: "Match not accepted yet" });
  }

  if (!match.participants.includes(req.user._id)) {
    return res.status(403).json({ msg: "Not a participant" });
  }

  match.scheduledFor = new Date(whenISO);
  match.durationMin = durationMin;
  match.videoRoom = randomRoom();

  await match.save();
  res.json(match);
};

/* ---------- List matches for current user ---------- */
export const listMatches = async (req, res) => {
  try {
    const matches = await Match.find({ participants: req.user._id })
      .sort({ updatedAt: -1 })
      .populate("participants", "name avatar skillsOffered skillsNeeded");

    res.json(matches);
  } catch (err) {
    console.error("❌ listMatches error:", err);
    res.status(500).json({ msg: "Failed to load matches" });
  }
};
export const deleteMatch = async (req, res) => {
  try {
    const { id } = req.params;
    const match = await Match.findById(id);

    if (!match) return res.status(404).json({ msg: "Match not found" });

    // only allow if requester is a participant or admin
    if (
      !match.participants.map(String).includes(req.user._id.toString()) &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ msg: "Not authorized to delete this match" });
    }

    await match.deleteOne();
    res.json({ msg: "Match deleted successfully" });
  } catch (err) {
    console.error("❌ deleteMatch error:", err);
    res.status(500).json({ msg: "Failed to delete match" });
  }
};