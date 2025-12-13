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
    hasMore,
    fetchProducts,
    setFilters,
  } = useProductStore();

  // --- Initialize filters from query params ---
  useEffect(() => {
    const params: Record<string, any> = {};
    searchParams.forEach((value, key) => {
      // Handle comma-separated values for arrays like colors
      if (value.includes(',')) {
        params[key] = value.split(',');
      } else {
        params[key] = value;
      }
    });
    setFilters(params);
    // Initial fetch
    fetchProducts(params, false);
  }, []); // Run once on mount

  // --- Update URL when filters change ---
  const pathname = usePathname();
  useEffect(() => {
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(filters)) {
      if (value) {
        if (Array.isArray(value)) {
          if (value.length > 0) query.set(key, value.join(','));
        } else {
          query.set(key, String(value));
        }
      }
    }

    const queryString = query.toString();
    const currentString = searchParams.toString();

    if (queryString !== currentString) {
      router.push(`${pathname}?${queryString}`);
    }
    // We trigger fetch here whenever filters change.
    // Important: Avoid double fetch on mount.
    // The initial useEffect sets filters. This dependency [filters] will trigger.
    // Simplest approach: Trust this useEffect to handle all data fetching based on filter state.
    fetchProducts(filters, false);
  }, [filters]);

  // --- Infinite Scroll Observer ---
  // Using a callback ref or simple useEffect with ID
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          fetchProducts(filters, true);
        }
      },
      { threshold: 1.0 }
    );

    const sentinel = document.getElementById('sentinel');
    if (sentinel) {
      observer.observe(sentinel);
    }

    return () => {
      if (sentinel) observer.unobserve(sentinel);
    };
  }, [filters, hasMore, loading]);


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

  const clearFilters = () => {
    setFilters({});
  };

  return (
    <>
      <Navbar />
      <div className="container mx-auto p-0.5">
        {/* --- Header with search and sort --- */}
        <div className="bg-base-100 border-b py-3 mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
            <div className="flex flex-row justify-between items-center gap-2">
              <select
                value={filters.sort || 'newest'}
                onChange={(e) => handleFilterChange({ ...filters, sort: e.target.value })}
                className="w-auto select-sm"
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
            {products.length === 0 && !loading ? (
              <div className="text-center py-16">
                <h2 className="text-[12px] font-semibold mb-3">No products found</h2>
                <p className="text-gray-500 mb-6">
                  Try adjusting your filters or search terms.
                </p>
                <button onClick={clearFilters} className="btn btn-primary">
                  Clear Filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 pb-4 gap-px">
                  {products.map((product: any) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>

                {/* Loading / Sentinel */}
                <div id="sentinel" className="h-10 w-full flex justify-center items-center mt-4">
                  {loading && <LoadingSpinner size="md" />}
                  {!hasMore && products.length > 0 && (
                    <p className="text-xs text-gray-400">No more products</p>
                  )}
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
