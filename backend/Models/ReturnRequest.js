// models/ReturnRequest.js
import mongoose from "mongoose";

const VerificationQuestionSchema = new mongoose.Schema(
  {
    question: { type: String, required: true },
    type: {
      type: String,
      enum: ["boolean", "text", "rating", "photo"],
      default: "boolean",
    },
    required: { type: Boolean, default: true },
    field: { type: String, required: true }, // Field name for answers
  },
  { _id: false }
);

const PickupVerificationSchema = new mongoose.Schema(
  {
    deliveryPersonId: { type: String, default: null },
    deliveryPersonName: { type: String, default: null },
    verifiedAt: { type: Date, default: null },

    // Verification questions and answers
    questions: [VerificationQuestionSchema],
    answers: {
      // Product authenticity questions
      isOriginalProduct: { type: Boolean, default: null },
      hasOriginalPackaging: { type: Boolean, default: null },
      packagingCondition: {
        type: String,
        enum: ["sealed", "opened_undamaged", "damaged", "missing"],
        default: null,
      },
      hasAllTags: { type: Boolean, default: null },
      hasAllAccessories: { type: Boolean, default: null },

      // Product condition questions
      productCondition: {
        type: String,
        enum: ["like_new", "excellent", "good", "fair", "poor", "damaged"],
        default: null,
      },
      hasScratches: { type: Boolean, default: null },
      hasStains: { type: Boolean, default: null },
      hasOdor: { type: Boolean, default: null },
      isInWorkingCondition: { type: Boolean, default: null },

      // Detailed observations
      damageDescription: { type: String, default: "" },
      missingParts: { type: String, default: "" },
      overallRating: { type: Number, min: 1, max: 5, default: null },

      // Photo evidence
      productPhotos: [{ type: String }],
      packagingPhotos: [{ type: String }],
      damagePhotos: [{ type: String }],
    },

    // Digital signatures/consent
    customerSignature: { type: String, default: null },
    customerConsentGiven: { type: Boolean, default: false },
    consentTimestamp: { type: Date, default: null },

    verificationScore: { type: Number, min: 0, max: 100, default: 0 },
    notes: { type: String, default: "" },
  },
  { _id: false }
);

const ReturnRequestSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      index: true,
    },
    orderItemIndex: { type: Number, required: true },
    variant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProductVariant",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    quantity: { type: Number, required: true, min: 1 },
    delivery: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Delivery",
      default: null,
    },

    reason: { type: String, default: "" },
    notes: { type: String, default: "" },
    photos: [{ type: String }],

    requestedAt: { type: Date, default: Date.now },

    status: {
      type: String,
      enum: [
        "requested",
        "pickup_scheduled",
        "pickup_assigned", // NEW: Delivery guy assigned
        "pickup_in_progress", // NEW: Pickup started
        "pickup_verification_pending", // NEW: Verification needed
        "picked_up", // NEW: After successful verification
        "received",
        "inspected",
        "approved",
        "rejected",
        "refunded",
        "closed",
      ],
      default: "requested",
      index: true,
    },

    refundMethod: {
      type: String,
      enum: ["wallet", "gateway"],
      default: "wallet",
    },
    refund: {
      amount: { type: Number, default: 0 },
      currency: { type: String, default: "INR" },
      refundedAt: { type: Date, default: null },
      refundTx: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "WalletTransaction",
        default: null,
      },
      gatewayRefundId: { type: String, default: null },
    },

    restockingFee: { type: Number, default: 0 },

    // Enhanced pickup info
    pickup: {
      carrier: { type: String, default: null },
      scheduledAt: { type: Date, default: null },
      pickupSlot: { type: Object, default: null },
      labelUrl: { type: String, default: null },
      trackingId: { type: String, default: null },
      assignedTo: {
        // Delivery person info
        personId: { type: String, default: null },
        personName: { type: String, default: null },
        assignedAt: { type: Date, default: null },
      },
    },

    // Verification data
    pickupVerification: {
      type: PickupVerificationSchema,
      default: null,
    },

    fraud: {
      score: { type: Number, default: 0 },
      reason: { type: String, default: "" },
      flagged: { type: Boolean, default: false },
    },

    condition: {
      type: String,
      enum: ["new", "opened", "damaged", "missing_parts", "other"],
      default: "new",
    },

    admin: {
      processedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
      },
      processedAt: Date,
      adminNotes: String,
    },

    meta: { type: Object, default: {} },
  },
  { timestamps: true }
);

// Pre-save middleware to update status based on verification
ReturnRequestSchema.pre("save", function (next) {
  if (
    this.pickupVerification &&
    this.pickupVerification.verifiedAt &&
    this.status === "pickup_verification_pending"
  ) {
    this.status = "picked_up";
  }
  next();
});

// prevent exact duplicate returns that would exceed qty: compound index
ReturnRequestSchema.index({ order: 1, orderItemIndex: 1, _id: 1 });

export default mongoose.models.ReturnRequest ||
  mongoose.model("ReturnRequest", ReturnRequestSchema);
