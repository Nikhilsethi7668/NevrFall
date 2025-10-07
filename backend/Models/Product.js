// Models/Product.js
import mongoose from "mongoose";

const MediaSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    alt: { type: String, default: "Unavailable" },
    role: {
      type: String,
      enum: ["main", "gallery", "swatch"],
      default: "gallery",
    },
  },
  { _id: false }
);

const AttributeSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, trim: true },
    value: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const ProductSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, default: "" },
    details: { type: Object, default: {} },
    tags: { type: [String], index: true, default: [] },
    categories: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Category", index: true },
    ],

    sleeveLength: {
      type: String,
      enum: ["full", "half", "three-quarter", "sleeveless"],
      index: true,
    },
    fitType: {
      type: String,
      enum: [
        "regular",
        "slim",
        "loose",
        "skinny",
        "relaxed",
        "oversized",
        "box",
      ],
      index: true,
    },
    material: {
      type: String,
      enum: [
        "cotton",
        "polyester",
        "wool",
        "linen",
        "silk",
        "denim",
        "leather",
        "rayon",
        "nylon",
        "spandex",
        "chiffon",
        "velvet",
        "corduroy",
        "fleece",
        "cashmere",
        "suede",
        "lace",
      ],
      index: true,
    },
    pattern: { type: String, index: true },

    coverImage: { type: String },
    images: [MediaSchema],
    attributes: [AttributeSchema],

    ratingAvg: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },

    collections: [{ type: String, index: true }],
    sizeChartUrl: String,
    isTrending: { type: Boolean, default: false, index: true },

    publishAt: { type: Date },
    clicks: { type: Number, default: 0 },
    purchases: { type: Number, default: 0 },

    basePrice: { type: Number, required: true },
    currency: { type: String, default: "INR" },

    availableColors: { type: [String], index: true, default: [] },
    availableSizes: { type: [String], index: true, default: [] },

    /* NEW: Which variant is shown on cards and preselected on PDP */
    defaultVariantSku: { type: String, index: true },
    defaultVariantNote: { type: String, default: "" },
  },
  { timestamps: true }
);

/* Text index for search */
ProductSchema.index({ title: "text", description: "text", tags: "text" });

export default mongoose.model("Product", ProductSchema);
