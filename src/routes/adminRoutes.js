import { Router } from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  requireAdmin,
  listUsers,
  toggleAdmin,
  deleteUser,
  listMatches,
  forceDeleteMatch,
} from "../controllers/adminController.js";

const router = Router();
router.use(protect, requireAdmin);

router.get   ("/users",            listUsers);
router.patch ("/users/:id/admin",  toggleAdmin);
router.delete("/users/:id",        deleteUser);

router.get   ("/matches",          listMatches);
router.delete("/matches/:id",      forceDeleteMatch);

export default router;
