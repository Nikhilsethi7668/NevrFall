// routes/return.routes.js
import express from "express";
import returnController from "../Controllers/return.controller.js";
import { authMiddleware, adminMiddleware } from "../Middlewares/auth.js";

const router = express.Router();

/**
 * User routes
 */
// Create a new return request
router.post(
  "/create",
  authMiddleware, // logged-in users only
  returnController.createReturnRequest
);

// Cancel a return request
router.post(
  "/:id/cancel",
  authMiddleware,
  returnController.cancelReturnRequest
);

// List all returns for current user (pagination optional)
router.get("/my-returns", authMiddleware, returnController.listReturnsForUser);

// Get a single return by ID
router.get("/:id", authMiddleware, returnController.getReturn);

/**
 * Admin routes
 */
// Approve a return and optionally schedule pickup
router.post(
  "/:id/approve",
  adminMiddleware, // admin-only
  returnController.adminApproveReturn
);

// Mark return received and process refund
router.post(
  "/:id/receive",
  adminMiddleware, // admin-only
  returnController.adminReceiveAndProcessRefund
);

export default router;
