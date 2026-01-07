// frontend/src/app/checkout/page.tsx
"use client";

import { useState, useEffect, use } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { cartAPI, orderAPI, deliveryAPI, paymentAPI } from "@/services/api";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useOrderStore } from "../store/useOrderStore";
import { toast } from "react-toastify";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function CheckoutPage() {
  const router = useRouter();
  const { coupon, address } = useOrderStore();
  const userId = typeof window !== "undefined" ? localStorage.getItem("userId") : null;
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "razorpay" | "wallet" | "stripe" | "payu">("stripe");
  const [useWallet, setUseWallet] = useState(false);

  // Fetch cart
  const { data: cart } = useQuery({
    queryKey: ["cart", userId],
    queryFn: async () => {
      if (!userId) return null;
      const res = await cartAPI.get(userId);
      return res.data;
    },
    enabled: !!userId,
  });


  // Create order mutation
  const createOrderMutation = useMutation({
    mutationFn: async () => {
      const items = cart.items.map((item: any) => ({
        variantId: item.variant,
        quantity: item.quantity,
        color: item.color,
        size: item.size,
      }));

      const res = await orderAPI.create({
        items,
        useCart: true,
        shippingAddress: address,
        couponCode: coupon,
      });
      return res.data;
    },
    onSuccess: (order) => {
      // Create payment session
      createPaymentSessionMutation.mutate(order._id);
    },
  });

  // Create payment session mutation
  const createPaymentSessionMutation = useMutation({
    mutationFn: async (orderId: string) => {
      const res = await orderAPI.createPaymentSession(orderId, {
        useWallet,
        paymentMethod,
      });
      return res.data;
    },
    onSuccess: (data) => {
      if (paymentMethod === "cod") {
        router.push(`/orders/${data.orderId}`);
      } else if (paymentMethod === "razorpay") {
        initiateRazorpayPayment(data);
      } else if (paymentMethod === "stripe") {
        // Stripe returns a URL to redirect to
        if (data.gateway && data.gateway.url) {
          window.location.href = data.gateway.url;
        } else {
          toast.error("Failed to initiate Stripe payment");
        }
      } else if (paymentMethod === "wallet") {
        router.push(`/orders/${data.orderId}`);
      }
    },
  });

  // Initiate Razorpay payment
  const initiateRazorpayPayment = (paymentData: any) => {
    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: paymentData.gatewayAmount * 100,
      currency: "INR",
      name: "Your Store",
      description: "Order Payment",
      order_id: paymentData.gateway.id,
      handler: async (response: any) => {
        try {
          // Verify payment
          const res = await paymentAPI.verifyPayment({
            sessionId: paymentData.sessionId,
            gatewayPaymentId: response.razorpay_payment_id,
            gatewayOrderId: response.razorpay_order_id,
            gatewaySignature: response.razorpay_signature,
          });

          if (res.data.success) {
            router.push(`/orders/${res.data.orderId}`);
          }
        } catch (error) {
          toast.success("Payment verification failed");
        }
      },
      prefill: {
        name: address.name,
        contact: address.phone,
      },
      theme: {
        color: "#3B82F6",
      },
    };

    const razorpay = new window.Razorpay(options);
    razorpay.open();
  };

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);


  const handlePlaceOrder = () => {
    if (!address) {
      toast.error("Please select an address first.");
      return;
    }
    createOrderMutation.mutate();
  };

  if (!userId || !cart || cart.items.length === 0) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto p-4">
          <div className="alert alert-warning">
            <span>Your cart is empty. Please add items before checkout.</span>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const subtotal = cart.items.reduce(
    (sum: number, item: any) => sum + item.price * item.quantity,
    0
  );

  return (
    <>
      <Navbar />
      <div className="container mx-auto p-4">
        <h1 className="text-[12px] font-bold mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="card bg-base-200 sticky top-20">
              <div className="card-body">
                <h2 className="card-title mb-4">Order Summary</h2>

                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {cart.items.map((item: any) => (
                    <div key={item.variant} className="flex gap-2">
                      <img
                        src={item.product?.coverImage || "/placeholder.png"}
                        alt={item.title}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div className="flex-1">
                        <p className="text-[10px] font-semibold">{item.title}</p>
                        <p className="text-xs text-gray-600">
                          {item.size} × {item.quantity}
                        </p>
                        <p className="text-[10px] font-bold">₹{item.price * item.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="divider"></div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span className="text-success">FREE</span>
                  </div>
                  <div className="divider"></div>
                  <div className="flex justify-between text-[12px] font-bold">
                    <span>Total</span>
                    <span>₹{subtotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="card bg-base-100 shadow">
              <div className="card-body">
                <h2 className="card-title mb-4">Payment Method</h2>

                <div className="space-y-4">
                  <div className="form-control">
                    <label className="label cursor-pointer justify-start gap-4">
                      <input
                        type="radio"
                        name="payment"
                        className="radio"
                        checked={paymentMethod === "stripe"}
                        onChange={() => setPaymentMethod("stripe")}
                      />
                      <span className="label-text">Credit/Debit Card (Stripe) <span className="badge badge-sm badge-success ml-2">Recommended</span></span>
                    </label>
                  </div>

                  <div className="form-control opacity-50">
                    <label className="label cursor-pointer justify-start gap-4">
                      <input
                        type="radio"
                        name="payment"
                        className="radio"
                        checked={paymentMethod === "razorpay"}
                        onChange={() => setPaymentMethod("razorpay")}
                        disabled
                      />
                      <span className="label-text">Razorpay (Inactive)</span>
                    </label>
                  </div>

                  <div className="form-control opacity-50">
                    <label className="label cursor-pointer justify-start gap-4">
                      <input
                        type="radio"
                        name="payment"
                        className="radio"
                        checked={paymentMethod === "payu"} // Assuming 'payu' existed in logic but not state type, state type needs update
                        onChange={() => setPaymentMethod("payu")}
                        disabled
                      />
                      <span className="label-text">PayU (Inactive)</span>
                    </label>
                  </div>

                  <div className="form-control">
                    <label className="label cursor-pointer justify-start gap-4">
                      <input
                        type="radio"
                        name="payment"
                        className="radio"
                        checked={paymentMethod === "cod"}
                        onChange={() => setPaymentMethod("cod")}
                      />
                      <span className="label-text">Cash on Delivery</span>
                    </label>
                  </div>

                  <div className="divider"></div>

                  <div className="form-control">
                    <label className="label cursor-pointer justify-start gap-4">
                      <input
                        type="checkbox"
                        className="checkbox"
                        checked={useWallet}
                        onChange={(e) => setUseWallet(e.target.checked)}
                      />
                      <span className="label-text">Use wallet balance (if available)</span>
                    </label>
                  </div>
                </div>

                <div className="flex lg:hidden md:hidden gap-4 mt-6">
                  <button
                    onClick={handlePlaceOrder}
                    disabled={createOrderMutation.isPending}
                    className="btn btn-primary flex-1"
                  >
                    {createOrderMutation.isPending ? (
                      <span className="loading loading-spinner"></span>
                    ) : (
                      "Place Order"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}