/*  src/middleware/authMiddleware.js  */
import jwt from "jsonwebtoken";
import admin from "firebase-admin";          // already initialised in server.js
import User  from "../models/User.js";

const { JWT_SECRET } = process.env;
if (!JWT_SECRET) throw new Error("JWT_SECRET env variable is not set");

/* ───────────────────── protect ─────────────────────
   Accepts EITHER:
     • Cookie  → req.cookies.token         (your HS256 JWT)
     • Header  → Authorization: Bearer x   (Firebase ID token)

   On success:
     • Loads / creates the DB‑User doc.
     • Attaches req.user and calls next().
---------------------------------------------------- */
export const protect = async (req, res, next) => {
  try {
    /* 1️⃣ Pick whichever token is present */
    const bearer      = req.headers.authorization || "";
    const headerToken = bearer.startsWith("Bearer ") ? bearer.split(" ")[1] : null;
    const cookieToken = req.cookies?.token || null;

    if (!headerToken && !cookieToken) {
      return res.status(401).json({ msg: "No token provided" });
    }

    /* 2️⃣ Try cookie‑JWT first (fast local verify) */
    if (cookieToken) {
      try {
        const decoded = jwt.verify(cookieToken, JWT_SECRET, { algorithms: ["HS256"] });
        const user    = await User.findById(decoded.userId).select("-password");
        if (!user) return res.status(401).json({ msg: "User not found" });
        req.user = user;
        return next();
      } catch (e) {
        // cookie might be expired/invalid → fall through to Firebase check
      }
    }

    /* 3️⃣ Fallback to Firebase ID token */
    try {
      const fb = await admin.auth().verifyIdToken(headerToken);
      let user = await User.findOne({ email: fb.email });
      if (!user) {
        // first‑time social login → create DB user
        user = await User.create({
          name:   fb.name  || fb.email.split("@")[0],
          email:  fb.email,
          avatar: fb.picture || "",
          password: "",           // empty ⇒ social login
        });
      }
      req.user = user;
      return next();
    } catch (err) {
      return res.status(401).json({ msg: "Token invalid or expired" });
    }

  } catch (err) {
    console.error("authMiddleware:", err);
    res.status(500).json({ msg: "Auth middleware error" });
  }
};

/* ───────────────── requireAdmin ───────────────── */
export const requireAdmin = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ msg: "Admin access required" });
  }
  next();
};
