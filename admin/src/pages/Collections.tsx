import React, { useEffect, useState } from 'react';
import { collectionsApi } from '@/api/collections';
import toast from 'react-hot-toast';
import { Collection } from '@/types';
import Modal from '@/components/Modal';

const Collections: React.FC = () => {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [priority, setPriority] = useState<'high' | 'moderate' | 'low'>('moderate');
  const [isActive, setIsActive] = useState<boolean>(true);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editing, setEditing] = useState<Collection | null>(null);
  const [editName, setEditName] = useState('');
  const [editSlug, setEditSlug] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editImage, setEditImage] = useState('');
  const [editPriority, setEditPriority] = useState<'high' | 'moderate' | 'low'>('moderate');
  const [editIsActive, setEditIsActive] = useState<boolean>(true);

  const load = async () => {
    setLoading(true);
    try {
      const data = await collectionsApi.getCollections();
      setCollections(data || []);
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Failed to load collections');
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
      await collectionsApi.createCollection({
        name,
        slug,
        description,
        image,
        priority,
        isActive: isActive ? 'yes' : 'no',
      } as any);
      toast.success('Collection created');
      setName('');
      setSlug('');
      setDescription('');
      setImage('');
      setPriority('moderate');
      setIsActive(true);
      await load();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Failed to create collection');
    }
  };

  const handleUpdate = async () => {
    if (!editing?._id) return;
    try {
      await collectionsApi.updateCollection(editing._id, {
        name: editName,
        slug: editSlug,
        description: editDescription,
        image: editImage,
        priority: editPriority,
        isActive: editIsActive ? 'yes' : 'no',
      } as any);
      toast.success('Collection updated');
      setIsEditModalOpen(false);
      await load();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Failed to update collection');
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Collections</h1>

      <div className="rounded-lg bg-white p-4 shadow">
        <h2 className="mb-3 text-lg font-semibold">Create Collection</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name *</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2"
              placeholder="Collection name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Slug</label>
            <input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2"
              placeholder="collection-slug"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2"
              placeholder="Short description"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Image URL</label>
            <input
              value={image}
              onChange={(e) => setImage(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2"
              placeholder="https://..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as any)}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2"
            >
              <option value="high">High</option>
              <option value="moderate">Moderate</option>
              <option value="low">Low</option>
            </select>
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
        <h2 className="mb-3 text-lg font-semibold">Existing Collections</h2>
        {loading ? (
          <p className="text-sm text-gray-500">Loading...</p>
        ) : (
          <div className="grid gap-2">
            {collections.map((c) => (
              <div key={c._id} className="flex items-center justify-between rounded border border-gray-200 p-2">
                <div>
                  <p className="font-medium">{c.name}</p>
                  <p className="text-xs text-gray-600">{c.slug}</p>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <span>{c.isActive === 'yes' ? 'Active' : 'Inactive'} • {c.priority}</span>
                  <button
                    className="rounded bg-yellow-500 px-2 py-1 text-white"
                    onClick={() => {
                      setEditing(c);
                      setEditName(c.name);
                      setEditSlug(c.slug);
                      setEditDescription(c.description || '');
                      setEditImage(c.image || '');
                      setEditPriority(c.priority);
                      setEditIsActive(c.isActive === 'yes');
                      setIsEditModalOpen(true);
                    }}
                  >
                    Edit
                  </button>
                  <button
                    className="rounded bg-red-600 px-2 py-1 text-white"
                    onClick={async () => {
                      if (!confirm('Delete this collection?')) return;
                      try {
                        await collectionsApi.deleteCollection(c._id);
                        toast.success('Collection deleted');
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
            {collections.length === 0 && <p className="text-sm text-gray-500">No collections</p>}
          </div>
        )}
      </div>

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={"Edit Collection"}
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
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <input
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Image URL</label>
            <input
              value={editImage}
              onChange={(e) => setEditImage(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Priority</label>
            <select
              value={editPriority}
              onChange={(e) => setEditPriority(e.target.value as any)}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2"
            >
              <option value="high">High</option>
              <option value="moderate">Moderate</option>
              <option value="low">Low</option>
            </select>
          </div>
          <div className="flex items-center">
            <input
              id="edit-active"
              type="checkbox"
              checked={editIsActive}
              onChange={(e) => setEditIsActive(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <label htmlFor="edit-active" className="ml-2 text-sm text-gray-700">Active</label>
          </div>
          <div className="mt-4 flex justify-end">
            <button
              onClick={handleUpdate}
              className="rounded-lg bg-primary-600 px-4 py-2 text-white hover:bg-primary-700"
            >
              Save
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Collections;