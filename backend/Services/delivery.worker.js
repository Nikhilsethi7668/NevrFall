// Services/delivery.worker.js
import { Worker, Queue, QueueScheduler } from "bullmq";
import { redis } from "../Controllers/redis.js"; // adjust path if needed
import Order from "../Models/Order.js";
import ReturnRequest from "../Models/ReturnRequest.js";
import ExchangeRequest from "../Models/ExchangeRequest.js";
import { delhiveryAPI } from "./delhivery.api.js"; 
import { createLogger } from "../utils/logger.js"; 
const QUEUE_NAME = "delivery-jobs";

// create scheduler to handle stalled jobs / retries
new QueueScheduler(QUEUE_NAME, { connection: redis });

// export queue for controllers to use
export const deliveryQueue = new Queue(QUEUE_NAME, { connection: redis });

const logger =
  typeof createLogger === "function"
    ? createLogger("delivery-worker")
    : console;

export const deliveryWorker = new Worker(
  QUEUE_NAME,
  async (job) => {
    // job.name used as type when scheduling; fallback to job.data.type
    const type = job.name || job.data?.type;
    const payload = job.data?.payload || job.data || {};

    logger.info?.(`Processing job ${job.id} type=${type}`, { payload });

    try {
      switch (type) {
        case "generateLabel":
          // Expect payload: { orderId, deliveryId }
          if (!delhiveryAPI || !delhiveryAPI.createShipmentLabel) {
            throw new Error("delhiveryAPI.createShipmentLabel not implemented");
          }
          return await delhiveryAPI.createShipmentLabel(
            payload.orderId,
            payload.deliveryId
          );

        case "downloadDeliveryDocs":
          // payload: { waybill } or { deliveryId }
          if (!delhiveryAPI || !delhiveryAPI.downloadDocuments) {
            throw new Error("delhiveryAPI.downloadDocuments not implemented");
          }
          return await delhiveryAPI.downloadDocuments(
            payload.waybill || payload.deliveryId,
            payload
          );

        case "postDeliveryProcessing":
          // payload: { orderId, deliveryStatus }
          if (!payload.orderId)
            throw new Error("orderId required for postDeliveryProcessing");
          const order = await Order.findById(payload.orderId);
          if (!order) throw new Error("Order not found");
          order.status = payload.deliveryStatus || order.status;
          await order.save();
          return order;

        case "ndrReattempt":
          // payload: { waybill, deliveryId }
          if (!delhiveryAPI || !delhiveryAPI.scheduleRetry) {
            throw new Error("delhiveryAPI.scheduleRetry not implemented");
          }
          return await delhiveryAPI.scheduleRetry(
            payload.waybill || payload.deliveryId,
            payload
          );

        case "notifyCustomer":
          // payload: { userId, deliveryId, status, otp }
          if (!delhiveryAPI || !delhiveryAPI.sendOTPToCustomer) {
            // If you don't have delhiveryAPI.sendOTPToCustomer, implement a notifier (SMS/push/email)
            logger.warn(
              "notifyCustomer called but sendOTPToCustomer not implemented; payload:",
              payload
            );
            return { ok: false, message: "notifier-not-implemented" };
          }
          return await delhiveryAPI.sendOTPToCustomer(
            payload.userId,
            payload.deliveryId,
            payload.otp,
            payload.status
          );

        case "reconcileDeliveryWithDocs":
          // payload: { deliveryId, waybill, docType }
          if (!delhiveryAPI || !delhiveryAPI.reconcileWithDocs) {
            logger.warn("reconcileDeliveryWithDocs not implemented", payload);
            return { ok: false, message: "reconcile-not-implemented" };
          }
          return await delhiveryAPI.reconcileWithDocs(
            payload.deliveryId,
            payload.waybill,
            payload.docType
          );

        default:
          throw new Error(`Unknown job type: ${type}`);
      }
    } catch (err) {
      logger.error?.(`Job ${job.id} type=${type} failed`, err);
      throw err;
    }
  },
  { connection: redis, concurrency: 5 } // adjust concurrency as needed
);

deliveryWorker.on("completed", (job) => {
  logger.info?.(`Job ${job.id} completed`, { name: job.name, data: job.data });
});

deliveryWorker.on("failed", (job, err) => {
  logger.error?.(`Job ${job.id} failed`, err);
});

// export default for convenience
export default {
  deliveryQueue,
  deliveryWorker,
};
