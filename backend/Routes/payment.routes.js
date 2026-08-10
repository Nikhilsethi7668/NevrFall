// import express from "express";
// import { verifyPayment } from "../Controllers/order.controller.js";
// import { auth } from "../Middlewares/auth.js";
// import WalletTransaction from "../Models/WalletTransaction.js";
// import bodyParser from "body-parser";
// import { stripeWebhook } from "../Controllers/webhook.controller.js";
// const router = express.Router();

// // Webhook endpoints (no authentication required)
// // Webhook endpoints (no authentication required)
// router.post("/webhook/razorpay", verifyPayment);
// router.post("/webhook/payu", verifyPayment);

// // Stripe Webhook needs raw body for signature verification

// // router.post(
// //     "/webhook/stripe",
// //     bodyParser.raw({ type: "application/json" }),
// //     stripeWebhook
// // );

// //Wallet history
// router.get("/wallet/history", auth, WalletTransaction);
// export default router;
