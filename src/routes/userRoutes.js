/*  backend/src/routes/userRoutes.js  */
import { Router } from "express";
import { protect } from "../middleware/authMiddleware.js";
import { upload }  from "../middleware/upload.js";

import {
  getProfile,
  updateProfile,
  addPost,
  deletePost,
  getUserById,
  getUserByEmail,   // ← NEW
  exploreUsers,
  followUser,
  unfollowUser,
} from "../controllers/userController.js";

const router = Router();

/* ────────── Current user (protected) ────────── */
router.get ("/me",             protect, getProfile);
router.put ("/me",             protect, upload.single("avatar"), updateProfile);
router.post("/me/posts",       protect, upload.single("image"),  addPost);
router.delete("/me/posts/:id", protect, deletePost);

/* ────────── Explore list (public) ────────── */
router.get("/explore", exploreUsers);

/* ────────── E‑mail → user lookup  (protected) ────────── */
router.get("/email/:email", protect, getUserByEmail);  //  ← NEW route

/* ────────── Follow / unfollow (protected) ────────── */
router.post  ("/:id/follow",  protect, followUser);
router.delete("/:id/follow",  protect, unfollowUser);

/* ────────── Public profile by ID (last, catches /:id) ────────── */
router.get("/:id", getUserById);

export default router;
