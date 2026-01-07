import PaymentGatewayConfig from "../Models/PaymentGatewayConfig.js";
import createRazorpayAdapter from "./razorpayAdapter.js";
import createPayuAdapter from "./payuAdapter.js";
import createStripeAdapter from "./stripeAdapter.js";

export async function getActiveGatewayAdapter(paymentMethod = "none") {
  console.log("getActiveGatewayAdapter called with:", paymentMethod);
  // If specific method requested (e.g. Stripe/Razorpay selected in frontend), use that.
  if (paymentMethod === "stripe") {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error("Stripe keys not configured");
    return createStripeAdapter();
  }

  // Fallback to active config from DB or Env if no specific method passed (or valid method ignored)
  const cfg = await PaymentGatewayConfig.findOne({});
  const active = paymentMethod !== "none" ? paymentMethod : (cfg?.activeGateway || process.env.ACTIVE_GATEWAY || "none");

  if (active === "none")
    throw new Error("No active payment gateway configured");

  if (active === "razorpay") {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || !keySecret)
      throw new Error("Razorpay keys not configured on this host");
    return createRazorpayAdapter({ key_id: keyId, key_secret: keySecret });
  }

  if (active === "payu") {
    const key = process.env.PAYU_KEY;
    const salt = process.env.PAYU_SALT;
    if (!key || !salt) throw new Error("PayU keys not configured on this host");
    return createPayuAdapter({ key, salt });
  }

  if (active === "stripe") {
    return createStripeAdapter();
  }

  throw new Error("Unsupported gateway: " + active);
}
