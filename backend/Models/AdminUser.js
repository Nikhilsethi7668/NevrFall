import mongoose from "mongoose";

const AdminUserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      default: "Admin",
      trim: true,
    },

    phone: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
      trim: true,

      validate: {
        validator: function (v) {
          return !v || /^[6-9]\d{9}$/.test(v);
        },
        message: "Please enter a valid 10-digit mobile number",
      },
    },

    email: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
      lowercase: true,
      trim: true,

      validate: {
        validator: function (v) {
          return !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        },
        message: "Please enter a valid email address",
      },
    },

    status: {
      type: String,
      enum: ["active", "inactive", "suspended"],
      default: "active",
    },

    lastLoginAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

export default mongoose.model("AdminUser", AdminUserSchema);