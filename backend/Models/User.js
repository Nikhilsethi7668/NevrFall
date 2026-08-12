import mongoose from "mongoose";

const AddressSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
    },

    phone: {
      type: String,
      trim: true,
    },

    pincode: {
      type: String,
      trim: true,
    },

    line1: {
      type: String,
      trim: true,
    },

    line2: {
      type: String,
      trim: true,
    },

    city: {
      type: String,
      trim: true,
    },

    state: {
      type: String,
      trim: true,
    },

    default: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false }
);

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      default: "User",
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },

    email: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
      lowercase: true,
      trim: true,
    },

    gender: {
      type: String,
      enum: ["male", "female", "other"],
      default: "male",
    },
    role: {
      type: String,
      default: "user",
    },

    addresses: {
      type: [AddressSchema],
      default: [],
    },

    wallet: {
      balance: {
        type: Number,
        default: 0,
        min: 0,
      },
    },

    status: {
      type: String,
      enum: ["active", "blocked"],
      default: "active",
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", UserSchema);