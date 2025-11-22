"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { orderAPI } from "@/services/api";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Link from "next/link";

export default function OrdersPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState("all");
  const [mounted, setMounted] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [orders, setOrders] = useState<any[] | null>(null);

  useEffect(() => {
    setMounted(true);
    setUserId(localStorage.getItem("userId"));
  }, []);

  // Fetch orders
  const { data: ordersData, isLoading } = useQuery({
    queryKey: ["orders", userId, statusFilter],
    queryFn: async () => {
      if (!userId) return null;
      const res = await orderAPI.list({
        page: 1,
        limit: 20,
        status: statusFilter === "all" ? undefined : statusFilter,
      });
      setOrders(res.data);
      return res.data;
    },
    enabled: !!userId,
  });

  // Cancel order mutation
  const cancelOrderMutation = useMutation({
    mutationFn: async (orderId: string) => {
      return orderAPI.cancel(orderId, { reason: "Customer requested cancellation" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      alert("Order cancelled successfully");
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

  if (!mounted) {
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

  if (!userId) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto p-4">
          <div className="alert alert-warning">
            <span>Please login to view your orders</span>
          </div>
        </div>
        <Footer />
      </>
    );
  }

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

  // const orders = ordersData?.items || [];
  console.log(orders);

  return (
    <>
      <Navbar />
      <div className="container mx-auto p-4">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6">
          <h1 className="text-3xl font-bold mb-4 sm:mb-0">My Orders</h1>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="select select-bordered w-full p-2 sm:w-auto"
          >
            <option value="all">All Orders</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
            <option value="returned">Returned</option>
          </select>
        </div>

        {orders && orders.length === 0 ? (
          <div className="text-center py-16">
            <h2 className="text-2xl font-bold mb-4">No orders found</h2>
            <p className="text-gray-600 mb-8">
              {statusFilter === "all"
                ? "You haven't placed any orders yet"
                : `No ${statusFilter} orders found`}
            </p>
            <Link href="/products" className="btn btn-primary">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders && orders.map((order: any) => (
              <div key={order._id} className="card bg-base-100 shadow">
                <div className="card-body p-4 sm:p-6">
                  <div className="flex flex-row justify-between sm:items-start mb-4">
                    <div className="mb-4 sm:mb-0">
                      <h3 className="text-lg font-semibold">Order #{order._id.slice(-6)}</h3>
                      <p className="text-sm text-gray-600">
                        Placed on {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-left sm:text-right">
                      <div className={`badge ${getStatusBadge(order.status)} mb-1`}>
                        {getStatusText(order.status)}
                      </div>
                      <p className="text-lg font-bold">₹{order?.total}</p>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="space-y-3 mb-4">
                    {order.items.map((item: any, index: number) => (
                      <div key={index} className="card bg-base-100 shadow-2xl">
                        <div className="px-1 h-[17vh]">
                          <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex gap-4 flex-1">
                              {/* Image */}
                              <img
                                src={item.product?.coverImage || "/placeholder.png"}
                                alt={item.title}
                                className="w-20 h-30 object-cover rounded"
                              />

                              {/* Content */}
                              <div className="flex-1">
                                <h3 className="font-bold text-sm sm:text-lg">{item.title}</h3>

                                <p className="text-sm text-gray-600">
                                  Color: {item.color} | Size: {item.size}
                                </p>

                                <div className="flex flex-col justify-between">
                                  <p className="text-xs font-semibold mt-2">₹{item.price}</p>

                                  {/* Quantity (read-only, as in orders) */}
                                  <div className="flex items-center md:gap-2 lg:gap-2 mt-1">
                                    <span className="text-sm">Qty:</span>
                                    <span className="w-8 text-center font-medium">{item.quantity}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>


                  {/* Shipping Address */}
                  {order.shippingAddress && (
                    <div className="mb-4">
                      <h4 className="font-semibold mb-2">Shipping Address</h4>
                      <div className="text-sm text-gray-600">
                        <p>{order.shippingAddress.name}</p>
                        <p>{order.shippingAddress.line1}</p>
                        {order.shippingAddress.line2 && <p>{order.shippingAddress.line2}</p>}
                        <p>
                          {order.shippingAddress.city}, {order.shippingAddress.state} -{" "}
                          {order.shippingAddress.pincode}
                        </p>
                        <p>Phone: {order.shippingAddress.phone}</p>
                      </div>
                    </div>
                  )}

                  {/* Order Actions */}
                  <div className="flex flex-col sm:flex-row gap-2 sm:justify-end">
                    <Link
                      href={`/orders/${order._id}`}
                      className="btn btn-outline btn-sm w-full sm:w-auto"
                    >
                      View Details
                    </Link>
                    {(order.status === "pending" || order.status === "confirmed" ) && (
                      <button
                        onClick={() => {
                          if (confirm("Are you sure you want to cancel this order?")) {
                            cancelOrderMutation.mutate(order._id);
                          }
                        }}
                        disabled={cancelOrderMutation.isPending}
                        className="btn btn-error btn-sm w-full sm:w-auto"
                      >
                        Cancel Order
                      </button>
                    )}
                    {order.status === "delivered" && (
                      <Link
                        href={`/return?orderId=${order._id}`}
                        className="btn btn-warning btn-sm w-full sm:w-auto"
                      >
                        Return
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}
