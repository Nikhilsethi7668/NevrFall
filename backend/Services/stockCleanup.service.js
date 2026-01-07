import mongoose from "mongoose";
import Order from "../Models/Order.js";
import ProductVariant from "../Models/ProductVariant.js";
import PaymentSession from "../Models/PaymentSession.js";
import { cacheDelPattern } from "../lib/cache.js";
import logger from "../utils/logger.js";

/**
 * Release stock for orders that have been pending for too long
 * @param {Number} timeoutMinutes - Orders older than this will be cancelled
 * @param {Number} batchSize - Number of orders to process
 */
export async function releasePendingOrders(
    timeoutMinutes = 15,
    batchSize = 50
) {
    const session = await mongoose.startSession();
    let processedCount = 0;

    try {
        const timeoutThreshold = new Date(Date.now() - timeoutMinutes * 60 * 1000);

        // Find orders that are pending and older than threshold
        const pendingOrders = await Order.find({
            status: "pending",
            createdAt: { $lt: timeoutThreshold },
        })
            .limit(batchSize)
            .populate("items.variant");

        if (pendingOrders.length === 0) {
            return { processedCount: 0, message: "No pending orders to release" };
        }

        logger.info(`Found ${pendingOrders.length} stale orders to cleanup`);

        for (const order of pendingOrders) {
            await session.withTransaction(async () => {
                // 1. Release stock for each item
                for (const item of order.items) {
                    if (item.variantId || item.variant?._id) {
                        const variantId = item.variant._id || item.variant;
                        await ProductVariant.updateOne(
                            { _id: variantId },
                            { $inc: { stock: item.quantity } },
                            { session }
                        );
                    }
                }

                // 2. Mark order as cancelled
                order.status = "cancelled";
                order.meta = {
                    ...order.meta,
                    cancellationReason: "payment_timeout",
                    cancelledAt: new Date(),
                };
                await order.save({ session });

                // 3. Expire any related payment sessions
                await PaymentSession.updateMany(
                    { order: order._id, status: "active" },
                    { status: "expired" },
                    { session }
                );

                // 4. Invalidate caches
                await cacheDelPattern(`order:${order._id}`);
                await cacheDelPattern(`orders:${order.user}:*`);
            });

            processedCount++;
        }

        // Invalidate product caches globally after batch
        if (processedCount > 0) {
            await cacheDelPattern(`product:*`);
            await cacheDelPattern(`variant:*`);
        }

        return { processedCount, message: `Successfully released stock for ${processedCount} orders` };

    } catch (error) {
        logger.error("Stock release job failed", { error: error.message });
        throw error;
    } finally {
        session.endSession();
    }
}
