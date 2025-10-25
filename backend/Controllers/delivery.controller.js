// controllers/delivery.controller.js
import mongoose from "mongoose";
import Delivery from "../Models/Delivery.js";
import Order from "../Models/Order.js";
import { shiprocketService } from "../Services/shiprocket.service.js";
import { deliveryQueue } from "../Services/delivery.worker.js";
import logger from "../utils/logger.js";

// Create delivery and shiprocket order
export const createDelivery = async (orderId) => {
  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
      const order = await Order.findById(orderId).session(session);
      if (!order) throw new Error("Order not found");

      // Check if delivery already exists
      const existingDelivery = await Delivery.findOne({
        order: orderId,
      }).session(session);
      if (existingDelivery) {
        throw new Error("Delivery already exists for this order");
      }

      // Create delivery record
      const delivery = await Delivery.create(
        [
          {
            order: orderId,
            user: order.user,
            payment_mode: order.paymentMethod === "cod" ? "COD" : "Prepaid",
            status: "NEW",
          },
        ],
        { session }
      );

      // Update order with delivery reference
      order.deliveryDetails = delivery[0]._id;
      await order.save({ session });

      // Queue Shiprocket order creation
      await deliveryQueue.add("createShiprocketOrder", {
        orderId,
        deliveryId: delivery[0]._id,
      });

      logger.info("Delivery created and queued for Shiprocket", {
        orderId,
        deliveryId: delivery[0]._id,
      });

      return delivery[0];
    });
  } finally {
    session.endSession();
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
        },
      },
    });

    return labelData;
  } catch (error) {
    logger.error("Label generation failed", {
      deliveryId,
      error: error.message,
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
        },
      },
    });

    return manifestData;
  } catch (error) {
    logger.error("Manifest generation failed", {
      deliveryId,
      error: error.message,
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

    // Update delivery status if changed
    if (
      trackingData.tracking_data &&
      trackingData.tracking_data.shipment_status
    ) {
      const newStatus = trackingData.tracking_data.shipment_status;
      if (newStatus !== delivery.status) {
        await Delivery.findByIdAndUpdate(deliveryId, {
          status: newStatus,
          $push: {
            history: {
              status: newStatus,
              note: "Status updated from tracking",
              raw: trackingData,
            },
          },
          ...(newStatus === "DELIVERED" && { deliveredAt: new Date() }),
        });
      }
    }

    return trackingData;
  } catch (error) {
    logger.error("Tracking failed", {
      deliveryId,
      error: error.message,
    });
    throw error;
  }
};

// Cancel shipment
export const cancelDelivery = async (deliveryId) => {
  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
      const delivery = await Delivery.findById(deliveryId).session(session);
      if (!delivery) throw new Error("Delivery not found");

      if (delivery.shipmentId) {
        await shiprocketService.cancelOrder(delivery.shipmentId);
      }

      // Update delivery status
      delivery.status = "CANCELLED";
      await delivery.save({ session });

      // Update order status
      await Order.findByIdAndUpdate(
        delivery.order,
        { status: "cancelled" },
        { session }
      );

      logger.info("Delivery cancelled successfully", { deliveryId });
    });
  } finally {
    session.endSession();
  }
};

// Shiprocket webhook handler
export const handleWebhook = async (payload) => {
  try {
    const { shipment_id, awb_code, status } = payload;

    const delivery = await Delivery.findOne({ shipmentId: shipment_id });
    if (!delivery) {
      logger.warn("Webhook received for unknown shipment", { shipment_id });
      return;
    }

    // Update delivery status and history
    await Delivery.findByIdAndUpdate(delivery._id, {
      status,
      awbCode: awb_code || delivery.awbCode,
      $push: {
        history: {
          status,
          note: "Status updated via webhook",
          raw: payload,
        },
      },
      ...(status === "DELIVERED" && { deliveredAt: new Date() }),
    });

    // Update order status based on delivery status
    const orderUpdateMap = {
      DELIVERED: "delivered",
      CANCELLED: "cancelled",
      RTO: "returned",
    };

    if (orderUpdateMap[status]) {
      await Order.findByIdAndUpdate(delivery.order, {
        status: orderUpdateMap[status],
      });
    }

    logger.info("Webhook processed successfully", {
      deliveryId: delivery._id,
      status,
    });
  } catch (error) {
    logger.error("Webhook processing failed", {
      error: error.message,
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
