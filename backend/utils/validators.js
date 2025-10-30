// Utils/validators.js
export function validateCreateShipmentPayload(payload) {
  if (!payload) return { ok: false, error: "payload required" };
  if (!Array.isArray(payload.shipments) || payload.shipments.length === 0)
    return { ok: false, error: "payload.shipments required" };
  const sh = payload.shipments[0];
  if (!sh.order) return { ok: false, error: "shipment.order required" };
  if (!sh.pin) return { ok: false, error: "shipment.pin required" };
  if (!payload.pickup_location || !payload.pickup_location.name)
    return { ok: false, error: "pickup_location.name required" };
  return { ok: true };
}
