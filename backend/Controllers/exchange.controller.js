// controllers/exchange.controller.js
import mongoose from "mongoose";
import ExchangeRequest from "../Models/ExchangeRequest.js";
import Order from "../Models/Order.js";
import InventoryReservation from "../Models/InventoryReservation.js";
import ProductVariant from "../Models/ProductVariant.js";

const reversePickupFee = 100; // Example fee, fetch from config

const computeEstimatedCredit = (originalPrice, fees) => {
  return originalPrice - fees.reversePickup - fees.restocking;
};

/*
FLOW:
1. User initiates exchange from FE, selecting a replacement.
2. API validates: order ownership, 7-day window, item not already returned.
3. Computes estimated credit (original price - fees).
4. Creates an ExchangeRequest doc with status 'REQUESTED'.
5. Reserves replacement inventory with a short TTL.
6. Returns the ExchangeRequest object.
*/
export const createExchange = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { orderId, orderItemId, selectedReplacement, idempotencyKey } =
      req.body;
    const userId = req.user.id;

    // Idempotency check
    if (idempotencyKey) {
      const existing = await ExchangeRequest.findOne({
        idempotencyKey,
        user: userId,
      }).session(session);
      if (existing) {
        await session.commitTransaction();
        return res.status(200).json(existing);
      }
    }

    // Validate order and item
    const order = await Order.findById(orderId).session(session);
    console.log("order:", order);
    console.log("Order ID", orderId);
    console.log(req.body, "req.body");
    if (!order) throw new Error("Order not found");
    if (!order.user.equals(userId)) throw new Error("Not your order");

    const orderItem = order.items[orderItemId];
    console.log(order.items[orderItemId], "order");
    if (!orderItem) throw new Error("Order item not found");
    if (orderItem.returnedQuantity >= orderItem.quantity)
      throw new Error("Item already fully returned/exchanged");

    // Check 7-day exchange window
    const deliveredAt = order?.deliveryDetails?.deliveredAt || order.updatedAt;
    const now = new Date();
    const diffDays = (now - deliveredAt) / (1000 * 60 * 60 * 24);
    if (diffDays > 7) throw new Error("Exchange window expired");

    // Compute fees and estimated credit
    const fees = { reversePickup: reversePickupFee, restocking: 0 };
    const originalPrice = orderItem.priceAfterDiscount * orderItem.quantity;
    const estimatedCredit = computeEstimatedCredit(originalPrice, fees);
    if (estimatedCredit <= 0)
      throw new Error("No credit available for exchange");

    // Calculate price difference (for admin/payment tracking)
    const selectedTotal =
      (selectedReplacement?.priceAtSelection || 0) *
      (selectedReplacement?.quantity || 1);
    const diff = Math.max(0, Math.round(selectedTotal - originalPrice));

    let dbSafeSelectedReplacement = null;
    let variant = null;
    if (selectedReplacement && selectedReplacement.skuId) {
      variant = await ProductVariant.findOne({
        sku: selectedReplacement.skuId,
      }).session(session);
      if (!variant) {
        throw new Error("Selected replacement product variant not found.");
      }
      dbSafeSelectedReplacement = {
        product: variant.product,
        variant: variant._id,
        sku: variant.sku,
        priceAtSelection: selectedReplacement.priceAtSelection,
        selectionType: selectedReplacement.selectionType || "user_place",
      };
    }

    // Create exchange request
    const exDocs = await ExchangeRequest.create(
      [
        {
          user: userId,
          originalOrder: order,
          originalOrderId: order._id,
          originalOrderItemId: order.items[orderItemId]._id,
          originalOrderItemIndex: orderItemId,
          originalItemPrice: originalPrice,
          selectedReplacement: dbSafeSelectedReplacement,
          estimatedCredit,
          fees,
          idempotencyKey,
          status: "REQUESTED",
          meta: {
            adminActionRequired: true,
            requestedAt: new Date(),
            priceDifference: diff,
            paymentStatus: diff > 0 ? "PENDING" : "N/A",
            paymentMode: null, // can later be "COD" or "ONLINE"
          },
          history: [
            {
              status: "REQUESTED",
              by: userId,
              at: new Date(),
              meta: { note: "User initiated exchange request" },
            },
          ],
        },
      ],
      { session }
    );
    const ex = exDocs[0];

    // Reserve replacement inventory (short TTL)
    if (variant) {
      const ttlMinutes = 30;
      await InventoryReservation.create(
        [
          {
            skuId: variant._id, // Use the ObjectId of the variant
            reservedBy: "exchange",
            reservedForId: ex._id, // Link to the exchange request
            quantity: selectedReplacement.quantity || 1,
            reservedAt: new Date(),
            expiresAt: new Date(Date.now() + ttlMinutes * 60 * 1000),
          },
        ],
        { session }
      );
    }
    order.items[orderItemId].returnedQuantity +=
      selectedReplacement.quantity || 1;
    await order.save({ session });

    // Commit transaction
    await session.commitTransaction();
    return res.status(201).json({ ex, order });
  } catch (err) {
    await session.abortTransaction();
    console.error("createExchange err:", err);
    return res.status(400).json({ error: err.message });
  } finally {
    session.endSession();
  }
};

export const qcHandler = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { exchangeId, qcPassed, notes, images, checkedBy } = req.body;
    const ex = await ExchangeRequest.findById(exchangeId).session(session);
    if (!ex) throw new Error("Exchange not found");

    // set QC report
    ex.qcReport = { passed: qcPassed, notes, images, checkedBy };
    ex.status = qcPassed ? "QC_PASSED" : "QC_FAILED";
    ex.history.push({
      status: ex.status,
      by: checkedBy,
      at: new Date(),
      meta: { notes },
    });

    if (!qcPassed) {
      // release reservation & release any held wallet
      if (ex.selectedReplacement && ex.selectedReplacement.skuId) {
        await InventoryReservation.deleteMany({
          reservedForId: ex._id,
          reservedBy: "exchange",
        }).session(session);
      }
      if (ex.meta?.heldWalletTxId) {
        await releaseHeldWalletTx({
          walletTxId: ex.meta.heldWalletTxId,
          session,
        });
      }
      await ex.save({ session });
      await session.commitTransaction();
      return res.json({ ok: true, exchange: ex });
    }

    // QC passed -> branch by price compare (x = original, y = replacement)
    const x = ex.originalItemPrice;
    const y =
      ex.selectedReplacement.priceAtSelection *
      (ex.selectedReplacement.quantity || 1);

    // case: x > y => credit (x - y) to wallet
    if (x > y) {
      const creditAmount = Math.round(x - y);
      const [walletTx] = await WalletTransaction.create(
        [
          {
            user: ex.user,
            type: "credit",
            amount: creditAmount,
            currency: "INR",
            status: "available",
            source: "exchange",
            refId: ex._id,
            meta: { note: "Exchange credit after QC" },
          },
        ],
        { session }
      );

      ex.walletTxId = walletTx._id;
      ex.status = "CREDITED";
      ex.history.push({
        status: "CREDITED",
        by: checkedBy,
        at: new Date(),
        meta: { walletTxId: walletTx._id },
      });

      // auto-place if requested and replacement price <= x
      if (ex.selectedReplacement.selectionType === "auto_place") {
        // create new order with wallet payment (ensure createOrderFromSelection accepts walletTxId)
        const newOrder = await createOrderFromSelection(
          {
            userId: ex.user,
            items: [
              {
                productId: ex.selectedReplacement.productId,
                variantId: ex.selectedReplacement.skuId,
                quantity: ex.selectedReplacement.quantity || 1,
                price: ex.selectedReplacement.priceAtSelection,
              },
            ],
            paymentMethod: "wallet",
            walletTxId: walletTx._id,
            couponCode: ex.selectedReplacement?.couponCode || null,
            meta: { exchangeId: ex._id },
          },
          session
        );

        ex.linkedNewOrderId = newOrder._id;
        ex.status = "NEW_ORDER_PLACED";
        ex.history.push({
          status: "NEW_ORDER_PLACED",
          by: checkedBy,
          at: new Date(),
          meta: { newOrderId: newOrder._id },
        });
      }

      await ex.save({ session });
      await session.commitTransaction();
      return res.json({ ok: true, exchange: ex });
    }

    // case: x === y => direct order placed (no payment)
    if (x === y) {
      const newOrder = await createOrderFromSelection(
        {
          userId: ex.user,
          items: [
            {
              productId: ex.selectedReplacement.productId,
              variantId: ex.selectedReplacement.skuId,
              quantity: ex.selectedReplacement.quantity || 1,
              price: ex.selectedReplacement.priceAtSelection,
            },
          ],
          paymentMethod: "none",
          couponCode: ex.selectedReplacement?.couponCode || null,
          meta: { exchangeId: ex._id },
        },
        session
      );

      ex.linkedNewOrderId = newOrder._id;
      ex.status = "NEW_ORDER_PLACED";
      ex.history.push({
        status: "NEW_ORDER_PLACED",
        by: checkedBy,
        at: new Date(),
        meta: { newOrderId: newOrder._id },
      });

      await ex.save({ session });
      await session.commitTransaction();
      return res.json({ ok: true, exchange: ex });
    }

    // case: x < y => need payment for diff => WAITING_FOR_PAYMENT
    if (x < y) {
      const diff = Math.round(y - x);
      ex.status = "WAITING_FOR_PAYMENT";
      ex.history.push({
        status: "WAITING_FOR_PAYMENT",
        by: checkedBy,
        at: new Date(),
        meta: { diff },
      });
      await ex.save({ session });
      // keep reservation alive for some TTL (admin decision)
      await session.commitTransaction();
      return res.json({ ok: true, exchange: ex, requiredPayment: diff });
    }

    // fallback
    await ex.save({ session });
    await session.commitTransaction();
    return res.json({ ok: true, exchange: ex });
  } catch (err) {
    await session.abortTransaction();
    console.error("qcHandler err:", err);
    return res.status(400).json({ error: err.message });
  } finally {
    session.endSession();
  }
};

export const confirmPaymentAndPlaceOrder = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { exchangeId, paymentMethod = "cod" } = req.body;
    const adminUser = req.user._id; // caller (admin or user depending on route)
    const ex = await ExchangeRequest.findById(exchangeId).session(session);
    if (!ex) throw new Error("Exchange not found");
    if (ex.status !== "WAITING_FOR_PAYMENT")
      throw new Error("Exchange not waiting for payment");

    const x = ex.originalItemPrice;
    const y =
      ex.selectedReplacement.priceAtSelection *
      (ex.selectedReplacement.quantity || 1);
    if (x >= y) throw new Error("No payment required");

    let diff = Math.round(y - x);
    let walletUsedTotal = 0;
    let consumedHeldWalletTxId = null;

    // 1) consume previously held wallet tx (if any)
    const heldWalletTxId = ex.meta?.heldWalletTxId || null;
    if (heldWalletTxId) {
      const heldTx = await WalletTransaction.findById(heldWalletTxId).session(
        session
      );
      if (heldTx && heldTx.status === "pending") {
        walletUsedTotal += heldTx.amount;
        // finalize the held tx (mark used/available depending on your semantics)
        await finalizeHeldWalletTx({ walletTxId: heldWalletTxId, session });
        diff = Math.max(0, diff - heldTx.amount);
        consumedHeldWalletTxId = heldWalletTxId;
      }
    }

    // 2) No more online gateway allowed — only COD for remaining diff
    let paymentDoc = null;
    if (diff > 0) {
      if (paymentMethod !== "cod") {
        throw new Error("Remaining exchange payment can only be paid by COD");
      }
      const [p] = await Payment.create(
        [
          {
            order: null,
            user: ex.user,
            method: "cod",
            amount: diff,
            status: "cod_pending",
            meta: { exchangeId: ex._id },
          },
        ],
        { session }
      );
      paymentDoc = p;
    }

    // 3) Place order
    const orderPayload = {
      userId: ex.user,
      items: [
        {
          productId: ex.selectedReplacement.productId,
          variantId: ex.selectedReplacement.skuId,
          quantity: ex.selectedReplacement.quantity || 1,
          price: ex.selectedReplacement.priceAtSelection,
        },
      ],
      paymentMethod: diff > 0 ? "cod" : walletUsedTotal > 0 ? "wallet" : "none",
      walletTxId: consumedHeldWalletTxId || null,
      couponCode: ex.selectedReplacement?.couponCode || null,
      meta: { exchangeId: ex._id },
    };

    const newOrder = await createOrderFromSelection(orderPayload, session);

    // link payment doc to order if present
    if (paymentDoc) {
      paymentDoc.order = newOrder._id;
      await paymentDoc.save({ session });
      ex.paymentId = paymentDoc._id;
    }

    // update exchange record
    ex.linkedNewOrderId = newOrder._id;
    ex.status = "NEW_ORDER_PLACED";
    ex.history.push({
      status: "NEW_ORDER_PLACED",
      by: adminUser,
      at: new Date(),
      meta: { newOrderId: newOrder._id },
    });
    // keep reference to held wallet tx if any
    if (consumedHeldWalletTxId)
      ex.meta.consumedHeldWalletTxId = consumedHeldWalletTxId;

    await ex.save({ session });
    await session.commitTransaction();
    return res.json({ ok: true, exchange: ex, newOrder });
  } catch (err) {
    await session.abortTransaction();
    console.error("confirmPaymentAndPlaceOrder err:", err);
    return res.status(400).json({ error: err.message });
  } finally {
    session.endSession();
  }
};

// Need to add more controllers for listing exchanges, getting details, admin updates, cancelRequestedExchange, etc.

// Other controllers (listExchanges, getExchangeDetails, cancelRequestedExchange) can be added similarly.
