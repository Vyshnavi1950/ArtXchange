// src/routes/authRoutes.js
import { Router } from "express";
import passport from "passport";

import { upload } from "../middleware/upload.js";
import { protect } from "../middleware/authMiddleware.js";   // ⬅️ named import!

import {
  registerUser,
  loginUser,
  forgotPassword,
  logoutUser,
  googleCallback,
} from "../controllers/authController.js";

const router = Router();

/* ---------- Public ---------- */
router.post("/register", upload.single("avatar"), registerUser);
router.post("/login",    loginUser);
router.post("/forgot",   forgotPassword);

/* ---------- Google OAuth ---------- */
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: "/login",
  }),
  googleCallback
);

/* ---------- Auth‑protected probe ---------- */
router.get("/me", protect, (req, res) => {
  res.json(req.user );
});

/* ---------- Logout (POST or GET) ---------- */
router.route("/logout").post(logoutUser).get(logoutUser);

export default router;
