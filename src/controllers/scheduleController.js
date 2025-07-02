import Session from "../models/Session.js";

/* GET /api/schedule  – all my sessions */
export const mySessions = async (req, res) => {
  const uid = req.user._id;
  const sessions = await Session.find({ $or: [{ userA: uid }, { userB: uid }] });
  res.json(sessions);
};

/* POST /api/schedule  – create new */
export const addSession = async (req, res) => {
  const { title, skill, dateStart, dateEnd, partnerId } = req.body;
  try {
    const session = await Session.create({
      title,
      skill,
      dateStart,
      dateEnd,
      userA: req.user._id,
      userB: partnerId,
    });
    res.status(201).json(session);
  } catch (err) {
    res.status(400).json({ msg: "Create failed" });
  }
};

/* PATCH /api/schedule/:id  – update status */
export const updateStatus = async (req, res) => {
  const { status } = req.body; // done | cancelled
  const session = await Session.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true }
  );
  res.json(session);
};
