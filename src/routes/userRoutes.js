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
router.post   ("/:id([0-9a-fA-F]{24})/follow", protect, followUser);
router.delete ("/:id([0-9a-fA-F]{24})/follow", protect, unfollowUser);

/* ───────────── Public profile by ID (ObjectId only) ─────────────
   ⚠️  This **must stay last** so it doesn’t swallow earlier paths.
------------------------------------------------------------------ */
router.get("/:id([0-9a-fA-F]{24})", getUserById);

export default router;
