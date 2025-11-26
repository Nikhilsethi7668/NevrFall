'use client';

import { Suspense, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { productAPI } from '@/services/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner';
import Pagination from '../components/Pagination';
import SearchBar from '../components/SearchBar';
import FilterSidebar from '../components/FilterSidebar';
import { useProductStore } from '../store/useProductStore';

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

  // --- Initialize filters from query params ---
  useEffect(() => {
    const params: Record<string, any> = {};
    searchParams.forEach((value, key) => {
      params[key] = value;
    });
    setFilters(params);
  }, []);

  // --- Update URL and fetch data when filters/page changes ---
  const pathname = usePathname();
  useEffect(() => {
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(filters)) {
      if (value) {
        query.set(key, String(value));
      }
    }

    const queryString = query.toString();
    const currentString = searchParams.toString();

    if (queryString !== currentString) {
      router.push(`${pathname}?${queryString}`);
    }
    fetchProducts(filters, page);
  }, [filters]);

  // --- Fetch facets for dynamic filters ---
  const { data: facetsData } = useQuery({
    queryKey: ['facets', filters],
    queryFn: async () => {
      const res = await productAPI.getFacets(filters);
      return res.data;
    },
  });

  const handleFilterChange = (newFilters: Record<string, any>) => {
    setFilters(newFilters);
  };

  const handlePageChange = (newPage: number) => {
    useProductStore.setState({ page: newPage });
  };

  const clearFilters = () => {
    setFilters({});
  };

  return (
    <>
      <Navbar />
      <div className="container mx-auto p-1">
        {/* --- Header with search and sort --- */}
        <div className="bg-base-100 border-b py-3 mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h1 className="text-3xl font-bold">Products</h1>

          <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
            <SearchBar
              placeholder="Search products..."
              className="w-full md:w-80"
              onSearch={(query) => handleFilterChange({ ...filters, search: query })}
            />

            <div className="flex flex-row items-center gap-2">
              <select
                value={filters.sort || 'newest'}
                onChange={(e) => handleFilterChange({ ...filters, sort: e.target.value })}
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
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-1">
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
