// Controllers/delivery.controller.js
import Delivery from "../Models/Delivery.js";
import Order from "../Models/Order.js"; // optional: update order status as needed
import WarehouseLocation from "../Models/WarehouseLocation.js";
import * as Delhivery from "../Services/delivery.service.js";
import { validateCreateShipmentPayload } from "../utils/validators.js";

/* ---------- Helper Functions for Multi-Piece Shipments ---------- */

/**
 * Split order items into shipment pieces
 * @param {Array} orderItems - Array of order items
 * @param {Object} options - { maxItemsPerPiece, maxWeightPerPiece (in grams) }
 * @returns {Array} Array of pieces, each containing items for that piece
 */
export function splitOrderIntoPieces(orderItems, options = {}) {
  const { maxItemsPerPiece = 5, maxWeightPerPiece = 5000 } = options; // Default: 5 items or 5kg per piece

  const pieces = [];
  let currentPiece = [];
  let currentWeight = 0;
  let currentItemCount = 0;

  for (let i = 0; i < orderItems.length; i++) {
    const item = orderItems[i];
    // Estimate weight (you may want to get actual weight from product/variant)
    const itemWeight = (item.weight || 500) * item.quantity; // Default 500g per item
    const itemCount = item.quantity;

    // Check if adding this item would exceed limits
    const wouldExceedWeight = currentWeight + itemWeight > maxWeightPerPiece;
    const wouldExceedCount = currentItemCount + itemCount > maxItemsPerPiece;

    // If current piece is not empty and adding this item would exceed limits, start new piece
    if (currentPiece.length > 0 && (wouldExceedWeight || wouldExceedCount)) {
      pieces.push([...currentPiece]);
      currentPiece = [];
      currentWeight = 0;
      currentItemCount = 0;
    }

    // Add item to current piece
    currentPiece.push({
      ...item,
      itemIndex: i, // Track original index in order.items
    });
    currentWeight += itemWeight;
    currentItemCount += itemCount;
  }

  // Add remaining items as last piece
  if (currentPiece.length > 0) {
    pieces.push(currentPiece);
  }

  return pieces.length > 0 ? pieces : [orderItems]; // Fallback to single piece if empty
}

/**
 * Build Delhivery shipment payload from order items
 * @param {Object} order - Order document
 * @param {Array} itemsForPiece - Items to include in this piece
 * @param {Object} pickupLocation - Pickup location object
 * @param {Number} pieceNumber - Piece number (1, 2, 3...)
 * @param {Number} totalPieces - Total number of pieces
 * @returns {Object} Delhivery shipment payload
 */
export function buildDelhiveryShipmentPayload(
  order,
  itemsForPiece,
  pickupLocation,
  pieceNumber = 1,
  totalPieces = 1
) {
  const shippingAddress = order.shippingAddress || {};
  const paymentMode = order.paymentMethod === "cod" ? "COD" : "Prepaid";

  // Build order string for Delhivery (order ID + piece number for multi-piece)
  const orderIdString =
    totalPieces > 1
      ? `${order._id.toString()}-P${pieceNumber}/${totalPieces}`
      : order._id.toString();

  // Calculate COD amount for this piece (if COD)
  let codAmount = 0;
  if (paymentMode === "COD") {
    codAmount = itemsForPiece.reduce(
      (sum, item) => sum + item.priceAfterDiscount * item.quantity,
      0
    );
    // Add proportional discount if any
    const pieceSubtotal = itemsForPiece.reduce(
      (sum, item) => sum + item.lineTotal,
      0
    );
    const orderTotal = order.total || 0;
    const orderSubtotal = order.subtotal || 0;
    if (orderTotal < orderSubtotal && orderSubtotal > 0) {
      const discountRatio = orderTotal / orderSubtotal;
      codAmount = Math.round(pieceSubtotal * discountRatio);
    }
  }

  // Build shipments array for Delhivery
  const shipments = [
    {
      order: orderIdString, // Unique order ID per piece
      name: shippingAddress.name || "Customer",
      phone: shippingAddress.phone || "",
      pin: shippingAddress.pincode || shippingAddress.pin || "",
      address: [
        shippingAddress.line1 || "",
        shippingAddress.line2 || "",
        shippingAddress.city || "",
        shippingAddress.state || "",
      ]
        .filter(Boolean)
        .join(", "),
      payment_mode: paymentMode,
      ...(codAmount > 0 && { amount: codAmount.toString() }),
      // Add item details
      products_desc: itemsForPiece
        .map(
          (item) =>
            `${item.title || "Product"} ${item.color || ""} ${
              item.size || ""
            } x${item.quantity}`
        )
        .join(", "),
      quantity: itemsForPiece.reduce((sum, item) => sum + item.quantity, 0),
      // Add weight if available
      ...(itemsForPiece[0]?.weight && {
        total_amount: itemsForPiece
          .reduce((sum, item) => sum + (item.weight || 500) * item.quantity, 0)
          .toString(),
      }),
    },
  ];

  return {
    shipments,
    pickup_location: pickupLocation,
  };
}

/**
 * Extract waybills from Delhivery response (handles both single and multi-piece)
 * @param {Object} response - Delhivery API response
 * @returns {Array} Array of waybill objects { waybill, shipmentIndex }
 */
export function extractWaybillsFromResponse(response) {
  const waybills = [];

  // Handle different response formats
  if (response?.shipments && Array.isArray(response.shipments)) {
    response.shipments.forEach((shipment, index) => {
      if (shipment.waybill) {
        waybills.push({
          waybill: shipment.waybill,
          shipmentIndex: index,
          shipment: shipment,
        });
      }
    });
  } else if (response?.packages && Array.isArray(response.packages)) {
    response.packages.forEach((pkg, index) => {
      if (pkg.waybill) {
        waybills.push({
          waybill: pkg.waybill,
          shipmentIndex: index,
          shipment: pkg,
        });
      }
    });
  } else if (response?.data?.waybill) {
    waybills.push({
      waybill: response.data.waybill,
      shipmentIndex: 0,
      shipment: response.data,
    });
  } else if (response?.waybill) {
    waybills.push({
      waybill: response.waybill,
      shipmentIndex: 0,
      shipment: response,
    });
  } else if (Array.isArray(response) && response.length > 0) {
    response.forEach((item, index) => {
      if (item.waybill) {
        waybills.push({
          waybill: item.waybill,
          shipmentIndex: index,
          shipment: item,
        });
      }
    });
  }

  return waybills;
}

/* ---------- 1. PINCODE ---------- */

//Working Properly
export async function pincodeServiceability(req, res) {
  try {
    const pin = req.query.pin || req.query.filter_codes;
    if (!pin)
      return res
        .status(400)
        .json({ ok: false, error: "pin/filter_codes required" });
    const cfg = req.query.configName || "default";
    const data = await Delhivery.checkPincode(pin, cfg);
    return res.json({ ok: true, data });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, error: err.raw || err.message });
  }
}

//working
export async function heavyPincodeServiceability(req, res) {
  try {
    const { pincode, product_type } = req.query;
    if (!pincode)
      return res.status(400).json({ ok: false, error: "pincode required" });
    const data = await Delhivery.checkHeavyPincode(
      { pincode, product_type },
      req.query.configName || "default"
    );
    return res.json({ ok: true, data });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, error: err.raw || err.message });
  }
}

/* ---------- 2. Expected TAT ---------- */
//Working
export async function expectedTatController(req, res) {
  try {
    let {
      origin_pin,
      destination_pin,
      mot = "E",
      pdt,
      expected_pickup_date = Date.now().year,
    } = req.query;
    if (!destination_pin || !mot)
      return res
        .status(400)
        .json({ ok: false, error: "origin_pin,destination_pin,mot required" });

    const warehouse = await WarehouseLocation.findOne({ default: true });
    if (!warehouse) {
      return res
        .status(404)
        .json({ ok: false, error: "Default warehouse not found" });
    }
    if (!origin_pin) origin_pin = warehouse?.pincode;
    const data = await Delhivery.expectedTAT(
      { origin_pin, destination_pin, mot, pdt, expected_pickup_date },
      req.query.configName || "default"
    );
    return res.json({ ok: true, data });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, error: err.raw || err.message });
  }
}

/* ---------- 3. Calculate cost ---------- */
//Working
export async function calculateCostController(req, res) {
  try {
    const params = req.query; // md,cgm,o_pin,d_pin,ss,pt
    // will include md= s/e , cgm=wt grms , o_pin , d_pin , ss->shipment status  , pt- "Pre-paid" /"cod"
    const data = await Delhivery.calculateShippingCost(
      params,
      req.query.configName || "default"
    );
    return res.json({ ok: true, data });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, error: err.raw || err.message });
  }
}

/* ---------- 4. Waybills ---------- */
//Working
export async function fetchWaybillsController(req, res) {
  try {
    const count = Number(req.query.count || req.body.count || 1);
    if (!count || count <= 0)
      return res.status(400).json({ ok: false, error: "count required" });
    const data = await Delhivery.fetchWaybillsBulk(
      count,
      req.query.configName || "default"
    );
    // TODO: persist waybills into a Waybill collection for later use
    return res.json({ ok: true, data });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, error: err.raw || err.message });
  }
}
//Working
export async function fetchWaybillSingleController(req, res) {
  try {
    const data = await Delhivery.fetchWaybillSingle(
      req.query.configName || "default"
    );
    return res.json({ ok: true, data });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, error: err.raw || err.message });
  }
}

/* ---------- 5. Create Shipment (manifest) ---------- */
/**
 * Enhanced to support multi-piece shipments
 *
 * Option 1 (Manual): body: { payload: { shipments: [...], pickup_location: {...} }, configName }
 * Option 2 (Auto from Order): body: { orderId, configName, splitOptions?: { maxItemsPerPiece, maxWeightPerPiece } }
 */
export async function createShipmentController(req, res) {
  try {
    const { orderId, clientId, payload, configName, splitOptions } = req.body;

    let finalPayload = payload;
    let order = null;
    let pieces = [];
    let totalPieces = 1;

    // If orderId provided, fetch order and auto-generate payload
    if (orderId) {
      order = await Order.findById(orderId).lean();
      if (!order) {
        return res.status(404).json({ ok: false, error: "Order not found" });
      }

      // Get default warehouse/pickup location
      const warehouse = await WarehouseLocation.findOne({ default: true });
      if (!warehouse) {
        return res
          .status(404)
          .json({ ok: false, error: "Default warehouse not found" });
      }

      const pickupLocation = {
        name: warehouse.name || "Default Warehouse",
        phone: warehouse.phone || "",
        address: [
          warehouse.line1 || "",
          warehouse.line2 || "",
          warehouse.city || "",
          warehouse.state || "",
        ]
          .filter(Boolean)
          .join(", "),
        pin: warehouse.pincode || "",
        city: warehouse.city || "",
        state: warehouse.state || "",
      };

      // Split order into pieces if needed
      pieces = splitOrderIntoPieces(order.items || [], splitOptions || {});
      totalPieces = pieces.length;

      // Build payload for all pieces (single API call for all pieces)
      if (totalPieces > 1) {
        // Multi-piece: combine all pieces into one payload
        const allShipments = [];
        pieces.forEach((pieceItems, index) => {
          const piecePayload = buildDelhiveryShipmentPayload(
            order,
            pieceItems,
            pickupLocation,
            index + 1,
            totalPieces
          );
          allShipments.push(...piecePayload.shipments);
        });
        finalPayload = {
          shipments: allShipments,
          pickup_location: pickupLocation,
        };
      } else {
        // Single piece
        finalPayload = buildDelhiveryShipmentPayload(
          order,
          pieces[0] || order.items,
          pickupLocation,
          1,
          1
        );
      }

      // Validate payload
      const v = validateCreateShipmentPayload(finalPayload);
      if (!v.ok) return res.status(400).json({ ok: false, error: v.error });
    } else if (!payload) {
      return res
        .status(400)
        .json({ ok: false, error: "payload or orderId required" });
    } else {
      // Manual payload provided
      const v = validateCreateShipmentPayload(payload);
      if (!v.ok) return res.status(400).json({ ok: false, error: v.error });
      totalPieces = payload.shipments?.length || 1;
    }

    // Create Delivery documents for each piece
    const deliveryDocs = [];
    for (let i = 0; i < totalPieces; i++) {
      const pieceItems = pieces[i] || [];
      const delivery = await Delivery.create({
        order: orderId || order?._id || null,
        client: clientId || order?.user || null,
        pieceNumber: i + 1,
        totalPieces: totalPieces,
        items: pieceItems.map((item) => ({
          product: item.product,
          variant: item.variant,
          quantity: item.quantity,
          itemIndex: item.itemIndex !== undefined ? item.itemIndex : i,
        })),
        status: "created",
        pickup_location: finalPayload.pickup_location?.name || "unknown",
        payment_mode:
          finalPayload?.shipments?.[i]?.payment_mode ||
          finalPayload?.shipments?.[0]?.payment_mode ||
          "Prepaid",
        delhiveryRaw: null,
      });
      deliveryDocs.push(delivery);
    }

    try {
      // Call Delhivery API with combined payload
      const resp = await Delhivery.createShipment(
        finalPayload,
        configName || "default"
      );

      // Extract waybills from response
      const waybills = extractWaybillsFromResponse(resp);

      // Update each delivery document with its waybill
      const updatedDeliveries = [];
      for (let i = 0; i < deliveryDocs.length; i++) {
        const delivery = deliveryDocs[i];
        const waybillData = waybills[i] || waybills[0] || null; // Fallback to first if fewer waybills

        if (waybillData?.waybill) {
          delivery.waybill = waybillData.waybill;
          delivery.status = "manifested";
        } else {
          delivery.status = "manifest_failed";
        }

        delivery.delhiveryRaw = resp;
        delivery.history.push({
          status: delivery.status,
          note:
            totalPieces > 1
              ? `Piece ${delivery.pieceNumber}/${totalPieces} manifest ${
                  delivery.status === "manifested" ? "created" : "failed"
                }`
              : "manifest created",
          raw: waybillData?.shipment || resp,
        });

        await delivery.save();
        updatedDeliveries.push(delivery);
      }

      // Update Order with delivery references
      if (orderId || order?._id) {
        try {
          const deliveryIds = updatedDeliveries.map((d) => d._id);
          await Order.updateOne(
            { _id: orderId || order._id },
            {
              $set: {
                status: "manifested",
                deliveryDetails: deliveryIds[0], // Keep first for backward compatibility
              },
              $addToSet: { deliveries: { $each: deliveryIds } }, // Add all delivery IDs
            }
          );
        } catch (e) {
          console.error("Error updating order:", e);
        }
      }

      return res.json({
        ok: true,
        data:
          totalPieces === 1
            ? updatedDeliveries[0]
            : { deliveries: updatedDeliveries, totalPieces },
        totalPieces,
        waybills: waybills.map((w) => w.waybill),
      });
    } catch (err) {
      // Mark all deliveries as failed
      for (const delivery of deliveryDocs) {
        delivery.meta = delivery.meta || {};
        delivery.meta.delhiveryError = err.raw || err.message;
        delivery.status = "manifest_failed";
        delivery.history.push({
          status: "manifest_failed",
          note: "manifest failed",
          raw: err.raw || err.message,
        });
        await delivery.save();
      }

      return res.status(500).json({
        ok: false,
        error: err.raw || err.message,
        deliveryIds: deliveryDocs.map((d) => d._id),
        totalPieces,
      });
    }
  } catch (err) {
    console.error("createShipmentController error:", err);
    return res.status(500).json({ ok: false, error: err.message });
  }
}

/* ---------- 6. Generate / Download label ---------- */
export async function generateLabelController(req, res) {
  try {
    const { deliveryId, waybill, pdf_size } = req.query;
    if (!deliveryId && !waybill)
      return res
        .status(400)
        .json({ ok: false, error: "deliveryId or waybill required" });
    const cfg = req.query.configName || "default";
    const wb = waybill || (await Delivery.findById(deliveryId)).waybill;
    if (!wb)
      return res.status(400).json({ ok: false, error: "no waybill found" });

    const labelResp = await Delhivery.generateLabel(
      { waybill: wb, pdf: true, pdf_size: pdf_size || "A4" },
      cfg
    );
    if (deliveryId) {
      await Delivery.updateOne(
        { _id: deliveryId },
        {
          $set: { "meta.labelResp": labelResp },
          $push: {
            history: {
              status: "label_generated",
              note: "label generated",
              raw: labelResp,
            },
          },
        }
      );
    }
    return res.json({ ok: true, data: labelResp });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, error: err.raw || err.message });
  }
}

/* ---------- 7. Create Pickup ---------- */
export async function createPickupController(req, res) {
  try {
    const {
      deliveryId,
      pickup_time,
      pickup_date,
      pickup_location,
      expected_package_count,
      configName,
    } = req.body;
    if (!pickup_location && !deliveryId)
      return res
        .status(400)
        .json({ ok: false, error: "pickup_location or deliveryId required" });

    const payload = {
      pickup_time,
      pickup_date,
      pickup_location,
      expected_package_count,
    };
    const resp = await Delhivery.createPickup(payload, configName || "default");

    if (deliveryId) {
      await Delivery.updateOne(
        { _id: deliveryId },
        {
          $set: { status: "picked_up" },
          $push: {
            history: { status: "picked_up", note: "pickup created", raw: resp },
          },
        }
      );
    }
    return res.json({ ok: true, data: resp });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, error: err.raw || err.message });
  }
}

/* ---------- 8. Cancel / Edit ---------- */
export async function cancelShipmentController(req, res) {
  try {
    const { deliveryId, waybill, configName } = req.body;
    if (!deliveryId && !waybill)
      return res
        .status(400)
        .json({ ok: false, error: "deliveryId or waybill required" });
    const wb = waybill || (await Delivery.findById(deliveryId)).waybill;
    if (!wb)
      return res.status(400).json({ ok: false, error: "no waybill found" });

    const resp = await Delhivery.cancelShipment(wb, configName || "default");
    if (deliveryId) {
      await Delivery.updateOne(
        { _id: deliveryId },
        {
          $set: { status: "cancelled", "meta.cancelResp": resp },
          $push: {
            history: {
              status: "cancelled",
              note: "cancel API called",
              raw: resp,
            },
          },
        }
      );
    }
    return res.json({ ok: true, data: resp });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, error: err.raw || err.message });
  }
}

export async function editShipmentController(req, res) {
  try {
    const payload = req.body; // must contain waybill & editable fields
    if (!payload || !payload.waybill)
      return res.status(400).json({ ok: false, error: "waybill required" });
    const resp = await Delhivery.editShipment(
      payload,
      req.body.configName || "default"
    );
    // find delivery by waybill and update
    await Delivery.updateOne(
      { waybill: payload.waybill },
      {
        $push: {
          history: { status: "edited", note: "shipment edited", raw: resp },
        },
      }
    );
    return res.json({ ok: true, data: resp });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, error: err.raw || err.message });
  }
}

/* ---------- 9. Track ---------- */
export async function trackController(req, res) {
  try {
    const waybill = req.query.waybill || req.query.wb;
    if (!waybill)
      return res.status(400).json({ ok: false, error: "waybill required" });
    const resp = await Delhivery.trackShipment(
      { waybill },
      req.query.configName || "default"
    );
    return res.json({ ok: true, data: resp });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, error: err.raw || err.message });
  }
}

/* ---------- 10. Webhook receiver (direct processing) ---------- */
export async function delhiveryWebhookHandler(req, res) {
  try {
    const body = req.body;
    // minimal: find waybill in payload
    const waybill = body?.waybill || body?.awb || body?.data?.waybill;
    if (!waybill) {
      // save raw webhook to audit log if desired
      console.warn("Webhook without waybill", body);
      return res.status(200).send("OK");
    }

    // find related deliveries
    const deliveries = await Delivery.find({ waybill }).limit(5);
    if (!deliveries || deliveries.length === 0) {
      console.warn("No delivery for webhook waybill", waybill);
      return res.status(200).send("OK");
    }

    for (const d of deliveries) {
      // map external status to internal status
      const newStatus = mapDelhiveryStatusToInternal(
        body?.status || body?.event,
        body?.status_type
      );
      d.history.push({ status: newStatus, note: "webhook update", raw: body });
      d.status = newStatus;
      d.delhiveryRaw = d.delhiveryRaw || {};
      d.delhiveryRaw.latestWebhook = body;

      // OTP handling example: if webhook indicates OTP verify
      if (body?.otp_verified === true || /OTP/i.test(body?.event || "")) {
        d.otpVerified = true;
        d.meta = d.meta || {};
        d.meta.otpVerifiedAt = new Date();
      }

      // Document handling (POD / images / qc)
      const docs = body?.documents || body?.docs || body?.images;
      if (docs) {
        d.meta = d.meta || {};
        d.meta.documents = (d.meta.documents || []).concat(docs);
      }

      if (/deliv/i.test(newStatus) || newStatus === "delivered") {
        d.deliveredAt = new Date();
      }

      await d.save();

      // optional: update Order status
      try {
        if (d.order)
          await Order.updateOne(
            { _id: d.order },
            { $set: { status: newStatus } }
          );
      } catch (e) {
        /* ignore update errors */
      }
    }

    // Acknowledge quickly
    return res.status(200).send("OK");
  } catch (err) {
    console.error("webhook processing error", err);
    return res.status(500).send("ERR");
  }
}

/* ---------- 11. Return creation ---------- */
export async function createReturnController(req, res) {
  try {
    const { payload, configName } = req.body;
    if (!payload)
      return res.status(400).json({ ok: false, error: "payload required" });
    // payload must include qc_type: "param" and custom_qc if using QC
    const delivery = await Delivery.create({
      order: payload.order || null,
      client: req.user?._id || null,
      status: "created",
      payment_mode: "Pickup",
      pickup_location: payload.pickup_location?.name || "unknown",
      delhiveryRaw: null,
    });

    try {
      const resp = await Delhivery.createShipment(
        payload,
        configName || "default"
      );
      delivery.delhiveryRaw = resp;
      delivery.status = "manifested";
      delivery.history.push({
        status: "manifested",
        note: "return manifest created",
        raw: resp,
      });
      await delivery.save();
      return res.json({ ok: true, data: delivery });
    } catch (err) {
      delivery.meta = delivery.meta || {};
      delivery.meta.delhiveryError = err.raw || err.message;
      delivery.status = "manifest_failed";
      delivery.history.push({
        status: "manifest_failed",
        note: "return manifest failed",
        raw: err.raw || err.message,
      });
      await delivery.save();
      return res.status(500).json({
        ok: false,
        error: err.raw || err.message,
        deliveryId: delivery._id,
      });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, error: err.message });
  }
}

/* ---------- 12. Download document ---------- */
export async function downloadDocumentController(req, res) {
  try {
    const { doc_type, waybill, configName } = req.query;
    if (!doc_type || !waybill)
      return res
        .status(400)
        .json({ ok: false, error: "doc_type and waybill required" });
    const resp = await Delhivery.downloadDocument(
      { doc_type, waybill },
      configName || "default"
    );
    return res.json({ ok: true, data: resp });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, error: err.raw || err.message });
  }
}

/* ---------- 13. NDR actions ---------- */
export async function ndrActionController(req, res) {
  try {
    const { items, configName } = req.body; // items: [{ waybill, act }]
    if (!items || !Array.isArray(items))
      return res.status(400).json({ ok: false, error: "items array required" });
    const resp = await Delhivery.ndrAction(items, configName || "default");
    return res.json({ ok: true, data: resp });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, error: err.raw || err.message });
  }
}

export async function getNdrStatusController(req, res) {
  try {
    const { uplId, configName } = req.query;
    if (!uplId)
      return res.status(400).json({ ok: false, error: "uplId required" });
    const resp = await Delhivery.getNdrStatus(uplId, configName || "default");
    return res.json({ ok: true, data: resp });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, error: err.raw || err.message });
  }
}

/* ---------- helper mapping ---------- */
function mapDelhiveryStatusToInternal(status, statusType) {
  const s = (status || "").toString().toLowerCase();
  if (s.includes("manifest")) return "manifested";
  if (s.includes("not picked") || s.includes("not_picked")) return "not_picked";
  if (s.includes("picked")) return "picked_up";
  if (s.includes("in transit") || s.includes("in_transit")) return "in_transit";
  if (s.includes("dispatched") || s.includes("out for delivery"))
    return "out-for-delivery";
  if (s.includes("delivered") || s === "dl") return "delivered";
  if (s.includes("rto") || s.includes("returned")) return "rto";
  if (s.includes("cancel") || s.includes("cn")) return "cancelled";
  if (/otp/i.test(s) || (statusType && /otp/i.test(statusType)))
    return "otp_verified";
  return s || statusType || "pending";
}
