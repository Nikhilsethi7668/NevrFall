import { Router } from "express";
import { auth, isAdmin, isSupport } from "../../Middlewares/auth.js";
import {
  getAllOrders,
  updateOrderStatus,
  approveRefund,
  getOrderAnalytics,
  getOrderById,
} from "../../Controllers/admin/adminOrder.controller.js";

const router = Router();

router.get("/", auth, isSupport, getAllOrders);
router.get("/analytics", auth, isAdmin, getOrderAnalytics);
router.get("/:id", auth, isSupport, getOrderById);

router.patch("/:id/status", auth, isAdmin, updateOrderStatus);
router.post("/:id/refund", auth, isAdmin, approveRefund);

export default router;