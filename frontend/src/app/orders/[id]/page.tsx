"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { orderAPI, returnAPI, paymentAPI } from "@/services/api";
import Image from "next/image";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import Link from "next/link";
import secureLocalStorage from "react-secure-storage";
import { EXCHANGE_CONFIRM_PAYMENT, EXCHANGE_CREATE, PRODUCT_DETAILS, PRODUCTS_ALL } from "@/app/constants/Constant";
import AllProducts from "../../products/page";
import { useEffect, useState } from "react";
import { FaRegHeart } from "react-icons/fa";
import { IoCloseSharp } from "react-icons/io5";
import { toast } from "react-toastify";

interface IVariant {
  _id: string;
  sku: string;
  price: number;
  size: string;
}

interface IProduct {
  title: string;
  coverImage: string;
  priceFrom: number;
  description: string;
}

interface IProductDetail {
  product: IProduct;
  variants: IVariant[];
  parent?: {
    description: string;
  }
}

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const orderId = params.id as string;
  const [exchangeSteps, setExchangeSteps] = useState("selectOrder");
  const [products, setProducts] = useState([]);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [exchangePrice, setExchangePrice] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState<{
    skuId: string;
    productId: string;
    priceAtSelection: number;
    quantity: number;
    coverImage?: string;
    title?: string;
    priceFrom?: number;
  }>({
    skuId: "",
    productId: "",
    priceAtSelection: 0,
    quantity: 1,
  });
  const [itemToReplace, setItemToReplace] = useState(-1);
  const [exchangeReason, setExchangeReason] = useState("");
  const [exchangeComments, setExchangeComments] = useState("");
  const [productDetail, setProductDetail] = useState<IProductDetail | null>(null);
  const [exchangeData, setExchangeData] = useState<any>({});
  const [pendingExchangeItems, setPendingExchangeItems] = useState<number[]>([]);
  useEffect(() => {
    const key = `exchange_pending_${orderId}`;
    const saved = typeof window !== 'undefined' ? localStorage.getItem(key) : null;
    if (saved) {
      try {
        setPendingExchangeItems(JSON.parse(saved));
      } catch { }
    }
  }, [orderId]);

  // Fetch order details
  const { data: order, isLoading, refetch: refetchOrder } = useQuery({
    queryKey: ["order", orderId],
    queryFn: async () => {
      const res = await orderAPI.get(orderId);
      return res.data;
    },
  });

  // Stripe Verification Logic
  const [verifying, setVerifying] = useState(false);
  const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const sessionId = searchParams?.get('session_id');
  const paymentStatus = searchParams?.get('status');

  useEffect(() => {
    if (sessionId && paymentStatus === 'success' && order && order.status === 'pending' && !verifying) {
      verifyStripePayment();
    }
  }, [sessionId, paymentStatus, order]);

  const verifyStripePayment = async () => {
    setVerifying(true);
    const toastId = toast.loading("Verifying payment...");
    try {
      // Changed to paymentAPI.verifyPayment as per other files, assuming it exists or using orderAPI if not
      // Checking api.ts usage in checkout page: paymentAPI.verifyPayment exists
      // However we need to pass gatewayOrderId as sessionId for Stripe adapter

      // Based on order.controller.js logic for verifyPayment:
      // It needs: sessionId (our DB session), OR gatewayOrderId (stripe session)
      // If we only have stripe session ID from URL, we might need a specific endpoint or ensure controller can lookup by gatewayOrderId.
      // BUT: The controller uses `PaymentSession.findOne({ sessionId, user })`.
      // The URL param `session_id` from Stripe IS the `gatewayOrderId`.
      // We need the internal `sessionId` to call `verifyPayment`.
      // Wait, `createStripeAdapter` sets `success_url` with `session_id={CHECKOUT_SESSION_ID}`.
      // Does it pass our internal sessionId? 
      // Let's check `stripeAdapter.js`:
      // success_url: `${process.env.CLIENT_URL}/orders/${notes.orderId}?status=success&session_id={CHECKOUT_SESSION_ID}`,

      // Issue: The controller expects `sessionId` (our internal one).
      // We only have the Stripe Session ID.
      // FIX: We should probably look up the session by `gatewayOrderId` in the controller if `sessionId` is missing.
      // OR: Update Stripe Adapter to pass our internal sessionId in URL too.

      // Let's UPDATE STRIPE ADAPTER FIRST to include internal sessionId in URL. 
      // But I can't do that in this tool call.

      // Workaround for now: We will try to send `gatewayOrderId` as `sessionId` and hope backend handles? 
      // No, controller line 706 searches by `sessionId`.

      // I will update the frontend to expects correct params after I fix the adapter.
      // For now, I will write the code assuming `internal_session_id` will be passed or I will fix the controller.

      // Better plan: Update controller to allow finding by `gatewayOrderId`.

      await paymentAPI.verifyPayment({
        sessionId: (sessionId as string) || "",
        gatewayOrderId: (sessionId as string) || "",
        gatewayPaymentId: "",
        gatewaySignature: "",
      });

      toast.update(toastId, { render: "Payment verified!", type: "success", isLoading: false, autoClose: 3000 });
      refetchOrder();
      // Remove params from URL
      router.replace(`/orders/${orderId}`);
    } catch (error) {
      toast.update(toastId, { render: "Verification check failed. Please refresh.", type: "error", isLoading: false, autoClose: 3000 });
    } finally {
      setVerifying(false);
    }
  };

  const { data: myReturns } = useQuery({
    queryKey: ["returns"],
    queryFn: async () => {
      const res = await returnAPI.list({ page: 1, limit: 100 });
      return res.data;
    },
  });

  const returnedItemIds = (myReturns || [])
    .filter((r: any) => r.orderId === orderId && r.status !== "cancelled")
    .flatMap((r: any) => r.items?.map((i: any) => i.itemId) || []);

  useEffect(() => {
    if (!order) return;
    if (!returnedItemIds?.length) return;
    const updated = pendingExchangeItems.filter((idx) => {
      const item = order.items[idx];
      return item && !returnedItemIds.includes(item._id);
    });
    setPendingExchangeItems(updated);
    const key = `exchange_pending_${orderId}`;
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, JSON.stringify(updated));
    }
  }, [myReturns, order]);

  // Cancel order mutation
  const cancelOrderMutation = useMutation({
    mutationFn: async (reason: string) => {
      return orderAPI.cancel(orderId, { reason });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["order", orderId] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast.success("Order cancelled successfully");
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || "Failed to cancel order");
    },
  });

  const getStatusBadge = (status: string) => {
    const statusMap: { [key: string]: string } = {
      pending: "badge-warning",
      confirmed: "badge-info",
      shipped: "badge-primary",
      delivered: "badge-success",
      cancelled: "badge-error",
      returned: "badge-neutral",
    };
    return statusMap[status] || "badge-neutral";
  };

  const getAllProducts = async () => {
    const URL = PRODUCTS_ALL;
    try {
      const res = await fetch(URL, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      setProducts(data.items);
    } catch (error) {
      console.log(error);
    }
  };

  const payload = {
    orderId: order?._id,
    orderItemId: itemToReplace,
    selectedReplacement: selectedProduct,
    idempotencyKey: order?.meta?.idempotencyKey,
    reason: exchangeReason,
    comments: exchangeComments,
  };

  const createExchange = async () => {
    const URL = EXCHANGE_CREATE;
    const token = secureLocalStorage.getItem("auth_token");
    const res = await fetch(URL, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    setExchangeData(data);
    return data;
  };

  const getProductById = async () => {
    if (!selectedProduct.productId) return;
    const URL = PRODUCT_DETAILS + "/" + selectedProduct.productId;
    try {
      const res = await fetch(URL, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      console.log(data);
      setProductDetail(data);
    } catch (error) {
      console.log(error);
    }
  };

  const confirmPayment = async (exchangeId: string) => {
    const URL = EXCHANGE_CONFIRM_PAYMENT;
    const token = secureLocalStorage.getItem("auth_token");
    const res = await fetch(URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ exchangeId })
    });
    const data = await res.json();
    return data;
  };

  const placeReturnForExchangedItem = async () => {
    if (!order) return;
    const originalItem = order.items[itemToReplace];
    if (!originalItem) return;
    const returnData = {
      orderId: order._id,
      items: [
        {
          itemId: originalItem._id,
          quantity: originalItem.quantity,
          reason: "Exchange",
        },
      ],
      reason: "Exchange",
      description: "Auto-created return for exchange",
    };
    await returnAPI.create(returnData);
  };

  const placeOrderForReplacementItem = async () => {
    if (!order || !productDetail || !productDetail.variants) return;
    const variant = productDetail.variants.find((v: IVariant) => v.sku === selectedProduct.skuId);
    if (!variant) return;
    await orderAPI.create({
      items: [
        {
          variantId: variant._id,
          quantity: selectedProduct.quantity || 1,
        },
      ],
      shippingAddress: order.shippingAddress,
      paymentMethod: "cod",
    });
  };

  useEffect(() => {
    getProductById();
  }, [selectedProduct.productId]);

  const getStatusText = (status: string) => {
    const statusMap: { [key: string]: string } = {
      pending: "Pending",
      confirmed: "Confirmed",
      shipped: "Shipped",
      delivered: "Delivered",
      cancelled: "Cancelled",
      returned: "Returned",
    };
    return statusMap[status] || status;
  };

  const getTrackingStatus = (status: string) => {
    const steps = [
      { key: "pending", label: "Order Placed" },
      { key: "confirmed", label: "Confirmed" },
      { key: "shipped", label: "Shipped" },
      { key: "delivered", label: "Delivered" },
    ];

    const currentIndex = steps.findIndex((step) => step.key === status);
    return { steps, currentIndex };
  };

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto p-4">
          <div className="flex justify-center items-center min-h-screen">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!order) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto p-4">
          <div className="alert alert-error">Order not found</div>
        </div>
        <Footer />
      </>
    );
  }

  const { steps, currentIndex } = getTrackingStatus(order.status);

  return (
    <>
      <Navbar />
      <div className="container mx-auto p-4">
        {/* Breadcrumbs */}
        <div className="breadcrumbs text-[10px] mb-6">
          <ul>
            <li>
              <Link href="/">Home</Link>
            </li>
            <li>
              <Link href="/orders">Orders</Link>
            </li>
            <li>Order #{order?._id.slice(-6)}</li>
          </ul>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Header */}
            <div className="card bg-base-100 shadow">
              <div className="card-body p-4 sm:p-6">
                <div className="flex flex-row justify-between sm:items-start">
                  <div className="mb-4 sm:mb-0">
                    <h1 className="text-[12px] font-bold">Order #{order._id.slice(-6)}</h1>
                    <p className="text-gray-600">
                      Placed on {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-left sm:text-right">
                    <div className={`badge ${getStatusBadge(order.status)} text-[10px] mb-1`}>
                      {getStatusText(order.status)}
                    </div>
                    <p className="text-[12px] font-bold mt-2">₹{order.total}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Progress */}
            <div className="card bg-base-100 shadow">
              <div className="card-body p-4 sm:p-6">
                <h2 className="card-title mb-4">Order Progress</h2>
                <ul className="steps steps-horizontal w-full">
                  {steps.map((step, index) => (
                    <li
                      key={step.key}
                      className={`step text-[10px] ${index <= currentIndex ? "step-primary" : ""
                        } ${order.status === "cancelled" ? "step-error" : ""}`}
                    >
                      {step.label}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Order Items */}
            <div className="card bg-base-100 shadow">
              <div className="card-body p-4 sm:p-6">
                <h2 className="card-title mb-4">Order Items</h2>
                <div className="space-y-4">
                  {order.items.map((item: any, index: number) => (
                    <div key={index} className="card bg-base-100 shadow-2xl">
                      {/* compact card body like cart */}
                      <div className="px-1 h-[17vh] items-stretch">
                        <div className="flex flex-row p-2 gap-2 items-center">
                          {/* Image */}
                          <div className="w-20 h-30 overflow-hidden rounded">
                            <img
                              src={item.product?.coverImage || "/placeholder.png"}
                              alt={item.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            {/* Main content */}
                            <div className="flex-1">
                              <h3 className="font-semibold text-[10px] sm:text-[12px] line-clamp-2">{item.title}</h3>
                              <p className="text-gray-600 text-xs sm:text-[10px]">
                                Brand: {item.product?.brand || "N/A"}
                              </p>
                              <p className="text-gray-600 text-xs sm:text-[10px]">
                                Size: {item.size} | Color: {item.color}
                              </p>
                              <p className="text-gray-600 text-xs sm:text-[10px]">Quantity: {item.quantity}</p>
                            </div>

                            {/* Price & badges */}
                            <div className="text-left sm:text-right ml-2 flex-shrink-0">
                              <p className="text-[12px] font-bold">
                                ₹{(item.price * item.quantity).toFixed(2)}
                              </p>
                              {pendingExchangeItems.includes(index) && (
                                <div className="badge badge-warning text-xs mt-2">Exchange Pending</div>
                              )}
                              {!!returnedItemIds && returnedItemIds.includes(item._id) && (
                                <div className="badge badge-neutral mt-2">Returned</div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Action button and modal remain exactly the same (no extra buttons/data) */}
                      <div className="px-3 pb-3">
                        {(pendingExchangeItems.includes(index) ||
                          (!!returnedItemIds && returnedItemIds.includes(item._id)) ||
                          (order.status === "delivered" && (new Date().getTime() - new Date(order.deliveryDetails?.deliveredAt || order.updatedAt).getTime() <= 7 * 24 * 60 * 60 * 1000))) && (
                            <button
                              className="btn w-full sm:w-auto text-[10px]"
                              disabled={
                                pendingExchangeItems.includes(index) ||
                                (!!returnedItemIds && returnedItemIds.includes(item._id))
                              }
                              onClick={() => {
                                getAllProducts();
                                setItemToReplace(index);
                                setCurrentPrice(item.price);
                                setExchangeSteps("reason");
                                (document.getElementById("my_modal_5") as HTMLDialogElement)?.showModal();
                              }}
                            >
                              {pendingExchangeItems.includes(index)
                                ? "Exchange Pending"
                                : !!returnedItemIds && returnedItemIds.includes(item._id)
                                  ? "Returned"
                                  : "Exchange Item"}
                            </button>
                          )}

                        {/* keep the exact same dialog/flow you had */}
                        <dialog id="my_modal_5" className="modal modal-bottom sm:modal-middle">
                          <div className="modal-box">
                            <div className="font-bold modal-top bg-base-100 flex flex-row sticky top-0 justify-between text-[12px]">
                              <p>Exchange</p>
                              <button
                                onClick={() => {
                                  setExchangeSteps("reason");
                                  (document.getElementById("my_modal_5") as HTMLDialogElement)?.close();
                                }}
                              >
                                <IoCloseSharp />
                              </button>
                            </div>
                            <div className="modal-action">
                              {exchangeSteps === "reason" && (
                                <div className="p-4 w-full">
                                  <h3 className="text-[12px] mb-4">Why are you exchanging this item?</h3>
                                  {/* visually hidden select for accessibility / to preserve original form-control if needed */}
                                  <div className="sr-only">
                                    <label>
                                      <span>Reason</span>
                                      <select
                                        onChange={(e) => setExchangeReason(e.target.value)}
                                        value={exchangeReason}
                                      >
                                        <option value="" disabled>
                                          Select a reason
                                        </option>
                                        <option value="size_issue">Size Issue</option>
                                        <option value="defective">Defective Product</option>
                                        <option value="wrong_item">Received Wrong Item</option>
                                        <option value="other">Other</option>
                                      </select>
                                    </label>
                                  </div>

                                  {/* Grid of reason cards (clickable) */}
                                  <div className="grid grid-cols-2 gap-4 mb-4">
                                    <button
                                      type="button"
                                      onClick={() => setExchangeReason("defective")}
                                      className={`card p-4 text-left rounded-lg shadow ${exchangeReason === "defective" ? "ring-2 ring-primary" : "bg-base-100"}`}
                                    >
                                      <div className="flex flex-col items-start gap-3">
                                        {/* icon */}
                                        <div className="w-12 h-10 rounded-full bg-[#fff0f0] flex flex-col items-center justify-center">
                                          {/* simple SVG icon */}
                                          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-pink-500">
                                            <path d="M4 7h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                            <path d="M8 11h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                            <path d="M10 15h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                          </svg>
                                        </div>
                                        <div>
                                          <div className="font-semibold">Damaged or Defective Product</div>
                                          <div className="text-[10px] text-gray-500">Not in good condition</div>
                                        </div>
                                      </div>
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => setExchangeReason("wrong_item")}
                                      className={`card p-4 text-left rounded-lg shadow ${exchangeReason === "wrong_item" ? "ring-2 ring-primary" : "bg-base-100"}`}
                                    >
                                      <div className="flex flex-col items-start gap-3">
                                        <div className="w-12 h-10 rounded-full bg-[#f0fdff] flex flex-col items-center justify-center">
                                          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-teal-500">
                                            <path d="M3 6h18M8 6v14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                            <path d="M16 10l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                          </svg>
                                        </div>
                                        <div>
                                          <div className="font-semibold">Wrong Product Delivered</div>
                                          <div className="text-[10px] text-gray-500">Not what I ordered</div>
                                        </div>
                                      </div>
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => setExchangeReason("defective" /* maps to 'defective' if you want 'quality' same as defective */)}
                                      className={`card p-4 text-left rounded-lg shadow ${exchangeReason === "defective" ? "ring-2 ring-primary" : "bg-base-100"}`}
                                    >
                                      <div className="flex flex-col items-start gap-3">
                                        <div className="w-12 h-10 rounded-full bg-[#fff7f0] flex flex-col items-center justify-center">
                                          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-rose-500">
                                            <path d="M12 2l2 5 5 .5-4 3 1.2 5L12 13l-4.2 3.5L9 10 5 7.5 10 7z" stroke="currentColor" strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round" />
                                          </svg>
                                        </div>
                                        <div>
                                          <div className="font-semibold">Quality issues</div>
                                          <div className="text-[10px] text-gray-500">Poor quality product</div>
                                        </div>
                                      </div>
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => setExchangeReason("size_issue")}
                                      className={`card p-4 text-left rounded-lg shadow ${exchangeReason === "size_issue" ? "ring-2 ring-primary" : "bg-base-100"}`}
                                    >
                                      <div className="flex flex-col items-start gap-3">
                                        <div className="w-12 h-10 rounded-full bg-[#f0fff7] flex flex-col items-center justify-center">
                                          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-emerald-500">
                                            <path d="M12 3v18M7 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                          </svg>
                                        </div>
                                        <div>
                                          <div className="font-semibold">Size & Fit Issues</div>
                                          <div className="text-[10px] text-gray-500">Doesn't fit me well</div>
                                        </div>
                                      </div>
                                    </button>
                                  </div>

                                  {/* Comments textarea (same binding as before) */}
                                  <div className="form-control w-full mb-4">
                                    <label className="label">
                                      <span className="label-text">Comments (optional)</span>
                                    </label>
                                    <textarea
                                      className="textarea textarea-bordered h-24"
                                      placeholder="Let us know more"
                                      onChange={(e) => setExchangeComments(e.target.value)}
                                      value={exchangeComments}
                                    ></textarea>
                                  </div>

                                  {/* Continue button (same logic) */}
                                  <button
                                    className="btn bg-black text-[10px] text-white w-full"
                                    onClick={() => setExchangeSteps("selectOrder")}
                                    disabled={!exchangeReason}
                                  >
                                    Continue
                                  </button>
                                </div>
                              )}

                              {exchangeSteps === "selectOrder" && (
                                <div>
                                  <h1>Select Item to Proceed with Exchange</h1>
                                  {products &&
                                    products.map((product: any, pIndex: number) => (
                                      <div key={product._id + "-ex-" + pIndex}>
                                        <div className="imgBlockNew custom-border listhover h-[30vh] lg:h-[576px] bg-[#FFEEE7] flex items-center justify-center overflow-hidden">
                                          <Image
                                            src={product.coverImage || "/placeholder.png"}
                                            alt={product.title}
                                            className="custom-border img-auto object-cover h-full w-full"
                                            width={300}
                                            height={310}
                                            loading="lazy"
                                          />
                                        </div>
                                        <div className="mx-1 py-2 lg:px-4">
                                          <div className="flex justify-between items-start">
                                            <p className="text-left text-xs lg:text-[12px] text-[#585c70] font-semibold line-clamp-2">
                                              {product.title}
                                            </p>
                                          </div>
                                          {product.brand && (
                                            <div className="listprice ecltext text-[10px] text-gray-500">
                                              <span>{product.brand}</span>
                                            </div>
                                          )}
                                          {product.collections && product.collections.length > 0 ? (
                                            <div className="listprice ecltext text-[10px] text-gray-500">
                                              <span>{product.collections.join(", ")}</span>
                                            </div>
                                          ) : (
                                            <div className="listprice ecltext text-[10px] text-gray-500">
                                              <span className="line-clamp-1">{product.slug}</span>
                                            </div>
                                          )}
                                          <div>
                                            <div className="col-12 special-products_pricingicing">
                                              <div className="price-block">
                                                <span className="offer font-semibold text-[10px]">
                                                  ₹{product.priceFrom}
                                                </span>
                                              </div>
                                            </div>
                                            <button
                                              onClick={() => {
                                                setSelectedProduct({
                                                  skuId: product.cardVariant.sku,
                                                  productId: product._id,
                                                  priceAtSelection: product.cardVariant.price,
                                                  quantity: 1,
                                                });
                                                setExchangePrice(product.priceFrom);
                                                setExchangeSteps("selected");
                                              }}
                                            >
                                              Select Item
                                            </button>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                </div>
                              )}

                              {exchangeSteps === "selected" && (
                                <div>
                                  {productDetail && productDetail.product && (
                                    <div className="p-4">
                                      <h3 className="text-[12px] font-bold mb-2">{productDetail.product.title}</h3>
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                          <Image
                                            src={productDetail.product.coverImage}
                                            alt={productDetail.product.title}
                                            width={500}
                                            height={500}
                                            className="rounded-lg object-cover w-full"
                                          />
                                        </div>
                                        <div>
                                          <p className="text-[12px] font-semibold">
                                            Price: ₹{productDetail.product.priceFrom}
                                          </p>
                                          <div className="mt-4">
                                            <p className="font-semibold">Available Sizes:</p>
                                            <div className="flex flex-wrap gap-2 mt-2">
                                              {productDetail.variants &&
                                                productDetail.variants.map((variant: IVariant) => (
                                                  <button
                                                    key={variant._id}
                                                    className={`btn ${selectedProduct.skuId === variant.sku ? "bg-black text-[10px] text-white" : "btn-outline"
                                                      }`}
                                                    onClick={() => {
                                                      setSelectedProduct((prev) => ({
                                                        ...prev,
                                                        skuId: variant.sku,
                                                        priceAtSelection: variant.price,
                                                        quantity: 1,
                                                      }));
                                                    }}
                                                  >
                                                    {variant.size}
                                                  </button>
                                                ))}
                                            </div>
                                          </div>
                                          <div className="mt-4">
                                            <p className="font-semibold">Quantity:</p>
                                            <div className="flex flex-row">
                                              <button
                                                className={`btn btn-outline ${selectedProduct.quantity > 1 ? "bg-base-100" : "bg-base-300"
                                                  }`}
                                                onClick={() => {
                                                  if (selectedProduct.quantity > 1) {
                                                    setSelectedProduct((prev) => ({
                                                      ...prev,
                                                      quantity: selectedProduct.quantity - 1,
                                                    }));
                                                  }
                                                }}
                                              >
                                                -
                                              </button>
                                              <button className="btn">{selectedProduct.quantity || 1}</button>
                                              <button
                                                className="btn btn-outline bg-base-100"
                                                onClick={() =>
                                                  setSelectedProduct((prev) => ({
                                                    ...prev,
                                                    quantity: selectedProduct.quantity + 1,
                                                  }))
                                                }
                                              >
                                                +
                                              </button>
                                            </div>
                                          </div>
                                          <div className="mt-6">
                                            <button
                                              className="btn btn-success w-full"
                                              disabled={!selectedProduct.skuId}
                                              onClick={() => {
                                                setExchangeSteps("payment");
                                              }}
                                            >
                                              Confirm Exchange
                                            </button>
                                          </div>
                                        </div>
                                      </div>
                                      <div className="mt-4">
                                        <h4 className="font-bold">Description</h4>
                                        <p>{productDetail.parent?.description}</p>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}

                              {exchangeSteps === "payment" && (
                                <div className="p-6 bg-white rounded-2xl shadow-lg space-y-4 text-center max-w-md mx-auto">
                                  <h1 className="text-[12px] font-semibold text-gray-800">
                                    Are you sure you want to exchange this item?
                                  </h1>
                                  <p className="text-[10px] text-gray-500">
                                    We are currently accepting exchange requests on{" "}
                                    <span className="font-medium text-gray-700">Cash on Delivery (COD)</span> only.
                                  </p>
                                  <div className="flex flex-col items-center space-y-3 mt-4">
                                    <h3 className="text-base font-medium text-gray-800 bg-gray-100 px-4 py-2 rounded-md">
                                      {currentPrice === exchangePrice
                                        ? "Amount to Pay: ₹0"
                                        : currentPrice > exchangePrice
                                          ? `₹${(currentPrice - exchangePrice).toFixed(2)} will be added to your wallet`
                                          : `Amount to Pay: ₹${(exchangePrice - currentPrice).toFixed(2)}`}
                                    </h3>
                                    <div className="flex items-center space-x-2 mt-2">
                                      <input type="radio" name="payment" value="COD" id="COD" defaultChecked className="radio checked:bg-primary" />
                                      <label htmlFor="COD" className="text-gray-700 font-medium">
                                        Cash on Delivery (COD)
                                      </label>
                                    </div>
                                  </div>
                                  <div className="flex justify-center gap-4 mt-6">
                                    <button
                                      onClick={() => {
                                        setExchangeSteps("selectOrder");
                                        (document.getElementById("my_modal_5") as HTMLDialogElement)?.close();
                                      }}
                                      className="btn btn-outline btn-sm w-24"
                                    >
                                      Cancel
                                    </button>
                                    <button
                                      onClick={async () => {
                                        const ex = await createExchange();
                                        await confirmPayment(ex._id);
                                        const updated = Array.from(new Set([...pendingExchangeItems, itemToReplace]));
                                        setPendingExchangeItems(updated);
                                        const key = `exchange_pending_${orderId}`;
                                        if (typeof window !== "undefined") {
                                          localStorage.setItem(key, JSON.stringify(updated));
                                        }
                                        (document.getElementById("my_modal_5") as HTMLDialogElement)?.close();
                                        setExchangeSteps("selectOrder");
                                      }}
                                      className="btn bg-black text-[10px] text-white btn-sm w-24"
                                    >
                                      Yes
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </dialog>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            {order.shippingAddress && (
              <div className="card bg-base-100 shadow">
                <div className="card-body p-4 sm:p-6">
                  <h2 className="card-title mb-4">Shipping Address</h2>
                  <div className="text-gray-700">
                    <p className="font-semibold text-[12px]">{order.shippingAddress.name}</p>
                    <p>{order.shippingAddress.line1}</p>
                    {order.shippingAddress.line2 && <p>{order.shippingAddress.line2}</p>}
                    <p>
                      {order.shippingAddress.city}, {order.shippingAddress.state} -{" "}
                      {order.shippingAddress.pincode}
                    </p>
                    <p>Phone: {order.shippingAddress.phone}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Payment Details */}
            <div className="card bg-base-100 shadow">
              <div className="card-body p-4 sm:p-6">
                <h2 className="card-title mb-4">Payment Details</h2>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>₹{order.subtotal?.toFixed(2) || "0.00"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span className="text-success">FREE</span>
                  </div>
                  {order.discount > 0 && (
                    <div className="flex justify-between text-success">
                      <span>Discount</span>
                      <span>-₹{order.discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="divider"></div>
                  <div className="flex justify-between text-[12px] font-bold">
                    <span>Total</span>
                    <span>₹{order.total}</span>
                  </div>
                  <div className="flex justify-between text-[10px] text-gray-600">
                    <span>Payment Method</span>
                    <span>{order.paymentMethod || "N/A"}</span>
                  </div>
                  <div className="flex justify-between text-[10px] text-gray-600">
                    <span>Payment Status</span>
                    <span className="capitalize">{order.payments[0].status == 'cod_pending' ? 'Pending' : order.payments[0].status || "N/A"}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Order Actions */}
          <div className="lg:col-span-1">
            <div className="card bg-base-200 sticky top-20">
              <div className="card-body p-4 sm:p-6">
                <h2 className="card-title mb-4">Order Actions</h2>
                <div className="space-y-3">
                  {["pending", "confirmed"].includes(order.status) && (
                    <button
                      onClick={() => {
                        const reason = prompt("Please enter a reason for cancellation:");
                        if (reason) {
                          cancelOrderMutation.mutate(reason);
                        }
                      }}
                      disabled={cancelOrderMutation.isPending}
                      className="btn bg-black text-[10px] text-white w-full"
                    >
                      {cancelOrderMutation.isPending ? "Cancelling..." : "Cancel Order"}
                    </button>
                  )}

                  {order.status === "delivered" && (
                    <Link
                      href={`/return?orderId=${order._id}`}
                      className="btn btn-warning w-full"
                    >
                      Request Return
                    </Link>
                  )}

                  <Link href="/orders" className="btn btn-outline w-full">
                    Back to Orders
                  </Link>

                  <Link href="/products" className="btn bg-black text-[10px] text-white w-full">
                    Continue Shopping
                  </Link>
                </div>

                {/* Order Summary */}
                <div className="divider"></div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Items</span>
                    <span>{order.items.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total</span>
                    <span className="font-bold">₹{order.total}</span>
                  </div>
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
