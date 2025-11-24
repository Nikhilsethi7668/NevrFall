import React, { useEffect, useState } from 'react';
import { useExchangeStore } from '@/store/useExchangeStore';
import Table from '@/components/Table';
import Pagination from '@/components/Pagination';
import { ExchangeRequest } from '@/types';

const Exchanges: React.FC = () => {
  const { exchanges, loading, page, totalPages, fetchExchanges, approveExchange } = useExchangeStore();
  const [statusFilter, setStatusFilter] = useState<string>('');

  useEffect(() => {
    fetchExchanges({ page: 1, status: statusFilter || undefined });
  }, [statusFilter]);

  const columns = [
    {
      key: 'id',
      header: 'ID',
      render: (item: ExchangeRequest) => item._id.slice(-6),
    },
    {
      key: 'user',
      header: 'User',
      render: (item: ExchangeRequest) =>
        typeof item.user === 'object' ? (item.user.name || item.user.phone) : String(item.user),
    },
    {
      key: 'order',
      header: 'Order',
      render: (item: ExchangeRequest) =>
        typeof item.originalOrder === 'object' ? item.originalOrder._id.slice(-6) : String(item.originalOrder).slice(-6),
    },
    {
      key: 'replacement',
      header: 'Replacement',
      render: (item: ExchangeRequest) => {
        const r = item.selectedReplacement as any;
        const title = r?.product?.title || '';
        const sku = r?.sku || '';
        const size = r?.variant?.size || '';
        return [title, sku, size].filter(Boolean).join(' / ');
      },
    },
    {
      key: 'price',
      header: 'Price',
      render: (item: ExchangeRequest) => item.selectedReplacement?.priceAtSelection ? `₹${item.selectedReplacement.priceAtSelection}` : '-',
    },
    {
      key: 'status',
      header: 'Status',
      render: (item: ExchangeRequest) => item.status,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (item: ExchangeRequest) => (
        <div className="flex gap-2">
          <button
            disabled={item.status !== 'REQUESTED'}
            onClick={() => approveExchange(item._id)}
            className="rounded bg-blue-600 px-3 py-1 text-xs text-white disabled:opacity-50"
          >
            Approve
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Exchanges</h1>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-gray-300 px-4 py-2 focus:border-primary-500 focus:outline-none"
        >
          <option value="">All Status</option>
          <option value="REQUESTED">Requested</option>
          <option value="APPROVED">Approved</option>
          <option value="QC_PASSED">QC Passed</option>
          <option value="QC_FAILED">QC Failed</option>
          <option value="NEW_ORDER_PLACED">New Order Placed</option>
          <option value="EXCHANGE_COMPLETED">Completed</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </div>

      <div className="rounded-lg bg-white shadow">
        <Table columns={columns} data={exchanges} keyExtractor={(i: any) => i._id} loading={loading} />
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={(p) => fetchExchanges({ page: p, status: statusFilter || undefined })}
        />
      </div>
    </div>
  );
};

export default Exchanges;