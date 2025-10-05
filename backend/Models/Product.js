import mongoose from "mongoose";

const MediaSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    alt: { type: String, default: "" },
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

    coverImage: { type: String },
    images: [MediaSchema],
    attributes: [AttributeSchema], 
    ratingAvg: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },

    collections: [{ type: String, index: true }], 
    sizeChartUrl: String,

    status: {
      type: String,
      enum: ["draft", "active", "archived"],
      default: "draft",
      index: true,
    },
    publishAt: { type: Date },

    availableColors: { type: [String], index: true, default: [] }, 
    availableSizes: { type: [String], index: true, default: [] },
  },
  { timestamps: true }
);

ProductSchema.index({ title: "text", description: "text", tags: "text" });

export default mongoose.model("Product", ProductSchema);
