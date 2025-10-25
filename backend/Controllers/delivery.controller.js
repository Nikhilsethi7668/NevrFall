import mongoose from "mongoose";
import Delivery from "../Models/Delivery.js";
import Order from "../Models/Order.js";
import crypto from "crypto";
import { sendSms } from "../Services/phone.service.js";
import { deliveryQueue } from "../Services/delivery.worker.js";
// import { sendSms } from "../Services/phone.service.js";
import * as shiprocketService from "../Services/shiprocket.service.js";

import logger from "../utils/logger.js";

const WEBHOOK_SECRET = process.env.SHIPROCKET_WEBHOOK_SECRET || null;
const QUEUE_ENABLED = (process.env.QUEUE_ENABLED || "true") === "true";
const FORCE_SYNC_SHIPROCKET =
  (process.env.FORCE_SYNC_SHIPROCKET || "false") === "true";

// Utility: generate numeric OTP (6 digits)
const generateOtp = () => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

const hashPayload = (payload) =>
  crypto.createHash("sha256").update(JSON.stringify(payload)).digest("hex");

// send OTP wrapper (uses sendSms)
const sendOtpToCustomer = async (delivery, reason = "delivery_otp") => {
  try {
    // ensure delivery is populated for order/user and phone
    const populated =
      (await delivery.populate("order user").execPopulate?.()) ??
      (await Delivery.findById(delivery._id).populate("order user"));
    const phone =
      populated?.order?.shippingAddress?.phone ||
      populated?.user?.phone ||
      populated?.shippingPhone ||
      null;
    const otp = populated?.otp;
    if (!phone || !otp) {
      logger.warn("OTP not sent — missing phone or otp", {
        deliveryId: delivery._id,
        phone,
        otp,
      });
      return;
    }

    await sendSms(phone, otp);
    logger.info("OTP sent to customer", {
      deliveryId: delivery._id,
      phone,
      reason,
    });
  } catch (err) {
    logger.error("Failed to send OTP", {
      deliveryId: delivery._id,
      error: err.message || err,
    });
  }
};
// Create delivery and shiprocket order
export const createDelivery = async (orderId) => {
  const session = await mongoose.startSession();
  try {
    const created = await session.withTransaction(async () => {
      const order = await Order.findById(orderId).session(session);
      if (!order) throw new Error("Order not found");

      const existingDelivery = await Delivery.findOne({
        order: orderId,
      }).session(session);
      if (existingDelivery) {
        // return normalized object so caller code works uniformly
        return {
          deliveryId: existingDelivery._id.toString(),
          orderId: order._id.toString(),
          otp: existingDelivery.otp,
          existing: true,
        };
      }

      const otp = generateOtp();

      const [deliveryDoc] = await Delivery.create(
        [
          {
            order: orderId,
            user: order.user,
            payment_mode: order.paymentMethod === "cod" ? "COD" : "Prepaid",
            otp,
            status: "NEW",
            history: [
              {
                status: "NEW",
                note: "Delivery record created",
                at: new Date(),
              },
            ],
          },
        ],
        { session }
      );

      order.deliveryDetails = deliveryDoc._id;
      await order.save({ session });

      return {
        deliveryId: deliveryDoc._id.toString(),
        orderId: order._id.toString(),
        otp,
        existing: false,
      };
    });

    // ONLY end session once (remove extra endSession in finally)
    session.endSession();

    // send OTP immediately (optional)
    if (created?.otp) {
      const order = await Order.findById(created.orderId).populate("user");
      const phone = order?.user?.phone;
      if (phone) {
        try {
          await sendSms(phone, created.otp);
          logger.info(`OTP ${created.otp} sent to ${phone}`);
        } catch (err) {
          logger.error("Immediate OTP send failed", {
            error: err.message || err,
          });
        }
      }
    }

    // enqueue
    try {
      await deliveryQueue.add("createShiprocketOrder", {
        orderId: created.orderId,
        deliveryId: created.deliveryId,
      });
    } catch (err) {
      logger.error("Enqueue failed", {
        error: err.message || err,
        deliveryId: created.deliveryId,
      });
      // fallback to sync creation if you want (optional)
    }

    return await Delivery.findById(created.deliveryId);
  } finally {
    // remove duplicate session.endSession() if you already called it
    try {
      session.endSession();
    } catch (e) {}
  }
};

// Generate shipping label
export const generateLabel = async (deliveryId) => {
  try {
    const delivery = await Delivery.findById(deliveryId);
    if (!delivery) throw new Error("Delivery not found");

    if (!delivery.shipmentId) {
      throw new Error("Shipment ID not available");
    }

    const labelData = await shiprocketService.generateLabel(
      delivery.shipmentId
    );

    // Update delivery with label info
    await Delivery.findByIdAndUpdate(deliveryId, {
      $push: {
        history: {
          status: "LABEL_GENERATED",
          note: "Shipping label generated",
          raw: labelData,
          at: new Date(),
        },
      },
    });

    return labelData;
  } catch (error) {
    logger.error("Label generation failed", {
      deliveryId,
      error: error.response?.data || error.message,
    });
    throw error;
  }
};

// Generate manifest
export const generateManifest = async (deliveryId) => {
  try {
    const delivery = await Delivery.findById(deliveryId);
    if (!delivery) throw new Error("Delivery not found");

    const manifestData = await shiprocketService.generateManifest(
      delivery.shipmentId
    );

    await Delivery.findByIdAndUpdate(deliveryId, {
      $push: {
        history: {
          status: "MANIFEST_GENERATED",
          note: "Manifest generated",
          raw: manifestData,
          at: new Date(),
        },
      },
    });

    return manifestData;
  } catch (error) {
    logger.error("Manifest generation failed", {
      deliveryId,
      error: error.response?.data || error.message,
    });
    throw error;
  }
};

// Track shipment
export const trackShipment = async (deliveryId) => {
  try {
    const delivery = await Delivery.findById(deliveryId);
    if (!delivery) throw new Error("Delivery not found");

    if (!delivery.awbCode) {
      throw new Error("AWB code not available");
    }

    const trackingData = await shiprocketService.trackOrder(delivery.awbCode);

    const newStatus =
      trackingData?.tracking_data?.shipment_status ||
      trackingData?.data?.shipment_status ||
      null;

    if (newStatus && newStatus !== delivery.status) {
      const update = {
        status: newStatus,
        $push: {
          history: {
            status: newStatus,
            note: "Status updated from tracking",
            raw: trackingData,
            at: new Date(),
          },
        },
      };
      if (newStatus === "DELIVERED") update.deliveredAt = new Date();

      const updated = await Delivery.findByIdAndUpdate(deliveryId, update, {
        new: true,
      });

      // If changed to dispatched / out-for-delivery, send OTP
      if (
        ["DISPATCHED", "OUT_FOR_DELIVERY", "OUT_FOR_DELIVERY"].includes(
          newStatus
        )
      ) {
        await sendOtpToCustomer(updated, "status_update_tracking");
      }
    }

    return trackingData;
  } catch (error) {
    logger.error("Tracking failed", {
      deliveryId,
      error: error.response?.data || error.message,
    });
    throw error;
  }
};

// Cancel shipment
export const cancelDelivery = async (deliveryId) => {
  const delivery = await Delivery.findById(deliveryId);
  if (!delivery) throw new Error("Delivery not found");

  if (delivery.shipmentId) {
    try {
      await shiprocketService.cancelOrder(delivery.shipmentId);
      logger.info("Shiprocket cancellation requested", {
        deliveryId,
        shipmentId: delivery.shipmentId,
      });
    } catch (err) {
      logger.error("Shiprocket cancelOrder failed", {
        deliveryId,
        shipmentId: delivery.shipmentId,
        error: err.response?.data || err.message,
      });
    }
  }

  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      const d = await Delivery.findById(deliveryId).session(session);
      if (!d) throw new Error("Delivery not found (during cancel transaction)");

      d.status = "CANCELLED";
      d.history.push({
        status: "CANCELLED",
        note: "Cancelled by system",
        at: new Date(),
      });
      await d.save({ session });

      await Order.findByIdAndUpdate(
        d.order,
        { status: "cancelled" },
        { session }
      );
    });
  } finally {
    session.endSession();
  }

  logger.info("Delivery cancelled successfully", { deliveryId });
};

// Shiprocket webhook handler
export const handleWebhook = async (payload, headers = {}) => {
  try {
    if (WEBHOOK_SECRET) {
      const signature =
        headers["x-shiprocket-signature"] || headers["x-signature"];
      if (!signature) {
        logger.warn("Webhook missing signature header");
        throw new Error("Missing webhook signature");
      }

      const computed = crypto
        .createHmac("sha256", WEBHOOK_SECRET)
        .update(JSON.stringify(payload))
        .digest("hex");

      if (computed !== signature) {
        logger.warn("Webhook signature mismatch", { computed, signature });
        throw new Error("Invalid webhook signature");
      }
    }

    const { shipment_id, awb_code, status } = payload;
    const delivery = await Delivery.findOne({
      shipmentId: shipment_id,
    }).populate("order user");
    if (!delivery) {
      logger.warn("Webhook received for unknown shipment", { shipment_id });
      return;
    }

    const webhookHash = hashPayload(payload);
    const alreadyExists = (delivery.history || []).some(
      (h) => h.raw && h.raw.__webhook_hash === webhookHash
    );
    if (alreadyExists) {
      logger.info("Duplicate webhook ignored", { shipment_id });
      return;
    }

    const update = {
      status,
      awbCode: awb_code || delivery.awbCode,
      $push: {
        history: {
          status,
          note: "Status updated via webhook",
          raw: { ...payload, __webhook_hash: webhookHash },
          at: new Date(),
        },
      },
      ...(status === "DELIVERED" && { deliveredAt: new Date() }),
    };

    const updated = await Delivery.findByIdAndUpdate(delivery._id, update, {
      new: true,
    });

    // Update order status mapping
    const orderUpdateMap = {
      DELIVERED: "delivered",
      CANCELLED: "cancelled",
      RTO: "returned",
      DISPATCHED: "dispatched",
      OUT_FOR_DELIVERY: "out_for_delivery",
    };

    if (orderUpdateMap[status]) {
      await Order.findByIdAndUpdate(delivery.order, {
        status: orderUpdateMap[status],
      });
    }

    // Send OTP when dispatched or out for delivery
    if (
      ["DISPATCHED", "OUT_FOR_DELIVERY", "OUT_FOR_DELIVERY"].includes(status)
    ) {
      await sendOtpToCustomer(updated, "status_update_webhook");
    }

    logger.info("Webhook processed successfully", {
      deliveryId: delivery._id,
      status,
    });
  } catch (error) {
    logger.error("Webhook processing failed", {
      error: error.response?.data || error.message,
      payload,
    });
    throw error;
  }
};

// Get delivery by ID
export const getDelivery = async (deliveryId) => {
  try {
    const delivery = await Delivery.findById(deliveryId).populate("order user");
    if (!delivery) throw new Error("Delivery not found");
    return delivery;
  } catch (error) {
    logger.error("Get delivery failed", {
      deliveryId,
      error: error.message,
    });
    throw error;
  }
};

// Get deliveries by user
export const getUserDeliveries = async (userId, page = 1, limit = 20) => {
  try {
    const deliveries = await Delivery.find({ user: userId })
      .populate("order")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return deliveries;
  } catch (error) {
    logger.error("Get user deliveries failed", {
      userId,
      error: error.message,
    });
    throw error;
  }
};

// Update delivery status
export const updateDeliveryStatus = async (deliveryId, status, notes = "") => {
  try {
    const delivery = await Delivery.findByIdAndUpdate(
      deliveryId,
      {
        status,
        $push: {
          history: {
            status,
            note: notes || `Status updated to ${status}`,
            at: new Date(),
          },
        },
      },
      { new: true }
    );

    if (!delivery) throw new Error("Delivery not found");

    logger.info("Delivery status updated", {
      deliveryId,
      status,
    });

    // Send OTP when status moves to dispatched / out for delivery
    if (
      ["DISPATCHED", "OUT_FOR_DELIVERY", "OUT_FOR_DELIVERY"].includes(status)
    ) {
      await sendOtpToCustomer(delivery, "status_update_manual");
    }

    return delivery;
  } catch (error) {
    logger.error("Update delivery status failed", {
      deliveryId,
      error: error.message,
    });
    throw error;
  }
};

export default {
  createDelivery,
  generateLabel,
  generateManifest,
  trackShipment,
  cancelDelivery,
  handleWebhook,
  getDelivery,
  getUserDeliveries,
  updateDeliveryStatus,
};
