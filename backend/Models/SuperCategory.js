import mongoose from "mongoose";

const SuperCategorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
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

        image: {
            type: String,
            default: null,
        },

        sortOrder: {
            type: Number,
            default: 0,
        },

        status: {
            type: String,
            enum: ["active", "inactive"],
            default: "active",
        }
    },
    { timestamps: true }
);

export default mongoose.model("SuperCategory", SuperCategorySchema);