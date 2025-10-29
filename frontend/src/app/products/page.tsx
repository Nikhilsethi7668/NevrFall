'use client';

import { Suspense, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import { productAPI } from '@/services/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner';
import Pagination from '../components/Pagination';
import SearchBar from '../components/SearchBar';
import FilterSidebar from '../components/FilterSidebar';
import { useProductStore } from '../store/useProductStore';
import { useCategoryStore } from '../store/useCategoryStore';

function ProductsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    products,
    loading,
    filters,
    page,
    totalPages,
    fetchProducts,
    setFilters,
  } = useProductStore();
  const { categories, fetchCategories } = useCategoryStore();

  // --- Initialize filters from query params ---
  useEffect(() => {
    const initialFilters = {
      search: searchParams.get('q') || '',
      sort: searchParams.get('sort') || 'newest',
      category: searchParams.get('category') || '',
      size: searchParams.get('size') || '',
      sleeves: searchParams.get('sleeves') || '',
      price: searchParams.get('price') || '',
      priceRange: searchParams.get('price') || '',
    };
    setFilters(initialFilters);
    fetchCategories();
  }, []);

  // --- Update URL and fetch data when filters/page changes ---
  useEffect(() => {
    const query = new URLSearchParams();
    if (filters.search) query.set('q', filters.search);
    if (filters.sort) query.set('sort', filters.sort);
    if (filters.category) query.set('category', filters.category);
    if (filters.size) query.set('size', filters.size);
    if (filters.sleeves) query.set('sleeves', filters.sleeves);
    if (filters.price) query.set('price', filters.price);
    if (filters.priceRange) query.set('price', filters.priceRange);
    router.push(`${window.location.pathname}?${query.toString()}`);
    fetchProducts(filters, page);
  }, [filters, page]);

  // --- Fetch facets for dynamic filters ---
  const { data: facetsData } = useQuery({
    queryKey: ['facets', filters],
    queryFn: async () => {
      const res = await productAPI.getFacets(filters);
      return res.data;
    },
  });

  const handleFilterChange = (key: string, value: string) => {
    setFilters({ ...filters, [key]: value });
  };

  const handlePageChange = (newPage: number) => {
    useProductStore.setState({ page: newPage });
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      sort: 'newest',
      category: '',
      size: '',
      sleeves: '',
      price: '',
      priceRange: '',
    });
  };

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-6">
        {/* --- Header with search and sort --- */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <h1 className="text-3xl font-bold">Products</h1>

          <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
            <SearchBar
              placeholder="Search products..."
              className="w-full md:w-80"
              onSearch={(query) => handleFilterChange('search', query)}
            />

            <div className="flex flex-row items-center gap-2">
              <select
                value={filters.sort}
                onChange={(e) => handleFilterChange('sort', e.target.value)}
                className="select select-bordered select-sm md:select-md border-gray-300"
              >
                <option value="newest">Newest</option>
                <option value="featured">Featured</option>
                <option value="trending">Trending</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>

              {/* --- Mobile Filter Sidebar Button --- */}
              <div className="block lg:hidden">
                <FilterSidebar
                  filters={filters}
                  handleFilterChange={handleFilterChange}
                  clearFilters={clearFilters}
                  facetsData={facetsData}
                  categories={categories}
                />
              </div>
            </div>
          </div>
        </div>

        {/* --- Main Content --- */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* --- Desktop Filters Sidebar --- */}
          <div className="hidden lg:block lg:w-1/4">
            <FilterSidebar
              filters={filters}
              handleFilterChange={handleFilterChange}
              clearFilters={clearFilters}
              facetsData={facetsData}
              categories={categories}
            />
          </div>

          {/* --- Product Grid Area --- */}
          <div className="w-full lg:w-3/4">
            {loading ? (
              <div className="flex justify-center py-16">
                <LoadingSpinner size="lg" text="Loading products..." />
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-16">
                <h2 className="text-2xl font-semibold mb-3">No products found</h2>
                <p className="text-gray-500 mb-6">
                  Try adjusting your filters or search terms.
                </p>
                <button onClick={clearFilters} className="btn btn-primary">
                  Clear Filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                  {products.map((product: any) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>

                {/* Pagination */}
                <div className="mt-10">
                  <Pagination
                    currentPage={page}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <ProductsPageContent />
    </Suspense>
  );
}
