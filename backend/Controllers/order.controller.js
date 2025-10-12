// controllers/orderController.js
import mongoose from "mongoose";
import Order from "../Models/Order.js";
import Cart from "../Models/Cart.js";
import Product from "../Models/Product.js";
import ProductVariant from "../Models/ProductVariant.js";
import Coupon from "../Models/Coupon.js";
import Payment from "../Models/Payments.js";
import PaymentGatewayConfig from "../Models/PaymentGatewayConfig.js";
import { getActiveGatewayAdapter } from "../Services/gatewayFactory.js";
import { use } from "react";
const CouponUsageSchema = new mongoose.Schema(
  {
    coupon: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Coupon",
      required: true,
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    uses: { type: Number, default: 0 },
  },
  { timestamps: true }
);
CouponUsageSchema.index({ coupon: 1, user: 1 }, { unique: true });
const CouponUsage =
  mongoose.models.CouponUsage ||
  mongoose.model("CouponUsage", CouponUsageSchema);

async function decrementVariantStockAtomic(variantId, qty, session) {
  const res = await ProductVariant.updateOne(
    { _id: variantId, stock: { $gte: qty } },
    { $inc: { stock: -qty } },
    { session }
  );
  if (res.modifiedCount === 0) {
    // read variant to provide helpful error
    const v = await ProductVariant.findById(variantId).session(session);
    if (!v) throw new Error(`Variant not found: ${variantId}`);
    throw new Error(
      `Insufficient stock for variant ${variantId}. Available: ${v.stock}`
    );
  }
}

/**
 * Compute applicableSubtotal for a coupon considering:
 * - coupon.applicableProductIds
 * - coupon.applicableCategoryIds
 *
 * Assumes `items` have `product` and `lineTotal`.
 * Loads product categories from Product model inside session.
 */
async function computeApplicableSubtotalForCoupon(coupon, items, session) {
  const productIdsFilter = (coupon.applicableProductIds || []).map(String);
  const categoryIdsFilter = (coupon.applicableCategoryIds || []).map(String);

  // no restrictions -> everything is applicable
  if (productIdsFilter.length === 0 && categoryIdsFilter.length === 0) {
    return items.reduce((s, it) => s + it.lineTotal, 0);
  }

  // fetch products used in order to resolve categories
  const uniqueProductIds = [...new Set(items.map((it) => String(it.product)))];
  const products = await Product.find({ _id: { $in: uniqueProductIds } })
    .select("_id category categories") // check both possible field names
    .session(session);

  // map productId -> categoryIds[]
  const productToCategories = new Map();
  for (const p of products) {
    let cats = [];
    if (Array.isArray(p.categories)) cats = p.categories.map(String);
    else if (Array.isArray(p.category)) cats = p.category.map(String);
    else if (p.category) cats = [String(p.category)];
    productToCategories.set(String(p._id), cats);
  }

  const productSet = new Set(productIdsFilter);
  const categorySet = new Set(categoryIdsFilter);

  let applicableSubtotal = 0;
  for (const it of items) {
    const pid = String(it.product);
    let included = false;

    if (productSet.size > 0 && productSet.has(pid)) included = true;

    if (!included && categorySet.size > 0) {
      const cats = productToCategories.get(pid) || [];
      for (const c of cats) {
        if (categorySet.has(String(c))) {
          included = true;
          break;
        }
      }
    }

    if (included) applicableSubtotal += it.lineTotal;
  }

  return applicableSubtotal;
}

/**
 * Reserve coupon usage atomically inside the provided session.
 * - Validates targetUser, expiry, minOrderValue, applicableSubtotal
 * - Increments coupon.usesCount (respecting maxUses)
 * - Increments/creates CouponUsage for per-user limits (respecting maxUsesPerUser)
 *
 * Returns the fresh coupon doc.
 */
async function reserveCouponUsageAtomic(
  couponCode,
  userId,
  subtotal,
  applicableSubtotal,
  session
) {
  const code = String(couponCode || "").toUpperCase();
  const coupon = await Coupon.findOne({ code }).session(session);
  if (!coupon || !coupon.active) throw new Error("Invalid coupon");

  // targetUser enforcement
  if (coupon.targetUser && String(coupon.targetUser) !== String(userId)) {
    throw new Error("Applied coupon is valid for selected user only");
  }

  // expiry & minOrderValue checks
  if (coupon.expiresAt && coupon.expiresAt < new Date())
    throw new Error("Coupon expired");
  if ((coupon.minOrderValue || 0) > 0 && subtotal < coupon.minOrderValue) {
    throw new Error(
      `Minimum order value of ${coupon.minOrderValue} required to apply this coupon`
    );
  }

  // coupon must apply to at least some items
  if ((applicableSubtotal || 0) <= 0)
    throw new Error("Coupon not applicable to order items");

  // PER-USER limit: increment (or create) coupon usage for this user atomically
  if (coupon.maxUsesPerUser && coupon.maxUsesPerUser > 0) {
    // query condition ensures we do not increment past maxUsesPerUser
    const cond = {
      coupon: coupon._id,
      user: userId,
      $or: [
        { uses: { $exists: false } },
        { uses: { $lt: coupon.maxUsesPerUser } },
      ],
    };
    const updatedUsage = await CouponUsage.findOneAndUpdate(
      cond,
      { $inc: { uses: 1 } },
      { upsert: true, new: true, setDefaultsOnInsert: true, session }
    );
    if (!updatedUsage) throw new Error("Coupon already used by user");
    // as this runs inside a transaction, if later overall increment fails the transaction will abort and this won't persist.
  }

  // OVERALL maxUses: atomically increment coupon.usesCount only if below maxUses
  if (coupon.maxUses && coupon.maxUses > 0) {
    const updatedCoupon = await Coupon.findOneAndUpdate(
      {
        _id: coupon._id,
        $or: [
          { maxUses: { $exists: false } },
          { usesCount: { $lt: coupon.maxUses } },
        ],
      },
      { $inc: { usesCount: 1 } },
      { session, new: true }
    );
    if (!updatedCoupon) throw new Error("Coupon usage limit reached");
    // update local coupon to reflect new usesCount
    coupon.usesCount = updatedCoupon.usesCount;
  } else {
    // if no global limit, increment usesCount for tracking
    coupon.usesCount = (coupon.usesCount || 0) + 1;
    await coupon.save({ session });
  }

  return coupon;
}

// ----------------- Controller Actions -----------------

/**
 * Create Order
 * Body: { userId, items?, useCart: boolean, couponCode?, shippingAddress, paymentMethod, paymentInfo }
 * If useCart = true, items are taken from user's cart.
 * items: [{ product, variant, price, quantity, size, color, title }]
 *
 * Idempotency: pass 'Idempotency-Key' header to deduplicate repeated requests.
 */
export const createOrder = async (req, res) => {
  const idempotencyKey = req.header("Idempotency-Key") || null;
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const {
      userId,
      items: payloadItems = [],
      useCart = false,
      couponCode = null,
      shippingAddress = {},
      paymentMethod = "cod",
      paymentInfo = {},
    } = req.body;

    // idempotency: return existing order for same key+user
    if (idempotencyKey) {
      const existing = await Order.findOne({
        "meta.idempotencyKey": idempotencyKey,
        user: userId,
      }).session(session);
      if (existing) {
        await session.commitTransaction();
        session.endSession();
        return res.status(200).json(existing);
      }
    }

    // 1) gather items
    let items = [];
    if (useCart) {
      const cart = await Cart.findOne({ user: userId }).session(session);
      if (!cart || !cart.items?.length) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ message: "Cart is empty" });
      }
      items = cart.items.map((ci) => ({
        product: ci.product,
        variant: ci.variant,
        title: ci.title,
        color: ci.color,
        size: ci.size,
        price: ci.price,
        quantity: ci.quantity,
        lineTotal: ci.price * ci.quantity,
      }));
    } else {
      if (!Array.isArray(payloadItems) || payloadItems.length === 0) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ message: "No items provided" });
      }
      items = payloadItems.map((it) => ({
        product: it.product,
        variant: it.variant,
        title: it.title,
        color: it.color,
        size: it.size,
        price: it.price,
        quantity: it.quantity,
        lineTotal: it.price * it.quantity,
      }));
    }

    // 2) stock checks & decrement per variant atomically
    for (const it of items) {
      await decrementVariantStockAtomic(it.variant, it.quantity, session);
    }

    // 3) subtotal
    const subtotal = items.reduce((s, it) => s + it.lineTotal, 0);

    // 4) coupon handling (if provided)
    let discountAmount = 0;
    let couponRef = null;
    if (couponCode) {
      // load coupon to compute applicable subtotal (we need coupon fields)
      const coupon = await Coupon.findOne({
        code: couponCode.toUpperCase(),
      }).session(session);
      if (!coupon || !coupon.active) throw new Error("Invalid coupon");

      const applicableSubtotal = await computeApplicableSubtotalForCoupon(
        coupon,
        items,
        session
      );
      if ((applicableSubtotal || 0) <= 0)
        throw new Error("Coupon not applicable to order items");

      // reserve/increment usage atomically (also validates targetUser, minOrderValue, expiry, per-user & overall)
      const reservedCoupon = await reserveCouponUsageAtomic(
        couponCode,
        userId,
        subtotal,
        applicableSubtotal,
        session
      );

      // compute discount per coupon type
      if (reservedCoupon.type === "fixed") {
        discountAmount = Math.min(reservedCoupon.value, applicableSubtotal);
      } else {
        // assume percentage type
        discountAmount = (applicableSubtotal * reservedCoupon.value) / 100;
        if (reservedCoupon.maxDiscountAmount)
          discountAmount = Math.min(
            discountAmount,
            reservedCoupon.maxDiscountAmount
          );
      }

      couponRef = reservedCoupon._id;
    }

    // 5) totals
    const total = Math.max(0, subtotal - (discountAmount || 0));

    // 6) create order
    const order = new Order({
      user: userId,
      items,
      subtotal,
      discountAmount,
      total,
      coupon: couponRef
        ? { couponId: couponRef, code: couponCode.toUpperCase() }
        : { couponId: null, code: "" },
      status: "pending",
      paymentMethod,
      paymentInfo,
      shippingAddress,
      meta: { idempotencyKey: idempotencyKey || null },
    });

    await order.save({ session });

    // 7) clear cart if used
    if (paymentMethod == "cod" && useCart) {
      await Cart.updateOne(
        { user: userId },
        { $set: { items: [], totalValue: 0 } },
        { session }
      );
    }
    //If paymentMethod is online, payment will be created when payment is initiated and then order status will be updated on payment confirmation and cart will be cleared then.

    await session.commitTransaction();
    session.endSession();
    return res.status(201).json(order);
  } catch (err) {
    // abort and respond
    try {
      await session.abortTransaction();
    } catch (_) {}
    session.endSession();
    return res
      .status(400)
      .json({ message: err.message || "Order creation failed" });
  }
};

/**
 * Create Payment for an order (gateway order creation)
 * Body: { idempotencyKey?, meta? }
 */
export const createPaymentForOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { idempotencyKey, meta = {} } = req.body;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (order.status === "cancelled")
      return res
        .status(400)
        .json({ message: "Order cancelled Please order again" });
    if (idempotencyKey) {
      const existing = await Payment.findOne({
        idempotencyKey,
        order: orderId,
      });
      if (existing) {
        return res.json({
          payment: existing,
          message: "Payment already initiated — please proceed to payment",
        });
      }
    }

    const adapter = await getActiveGatewayAdapter();
    const gatewayPayload = {
      amount: order.total,
      currency: "INR",
      receipt: String(order._id),
      meta,
    };

    const gatewayResp = await adapter.createOrder(gatewayPayload);

    const payment = new Payment({
      order: order._id,
      user: order.user,
      method: order.paymentMethod || "razorpay",
      amount: order.total,
      currency: "INR",
      gatewayPaymentId: gatewayResp.id || gatewayResp.orderId || null,
      status: "created",
      meta: { gatewayResp },
      idempotencyKey: idempotencyKey || null,
    });

    await payment.save();

    return res.json({ payment, gatewayResp });
  } catch (err) {
    return res
      .status(400)
      .json({ message: err.message || "Payment initiation failed" });
  }
};

/**
 * Confirm Payment (client/gateway notifies)
 * Body: { gatewayPayload }
 */
export const confirmPayment = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const { paymentId } = req.params;
    const { gatewayPayload = {}, useCart = "false" } = req.body;

    const payment = await Payment.findById(paymentId).session(session);
    if (!payment) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "Payment not found" });
    }
    if (payment.status === "success") {
      await session.commitTransaction();
      session.endSession();
      return res.status(200).json(payment);
    }

    const adapter = await getActiveGatewayAdapter();
    // adapter.verifyPayment should throw if invalid signature
    await adapter.verifyPayment(gatewayPayload);

    payment.status = "success";
    payment.gatewayPaymentId =
      gatewayPayload.payment_id || payment.gatewayPaymentId;
    payment.meta = { ...payment.meta, gatewayPayload };
    await payment.save({ session });

    const order = await Order.findById(payment.order).session(session);
    if (!order) throw new Error("Associated order not found");

    order.status = "paid";
    order.payments = order.payments || [];
    order.payments.push({
      method: payment.method,
      amount: payment.amount,
      gatewayPaymentId: payment.gatewayPaymentId,
      status: "success",
      meta: payment.meta,
    });
    await order.save({ session });
    if (useCart === "true") {
      const cart = await Cart.findOne({ user: order.user }).session(session);
      if (cart) {
        cart.items = [];
        cart.totalValue = 0;
        await cart.save({ session });
      }
    }

    await session.commitTransaction();
    session.endSession();
    return res.json({ order, payment });
  } catch (err) {
    try {
      await session.abortTransaction();
    } catch (_) {}
    session.endSession();
    return res
      .status(400)
      .json({ message: err.message || "Payment confirmation failed" });
  }
};

export const getOrder = async (req, res) => {
  const { id } = req.params;
  const order = await Order.findById(id).populate(
    "items.product items.variant coupon.couponId payments"
  );
  if (!order) return res.status(404).json({ message: "Order not found" });
  res.json(order);
};

export const listOrders = async (req, res) => {
  const { userId, page = 1, limit = 20, status } = req.query;
  const q = {};
  if (userId) q.user = userId;
  if (status) q.status = status;
  const orders = await Order.find(q)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));
  res.json(orders);
};

/**
 * Cancel Order (restores stock)
 */
export const cancelOrder = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const { id } = req.params;
    const order = await Order.findById(id).session(session);
    if (!order) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "Order not found" });
    }

    if (["cancelled", "delivered", "refunded"].includes(order.status))
      throw new Error("Order cannot be cancelled in its current state");

    for (const it of order.items) {
      await ProductVariant.updateOne(
        { _id: it.variant },
        { $inc: { stock: it.quantity } },
        { session }
      );
    }

    order.status = "cancelled";
    await order.save({ session });

    await session.commitTransaction();
    session.endSession();
    return res.json({ ok: true, order });
  } catch (err) {
    try {
      await session.abortTransaction();
    } catch (_) {}
    session.endSession();
    return res.status(400).json({ message: err.message || "Cancel failed" });
  }
};

/**
 * Refund Order (admin)
 * Body: { amount?, reason? }
 */
export const refundOrder = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const { id } = req.params;
    const { amount = null, reason = "" } = req.body;

    const order = await Order.findById(id).session(session);
    if (!order) throw new Error("Order not found");
    if (
      !["paid", "delivered"].includes(order.status) &&
      order.status !== "paid"
    )
      throw new Error("Order not refundable in current state");

    const lastPayment = (order.payments || [])
      .slice()
      .reverse()
      .find((p) => p.status === "success");
    if (!lastPayment) throw new Error("No successful payment found to refund");

    const adapter = await getActiveGatewayAdapter();
    const refundAmount = amount || lastPayment.amount;

    const refundResp = await adapter.refund({
      paymentId: lastPayment.gatewayPaymentId,
      amount: refundAmount,
      reason,
    });

    const refundPayment = new Payment({
      order: order._id,
      user: order.user,
      method: lastPayment.method,
      amount: -Math.abs(refundAmount),
      currency: "INR",
      gatewayPaymentId: refundResp.id || null,
      status: "success",
      meta: { refundResp, reason },
    });
    await refundPayment.save({ session });

    order.status = "refunded";
    order.payments.push({
      method: refundPayment.method,
      amount: refundPayment.amount,
      gatewayPaymentId: refundPayment.gatewayPaymentId,
      status: "refunded",
      meta: refundPayment.meta,
    });
    await order.save({ session });

    await session.commitTransaction();
    session.endSession();
    return res.json({ ok: true, order, refundPayment, refundResp });
  } catch (err) {
    try {
      await session.abortTransaction();
    } catch (_) {}
    session.endSession();
    return res.status(400).json({ message: err.message || "Refund failed" });
  }
};
