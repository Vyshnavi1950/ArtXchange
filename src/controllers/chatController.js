/* backend/src/controllers/chatController.js */
import Message from "../models/Message.js";

export const getHistory = async (req, res) => {
  const { partnerId } = req.params;
  const skip = Number(req.query.skip) || 0;

  try {
    const msgs = await Message.find({
      $or: [
        { from: req.user._id, to: partnerId },
        { from: partnerId,    to: req.user._id },
      ],
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(30);

    res.json(msgs.reverse());
  } catch (err) {
    console.error("❌ chat history error:", err);
    res.status(500).json({ msg: "Failed to load messages" });
  }
};
