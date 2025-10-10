import mongoose from "mongoose";
import Order from "../Models/Order.js";
import Cart from "../Models/Cart.js";
import Product from "../Models/Product.js";
import ProductVariant from "../Models/ProductVariant.js";
import Coupon from "../Models/Coupon.js";

/**
 * Create Order
 * Body: { userId, items?, useCart: boolean, couponCode?, shippingAddress, paymentMethod, paymentInfo }
 * If useCart = true, items are taken from user's cart.
 * items: [{ product, variant, price, quantity, size, color }]
 */
export const createOrder = async (req, res) => {
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

    // 1) get items (either from cart or payload)
    let items = [];
    if (useCart) {
      const cart = await Cart.findOne({ user: userId }).session(session);
      if (!cart || !cart.items.length) {
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

    // 2) stock checks & decrement stock per variant atomically
    for (const it of items) {
      const variant = await ProductVariant.findOne({ _id: it.variant }).session(
        session
      );
      if (!variant) throw new Error(`Variant not found: ${it.variant}`);
      if (variant.stock < it.quantity)
        throw new Error(`Insufficient stock for variant ${it.variant}`);
      variant.stock -= it.quantity;
      await variant.save({ session });
    }

    // 3) compute subtotal
    const subtotal = items.reduce((s, it) => s + it.lineTotal, 0);

    // 4) apply coupon if provided (respect targetUser and minOrderValue)
    let discountAmount = 0;
    let couponRef = null;
    if (couponCode) {
      const coupon = await Coupon.findOne({
        code: couponCode.toUpperCase(),
      }).session(session);

      if (!coupon || !coupon.active) throw new Error("Invalid coupon");

      // targetUser check
      if (coupon.targetUser && String(coupon.targetUser) !== String(userId)) {
        throw new Error("Applied Coupon is valid for selected user only");
      }

      if (coupon.expiresAt && coupon.expiresAt < new Date())
        throw new Error("Coupon expired");

      if (coupon.maxUses && coupon.usesCount >= coupon.maxUses)
        throw new Error("Coupon usage limit reached");

      // per-user limit
      if (coupon.maxUsesPerUser) {
        const userUsage = await Order.countDocuments({
          "coupon.couponId": coupon._id,
          user: userId,
        }).session(session);
        if (userUsage >= coupon.maxUsesPerUser)
          throw new Error("Coupon already used by user");
      }

      if ((coupon.minOrderValue || 0) > 0 && subtotal < coupon.minOrderValue) {
        throw new Error(
          `Minimum order value of ${coupon.minOrderValue} required to apply this coupon`
        );
      }

      // compute applicable subtotal (items coupon can discount)
      let applicableSubtotal = 0;
      const productSet = new Set(
        (coupon.applicableProductIds || []).map(String)
      );
      for (const it of items) {
        if (productSet.size === 0 || productSet.has(String(it.product))) {
          applicableSubtotal += it.lineTotal;
        }
      }
      if (applicableSubtotal <= 0)
        throw new Error("Coupon not applicable to order items");

      if (coupon.type === "fixed") {
        discountAmount = Math.min(coupon.value, applicableSubtotal);
      } else {
        discountAmount = (applicableSubtotal * coupon.value) / 100;
        if (coupon.maxDiscountAmount)
          discountAmount = Math.min(discountAmount, coupon.maxDiscountAmount);
      }

      // update coupon usesCount
      coupon.usesCount = (coupon.usesCount || 0) + 1;
      await coupon.save({ session });

      couponRef = coupon._id;
    }

    // 5) finalize totals
    const total = Math.max(0, subtotal - discountAmount);

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
      status: paymentMethod === "cod" ? "pending" : "pending",
      paymentMethod,
      paymentInfo,
      shippingAddress,
    });

    await order.save({ session });

    // 7) if using cart, clear cart
    if (useCart) {
      await Cart.updateOne(
        { user: userId },
        { $set: { items: [], totalValue: 0 } }
      ).session(session);
    }

    await session.commitTransaction();
    session.endSession();

    res.status(201).json(order);
  } catch (err) {
    try {
      await session.abortTransaction();
    } catch (_) {}
    session.endSession();
    res.status(400).json({ message: err.message || "Order creation failed" });
  }
};

export const getOrder = async (req, res) => {
  const { id } = req.params;
  const order = await Order.findById(id).populate(
    "items.product items.variant coupon.couponId"
  );
  if (!order) return res.status(404).json({ message: "Order not found" });
  res.json(order);
};

export const listOrders = async (req, res) => {
  const { userId, page = 1, limit = 20 } = req.query;
  const q = {};
  if (userId) q.user = userId;
  const orders = await Order.find(q)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));
  res.json(orders);
};
