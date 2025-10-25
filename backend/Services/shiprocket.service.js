// services/shiprocket.service.js
import axios from "axios";
import Order from "../Models/Order.js";
import Delivery from "../Models/Delivery.js";
import logger from "../utils/logger.js";
import ReturnRequest from "../Models/ReturnRequest.js";

class ShiprocketService {
  constructor() {
    this.baseURL =
      process.env.SHIPROCKET_BASE_URL ||
      "https://apiv2.shiprocket.in/v1/external";
    this.email = process.env.SHIPROCKET_EMAIL;
    this.password = process.env.SHIPROCKET_PASSWORD;
    this.token = null;
  }

  async authenticate() {
    try {
      const response = await axios.post(`${this.baseURL}/auth/login`, {
        email: this.email,
        password: this.password,
      });

      this.token = response.data.token;
      return this.token;
    } catch (error) {
      logger.error("Shiprocket authentication failed", {
        error: error.response?.data || error.message,
      });
      throw new Error("Shiprocket authentication failed");
    }
  }

  async makeAuthenticatedRequest(config) {
    if (!this.token) {
      await this.authenticate();
    }

    try {
      const response = await axios({
        ...config,
        headers: {
          ...config.headers,
          Authorization: `Bearer ${this.token}`,
        },
      });
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        // Token expired, re-authenticate and retry
        await this.authenticate();
        const retryResponse = await axios({
          ...config,
          headers: {
            ...config.headers,
            Authorization: `Bearer ${this.token}`,
          },
        });
        return retryResponse.data;
      }
      throw error;
    }
  }

  async createOrder(orderId, deliveryId) {
    try {
      const order = await Order.findById(orderId).populate("user");
      if (!order) throw new Error("Order not found");

      const orderPayload = this.buildOrderPayload(order);

      const response = await this.makeAuthenticatedRequest({
        method: "POST",
        url: `${this.baseURL}/orders/create/adhoc`,
        data: orderPayload,
      });

      // Update delivery with Shiprocket data
      await Delivery.findByIdAndUpdate(deliveryId, {
        shipmentId: response.shipment_id,
        awbCode: response.awb_code,
        channelOrderId: response.channel_order_id,
        status: "NEW",
        shiprocketRaw: response,
        $push: {
          history: {
            status: "NEW",
            note: "Order created in Shiprocket",
            raw: response,
          },
        },
      });

      logger.info("Shiprocket order created successfully", {
        orderId,
        deliveryId,
        shipmentId: response.shipment_id,
      });

      return response;
    } catch (error) {
      logger.error("Shiprocket order creation failed", {
        orderId,
        deliveryId,
        error: error.response?.data || error.message,
      });
      throw error;
    }
  }

  buildOrderPayload(order) {
    const isCOD = order.paymentMethod === "cod";

    return {
      order_id: order._id.toString(),
      order_date: order.createdAt.toISOString(),
      pickup_location: process.env.SHIPROCKET_PICKUP_LOCATION || "Primary",
      channel_id: process.env.SHIPROCKET_CHANNEL_ID || "",
      comment: "Thank you for your order!",
      billing_customer_name: order.shippingAddress.name,
      billing_last_name:
        order.shippingAddress.name.split(" ").slice(1).join(" ") || "",
      billing_address: order.shippingAddress.addressLine1,
      billing_address_2: order.shippingAddress.addressLine2 || "",
      billing_city: order.shippingAddress.city,
      billing_pincode: order.shippingAddress.pincode,
      billing_state: order.shippingAddress.state,
      billing_country: "India",
      billing_email: order.user.email,
      billing_phone: order.shippingAddress.phone,
      shipping_is_billing: true,
      shipping_customer_name: order.shippingAddress.name,
      shipping_last_name:
        order.shippingAddress.name.split(" ").slice(1).join(" ") || "",
      shipping_address: order.shippingAddress.addressLine1,
      shipping_address_2: order.shippingAddress.addressLine2 || "",
      shipping_city: order.shippingAddress.city,
      shipping_pincode: order.shippingAddress.pincode,
      shipping_country: "India",
      shipping_state: order.shippingAddress.state,
      shipping_email: order.user.email,
      shipping_phone: order.shippingAddress.phone,
      order_items: order.items.map((item) => ({
        name: item.title,
        sku: item.variant.sku || `variant_${item.variant._id}`,
        units: item.quantity,
        selling_price: item.price,
        discount: item.lineTotal - item.priceAfterDiscount,
        tax: 0,
        hsn: 0,
      })),
      payment_method: isCOD ? "COD" : "Prepaid",
      sub_total: order.subtotal,
      length: 10,
      breadth: 10,
      height: 10,
      weight: 0.5,
      total_discount: order.discountAmount,
      shipping_charges: 0,
      giftwrap_charges: 0,
      transaction_charges: 0,
      total: order.total,
      ...(isCOD && { cod_amount: order.total }),
    };
  }

  async generateLabel(shipmentId) {
    try {
      const response = await this.makeAuthenticatedRequest({
        method: "GET",
        url: `${this.baseURL}/courier/generate/label`,
        params: { shipment_ids: shipmentId },
      });

      return response;
    } catch (error) {
      logger.error("Shiprocket label generation failed", {
        shipmentId,
        error: error.response?.data || error.message,
      });
      throw error;
    }
  }

  async generateManifest(shipmentId) {
    try {
      const response = await this.makeAuthenticatedRequest({
        method: "GET",
        url: `${this.baseURL}/courier/generate/manifest`,
        params: { shipment_ids: shipmentId },
      });

      return response;
    } catch (error) {
      logger.error("Shiprocket manifest generation failed", {
        shipmentId,
        error: error.response?.data || error.message,
      });
      throw error;
    }
  }

  async trackOrder(awbCode) {
    try {
      const response = await this.makeAuthenticatedRequest({
        method: "GET",
        url: `${this.baseURL}/courier/track/awb`,
        params: { awb_code: awbCode },
      });

      return response;
    } catch (error) {
      logger.error("Shiprocket tracking failed", {
        awbCode,
        error: error.response?.data || error.message,
      });
      throw error;
    }
  }

  async cancelOrder(shipmentId) {
    try {
      const response = await this.makeAuthenticatedRequest({
        method: "POST",
        url: `${this.baseURL}/orders/cancel`,
        data: { shipment_ids: [shipmentId] },
      });

      return response;
    } catch (error) {
      logger.error("Shiprocket order cancellation failed", {
        shipmentId,
        error: error.response?.data || error.message,
      });
      throw error;
    }
  }

  async schedulePickup(shipmentId) {
    try {
      const response = await this.makeAuthenticatedRequest({
        method: "POST",
        url: `${this.baseURL}/courier/generate/pickup`,
        data: { shipment_id: [shipmentId] },
      });

      return response;
    } catch (error) {
      logger.error("Shiprocket pickup scheduling failed", {
        shipmentId,
        error: error.response?.data || error.message,
      });
      throw error;
    }
  }
  async createReturnPickup(returnRequestId) {
    try {
      const returnRequest = await ReturnRequest.findById(returnRequestId)
        .populate("order")
        .populate("user")
        .populate("variant");

      if (!returnRequest) throw new Error("Return request not found");

      const returnPayload = this.buildReturnPickupPayload(returnRequest);

      const response = await this.makeAuthenticatedRequest({
        method: "POST",
        url: `${this.baseURL}/orders/create/adhoc`,
        data: returnPayload,
      });

      // Update return request with pickup info
      await ReturnRequest.findByIdAndUpdate(returnRequestId, {
        "pickup.carrier": "shiprocket",
        "pickup.trackingId": response.shipment_id,
        "pickup.awbCode": response.awb_code,
        "pickup.scheduledAt": new Date(),
        status: "pickup_scheduled",
        $push: {
          timelines: {
            status: "pickup_scheduled",
            action: "carrier_assigned",
            performedBy: null,
            notes: `Return pickup scheduled with Shiprocket. AWB: ${response.awb_code}`,
          },
        },
      });

      logger.info("Shiprocket return pickup created successfully", {
        returnRequestId,
        shipmentId: response.shipment_id,
        awbCode: response.awb_code,
      });

      return response;
    } catch (error) {
      logger.error("Shiprocket return pickup creation failed", {
        returnRequestId,
        error: error.response?.data || error.message,
      });
      throw error;
    }
  }

  // Build return pickup payload for Shiprocket
  buildReturnPickupPayload(returnRequest) {
    const order = returnRequest.order;
    const user = returnRequest.user;
    const variant = returnRequest.variant;

    // Use customer address as pickup location (return from customer)
    const pickupAddress = order.shippingAddress;

    // Use warehouse address as delivery location (return to warehouse)
    const deliveryAddress = {
      name: process.env.WAREHOUSE_NAME || "Warehouse Manager",
      phone: process.env.WAREHOUSE_PHONE || "0000000000",
      addressLine1: process.env.WAREHOUSE_ADDRESS_LINE1 || "Warehouse Address",
      city: process.env.WAREHOUSE_CITY || "City",
      state: process.env.WAREHOUSE_STATE || "State",
      pincode: process.env.WAREHOUSE_PINCODE || "000000",
    };

    return {
      order_id: `RETURN-${returnRequest._id}`,
      order_date: new Date().toISOString(),
      pickup_location: "Customer_Location", // Special location for returns
      channel_id: process.env.SHIPROCKET_CHANNEL_ID || "",
      comment: `Return pickup for order ${order._id}. Reason: ${returnRequest.reason}`,

      // Billing info (customer)
      billing_customer_name: pickupAddress.name,
      billing_last_name: pickupAddress.name.split(" ").slice(1).join(" ") || "",
      billing_address: pickupAddress.addressLine1,
      billing_address_2: pickupAddress.addressLine2 || "",
      billing_city: pickupAddress.city,
      billing_pincode: pickupAddress.pincode,
      billing_state: pickupAddress.state,
      billing_country: "India",
      billing_email: user.email,
      billing_phone: pickupAddress.phone,

      // Shipping info (warehouse - where the return goes)
      shipping_is_billing: false,
      shipping_customer_name: deliveryAddress.name,
      shipping_last_name:
        deliveryAddress.name.split(" ").slice(1).join(" ") || "",
      shipping_address: deliveryAddress.addressLine1,
      shipping_address_2: deliveryAddress.addressLine2 || "",
      shipping_city: deliveryAddress.city,
      shipping_pincode: deliveryAddress.pincode,
      shipping_country: "India",
      shipping_state: deliveryAddress.state,
      shipping_email: process.env.WAREHOUSE_EMAIL || user.email,
      shipping_phone: deliveryAddress.phone,

      // Return item details
      order_items: [
        {
          name: `RETURN: ${variant.product?.title || "Product"}`,
          sku: variant.sku || `return_${variant._id}`,
          units: returnRequest.quantity,
          selling_price: 0, // No value for returns
          discount: 0,
          tax: 0,
          hsn: 0,
        },
      ],

      // Return specific fields
      payment_method: "Prepaid", // Returns are always prepaid
      sub_total: 0,
      length: 10,
      breadth: 10,
      height: 10,
      weight: 0.5,
      total_discount: 0,
      shipping_charges: 0,
      giftwrap_charges: 0,
      transaction_charges: 0,
      total: 0,

      // Return flags (Shiprocket specific)
      is_return: true,
      return_type: "exchange", // or "refund" based on your logic
    };
  }

  // NEW: Schedule pickup for return
  async scheduleReturnPickup(shipmentId) {
    try {
      const response = await this.makeAuthenticatedRequest({
        method: "POST",
        url: `${this.baseURL}/courier/generate/pickup`,
        data: { shipment_id: [shipmentId] },
      });

      return response;
    } catch (error) {
      logger.error("Shiprocket return pickup scheduling failed", {
        shipmentId,
        error: error.response?.data || error.message,
      });
      throw error;
    }
  }

  // NEW: Generate return label
  async generateReturnLabel(shipmentId) {
    try {
      const response = await this.makeAuthenticatedRequest({
        method: "GET",
        url: `${this.baseURL}/courier/generate/label`,
        params: { shipment_ids: shipmentId },
      });

      return response;
    } catch (error) {
      logger.error("Shiprocket return label generation failed", {
        shipmentId,
        error: error.response?.data || error.message,
      });
      throw error;
    }
  }

  // NEW: Track return shipment
  async trackReturn(awbCode) {
    try {
      const response = await this.makeAuthenticatedRequest({
        method: "GET",
        url: `${this.baseURL}/courier/track/awb`,
        params: { awb_code: awbCode },
      });

      return response;
    } catch (error) {
      logger.error("Shiprocket return tracking failed", {
        awbCode,
        error: error.response?.data || error.message,
      });
      throw error;
    }
  }

  // NEW: Cancel return pickup
  async cancelReturnPickup(shipmentId) {
    try {
      const response = await this.makeAuthenticatedRequest({
        method: "POST",
        url: `${this.baseURL}/orders/cancel`,
        data: { shipment_ids: [shipmentId] },
      });

      return response;
    } catch (error) {
      logger.error("Shiprocket return cancellation failed", {
        shipmentId,
        error: error.response?.data || error.message,
      });
      throw error;
    }
  }
}

export const shiprocketService = new ShiprocketService();
export default shiprocketService;
