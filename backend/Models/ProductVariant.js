import mongoose from "mongoose";

const VariantSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },
    sku: { type: String, required: true, unique: true, trim: true },
    barcode: { type: String, trim: true },
    options: {
      color: { type: String, required: true, lowercase: true, index: true },
      size: { type: String, required: true, uppercase: true, index: true }, 
    },

    currency: { type: String, default: "INR" },
    mrp: { type: Number, required: true }, 
    price: { type: Number, required: true, index: true },
    taxClass: { type: String, default: "GST" },

    weightGrams: { type: Number, default: 0 },
    dimensionsCm: { l: Number, w: Number, h: Number },

    images: [{ url: String, alt: String }],
    allowBackorder: { type: Boolean, default: false },

  },
  { timestamps: true }
);

VariantSchema.index(
  { "options.color": 1, "options.size": 1, product: 1 },
  { unique: true }
);

export default mongoose.model("ProductVariant", VariantSchema);
