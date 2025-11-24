// routes/return.routes.js
import express from "express";
import returnController from "../Controllers/return.controller.js";
import { auth, isAdmin } from "../Middlewares/auth.js";
import { cancelReturnRequest } from "../Controllers/return.controller.js";

const router = express.Router();

/**
 * User routes
 */
// Create a new return request
router.post(
  "/create",
  auth, // logged-in users only
  returnController.createReturnRequest
);

// Cancel a return request
router.post("/:id/cancel", auth, cancelReturnRequest);

// List all returns for current user (pagination optional)
router.get("/my-returns", auth, returnController.listReturnsForUser);

// Get a single return by ID
router.get("/:id", auth, returnController.getReturn);

/**
 * Admin routes
 */
router.get("/", auth, isAdmin, returnController.listAllReturns);

router.post("/:id/approve", auth, isAdmin, returnController.adminApproveReturn);
router.post("/:id/receive", auth, isAdmin, returnController.adminReceiveAndProcessRefund);

export default router;
