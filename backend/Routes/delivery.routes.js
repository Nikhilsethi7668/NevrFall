import express from "express";
import {
  createDelivery,
  generateLabel,
  generateManifest,
  trackShipment,
  cancelDelivery,
  handleWebhook,
  getDelivery,
  getUserDeliveries,
  updateDeliveryStatus,
} from "../Controllers/delivery.controller.js";
import { auth } from "../Middlewares/auth.js";

const router = express.Router();

// Public / frontend
// Rename pincode route to generic name (implement in controller if needed)
router.get("/delivery/pincode/check", async (req, res) => {
  // implement pincode handler or forward to appropriate service
  res.status(501).json({ message: "Pincode check not implemented" });
});

// Admin / internal (requires auth)
router.post("/delivery", auth, async (req, res) => {
  // dispatchOrder -> createDelivery
  try {
    const { orderId } = req.body;
    const delivery = await createDelivery(orderId);
    res.status(201).json(delivery);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
router.post("/delivery/pickup", auth, async (req, res) => {
  // Hookup shiprocket pickup scheduling (call shiprocketService or controller wrapper)
  res.status(501).json({ message: "Pickup endpoint not implemented" });
});
router.post("/delivery/cancel", auth, async (req, res) => {
  try {
    const { deliveryId } = req.body;
    await cancelDelivery(deliveryId);
    res.json({ ok: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// OTP endpoints (if you need them — currently not implemented in controller)
router.post("/delivery/:deliveryId/otp/generate", auth, (req, res) =>
  res.status(501).json({ message: "OTP generate not implemented" })
);
router.post("/delivery/:deliveryId/otp/verify", auth, (req, res) =>
  res.status(501).json({ message: "OTP verify not implemented" })
);

// Shipment status/public tracking
router.get("/delivery/:deliveryId/status", auth, async (req, res) => {
  try {
    const result = await trackShipment(req.params.deliveryId); // or getShipmentStatus wrapper
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Webhook for Shiprocket (public)
router.post("/delivery/webhook/shiprocket", async (req, res) => {
  try {
    await handleWebhook(req.body);
    res.status(200).send("OK");
  } catch (err) {
    res.status(500).send("error");
  }
});

export default router;
