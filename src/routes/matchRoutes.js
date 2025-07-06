/*  backend/src/routes/matchRoutes.js  */
import express from "express";
import {
  suggestMatches,
  requestMatch,
  respondMatch,
  scheduleMatch,
  listMatches,
  getMatchWithUser,
  deleteMatch,
} from "../controllers/matchController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

/*  All routes below require authentication  */
router.use(protect);

/* ───────── Match collection ───────── */
router.get   ("/",         listMatches);     // GET   /api/matches
router.post  ("/",         requestMatch);    // POST  /api/matches (create)

/* ───────── Helper endpoints ───────── */
router.get   ("/suggest",  suggestMatches);  // GET   /api/matches/suggest
router.get   ("/with/:id", getMatchWithUser);// GET   /api/matches/with/:id

/* ───────── Actions on a specific match ───────── */
router.patch ("/:id/respond",  respondMatch);   // PATCH /api/matches/:id/respond (accept/reject)
router.patch ("/:id/schedule", scheduleMatch);  // PATCH /api/matches/:id/schedule (set date)
router.delete("/:id",          deleteMatch);    // DELETE /api/matches/:id

export default router;
