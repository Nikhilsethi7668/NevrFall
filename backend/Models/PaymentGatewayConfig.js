// models/PaymentGatewayConfig.js
import mongoose from "mongoose";

const PaymentGatewayConfigSchema = new mongoose.Schema(
  {
    activeGateway: {
      type: String,
      enum: ["razorpay", "payu", "stripe", "none"],
      default: process.env.ACTIVE_GATEWAY || "none",
    },
  },
  { timestamps: true }
);

export default mongoose.model(
  "PaymentGatewayConfig",
  PaymentGatewayConfigSchema
);
