import React, { useEffect, useState } from 'react';
import Table from '@/components/Table';
import Modal from '@/components/Modal';
import Pagination from '@/components/Pagination';
import toast from 'react-hot-toast';
import { ReturnRequest } from '@/types';
import { returnApi } from '@/api/returns';

const statusTiles: ReturnRequest['status'][] = [
  'requested','pickup_scheduled','picked_up','received','inspected','approved','rejected','refunded','closed'
];

const Returns: React.FC = () => {
  const [items, setItems] = useState<ReturnRequest[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<ReturnRequest['status'] | ''>('');
  const [selected, setSelected] = useState<ReturnRequest | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const load = async (p = 1) => {
    setLoading(true);
    try {
      const data = await returnApi.list({ page: p, limit: 20, status: statusFilter || undefined });
      setItems(data.items || []);
      setTotalPages(Math.ceil((data.total || 1) / (data.limit || 20)));
      setPage(data.page || p);
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Failed to load returns');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(1); }, [statusFilter]);

  const columns = [
    { key: '_id', header: 'ID', render: (r: ReturnRequest) => <span className="font-mono text-sm">{r._id.slice(-8)}</span> },
    { key: 'user', header: 'User', render: (r: ReturnRequest) => typeof r.user === 'object' ? (r.user as any)?.name || '—' : String(r.user) },
    { key: 'status', header: 'Status' },
    { key: 'createdAt', header: 'Requested At', render: (r: ReturnRequest) => new Date(r.createdAt).toLocaleString() },
    {
      key: 'actions',
      header: 'Actions',
      render: (r: ReturnRequest) => (
        <div className="flex gap-2">
          <button onClick={() => { setSelected(r); setIsModalOpen(true); }} className="rounded bg-blue-600 px-3 py-1 text-xs text-white hover:bg-blue-700">View</button>
          <button onClick={async () => { try { await returnApi.approve(r._id); toast.success('Return approved'); load(page); } catch (e: any) { toast.error(e?.response?.data?.message || 'Approve failed'); } }} className="rounded bg-green-600 px-3 py-1 text-xs text-white hover:bg-green-700">Approve</button>
          <button onClick={async () => { try { await returnApi.receive(r._id); toast.success('Marked received'); load(page); } catch (e: any) { toast.error(e?.response?.data?.message || 'Receive failed'); } }} className="rounded bg-gray-600 px-3 py-1 text-xs text-white hover:bg-gray-700">Receive</button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-gray-900">Return Requests</h1>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setStatusFilter('')} className={`rounded-full px-3 py-1 text-sm border ${statusFilter === '' ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-gray-700 border-gray-300'}`}>All</button>
          {statusTiles.map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)} className={`rounded-full px-3 py-1 text-sm border ${statusFilter === s ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-gray-700 border-gray-300'}`}>{s}</button>
          ))}
        </div>
      </div>

      <div className="rounded-lg bg-white shadow">
        <Table columns={columns} data={items} keyExtractor={(x) => x._id} loading={loading} />
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={(p) => load(p)} />
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Return Details" size="lg">
        {selected && (
          <div className="space-y-3">
            <div><p className="text-sm text-gray-600">ID</p><p className="font-mono">{selected._id}</p></div>
            <div><p className="text-sm text-gray-600">Status</p><p className="font-medium">{selected.status}</p></div>
            <div><p className="text-sm text-gray-600">Quantity</p><p className="font-medium">{selected.quantity}</p></div>
            <div><p className="text-sm text-gray-600">Pickup</p><p className="font-medium">{selected.pickup?.trackingId || '—'}</p></div>
            <div><p className="text-sm text-gray-600">Refund</p><p className="font-medium">{selected.refund?.amount ? `₹${selected.refund.amount}` : '—'}</p></div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Returns;