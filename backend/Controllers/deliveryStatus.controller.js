import Delivery from "../Models/Delivery.js";
import Order from "../Models/Order.js";
import { sendSms } from "../Services/phone.service.js";
import logger from "../utils/logger.js";

// Can also be webhook
export const updateDeliveryStatus = async (shipmentId, newStatus) => {
  const delivery = await Delivery.findOne({ shipmentId }).populate("order");
  if (!delivery) throw new Error("Delivery not found");

  // Update status
  delivery.status = newStatus;
  await delivery.save();

  // update order for sync
  if (delivery.order) {
    delivery.order.status = newStatus;
    await delivery.order.save();
  }

  // ✅ Send OTP when dispatched or out for delivery
  if (["DISPATCHED", "OUT_FOR_DELIVERY"].includes(newStatus)) {
    try {
      const user = await delivery.populate("user");
      if (user?.user?.phone && delivery.otp) {
        await sendSms(user.user.phone, delivery.otp);
        logger.info(
          `OTP ${delivery.otp} sent to ${user.user.phone} (status: ${newStatus})`
        );
      }
    } catch (err) {
      logger.error("Failed to send OTP SMS", err);
    }
  }

  return delivery;
};
