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
    this.tokenFetchedAt = null;
    this.axios = axios.create({
      baseURL: this.baseURL,
      timeout: 15_000,
    });

    // Attach a response interceptor to handle 401 -> refresh token
    this.axios.interceptors.response.use(
      (res) => res,
      async (error) => {
        const originalRequest = error.config;
        if (
          error.response &&
          error.response.status === 401 &&
          !originalRequest._retry
        ) {
          originalRequest._retry = true;
          try {
            await this.authenticate();
            originalRequest.headers = {
              ...originalRequest.headers,
              Authorization: `Bearer ${this.token}`,
            };
            return this.axios(originalRequest);
          } catch (err) {
            return Promise.reject(err);
          }
        }
        return Promise.reject(error);
      }
    );
  }

  async authenticate() {
    try {
      const response = await axios.post(`${this.baseURL}/auth/login`, {
        email: this.email,
        password: this.password,
      });

      // defensive: check token field
      this.token = response.data?.token || response.data?.auth_token || null;
      this.tokenFetchedAt = Date.now();

      if (!this.token) {
        logger.error("Shiprocket auth response missing token", {
          body: response.data,
        });
        throw new Error("Shiprocket authentication failed: no token");
      }

      // set axios default auth header
      this.axios.defaults.headers.common.Authorization = `Bearer ${this.token}`;

      logger.info("Shiprocket authenticated successfully");
      return this.token;
    } catch (error) {
      logger.error("Shiprocket authentication failed", {
        error: error.response?.data || error.message,
      });
      throw new Error("Shiprocket authentication failed");
    }
  }

  async makeAuthenticatedRequest(config) {
    // Ensure we have a token; authenticate if missing
    if (!this.token) {
      await this.authenticate();
    }

    try {
      const response = await this.axios({
        ...config,
        headers: {
          ...config.headers,
          Authorization: `Bearer ${this.token}`,
        },
      });
      return response.data;
    } catch (error) {
      // Let caller see the underlying response data if available
      logger.error("Shiprocket request failed", {
        url: config.url,
        error: error.response?.data || error.message,
      });
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
        url: `/orders/create/adhoc`,
        data: orderPayload,
      });

      // Defensive checks for response fields
      const shipmentId = response?.shipment_id || response?.data?.shipment_id;
      const awbCode = response?.awb_code || response?.data?.awb_code;

      await Delivery.findByIdAndUpdate(deliveryId, {
        shipmentId,
        awbCode,
        channelOrderId: response?.channel_order_id || null,
        status: "NEW",
        shiprocketRaw: response,
        $push: {
          history: {
            status: "NEW",
            note: "Order created in Shiprocket",
            raw: response,
            at: new Date(),
          },
        },
      });

      logger.info("Shiprocket order created successfully", {
        orderId,
        deliveryId,
        shipmentId,
        awbCode,
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
  // Add near other exports
  async createManualShipment(deliveryId) {
    try {
      const delivery = await Delivery.findById(deliveryId).populate("order");
      if (!delivery || !delivery.order)
        throw new Error("Delivery or order not found");

      // Reuse existing createOrder logic if you have one
      const response = await createOrder(delivery.order._id);
      return response;
    } catch (err) {
      logger.error("Manual shipment creation failed", err);
      throw err;
    }
  }

  buildOrderPayload(order) {
    const isCOD = order.paymentMethod === "cod";

    // Defensive: ensure shipping/billing exist
    const ship = order.shippingAddress || {};
    const user = order.user || {};

    return {
      order_id: order._id.toString(),
      order_date: order.createdAt
        ? order.createdAt.toISOString()
        : new Date().toISOString(),
      pickup_location: process.env.SHIPROCKET_PICKUP_LOCATION || "Primary",
      channel_id: process.env.SHIPROCKET_CHANNEL_ID || "",
      comment: "Thank you for your order!",
      billing_customer_name: ship.name || user.name || "Customer",
      billing_last_name:
        (ship.name && ship.name.split(" ").slice(1).join(" ")) || "",
      billing_address: ship.addressLine1 || "",
      billing_address_2: ship.addressLine2 || "",
      billing_city: ship.city || "",
      billing_pincode: ship.pincode || "",
      billing_state: ship.state || "",
      billing_country: "India",
      billing_email: user.email || "",
      billing_phone: ship.phone || user.phone || "",
      shipping_is_billing: true,
      shipping_customer_name: ship.name || user.name || "Customer",
      shipping_last_name:
        (ship.name && ship.name.split(" ").slice(1).join(" ")) || "",
      shipping_address: ship.addressLine1 || "",
      shipping_address_2: ship.addressLine2 || "",
      shipping_city: ship.city || "",
      shipping_pincode: ship.pincode || "",
      shipping_country: "India",
      shipping_state: ship.state || "",
      shipping_email: user.email || "",
      shipping_phone: ship.phone || user.phone || "",
      order_items: (order.items || []).map((item) => ({
        name: item.title,
        sku: item.variant?.sku || `variant_${item.variant?._id}`,
        units: item.quantity,
        selling_price: item.price,
        discount: Math.max(
          0,
          (item.lineTotal || 0) - (item.priceAfterDiscount || item.price || 0)
        ),
        tax: 0,
        hsn: 0,
      })),
      payment_method: isCOD ? "COD" : "Prepaid",
      sub_total: order.subtotal || 0,
      length: 10,
      breadth: 10,
      height: 10,
      weight: 0.5,
      total_discount: order.discountAmount || 0,
      shipping_charges: 0,
      giftwrap_charges: 0,
      transaction_charges: 0,
      total: order.total || 0,
      ...(isCOD && { cod_amount: order.total || 0 }),
    };
  }

  async generateLabel(shipmentId) {
    try {
      const response = await this.makeAuthenticatedRequest({
        method: "GET",
        url: `/courier/generate/label`,
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
        url: `/courier/generate/manifest`,
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
        url: `/courier/track/awb`,
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
        url: `/orders/cancel`,
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
        url: `/courier/generate/pickup`,
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
        url: `/orders/create/adhoc`,
        data: returnPayload,
      });

      // Update return request with pickup info
      await ReturnRequest.findByIdAndUpdate(returnRequestId, {
        "pickup.carrier": "shiprocket",
        "pickup.trackingId": response?.shipment_id || null,
        "pickup.awbCode": response?.awb_code || null,
        "pickup.scheduledAt": new Date(),
        status: "pickup_scheduled",
        $push: {
          timelines: {
            status: "pickup_scheduled",
            action: "carrier_assigned",
            performedBy: null,
            notes: `Return pickup scheduled with Shiprocket. AWB: ${response?.awb_code}`,
            at: new Date(),
          },
        },
      });

      logger.info("Shiprocket return pickup created successfully", {
        returnRequestId,
        shipmentId: response?.shipment_id,
        awbCode: response?.awb_code,
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
    const order = returnRequest.order || {};
    const user = returnRequest.user || {};
    const variant = returnRequest.variant || {};

    // Use customer address as pickup location (return from customer)
    const pickupAddress = order.shippingAddress || {};

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
      pickup_location: "Customer_Location",
      channel_id: process.env.SHIPROCKET_CHANNEL_ID || "",
      comment: `Return pickup for order ${order._id}. Reason: ${returnRequest.reason}`,

      billing_customer_name: pickupAddress.name || user.name || "Customer",
      billing_last_name:
        (pickupAddress.name &&
          pickupAddress.name.split(" ").slice(1).join(" ")) ||
        "",
      billing_address: pickupAddress.addressLine1 || "",
      billing_address_2: pickupAddress.addressLine2 || "",
      billing_city: pickupAddress.city || "",
      billing_pincode: pickupAddress.pincode || "",
      billing_state: pickupAddress.state || "",
      billing_country: "India",
      billing_email: user.email || "",
      billing_phone: pickupAddress.phone || user.phone || "",

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
      shipping_email: process.env.WAREHOUSE_EMAIL || user.email || "",
      shipping_phone: deliveryAddress.phone,

      order_items: [
        {
          name: `RETURN: ${variant.product?.title || "Product"}`,
          sku: variant.sku || `return_${variant._id}`,
          units: returnRequest.quantity || 1,
          selling_price: 0,
          discount: 0,
          tax: 0,
          hsn: 0,
        },
      ],

      payment_method: "Prepaid",
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
      is_return: true,
      return_type: "exchange",
    };
  }

  // Schedule pickup for return
  async scheduleReturnPickup(shipmentId) {
    try {
      const response = await this.makeAuthenticatedRequest({
        method: "POST",
        url: `/courier/generate/pickup`,
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

  // Generate return label
  async generateReturnLabel(shipmentId) {
    try {
      const response = await this.makeAuthenticatedRequest({
        method: "GET",
        url: `/courier/generate/label`,
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

  // Track return shipment
  async trackReturn(awbCode) {
    try {
      const response = await this.makeAuthenticatedRequest({
        method: "GET",
        url: `/courier/track/awb`,
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

  // Cancel return pickup
  async cancelReturnPickup(shipmentId) {
    try {
      const response = await this.makeAuthenticatedRequest({
        method: "POST",
        url: `/orders/cancel`,
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
