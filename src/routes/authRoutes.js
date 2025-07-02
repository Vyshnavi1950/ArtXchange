/*  src/routes/authRoutes.js  */
import { Router } from "express";
import { upload } from "../middleware/upload.js";

import {
  registerUser,
  loginUser,
  forgotPassword,
  logoutUser,   // ← NEW!
} from "../controllers/authController.js";

const router = Router();

/* -------- public auth endpoints -------- */
router.post("/register", upload.single("avatar"), registerUser);
router.post("/login",    loginUser);
router.post("/forgot",   forgotPassword);
router.post("/logout",   logoutUser);         // ← NEW!

export default router;
