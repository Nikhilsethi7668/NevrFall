import mongoose from "mongoose";

const RoleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    // Permanent logical identity
    // Example: seller, support, super_admin
    //
    // Once created, this should NOT be changed.
    // Deleted custom-role keys should NOT be reused.
    key: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    permissions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Permission",
      },
    ],

    // Platform-created role or custom role
    isSystemRole: {
      type: Boolean,
      default: false,
    },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AdminUser",
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Role", RoleSchema);