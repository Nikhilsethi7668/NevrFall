import mongoose from "mongoose";

const InventorySchema = new mongoose.Schema(
  {
    variant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProductVariant",
      required: true,
      unique: true,
      index: true,
    },
    qty: { type: Number, default: 0 },
    warehouse: { type: String, default: "default", index: true },
  },
  { timestamps: true }
);

export default mongoose.model("Inventory", InventorySchema);
