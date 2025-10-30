// Controllers/delivery.controller.js
import Delivery from "../Models/Delivery.js";
import Order from "../Models/Order.js"; // optional: update order status as needed
import * as Delhivery from "../Services/delivery.service.js";
import { validateCreateShipmentPayload } from "../utils/validators.js";

/* ---------- 1. PINCODE ---------- */
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
export async function expectedTatController(req, res) {
  try {
    const { origin_pin, destination_pin, mot, pdt, expected_pickup_date } =
      req.query;
    if (!origin_pin || !destination_pin || !mot)
      return res
        .status(400)
        .json({ ok: false, error: "origin_pin,destination_pin,mot required" });
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
export async function calculateCostController(req, res) {
  try {
    const params = req.query; // md,cgm,o_pin,d_pin,ss,pt
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
 * body: { orderId, clientId, payload: { shipments: [...], pickup_location: {...} }, configName }
 */
export async function createShipmentController(req, res) {
  try {
    const { orderId, clientId, payload, configName } = req.body;
    if (!payload)
      return res.status(400).json({ ok: false, error: "payload required" });
    const v = validateCreateShipmentPayload(payload);
    if (!v.ok) return res.status(400).json({ ok: false, error: v.error });

    // create Delivery doc
    const delivery = await Delivery.create({
      order: orderId || null,
      client: clientId || null,
      status: "created",
      pickup_location: payload.pickup_location?.name || "unknown",
      payment_mode: payload?.shipments?.[0]?.payment_mode || "Prepaid",
      delhiveryRaw: null,
    });

    try {
      const resp = await Delhivery.createShipment(
        payload,
        configName || "default"
      );
      // Map response to waybill(s). Response shape may vary — adapt to actual API response.
      // Many Delhivery responses return "packages" or "shipments" arrays or a direct object.
      const waybill =
        resp?.shipments?.[0]?.waybill ||
        resp?.packages?.[0]?.waybill ||
        resp?.data?.waybill ||
        (Array.isArray(resp) && resp[0]) ||
        null;

      delivery.waybill = waybill || delivery.waybill;
      delivery.delhiveryRaw = resp;
      delivery.status = waybill ? "manifested" : "manifest_failed";
      delivery.history.push({
        status: delivery.status,
        note: "manifest created",
        raw: resp,
      });
      await delivery.save();

      // optional: update Order status
      if (orderId) {
        try {
          await Order.updateOne(
            { _id: orderId },
            { $set: { status: "manifested" } }
          );
        } catch (e) {
          /* ignore */
        }
      }

      return res.json({ ok: true, data: delivery });
    } catch (err) {
      delivery.meta = delivery.meta || {};
      delivery.meta.delhiveryError = err.raw || err.message;
      delivery.status = "manifest_failed";
      delivery.history.push({
        status: "manifest_failed",
        note: "manifest failed",
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
