// models/Cart.js
import mongoose from "mongoose";

const CartItemSchema = new mongoose.Schema(
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
    qty: { type: Number, default: 1, min: 1 },
    addedAt: { type: Date, default: Date.now }, 
    
  },
  { _id: false }
);

const CartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    items: { type: [CartItemSchema], default: [] },
    currency: { type: String, default: "INR" },
  },
  { timestamps: true }
);

export default mongoose.model("Cart", CartSchema);
