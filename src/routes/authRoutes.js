import { Router } from "express";
import { upload } from "../middleware/upload.js";

// ⬇️ import your auth controllers
import {
  registerUser,      // <── this was missing
  loginUser,
  forgotPassword,
} from "../controllers/authController.js";

const router = Router();

/* Registration route with avatar upload */
router.post("/register", upload.single("avatar"), registerUser);

/* Other auth routes (examples) */
router.post("/login",    loginUser);
router.post("/forgot",   forgotPassword);

export default router;
