// routes/auth.routes.js
import { Router } from "express";
import { auth } from "../Middlewares/auth.js";
import {
  requestOtp,
  verifyOtp,
  me,
  logout,
} from "../Controllers/auth.controller.js";

const router = Router();
router.post("/otp/request", requestOtp);
router.post("/otp/verify", verifyOtp);
router.get("/me", auth, me);
router.post("/logout", logout);

export default router;
