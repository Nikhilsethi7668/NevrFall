// models/Delivery.js
import mongoose from "mongoose";

const DeliveryHistorySchema = new mongoose.Schema(
  {
    status: { type: String, required: true },
    at: { type: Date, default: Date.now },
    note: { type: String, default: "" },
    raw: { type: Object, default: {} }, // raw payload from Shiprocket
  },
  { _id: false }
);

const DeliverySchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // Shiprocket specific fields
    shipmentId: { type: String, default: null, index: true },
    awbCode: { type: String, default: null, index: true },
    channelOrderId: { type: String, default: null },

    status: {
      type: String,
      enum: [
        "NEW",
        "PICKUP_SCHEDULED",
        "MANIFESTED",
        "PICKUP_QUEUED",
        "PICKUP_ASSIGNED",
        "PICKUP_COMPLETED",
        "IN_TRANSIT",
        "OUT_FOR_DELIVERY",
        "DELIVERED",
        "CANCELLED",
        "RTO",
        "LOST",
        "DAMAGED",
      ],
      default: "NEW",
      index: true,
    },

    payment_mode: {
      type: String,
      enum: ["COD", "Prepaid"],
      default: "Prepaid",
    },

    // Shiprocket raw responses
    shiprocketRaw: { type: Object, default: {} },
    history: { type: [DeliveryHistorySchema], default: [] },

    // OTP for delivery verification
    otpHash: { type: String, default: null },
    otpSentAt: { type: Date, default: null },
    otpVerified: { type: Boolean, default: false },

    deliveredAt: { type: Date, default: null },
    attemptCount: { type: Number, default: 0 },

    // RTO/NDR fields
    ndrStatus: { type: String, default: null },
    meta: { type: Object, default: {} },
  },
  { timestamps: true }
);

DeliverySchema.index({ order: 1, user: 1 });
DeliverySchema.index({ status: 1, awbCode: 1 });

export default mongoose.models.Delivery ||
  mongoose.model("Delivery", DeliverySchema);
