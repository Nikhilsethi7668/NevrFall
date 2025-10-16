// routes/exchange.routes.js
import express from "express";
import {
  createExchange,
  qcHandler,
  confirmPaymentAndPlaceOrder,
  // Optional controllers if implemented
  // listExchanges,
  // getExchangeDetails,
  // cancelRequestedExchange
} from "../Controllers/exchange.controller.js";
import { authMiddleware, isAdmin } from "../Middlewares/auth.js"; // assuming you have auth middleware

const router = express.Router();

/**
 * User routes
 */
router.post(
  "/create",
  authMiddleware, // user must be logged in
  createExchange
);

router.post(
  "/confirm-payment",
  authMiddleware, // user or admin depending on flow
  confirmPaymentAndPlaceOrder
);

/**
 * Admin / QC routes
 */
router.post(
  "/qc",
  adminMiddleware, // only admin/QC personnel
  qcHandler
);

// Optional future routes
// router.get("/", isAdmin, listExchanges);
// router.get("/:exchangeId", isAdmin, getExchangeDetails);
// router.post("/:exchangeId/cancel", isAdmin, cancelRequestedExchange);

export default router;
