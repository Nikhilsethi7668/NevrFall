import mongoose from "mongoose";

const AdminUserRoleSchema = new mongoose.Schema(
    {
        adminUserId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "AdminUser",
            required: true,
            index: true,
        },

        // References Role.key
        roleKey: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
            index: true,
        },

        // global = access all brands
        // brand = access only specified brands
        scope: {
            type: String,
            enum: ["global", "brand"],
            default: "brand",
        },

        // Used only when scope = "brand"
        brandIds: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Brand",
            },
        ],
    },
    { timestamps: true }
);

AdminUserRoleSchema.index(
    { adminUserId: 1, roleKey: 1 },
    { unique: true }
);

export default mongoose.model(
    "AdminUserRole",
    AdminUserRoleSchema
);