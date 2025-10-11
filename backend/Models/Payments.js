import mongoose from "mongoose";

const PaymentSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      index: true,
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    method: {
      type: String,
      enum: ["cod", "wallet", "razorpay", "payu"],
      required: true,
    },
    amount: { type: Number, required: true },
    currency: { type: String, default: "INR" },
    gatewayPaymentId: { type: String, default: null },
    status: {
      type: String,
      enum: [
        "created",
        "attempted",
        "success",
        "failed",
        "cod_pending",
        "refunded",
      ],
      default: "created",
    },
    meta: { type: Object, default: {} },
    idempotencyKey: { type: String, index: true, default: null },
  },
  { timestamps: true }
);

export default mongoose.model("Payment", PaymentSchema);
