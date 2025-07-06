/* ✅ backend/controllers/matchController.js */
import User  from "../models/User.js";
import Match from "../models/Match.js";

const randomRoom = () => Math.random().toString(36).slice(2, 10);

/* ───────── Suggest partners (teach / learn) ───────── */
export const suggestMatches = async (req, res) => {
  const me = req.user;
  try {
    const teachMatches = await User.find({
      _id: { $ne: me._id },
      skillsNeeded: { $in: me.skillsOffered || [] },
    }).select("name avatar skillsNeeded skillsOffered email").limit(10);

    const learnMatches = await User.find({
      _id: { $ne: me._id },
      skillsOffered: { $in: me.skillsNeeded || [] },
    }).select("name avatar skillsNeeded skillsOffered email").limit(10);

    res.json({ teachMatches, learnMatches });
  } catch (err) {
    console.error("❌ suggestMatches:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

/* ───────── Create / request a match ───────── */
export const requestMatch = async (req, res) => {
  try {
    const meId              = String(req.user._id);
    const { targetId, skill } = req.body;

    if (!targetId || !skill) {
      return res.status(400).json({ msg: "targetId & skill required" });
    }
    if (meId === targetId) {
      return res.status(400).json({ msg: "Cannot match with yourself" });
    }

    const participants = [meId, String(targetId)].sort();

    /* Check if there's already an *active* match (pending | accepted) */
    const active = await Match.findOne({
      participants,
      status: { $in: ["pending", "accepted"] },
    });

    if (active) {
      return res.status(409).json({
        msg: "An active match already exists",
        currentStatus: active.status,
      });
    }

    /* Create new match */
    const match = await Match.create({
      participants,
      initiator: meId,
      skill,
    });

    res.status(201).json(match);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ msg: "Duplicate active match" });
    }
    console.error("❌ requestMatch:", err);
    res.status(500).json({ msg: "Failed to create match" });
  }
};

/* ───────── Accept / Reject ───────── */
export const respondMatch = async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body; // "accept" | "reject"

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
  } catch (err) {
    console.error("❌ respondMatch:", err);
    res.status(500).json({ msg: "Failed to update match" });
  }
};

/* ───────── Schedule a session ───────── */
export const scheduleMatch = async (req, res) => {
  try {
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
    match.durationMin  = durationMin;
    match.videoRoom    = randomRoom();

    await match.save();
    res.json(match);
  } catch (err) {
    console.error("❌ scheduleMatch:", err);
    res.status(500).json({ msg: "Failed to schedule match" });
  }
};

/* ───────── List my matches ───────── */
export const listMatches = async (req, res) => {
  try {
    const matches = await Match.find({ participants: req.user._id })
      .sort({ updatedAt: -1 })
      .populate("participants", "name avatar skillsOffered skillsNeeded");
    res.json(matches);
  } catch (err) {
    console.error("❌ listMatches:", err);
    res.status(500).json({ msg: "Failed to load matches" });
  }
};

/* ───────── Status with a single user ───────── */
export const getMatchWithUser = async (req, res) => {
  try {
    const me   = String(req.user._id);
    const you  = String(req.params.id);
    const participants = [me, you].sort();

    const match = await Match.findOne({ participants });
    if (!match) return res.json({ status: "none" });

    res.json({ status: match.status, match });
  } catch (err) {
    console.error("❌ getMatchWithUser:", err);
    res.status(500).json({ msg: "Failed to fetch match" });
  }
};

/* ───────── Delete ───────── */
export const deleteMatch = async (req, res) => {
  try {
    const match = await Match.findById(req.params.id);
    if (!match) return res.status(404).json({ msg: "Match not found" });

    const isParticipant = match.participants
      .map(String)
      .includes(String(req.user._id));
    const isAdmin = req.user.isAdmin || req.user.role === "admin";

    if (!isParticipant && !isAdmin) {
      return res.status(403).json({ msg: "Not authorized" });
    }

    await match.deleteOne();
    res.json({ msg: "Match deleted" });
  } catch (err) {
    console.error("❌ deleteMatch:", err);
    res.status(500).json({ msg: "Failed to delete match" });
  }
};
