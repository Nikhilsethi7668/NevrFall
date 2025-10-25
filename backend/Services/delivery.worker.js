// services/delivery.worker.js
import { Worker, Queue } from "bullmq";
import { redisBullMQ as redis } from "../lib/redis.js";
import { shiprocketService } from "./shiprocket.service.js";
import Delivery from "../Models/Delivery.js";
import Order from "../Models/Order.js";
import ReturnRequest from "../Models/ReturnRequest.js";
import logger from "../utils/logger.js";

const QUEUE_NAME = "delivery-jobs";

export const deliveryQueue = new Queue(QUEUE_NAME, {
  connection: redis,
  defaultJobOptions: {
    removeOnComplete: 100,
    removeOnFail: 100,
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 1000,
    },
  },
});

export const deliveryWorker = new Worker(
  QUEUE_NAME,
  async (job) => {
    const jobName = job.name;
    const payload = job.data || {};

    logger.info(`Processing delivery job ${job.id}`, { jobName, payload });

    try {
      switch (jobName) {
        case "createShiprocketOrder":
          return await shiprocketService.createOrder(
            payload.orderId,
            payload.deliveryId
          );

        case "createReturnPickup":
          return await shiprocketService.createReturnPickup(
            payload.returnRequestId
          );

        case "generateLabel":
          return await shiprocketService.generateLabel(payload.shipmentId);

        case "generateReturnLabel":
          return await shiprocketService.generateReturnLabel(
            payload.shipmentId
          );

        case "trackShipment":
          return await shiprocketService.trackOrder(payload.awbCode);

        case "trackReturn":
          return await shiprocketService.trackReturn(payload.awbCode);

        case "schedulePickup":
          return await shiprocketService.schedulePickup(payload.shipmentId);

        case "cancelReturnPickup":
          return await shiprocketService.cancelReturnPickup(payload.shipmentId);

        case "scheduleReturnPickup":
          return await shiprocketService.scheduleReturnPickup(
            payload.shipmentId
          );

        case "updateOrderStatus":
          const order = await Order.findByIdAndUpdate(
            payload.orderId,
            { status: payload.status },
            { new: true }
          );
          return order;

        default:
          throw new Error(`Unknown job name: ${jobName}`);
      }
    } catch (error) {
      logger.error(`Delivery job ${job.id} failed`, {
        jobName,
        payload,
        error: error.response?.data || error.message,
      });
      // Re-throw so Bull handles retries according to attempts/backoff
      throw error;
    }
  },
  {
    connection: redis,
    concurrency: 5,
  }
);

// Completed / failed handlers
deliveryWorker.on("completed", (job) => {
  logger.info(`Delivery job ${job.id} completed`, {
    jobName: job.name,
    result: job.returnvalue,
  });
});

deliveryWorker.on("failed", (job, err) => {
  logger.error(`Delivery job ${job.id} failed`, {
    jobName: job?.name,
    error: err?.message,
  });
});

export default { deliveryQueue, deliveryWorker };
