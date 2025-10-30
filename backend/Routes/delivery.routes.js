// routes/delivery.routes.js
import express from "express";
import { auth } from "../Middlewares/auth.js";
import Delivery from "../Models/Delivery.js";

import {
  // serviceability & misc
  pincodeServiceability,
  heavyPincodeServiceability,
  expectedTatController,
  calculateCostController,

  // waybills / labels
  fetchWaybillsController,
  fetchWaybillSingleController,
  generateLabelController,

  // shipments / manifests
  createShipmentController,
  createPickupController,
  cancelShipmentController,
  editShipmentController,
  createReturnController,

  // tracking / webhook / docs
  trackController,
  delhiveryWebhookHandler,
  downloadDocumentController,

  // NDR
  ndrActionController,
  getNdrStatusController,
} from "../Controllers/delivery.controller.js";

const router = express.Router();

/**
 * Public / frontend
 */
router.get(
  "/delivery/pincode/delhivery",
  // Query: ?pincode=110001 or ?filter_codes=110001
  pincodeServiceability
);

router.get("/delivery/pincode/heavy", heavyPincodeServiceability);
// Example: /delivery/pincode/heavy?pincode=560001&product_type=heavy

router.get("/delivery/expected-tat", expectedTatController);
// Query: ?origin_pin=xxxx&destination_pin=yyyy&mot=xxx&pdt=...

router.get("/delivery/cost", calculateCostController);
// Query params as required by calculateShippingCost

/**
 * Waybills & labels (admin)
 */
router.get("/delivery/waybills/fetch", auth, fetchWaybillsController);
// Query: ?count=10

router.get("/delivery/waybill/fetch", auth, fetchWaybillSingleController);

router.get("/delivery/label", auth, generateLabelController);
// Query: ?deliveryId=... or ?waybill=...&pdf_size=A4

/**
 * Dispatch / pickup / cancel / edit (admin)
 *
 * - createShipmentController is used for creating manifests (dispatch)
 * - createPickupController to schedule pickup
 */
router.post("/delivery/dispatch", auth, createShipmentController);
// body: { orderId, clientId, payload: { shipments: [...], pickup_location: {...} }, configName }

router.post("/delivery/pickup", auth, createPickupController);
// body: { deliveryId / pickup_location, pickup_time, pickup_date, expected_package_count }

router.post("/delivery/cancel", auth, cancelShipmentController);
// body: { deliveryId, waybill, configName }

router.post("/delivery/edit", auth, editShipmentController);
// body: { waybill, ...editableFields }

/**
 * Returns
 */
router.post("/delivery/return", auth, createReturnController);
// body: { payload, configName }

/**
 * Tracking & status
 */
router.get("/delivery/track", trackController);
// public fallback: /delivery/track?waybill=12345

router.get("/delivery/:deliveryId/status", auth, async (req, res) => {
  try {
    const { deliveryId } = req.params;
    if (!deliveryId)
      return res.status(400).json({ ok: false, error: "deliveryId required" });
    const d = await Delivery.findById(deliveryId).lean();
    if (!d)
      return res.status(404).json({ ok: false, error: "Delivery not found" });

    const lastHistory =
      d.history && d.history.length ? d.history[d.history.length - 1] : null;
    return res.json({
      ok: true,
      data: {
        _id: d._id,
        order: d.order,
        waybill: d.waybill,
        status: d.status,
        deliveredAt: d.deliveredAt || null,
        otpVerified: d.otpVerified || false,
        lastHistory,
      },
    });
  } catch (err) {
    console.error("getShipmentStatus route error:", err);
    return res
      .status(500)
      .json({ ok: false, error: err.message || "server error" });
  }
});

/**
 * Webhooks (public)
 *
 * NOTE: ensure you parse raw body for HMAC signature verification if you use it.
 */
router.post("/delivery/webhook/scan", delhiveryWebhookHandler);
router.post("/delivery/webhook/doc", delhiveryWebhookHandler);

/**
 * Documents & NDR
 */
router.get("/delivery/document", downloadDocumentController);
// Query: ?doc_type=...&waybill=...

router.post("/delivery/ndr", auth, ndrActionController);
// body: { items: [{ waybill, act }] }

router.get("/delivery/ndr/status", auth, getNdrStatusController);
// Query: ?uplId=...

/**
 * OTP routes
 * If you still have generateDeliveryOtp / verifyDeliveryOtp implemented elsewhere,
 * import them and uncomment these routes.
 */
// router.post("/delivery/:deliveryId/otp/generate", auth, generateDeliveryOtp);
// router.post("/delivery/:deliveryId/otp/verify", auth, verifyDeliveryOtp);

export default router;
