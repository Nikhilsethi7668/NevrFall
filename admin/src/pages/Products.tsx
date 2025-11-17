import React, { useEffect, useState } from 'react';
import { Plus, Eye, Edit, Trash2 } from 'lucide-react';
import Table from '@/components/Table';
import Modal from '@/components/Modal';
import ProductForm from './ProductForm';
import toast from 'react-hot-toast';
import { ParentProduct, Category, Product } from '@/types';
import { productApi } from '@/api/products';
import { categoryApi } from '@/api/categories';

const Products: React.FC = () => {
  const [parentProducts, setParentProducts] = useState<ParentProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isParentModalOpen, setIsParentModalOpen] = useState(false);
  const [selectedParentId, setSelectedParentId] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [parentTitle, setParentTitle] = useState('');
  const [parentSlug, setParentSlug] = useState('');
  const [parentDescription, setParentDescription] = useState('');
  const [parentCategoryId, setParentCategoryId] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [isChildModalOpen, setIsChildModalOpen] = useState(false);
  const [childProducts, setChildProducts] = useState<Product[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [parents, cats] = await Promise.all([
          productApi.getParentProducts(),
          categoryApi.getCategories(),
        ]);
        setParentProducts(parents);
        setCategories(cats);
      } catch (e) {
        toast.error('Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const openCreateProduct = (parentId: string) => {
    setSelectedParentId(parentId);
    setIsProductModalOpen(true);
  };

  const handleCloseProductModal = () => {
    setIsProductModalOpen(false);
    setSelectedParentId(null);
  };

  const refreshParents = async () => {
    try {
      const parents = await productApi.getParentProducts();
      setParentProducts(parents);
    } catch {}
  };

  const columns = [
    { key: 'title', header: 'Title' },
    { key: 'slug', header: 'Slug' },
    {
      key: 'category',
      header: 'Category',
      render: (item: ParentProduct) =>
        categories.find((c) => c._id === item.categories)?.name || '—',
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (item: ParentProduct) => (
        <div className="flex gap-2">
          <button
            onClick={() => openCreateProduct(item._id)}
            className="rounded-lg bg-primary-600 px-3 py-1 text-sm text-white hover:bg-primary-700"
          >
            Create Product
          </button>
          <button
            onClick={async () => {
              try {
                const data = await productApi.getProducts({ page: 1, limit: 100 });
                const items = (data.items || []) as Product[];
                const filtered = items.filter((p) => {
                  const parent = p.parent as any;
                  const pid = typeof parent === 'string' ? parent : parent?._id;
                  return pid === item._id;
                });
                setChildProducts(filtered);
                setIsChildModalOpen(true);
              } catch {
                toast.error('Failed to load products');
              }
            }}
            className="rounded-lg bg-gray-100 px-3 py-1 text-sm text-gray-800 hover:bg-gray-200"
          >
            View Products
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Parent Products</h1>
          <button
            onClick={() => setIsParentModalOpen(true)}
            className="flex items-center rounded-lg bg-primary-600 px-4 py-2 text-white hover:bg-primary-700"
          >
            <Plus className="mr-2 h-5 w-5" />
            Add Parent Product
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategoryId('')}
            className={`rounded-full px-3 py-1 text-sm border ${
              selectedCategoryId === '' ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-gray-700 border-gray-300'
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat._id}
              onClick={() => setSelectedCategoryId(cat._id)}
              className={`rounded-full px-3 py-1 text-sm border ${
                selectedCategoryId === cat._id ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-gray-700 border-gray-300'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-lg bg-white shadow">
        <Table
          columns={columns}
          data={selectedCategoryId ? parentProducts.filter((p) => p.categories === selectedCategoryId) : parentProducts}
          keyExtractor={(item) => item._id}
          loading={loading}
        />
      </div>

      <Modal
        isOpen={isProductModalOpen}
        onClose={handleCloseProductModal}
        title={"Create Product"}
        size="xl"
      >
        <ProductForm
          product={null}
          parentProductId={selectedParentId || undefined}
          onSuccess={() => {
            handleCloseProductModal();
            refreshParents();
          }}
          onCancel={handleCloseProductModal}
        />
      </Modal>

      <Modal
        isOpen={isChildModalOpen}
        onClose={() => {
          setIsChildModalOpen(false);
          setEditingProduct(null);
        }}
        title={"Products"}
        size="xl"
      >
        <div className="space-y-4">
          <Table
            columns={[
              { key: 'title', header: 'Title' },
              { key: 'colorLabel', header: 'Color' },
              { key: 'availableSizes', header: 'Sizes', render: (p: Product) => p.availableSizes.join(', ') },
              { key: 'priceFrom', header: 'Price', render: (p: Product) => `₹${p.priceFrom}` },
              {
                key: 'actions',
                header: 'Actions',
                render: (p: Product) => (
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingProduct(p);
                      }}
                      className="rounded p-1 text-blue-600 hover:bg-blue-50"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={async () => {
                        if (!confirm('Delete this product?')) return;
                        try {
                          await productApi.deleteProduct(p._id);
                          setChildProducts((prev) => prev.filter((x) => x._id !== p._id));
                          toast.success('Product deleted');
                        } catch {
                          toast.error('Failed to delete');
                        }
                      }}
                      className="rounded p-1 text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ),
              },
            ]}
            data={childProducts}
            keyExtractor={(p) => p._id}
          />

          {editingProduct && (
            <ProductForm
              product={editingProduct}
              onSuccess={() => {
                setEditingProduct(null);
                setIsChildModalOpen(false);
              }}
              onCancel={() => setEditingProduct(null)}
            />
          )}
        </div>
      </Modal>

      <Modal
        isOpen={isParentModalOpen}
        onClose={() => setIsParentModalOpen(false)}
        title={"Add Parent Product"}
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Title *</label>
            <input
              value={parentTitle}
              onChange={(e) => setParentTitle(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2"
              placeholder="Parent title"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Slug *</label>
            <input
              value={parentSlug}
              onChange={(e) => setParentSlug(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2"
              placeholder="parent-slug"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={parentDescription}
              onChange={(e) => setParentDescription(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2"
              placeholder="Parent description"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Category</label>
            <select
              value={parentCategoryId}
              onChange={(e) => setParentCategoryId(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2"
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end space-x-3 border-t pt-4">
            <button
              type="button"
              onClick={() => setIsParentModalOpen(false)}
              className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={async () => {
                if (!parentTitle) {
                  toast.error('Title is required');
                  return;
                }
                try {
                  await productApi.createParentProduct({
                    title: parentTitle,
                    slug: parentSlug,
                    description: parentDescription,
                    categories: parentCategoryId || undefined,
                  });
                  toast.success('Parent product created');
                  setIsParentModalOpen(false);
                  setParentTitle('');
                  setParentSlug('');
                  setParentDescription('');
                  setParentCategoryId('');
                  const parents = await productApi.getParentProducts();
                  setParentProducts(parents);
                } catch (err: any) {
                  if (err?.response?.status === 409) {
                    toast.success('Parent product already exists');
                    setIsParentModalOpen(false);
                  } else {
                    toast.error(err?.response?.data?.message || 'Failed to create parent product');
                  }
                }
              }}
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

export default Products;