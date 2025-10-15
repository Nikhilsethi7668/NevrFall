import mongoose from "mongoose";

const DeliverySchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      index: true,
    },
    courier: { type: String, default: "" },
    courierTrackingId: { type: String, default: "" },
    addressSnapshot: { type: Object, default: {} }, // store address at delivery time
    attempts: { type: Number, default: 0 },
    attemptHistory: [
      {
        attemptedAt: Date,
        status: String,
        note: String,
      },
    ],
    deliveredAt: { type: Date, default: null, index: true },
    deliveredBy: { type: String, default: "" }, // name of courier / agent
    proof: {
      signatureUrl: { type: String, default: "" },
      photoUrls: [{ type: String }],
    },
    meta: { type: Object, default: {} },
  },
  { timestamps: true }
);

export default mongoose.models.Delivery ||
  mongoose.model("Delivery", DeliverySchema);
