import { Router } from "express";
import { protect } from "../middleware/authMiddleware.js";
import { mySessions, addSession, updateStatus } from "../controllers/scheduleController.js";

const router = Router();

router.get("/",      protect, mySessions);
router.post("/",     protect, addSession);
router.patch("/:id", protect, updateStatus);

export default router;
