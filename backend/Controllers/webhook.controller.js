
import Stripe from "stripe";
import Order from "../Models/Order.js";
import PaymentSession from "../Models/PaymentSession.js";
import mongoose from "mongoose";
import createStripeAdapter from "../Services/stripeAdapter.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const stripeWebhook = async (req, res) => {
    const sig = req.headers["stripe-signature"];
    let event;

    try {
        // Note: req.rawBody is assumed to be available. 
        // Ensure bodyParser.raw({ type: 'application/json' }) is used for this route.
        event = stripe.webhooks.constructEvent(
            req.rawBody,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err) {
        console.error(`Webhook signature verification failed: ${err.message}`);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    try {
        switch (event.type) {
            case "checkout.session.completed":
                await handleCheckoutSessionCompleted(event.data.object);
                break;
            // Add other event types if needed
            default:
                console.log(`Unhandled event type ${event.type}`);
        }

        res.json({ received: true });
    } catch (error) {
        console.error("Webhook processing error:", error);
        res.status(500).json({ error: "Processing failed" });
    }
};

async function handleCheckoutSessionCompleted(sessionObject) {
    const gatewayOrderId = sessionObject.id;

    // Start a session for atomicity if possible, or just standard update
    // Finding the internal session is key.
    // We can assume the metadata contains orderId
    const orderId = sessionObject.metadata?.orderId;

    // We can reuse the stripeAdapter's verify logic OR manually update DB.
    // Reusing the adapter logic via a mocked call or direct invocation is cleanest, 
    // BUT adapter.verifyPayment expects the session to exist in our DB.

    console.log(`Processing successful payment for Stripe Session ${gatewayOrderId}`);

    const session = await mongoose.startSession();
    try {
        await session.withTransaction(async () => {
            // 1. Find existing payment session
            const paymentSession = await PaymentSession.findOne({
                $or: [{ gatewayOrderId: gatewayOrderId }, { 'metadata.orderId': orderId }]
            }).session(session);

            if (!paymentSession) {
                console.warn(`Payment Session not found for stripe ID ${gatewayOrderId}`);
                return;
            }

            if (paymentSession.status === 'completed') {
                console.log("Payment already completed.");
                return;
            }

            // 2. Update Payment Session
            paymentSession.status = "completed";
            paymentSession.gatewayPaymentId = sessionObject.payment_intent;
            paymentSession.gatewayOrderId = gatewayOrderId;
            await paymentSession.save({ session });

            // 3. Update Order
            const order = await Order.findById(paymentSession.order).session(session);
            if (order) {
                order.status = "confirmed"; // Or paid, depending on logic
                // Update payment details in order array
                const paymentEntry = order.payments.find(p => p.method === paymentSession.paymentMethod);
                if (paymentEntry) {
                    paymentEntry.status = "success";
                    paymentEntry.transactionId = sessionObject.payment_intent;
                } else {
                    order.payments.push({
                        method: "stripe",
                        amount: sessionObject.amount_total / 100,
                        status: "success",
                        transactionId: sessionObject.payment_intent
                    });
                }
                await order.save({ session });
                console.log(`Order ${order._id} confirmed via Webhook.`);
            }
        });
    } catch (err) {
        console.error("Transaction error in webhook:", err);
        throw err;
    } finally {
        session.endSession();
    }
}
