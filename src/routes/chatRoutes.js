/*  backend/src/routes/chatRoutes.js  */
import { Router } from "express";
import { protect } from "../middleware/authMiddleware.js";
import { getHistory } from "../controllers/chatController.js";

const router = Router();

// Fetch chat history (optional REST endpoint)
router.get("/:room", protect, getHistory);

export default router;
