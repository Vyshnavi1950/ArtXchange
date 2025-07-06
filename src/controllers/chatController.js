import Message from "../models/Message.js";

/* GET /api/chat/:partnerId */
export const getHistory = async (req, res) => {
  try {
    const me  = String(req.user._id);
    const you = String(req.params.partnerId);
    const room = [me, you].sort().join("|");

    const msgs = await Message.find({ room }).sort({ createdAt: 1 });
    res.json(msgs);
  } catch (err) {
    console.error("getHistory error:", err);
    res.status(500).json({ msg: "Failed to load messages" });
  }
};
