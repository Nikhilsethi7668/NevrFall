import React, { useEffect, useState } from 'react';
import { categoryApi } from '@/api/categories';
import toast from 'react-hot-toast';
import { Category } from '@/types';
import Modal from '@/components/Modal';

const Categories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [parent, setParent] = useState('');
  const [sortOrder, setSortOrder] = useState<number>(0);
  const [isActive, setIsActive] = useState<boolean>(true);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [editName, setEditName] = useState('');
  const [editSlug, setEditSlug] = useState('');
  const [editParent, setEditParent] = useState('');
  const [editSortOrder, setEditSortOrder] = useState<number>(0);
  const [editIsActive, setEditIsActive] = useState<boolean>(true);

  const load = async () => {
    setLoading(true);
    try {
      const data = await categoryApi.getCategories();
      setCategories(data || []);
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async () => {
    if (!name) {
      toast.error('Name is required');
      return;
    }
    try {
      await categoryApi.createCategory({
        name,
        slug,
        parent: parent || undefined,
        sortOrder,
        isActive,
      } as any);
      toast.success('Category created');
      setName('');
      setSlug('');
      setParent('');
      setSortOrder(0);
      setIsActive(true);
      await load();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Failed to create category');
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Categories</h1>

      <div className="rounded-lg bg-white p-4 shadow">
        <h2 className="mb-3 text-lg font-semibold">Create Category</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name *</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2"
              placeholder="Category name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Slug</label>
            <input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2"
              placeholder="category-slug"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Parent</label>
            <select
              value={parent}
              onChange={(e) => setParent(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2"
            >
              <option value="">None</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Sort Order</label>
            <input
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(Number(e.target.value) || 0)}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2"
              placeholder="0"
            />
          </div>
          <div className="flex items-center">
            <input
              id="active"
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <label htmlFor="active" className="ml-2 text-sm text-gray-700">Active</label>
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <button
            onClick={handleCreate}
            className="rounded-lg bg-primary-600 px-4 py-2 text-white hover:bg-primary-700"
          >
            Create
          </button>
        </div>
      </div>

      <div className="rounded-lg bg-white p-4 shadow">
        <h2 className="mb-3 text-lg font-semibold">Existing Categories</h2>
        {loading ? (
          <p className="text-sm text-gray-500">Loading...</p>
        ) : (
          <div className="grid gap-2">
            {categories.map((c) => (
              <div key={c._id} className="flex items-center justify-between rounded border border-gray-200 p-2">
                <div>
                  <p className="font-medium">{c.name}</p>
                  <p className="text-xs text-gray-600">{c.slug}</p>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <span>{c.isActive ? 'Active' : 'Inactive'} • Order {c.sortOrder}</span>
                  <button
                    className="rounded bg-yellow-500 px-2 py-1 text-white"
                    onClick={() => {
                      setEditing(c);
                      setEditName(c.name);
                      setEditSlug(c.slug);
                      setEditParent((c.parent as any) || '');
                      setEditSortOrder(c.sortOrder || 0);
                      setEditIsActive(Boolean(c.isActive));
                      setIsEditModalOpen(true);
                    }}
                  >
                    Edit
                  </button>
                  <button
                    className="rounded bg-red-600 px-2 py-1 text-white"
                    onClick={async () => {
                      if (!confirm('Delete this category?')) return;
                      try {
                        await categoryApi.deleteCategory(c._id);
                        toast.success('Category deleted');
                        await load();
                      } catch (e: any) {
                        toast.error(e?.response?.data?.message || 'Delete failed');
                      }
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
            {categories.length === 0 && <p className="text-sm text-gray-500">No categories</p>}
          </div>
        )}
      </div>
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={"Edit Category"}
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name *</label>
            <input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Slug</label>
            <input
              value={editSlug}
              onChange={(e) => setEditSlug(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Parent</label>
            <select
              value={editParent}
              onChange={(e) => setEditParent(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2"
            >
              <option value="">None</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Sort Order</label>
            <input
              type="number"
              value={editSortOrder}
              onChange={(e) => setEditSortOrder(Number(e.target.value) || 0)}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2"
            />
          </div>
          <div className="flex items-center">
            <input
              id="editActive"
              type="checkbox"
              checked={editIsActive}
              onChange={(e) => setEditIsActive(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <label htmlFor="editActive" className="ml-2 text-sm text-gray-700">Active</label>
          </div>
          <div className="flex justify-end space-x-3 border-t pt-4">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={async () => {
                if (!editing) return;
                if (!editName) {
                  toast.error('Name is required');
                  return;
                }
                try {
                  await categoryApi.updateCategory(editing._id, {
                    name: editName,
                    slug: editSlug,
                    parent: editParent || null,
                    sortOrder: editSortOrder,
                    isActive: editIsActive,
                  } as any);
                  toast.success('Category updated');
                  setIsEditModalOpen(false);
                  setEditing(null);
                  await load();
                } catch (e: any) {
                  toast.error(e?.response?.data?.message || 'Update failed');
                }
              }}
              className="rounded-lg bg-primary-600 px-4 py-2 text-white hover:bg-primary-700"
            >
              Save Changes
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Categories;