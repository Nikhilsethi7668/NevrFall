"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { productAPI } from "@/services/api";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import ProductCard from "./components/ProductCard";
import LoadingSpinner from "./components/LoadingSpinner";
import ImageCarousel from "./components/ImageCarousel";
import CategoryChips from "./components/CategoryChips";
import QuickFilters from "./components/QuickFilters";
import TrendingGrid from "./components/TrendingGrid";
import TopCategories from "./components/TopCategories";
import { useState, useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { usePageLoad } from "./context/PageLoadContext";

export default function Home() {
  const [quickFilter, setQuickFilter] = useState("Jacket");
  const [isSticky, setIsSticky] = useState(false);
  const { ref, inView } = useInView();
  const { ref: stickyRef, inView: isStickyInView } = useInView({
    threshold: 0,
    rootMargin: '-56px 0px 0px 0px'
  });
  const { setPageReady } = usePageLoad();

  // Infinite Scroll Query
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
    error
  } = useInfiniteQuery({
    queryKey: ["products-infinite"],
    queryFn: async ({ pageParam }) => {
      const res = await productAPI.getAll({
        limit: 8,
        cursor: pageParam as string | undefined
      });
      return res.data;
    },
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor || undefined,
  });

  // Load more when scrolling to bottom
  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);

  // Detect sticky state
  useEffect(() => {
    setIsSticky(!isStickyInView);
  }, [isStickyInView]);

  // Signal page is ready when initial data loads
  useEffect(() => {
    if (status === 'success' && data?.pages?.[0]?.items?.length > 0) {
      // Give a small delay to ensure images start loading
      const timer = setTimeout(() => {
        setPageReady();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [status, data, setPageReady]);

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-white pb-20">
        {/* 1. Carousel - Full Width */}
        <section className="w-full">
          <ImageCarousel />
        </section>

        {/* 2. Category & Collection Chips - Sticky */}
        <div ref={stickyRef} className={isSticky ? "" : "mt-4"}>
          <section className="sticky top-[56px] z-40 bg-white/95 backdrop-blur-sm border-b border-gray-100">
            <CategoryChips />
          </section>
        </div>

        {/* Container for desktop - max width with centered content */}
        <div className="max-w-[1600px] mx-auto px-4 lg:px-8">
          {/* 3. Quick Filters */}
          <section className="mt-6">
            <QuickFilters
              selectedFilter={quickFilter}
              onFilterChange={setQuickFilter}
            />
          </section>

          {/* 4. Trending Grid (based on Quick Filter) */}
          <section className="mt-4">
            <TrendingGrid selectedFilter={quickFilter} />
          </section>

          {/* 5. Top Categories */}
          <section className="mt-8">
            <TopCategories />
          </section>

          {/* 6. All Products (Infinite Scroll) */}
          <section className="py-8">
            <div className="mb-6">
              <h2 className="text-xl lg:text-2xl font-bold tracking-wider uppercase text-left">
                All Products
              </h2>
            </div>

            {status === 'pending' ? (
              <div className="flex justify-center py-20">
                <LoadingSpinner size="lg" text="Loading products..." />
              </div>
            ) : status === 'error' ? (
              <div className="text-center py-20 text-red-500">
                Error loading products. Please try again.
                <button
                  onClick={() => window.location.reload()}
                  className="block mx-auto mt-4 px-4 py-2 bg-black text-white text-xs uppercase"
                >
                  Retry
                </button>
              </div>
            ) : (
              <>
                {/* Desktop: 4 columns, Mobile: 2 columns */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 lg:gap-x-6 gap-y-6 lg:gap-y-8">
                  {data.pages.map((page, i) => (
                    page.items.map((product: any) => (
                      <ProductCard key={product._id} product={product} />
                    ))
                  ))}
                </div>

                {/* Loading indicator for next page */}
                <div ref={ref} className="py-8 flex justify-center w-full">
                  {isFetchingNextPage ? (
                    <LoadingSpinner size="md" />
                  ) : hasNextPage ? (
                    <span className="text-gray-400 text-xs">Load more</span>
                  ) : (
                    <span className="text-gray-400 text-xs uppercase tracking-widest">
                      You've reached the end
                    </span>
                  )}
                </div>
              </>
            )}
          </section>
        </div>
      </main>

      <Footer />
    </>
  );
}