// routes/return.routes.js
import express from "express";
import {
  createReturnRequest,
  adminApproveReturn,
  adminReceiveAndProcessRefund,
  listReturnsForUser,
  getReturn,
  // return tracking / pickup helpers
  trackReturnPickup,
  cancelReturnPickup,
  generateReturnLabel,
} from "../Controllers/return.controller.js";
import { auth, isAdmin } from "../Middlewares/auth.js";

const router = express.Router();

/**
 * Public / User routes
 */

// Create a new return request
router.post("/create", auth, createReturnRequest);

// List all returns for current user (pagination optional)
router.get("/my-returns", auth, listReturnsForUser);

// Track return pickup status
router.get("/:id/track", auth, trackReturnPickup);

// Generate return label
router.get("/:id/label", auth, generateReturnLabel);

// Get a single return by ID
router.get("/:id", auth, getReturn);

// Cancel a return request (user)
router.post("/:id/cancel", auth, cancelReturnPickup);

/**
 * Admin routes
 *
 * NOTE: admin routes that are parameterized or could conflict with
 * /:id routes are declared here so that specific admin paths resolve
 * before the generic :id handlers above.
 */

// Approve a return and optionally schedule pickup
router.post("/:id/approve", isAdmin, adminApproveReturn);

// Mark return received and process refund
router.post("/:id/receive", isAdmin, adminReceiveAndProcessRefund);

// Cancel return pickup (admin only) — re-uses cancelReturnPickup handler
router.post("/:id/cancel-pickup", isAdmin, cancelReturnPickup);

// Placeholder admin endpoints (if you add these later in controller)
router.get("/admin/all", isAdmin, (req, res) =>
  res.status(501).json({ message: "adminGetAllReturns not implemented yet" })
);

router.put("/:id/status", isAdmin, (req, res) =>
  res
    .status(501)
    .json({ message: "adminUpdateReturnStatus not implemented yet" })
);

export default router;
