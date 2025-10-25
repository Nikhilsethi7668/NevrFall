// routes/return.routes.js
import express from "express";
import returnController from "../Controllers/return.controller.js";
import { auth, isAdmin } from "../Middlewares/auth.js";

const router = express.Router();

/**
 * User routes
 */
// Create a new return request
router.post("/create", auth, returnController.createReturnRequest);

// Cancel a return request
router.post("/:id/cancel", auth, returnController.cancelReturnRequest);

// List all returns for current user (pagination optional)
router.get("/my-returns", auth, returnController.listReturnsForUser);

// Get a single return by ID
router.get("/:id", auth, returnController.getReturn);

// Track return pickup status
router.get("/:id/track", auth, returnController.trackReturnPickup);

// Generate return label
router.get("/:id/label", auth, returnController.generateReturnLabel);

/**
 * Admin routes
 */
// Approve a return and optionally schedule pickup
router.post("/:id/approve", isAdmin, returnController.adminApproveReturn);

// Mark return received and process refund
router.post(
  "/:id/receive",
  isAdmin,
  returnController.adminReceiveAndProcessRefund
);

// Cancel return pickup (admin only)
router.post("/:id/cancel-pickup", isAdmin, returnController.cancelReturnPickup);

// Get all returns (admin)
router.get("/admin/all", isAdmin, returnController.adminGetAllReturns);

// Update return status (admin)
router.put("/:id/status", isAdmin, returnController.adminUpdateReturnStatus);

export default router;
