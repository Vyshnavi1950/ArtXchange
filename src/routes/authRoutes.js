/*  src/routes/authRoutes.js  */
import { Router } from "express";
import passport from "passport";            // ← add Passport for Google OAuth
import { upload } from "../middleware/upload.js";

import {
  registerUser,
  loginUser,
  forgotPassword,
  logoutUser,
  googleCallback,                           // success handler for Google auth
} from "../controllers/authController.js";

const router = Router();

/* -------- public auth endpoints -------- */
router.post("/register", upload.single("avatar"), registerUser);
router.post("/login",    loginUser);
router.post("/forgot",   forgotPassword);

/* -------- logout (works for button OR link) -------- */
router.post("/logout", logoutUser);          // preferred: fetch/axios POST
router.get("/logout",  logoutUser);          // optional: plain <a href="/logout">

/* -------- Google OAuth endpoints -------- */
// 1) Kick off Google sign‑in
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// 2) Google redirects back here
router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,                          // using JWT cookies instead of sessions
    failureRedirect: "/login",
  }),
  googleCallback                             // issues token + redirects to frontend
);

export default router;
