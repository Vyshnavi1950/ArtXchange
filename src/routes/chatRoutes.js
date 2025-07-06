// ✅ backend/src/routes/chatRoutes.js
import { Router } from "express";
import { protect } from "../middleware/authMiddleware.js";
import { getHistory } from "../controllers/chatController.js";

const router = Router();

// ✅ Corrected route: partnerId instead of room
router.get("/:partnerId", protect, getHistory);

export default router;
