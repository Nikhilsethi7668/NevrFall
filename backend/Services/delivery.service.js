// Services/delhivery.service.js
import getDelhiveryClient from "../utils/getDelhiveryClient.js";

function wrapError(e) {
  const err = new Error(e?.message || "Delhivery API error");
  err.raw = e?.response?.data || e;
  err.status = e?.response?.status || 500;
  throw err;
}

/* -------------------- Pincode / Serviceability -------------------- */
export async function checkPincode(filter_code, configName = "default") {
  try {
    const { client } = await getDelhiveryClient(configName);
    const r = await client.get(
      `/c/api/pin-codes/json/?filter_codes=${encodeURIComponent(filter_code)}`
    );
    console.log(r);
    return r.data;
  } catch (e) {
    wrapError(e);
  }
}

export async function checkHeavyPincode(
  { pincode, product_type = "Heavy" },
  configName = "default"
) {
  try {
    const { client } = await getDelhiveryClient(configName);
    const url = `/api/dc/fetch/serviceability/pincode?product_type=${encodeURIComponent(
      product_type
    )}&pincode=${encodeURIComponent(pincode)}`;
    const r = await client.get(url);
    return r.data;
  } catch (e) {
    wrapError(e);
  }
}

/* -------------------- TAT / Cost -------------------- */
export async function expectedTAT(
  { origin_pin, destination_pin, mot, pdt, expected_pickup_date },
  configName = "default"
) {
  try {
    const { client } = await getDelhiveryClient(configName);
    const qs = new URLSearchParams({ origin_pin, destination_pin, mot });
    if (pdt) qs.set("pdt", pdt);
    if (expected_pickup_date)
      qs.set("expected_pickup_date", expected_pickup_date);
    const r = await client.get(`/api/dc/expected_tat?${qs.toString()}`);
    return r.data;
  } catch (e) {
    wrapError(e);
  }
}

export async function calculateShippingCost(
  { md, cgm, o_pin, d_pin, ss, pt },
  configName = "default"
) {
  try {
    const { client } = await getDelhiveryClient(configName);
    const qs = new URLSearchParams({
      md,
      cgm,
      o_pin,
      d_pin,
      ss,
      pt,
    }).toString();
    const r = await client.get(`/api/kinko/v1/invoice/charges/.json?${qs}`);
    return r.data;
  } catch (e) {
    wrapError(e);
  }
}

/* -------------------- Waybills -------------------- */
export async function fetchWaybillsBulk(count = 1, configName = "default") {
  try {
    const { client } = await getDelhiveryClient(configName);
    const r = await client.get(
      `/waybill/api/bulk/json/?count=${encodeURIComponent(count)}`
    );
    return r.data;
  } catch (e) {
    wrapError(e);
  }
}

export async function fetchWaybillSingle(configName = "default") {
  try {
    const { client } = await getDelhiveryClient(configName);
    const r = await client.get(`/waybill/api/fetch/json/`);
    return r.data;
  } catch (e) {
    wrapError(e);
  }
}

/* -------------------- Shipment creation / edit / cancel -------------------- */
export async function createShipment(payload, configName = "default") {
  try {
    const { client } = await getDelhiveryClient(configName);
    const form = `format=json&data=${JSON.stringify(payload)}`;
    const r = await client.post(`/api/cmu/create.json`, form, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
    console.log(r);
    return r.data;
  } catch (e) {
    wrapError(e);
  }
}

export async function editShipment(payload, configName = "default") {
  try {
    const { client } = await getDelhiveryClient(configName);
    const r = await client.post(`/api/p/edit`, payload);
    return r.data;
  } catch (e) {
    wrapError(e);
  }
}

export async function cancelShipment(waybill, configName = "default") {
  try {
    const { client } = await getDelhiveryClient(configName);
    const r = await client.post(`/api/p/edit`, {
      waybill,
      cancellation: "true",
    });
    return r.data;
  } catch (e) {
    wrapError(e);
  }
}

export async function updateEwaybill({ dcn, ewbn }, configName = "default") {
  try {
    const { client } = await getDelhiveryClient(configName);
    const r = await client.put(
      `/api/rest/ewaybill/${encodeURIComponent(dcn)}/`,
      { data: [{ dcn, ewbn }] }
    );
    return r.data;
  } catch (e) {
    wrapError(e);
  }
}

/* -------------------- Tracking / Label / Pickup / Docs / NDR -------------------- */
export async function trackShipment(
  { waybill, ref_ids = "" },
  configName = "default"
) {
  try {
    const { client } = await getDelhiveryClient(configName);
    const qs = `?waybill=${encodeURIComponent(
      waybill
    )}&ref_ids=${encodeURIComponent(ref_ids)}`;
    const r = await client.get(`/api/v1/packages/json/${qs}`);
    return r.data;
  } catch (e) {
    wrapError(e);
  }
}

export async function generateLabel(
  { waybill, pdf = true, pdf_size = "A4" },
  configName = "default"
) {
  try {
    const { client } = await getDelhiveryClient(configName);
    const qs = `?wbns=${encodeURIComponent(
      waybill
    )}&pdf=${pdf}&pdf_size=${encodeURIComponent(pdf_size)}`;
    const r = await client.get(`/api/p/packing_slip${qs}`);
    return r.data;
  } catch (e) {
    wrapError(e);
  }
}

export async function createPickup(
  { pickup_time, pickup_date, pickup_location, expected_package_count },
  configName = "default"
) {
  try {
    const { client } = await getDelhiveryClient(configName);
    const body = {
      pickup_time,
      pickup_date,
      pickup_location,
      expected_package_count,
    };
    const r = await client.post(`/fm/request/new/`, body);
    return r.data;
  } catch (e) {
    wrapError(e);
  }
}

export async function downloadDocument(
  { doc_type, waybill },
  configName = "default"
) {
  try {
    const { client } = await getDelhiveryClient(configName);
    const qs = `?doc_type=${encodeURIComponent(
      doc_type
    )}&waybill=${encodeURIComponent(waybill)}`;
    const r = await client.get(`/api/rest/fetch/pkg/document/${qs}`);
    return r.data;
  } catch (e) {
    wrapError(e);
  }
}

export async function ndrAction(items, configName = "default") {
  try {
    const { client } = await getDelhiveryClient(configName);
    const r = await client.post(`/api/p/update`, { data: items });
    return r.data;
  } catch (e) {
    wrapError(e);
  }
}

export async function getNdrStatus(uplId, configName = "default") {
  try {
    const { client } = await getDelhiveryClient(configName);
    const r = await client.get(
      `/api/cmu/get_bulk_upl/${encodeURIComponent(uplId)}?verbose=true`
    );
    return r.data;
  } catch (e) {
    wrapError(e);
  }
}

export default {
  checkPincode,
  checkHeavyPincode,
  expectedTAT,
  calculateShippingCost,
  fetchWaybillsBulk,
  fetchWaybillSingle,
  createShipment,
  editShipment,
  cancelShipment,
  updateEwaybill,
  trackShipment,
  generateLabel,
  createPickup,
  downloadDocument,
  ndrAction,
  getNdrStatus,
};
