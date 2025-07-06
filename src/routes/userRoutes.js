/*  backend/src/routes/userRoutes.js  */
import { Router }          from "express";
import { protect }         from "../middleware/authMiddleware.js";
import { upload }          from "../middleware/upload.js";

import {
  getProfile,
  updateProfile,
  addPost,
  deletePost,
  getUserById,
  getUserByEmail,
  exploreUsers,
  followUser,
  unfollowUser,
} from "../controllers/userController.js";

const router = Router();

/* ───────────── Current‑user routes (protected) ───────────── */
router
  .route("/me")
  .get(   protect, getProfile)
  .put(   protect, upload.single("avatar"), updateProfile);

router.post   ("/me/posts",       protect, upload.single("image"), addPost);
router.delete ("/me/posts/:id",   protect, deletePost);

/* ───────────── Explore list (public) ───────────── */
router.get("/explore", exploreUsers);

/* ───────────── Email → User lookup (protected) ───────────── */
router.get("/email/:email", protect, getUserByEmail);

/* ───────────── Follow / Unfollow (protected) ───────────── */
/* Accept both ObjectId (24‑hex) and Firebase UID strings */
router.post   ("/:id/follow", protect, followUser);
router.delete ("/:id/follow", protect, unfollowUser);

/* ───────────── Public profile by ID (catch‑all) ─────────────
   ⚠️  Keep last so it doesn’t swallow earlier paths.
------------------------------------------------------------------ */
router.get("/:id", getUserById);

export default router;
