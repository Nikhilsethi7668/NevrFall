import mongoose from "mongoose";

const OrderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    variant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProductVariant",
      required: true,
    },
    title: { type: String, required: true },
    color: { type: String },
    size: { type: String },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    lineTotal: { type: Number, required: true },
  },
  { _id: false }
);

const OrderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    items: { type: [OrderItemSchema], default: [] },

    subtotal: { type: Number, required: true }, // sum of lineTotal
    discountAmount: { type: Number, default: 0 }, // coupon discount
    total: { type: Number, required: true }, // subtotal - discount + shipping/taxes (if any)

    coupon: {
      couponId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Coupon",
        default: null,
      },
      code: { type: String, default: "" },
    },

    // status, payment & shipping
    status: {
      type: String,
      enum: [
        "pending",
        "paid",
        "processing",
        "Confirmed",
        "out-for-delivery",
        "delivered",
        "cancelled",
        "refunded",
        "failed",
        "return-requested",
        "returned",
        "exchange-requested",
        "exchange-approved",
        "pickup-scheduled",
        "picked-up",
        "exchanged",
        "exchange-rejected",
      ],
      default: "pending",
    },
    paymentMethod: { type: String, default: "cod" },
    paymentInfo: { type: Object, default: {} },

    shippingAddress: { type: Object, default: {} },

    meta: { type: Object, default: {} }, // extensible metadata
  },
  { timestamps: true }
);

OrderSchema.index({ user: 1, status: 1 });

export default mongoose.model("Order", OrderSchema);
