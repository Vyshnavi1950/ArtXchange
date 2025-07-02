import { Router } from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  suggestMatches,
  requestMatch,
  respondMatch,
  scheduleMatch,
  listMatches,
  deleteMatch,          // ← NEW
} from "../controllers/matchController.js";

const router = Router();
router.use(protect);    // all routes require JWT

router.get ("/suggest",       suggestMatches);
router.get ("/",              listMatches);
router.post("/",              requestMatch);
router.patch("/:id/respond",  respondMatch);
router.patch("/:id/schedule", scheduleMatch);
router.delete("/:id",         deleteMatch);   // ← NEW

export default router;
