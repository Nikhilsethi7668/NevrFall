import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { useOrderStore } from '@/store/useOrderStore';
import Table from '@/components/Table';
import Pagination from '@/components/Pagination';
import Modal from '@/components/Modal';
import { Order, OrderStatus } from '@/types';
import toast from 'react-hot-toast';
import clsx from 'clsx';
import { DISPATCH_ORDER, GET_ORDER_BY_ID } from '@/constants/Constant';
import axios from 'axios';

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  paid: 'bg-blue-100 text-blue-800',
  processing: 'bg-purple-100 text-purple-800',
  confirmed: 'bg-green-100 text-green-800',
  delivered: 'bg-green-200 text-green-900',
  cancelled: 'bg-red-100 text-red-800',
  refunded: 'bg-gray-100 text-gray-800',
};

const statusTiles: OrderStatus[] = [
  'pending',
  'paid',
  'processing',
  'confirmed',
  'out-for-delivery',
  'delivered',
  'cancelled',
  'refunded',
];

const Orders: React.FC = () => {
  const { orders, page, totalPages, loading, fetchOrders, updateOrderStatus, approveRefund } = useOrderStore();
  const [order, setOrder] = useState<Order | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchOrders({ status: statusFilter || undefined });
  }, [statusFilter]);

  const payload = {
    orderId: order?._id,
    clientId: typeof order?.user === 'object' ? order?.user?._id : order?.user,
  }
  console.log(payload);
  console.log(order);

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      toast.success('Order status updated');
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleRefund = async (orderId: string) => {
    const reason = prompt('Enter refund reason:');
    if (!reason) return;

    try {
      await approveRefund(orderId, reason);
      toast.success('Refund processed');
    } catch (error) {
      toast.error('Failed to process refund');
    }
  };

  const getOrderById = async () => {
    if (!selectedOrder) return;
    const URL = GET_ORDER_BY_ID + selectedOrder._id;
    const token = localStorage.getItem('adminToken');

    try {
      const res = await axios.get(URL, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });
      console.log(res.data)
      setOrder(res.data);
    } catch (error: any) {
      toast.error(error.response?.data?.message);
    }
  };

  const dispatchOrder = async () => {
    const URL = DISPATCH_ORDER;
    const token = localStorage.getItem('adminToken');

    try {
      const res = await axios.post(URL, payload, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });
      const result = res.data.data;
      console.log(result);
      toast.success('Order dispatched');
    }
    catch {
      toast.error('Failed to dispatch order');
    }
  };


  const columns = [
    {
      key: 'orderId',
      header: 'Order ID',
      render: (item: Order) => (
        <span className="font-mono text-sm">{item._id.slice(-8)}</span>
      ),
    },
    {
      key: 'user',
      header: 'Customer',
      render: (item: Order) =>
        typeof item.user === 'object' ? item.user.name : 'N/A',
    },
    {
      key: 'total',
      header: 'Total',
      render: (item: Order) => `₹${item.total.toLocaleString()}`,
    },
    {
      key: 'status',
      header: 'Status',
      render: (item: Order) => (
        <span
          className={clsx(
            'rounded-full px-2 py-1 text-xs font-medium',
            statusColors[item.status] || 'bg-gray-100 text-gray-800'
          )}
        >
          {item.status}
        </span>
      ),
    },
    {
      key: 'createdAt',
      header: 'Date',
      render: (item: Order) => format(new Date(item.createdAt), 'MMM dd, yyyy'),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (item: Order) => (
        <div className="flex space-x-2">
          <button
            onClick={() => {
              setSelectedOrder(item);
              setIsModalOpen(true);
              getOrderById();
            }}
            className="rounded bg-blue-600 px-3 py-1 text-xs text-white hover:bg-blue-700"
          >
            View
          </button>
          {(item.status === 'cancelled' || item.status === 'returned') && (
            <button
              onClick={() => handleRefund(item._id)}
              className="rounded bg-green-600 px-3 py-1 text-xs text-white hover:bg-green-700"
            >
              Refund
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6" >
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setStatusFilter('')}
            className={`rounded-full px-3 py-1 text-sm border ${statusFilter === '' ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-gray-700 border-gray-300'
              }`}
          >
            All
          </button>
          {statusTiles.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`rounded-full px-3 py-1 text-sm border ${statusFilter === s ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-gray-700 border-gray-300'
                }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-lg bg-white shadow">
        <Table
          columns={columns}
          data={orders}
          keyExtractor={(item) => item._id}
          loading={loading}
        />
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={(p) => fetchOrders({ page: p, status: statusFilter || undefined })}
        />
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Order Details"
        size="lg"
      >
        {selectedOrder && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Order ID</p>
                <p className="font-mono font-medium">{selectedOrder._id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Customer</p>
                <p className="font-medium">
                  {typeof selectedOrder.user === 'object'
                    ? selectedOrder.user.name
                    : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Date</p>
                <p className="font-medium">
                  {format(new Date(selectedOrder.createdAt), 'PPP')}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Payment Method</p>
                <p className="font-medium">{selectedOrder.paymentMethod}</p>
              </div>
            </div>

            <div>
              <p className="mb-2 text-sm text-gray-600">Update Status</p>
              <select
                value={selectedOrder.status}
                onChange={(e) =>
                  handleStatusChange(selectedOrder._id, e.target.value as OrderStatus)
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary-500 focus:outline-none"
              >
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="processing">Processing</option>
                <option value="confirmed">Confirmed</option>
                <option value="out-for-delivery">Out for Delivery</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
                <option value="returned">Returned</option>
              </select>
            </div>

            {selectedOrder.shippingAddress && (
              <div>
                <p className="mb-2 text-sm font-medium text-gray-900">
                  Shipping Address
                </p>
                <div className="rounded border border-gray-200 p-2 text-sm">
                  <p>{selectedOrder.shippingAddress.name}</p>
                  <p>{selectedOrder.shippingAddress.line1}</p>
                  {selectedOrder.shippingAddress.line2 && <p>{selectedOrder.shippingAddress.line2}</p>}
                  <p>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.pincode}</p>
                  <p>{selectedOrder.shippingAddress.phone}</p>
                </div>
              </div>
            )}

            <div>
              <p className="mb-2 text-sm font-medium text-gray-900">Items</p>
              <div className="space-y-2">
                {selectedOrder.items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between rounded border border-gray-200 p-2 text-sm">
                    <div>
                      <p className="font-medium">{item.title}</p>
                      <p className="text-gray-600">SKU: {typeof item.variant === 'object' ? item.variant.sku : 'N/A'}</p>
                      <p className="text-gray-600">Quantity: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">₹{item.priceAfterDiscount.toLocaleString()}</p>
                      <p className="text-gray-600 line-through">₹{item.price.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2 border-t border-gray-200 pt-4">
              <div className="flex justify-between text-sm">
                <p className="text-gray-600">Subtotal</p>
                <p>₹{selectedOrder.subtotal.toLocaleString()}</p>
              </div>
              <div className="flex justify-between text-sm">
                <p className="text-gray-600">Discount</p>
                <p>- ₹{selectedOrder.discountAmount.toLocaleString()}</p>
              </div>
              <div className="flex justify-between font-medium">
                <p>Total</p>
                <p>₹{selectedOrder.total.toLocaleString()}</p>
              </div>
            </div>

            {selectedOrder.meta?.statusHistory && (
              <div>
                <p className="mb-2 text-sm font-medium text-gray-900">
                  Status History
                </p>
                <div className="space-y-2">
                  {selectedOrder.meta.statusHistory.map((history, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between rounded border border-gray-200 p-2 text-sm"
                    >
                      <span className="font-medium">{history.status}</span>
                      <span className="text-gray-600">
                        {format(new Date(history.updatedAt), 'PPp')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        <div className='flex justify-end'>
          <button onClickCapture={() => dispatchOrder()} className="rounded bg-blue-600 px-5 py-2 text-lg text-white hover:bg-blue-700" onClick={() => setIsModalOpen(false)}>Dispatch</button>
        </div>
      </Modal>
    </div >
  );
};

export default Orders;