import mongoose from "mongoose";

const BrandSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    logo: {
      type: String,
      default: "",
    },

    mainCategories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SuperCategory",
      },
    ],

    domain: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
    },

    status: {
      type: String,
      enum: ["pending", "active", "suspended", "inactive"],
      default: "pending",
    },

    settings: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

export default mongoose.model("Brand", BrandSchema);