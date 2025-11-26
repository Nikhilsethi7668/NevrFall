"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { productAPI } from "@/services/api";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import ProductCard from "./components/ProductCard";
import LoadingSpinner from "./components/LoadingSpinner";
import Link from "next/link";
import Categories from "./components/Categories";
import ImageCarousel from "./components/ImageCarousel";
import { useProductStore } from "./store/useProductStore";
import Pagination from "./components/Pagination";
import { useEffect, useState } from "react";
import secureLocalStorage from "react-secure-storage";

export default function Home() {
  const router = useRouter();
  const {
    products,
    loading,
    filters,
    page,
    totalPages,
    fetchProducts,
    setFilters,
  } = useProductStore();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    fetchProducts(filters, page);
    const token = secureLocalStorage.getItem("auth_token");
    if (token) {
      setIsLoggedIn(true);
    }
  }, [page]);

  const handlePageChange = (newPage: number) => {
    useProductStore.setState({ page: newPage });
  };

  // Fetch featured products
  const { data: featuredProducts, isLoading: featuredLoading } = useQuery({
    queryKey: ["featured-products"],
    queryFn: async () => {
      const res = await productAPI.getFeatured({ limit: 6 });
      return res.data;
    },
  });

  // Fetch new arrivals
  const { data: newArrivals, isLoading: newArrivalsLoading } = useQuery({
    queryKey: ["new-arrivals"],
    queryFn: async () => {
      const res = await productAPI.getNewArrivals({ limit: 8 });
      return res.data;
    },
  });

  // Fetch trending products
  const { data: trendingProducts, isLoading: trendingLoading } = useQuery({
    queryKey: ["trending-products"],
    queryFn: async () => {
      const res = await productAPI.getTrending({ limit: 8 });
      return res.data;
    },
  });

  // Fetch recommended products
  const { data: recommendedProducts, isLoading: recommendedLoading } = useQuery({
    queryKey: ["recommended-products"],
    queryFn: async () => {
      const res = await productAPI.getRecommended({ limit: 8 });
      return res.data;
    },
    enabled: isLoggedIn,
  });


  return (
    <>
      <Navbar />
      <div className="hero min-h-[78vh] relative">
        <video
          className="absolute inset-0 w-full h-full object-cover"
          src="/hero.mp4"
          autoPlay
          loop
          muted
        />
      </div>

       {/* Recommended Products */}
      {isLoggedIn && recommendedProducts && recommendedProducts.items.length > 0 && (
        <div className="bg-base-300">
          <div className="p-0.5 lg:p-6">
            <h2 className="text-xs text-[#707070] font-bold uppercase my-6">Recommended For You</h2>
            {recommendedLoading ? (
              <LoadingSpinner size="lg" text="Loading recommendations..." />
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-px lg:gap-2">
                {recommendedProducts?.items?.map((product: any) => (
                    <ProductCard key={product._id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Featured Products */}
      {/* <div className="container mx-auto p-6">
        <h2 className="text-3xl font-bold text-center mb-8">Featured Products</h2>
        {featuredLoading ? (
          <LoadingSpinner size="lg" text="Loading featured products..." />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 lg:gap-6">
            {featuredProducts?.items?.map((product: any) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div> */}

      {/* New Arrivals */}
      <div className="">
        <div className="p-0.5 lg:p-6">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-xs text-[#707070] font-bold uppercase tracking-tight my-6">New Arrivals</h2>
          </div>
          {newArrivalsLoading ? (
            <LoadingSpinner size="lg" text="Loading new arrivals..." />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-px lg:gap-2">
              {newArrivals?.items?.map((product: any) => (
                  <ProductCard product={product} />
              ))}
            </div>
          )}
          <div className="flex w-full justify-center items-center mt-2">
            <button
              onClick={() => router.push("/products?sort=newest")}
              className="bg-black uppercase text-white text-[10px] py-2 px-5"
            >
              EXPLORE ALL
            </button>
          </div>
        </div>
      </div>

      <div className="hero min-h-[78vh] relative">
        <video
          className="absolute inset-0 w-full h-full object-cover"
          src="/hero.mp4"
          autoPlay
          loop
          muted
        />
      </div>

        {/* Trending Products */}
        <div className="p-0.5 lg:p-6">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-xs text-[#707070] my-6 font-bold uppercase tracking-tight">Trending Now</h2>
          </div>
          {trendingLoading ? (
            <LoadingSpinner size="lg" text="Loading trending products..." />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-px lg:gap-2">
              {trendingProducts?.items?.map((product: any) => (
                  <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
          <div className="flex w-full justify-center items-center mt-2">
            <button
                onClick={() => router.push("/products?sort=trending")}
                className="bg-black uppercase text-white text-[10px] py-2 px-5"
              >
                EXPLORE ALL
              </button>
          </div>
        </div>


      {/* <div className="container mx-auto p-6">
        <Categories />
      </div> */}
      
      <div className="mx-auto p-0.5">
        <div className="lg:col-span-3">
          <h1 className="font-semibold uppercase text-xs text-[#707070] my-6">Products</h1>
          {loading ? (
            <LoadingSpinner size="lg" text="Loading products..." />
          ) : products.length === 0 ? (
            <div className="text-center py-16">
              <h2 className="text-2xl font-bold mb-4">No products found</h2>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-px lg:gap-2">
                {products.map((product: any) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                className="mt-8"
              />
            </>
          )}
        </div>
      </div>

      <Footer />
    </>
  );
}