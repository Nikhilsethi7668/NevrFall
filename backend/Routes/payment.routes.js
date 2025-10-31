import express from "express";
import { verifyPayment } from "../Controllers/order.controller.js";
import { auth } from "../Middlewares/auth.js";
import WalletTransaction from "../Models/WalletTransaction.js";

const router = express.Router();

// Webhook endpoints (no authentication required)
router.post("/webhook/razorpay", verifyPayment);
router.post("/webhook/payu", verifyPayment);

//Wallet history
router.get("/wallet/history", auth, WalletTransaction);
export default router;
