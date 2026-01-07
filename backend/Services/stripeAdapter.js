import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default function createStripeAdapter() {
    return {
        /**
         * Create a Stripe Checkout Session
         * @param {Object} orderData
         */
        async createOrder(orderData) {
            try {
                const { amount, currency, receipt, notes } = orderData;

                // Stripe expects amount in smallest currency unit (e.g., paise for INR)
                // Ensure amount is integer
                const amountInSmallestUnit = Math.round(amount * 100);

                const session = await stripe.checkout.sessions.create({
                    payment_method_types: ["card"],
                    line_items: [
                        {
                            price_data: {
                                currency: currency || "inr",
                                product_data: {
                                    name: "Order Payment", // Generic name as we pass total
                                    description: `Order #${notes.orderId}`,
                                },
                                unit_amount: amountInSmallestUnit,
                            },
                            quantity: 1,
                        },
                    ],
                    mode: "payment",
                    success_url: `${process.env.CLIENT_URL}/orders/${notes.orderId}?status=success&session_id={CHECKOUT_SESSION_ID}`,
                    cancel_url: `${process.env.CLIENT_URL}/checkout?status=cancelled`,
                    client_reference_id: notes.orderId,
                    metadata: {
                        ...notes,
                        receipt,
                    },
                });

                // Return unified format expected by controller
                // For Stripe, we return the URL for redirection
                return {
                    id: session.id,
                    currency: session.currency,
                    amount: session.amount_total,
                    url: session.url, // Critical: Frontend will redirect here
                    status: "created",
                };
            } catch (error) {
                console.error("Stripe Create Order Error:", error);
                throw new Error("Stripe payment initialization failed: " + error.message);
            }
        },

        /**
         * Verify Stripe Payment
         * @param {Object} paymentData
         */
        async verifyPayment(paymentData) {
            try {
                const { gatewayOrderId } = paymentData; // This should be the session ID

                if (!gatewayOrderId) {
                    throw new Error("No session ID provided for verification");
                }

                const session = await stripe.checkout.sessions.retrieve(gatewayOrderId);

                if (session.payment_status === "paid") {
                    return {
                        valid: true,
                        amount: session.amount_total / 100, // Convert back to main unit
                        currency: session.currency,
                        referenceId: session.payment_intent,
                        status: "success",
                    };
                } else {
                    return {
                        valid: false,
                        status: session.payment_status,
                    };
                }
            } catch (error) {
                console.error("Stripe Verify Payment Error:", error);
                throw new Error("Stripe payment verification failed");
            }
        },
    };
}
