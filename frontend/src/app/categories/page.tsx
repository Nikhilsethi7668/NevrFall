"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { productAPI } from "@/services/api";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Link from "next/link";

export default function CategoriesPage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Fetch categories/facets
  const { data: facetsData, isLoading } = useQuery({
    queryKey: ["facets"],
    queryFn: async () => {
      const res = await productAPI.getFacets();
      return res.data;
    },
  });

  // Fetch products for selected category
  const { data: productsData } = useQuery({
    queryKey: ["category-products", selectedCategory],
    queryFn: async () => {
      if (selectedCategory === "all") {
        const res = await productAPI.getAll({ limit: 12 });
        return res.data;
      } else {
        const res = await productAPI.getByFilter({
          category: selectedCategory,
          limit: 12,
        });
        return res.data;
      }
    },
  });

  const categories = [
    { id: "all", name: "All Products", icon: "🛍️" },
    { id: "sneakers", name: "Sneakers", icon: "👟" },
    { id: "boots", name: "Boots", icon: "🥾" },
    { id: "sandals", name: "Sandals", icon: "🩴" },
    { id: "heels", name: "Heels", icon: "👠" },
    { id: "flats", name: "Flats", icon: "👡" },
    { id: "athletic", name: "Athletic", icon: "🏃‍♀️" },
    { id: "casual", name: "Casual", icon: "👞" },
  ];

  const products = productsData?.items || [];

  return (
    <>
      <Navbar />
      <div className="container mx-auto p-4">
        <h1 className="text-4xl font-bold text-center mb-8">Shop by Category</h1>
        
        {/* Category Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-12">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`card bg-base-100 shadow hover:shadow-lg transition-all ${
                selectedCategory === category.id ? "ring-2 ring-primary" : ""
              }`}
            >
              <div className="card-body text-center p-4">
                <div className="text-[12px] mb-2">{category.icon}</div>
                <h3 className="font-semibold text-[10px]">{category.name}</h3>
              </div>
            </button>
          ))}
        </div>

        {/* Category Products */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-[12px] font-bold">
              {categories.find(c => c.id === selectedCategory)?.name || "All Products"}
            </h2>
            <Link
              href={`/products?category=${selectedCategory}`}
              className="btn btn-outline"
            >
              View All
            </Link>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center min-h-64">
              <span className="loading loading-spinner loading-lg"></span>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-16">
              <h3 className="text-[12px] font-semibold mb-4">No products found</h3>
              <p className="text-gray-600 mb-8">
                Try selecting a different category or browse all products
              </p>
              <button
                onClick={() => setSelectedCategory("all")}
                className="btn btn-primary"
              >
                View All Products
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product: any) => (
                <div key={product._id} className="card bg-base-100 shadow-sm hover:shadow-lg transition-shadow">
                  <Link href={`/products/${product.slug || product._id}`}>
                    <figure>
                      <img
                        src={product.coverImage || "/placeholder.png"}
                        alt={product.title}
                        className="w-full h-64 object-cover"
                      />
                    </figure>
                    <div className="card-body">
                      <h2 className="card-title text-[12px]">{product.title}</h2>
                      <p className="text-[10px] text-gray-600">{product.brand}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-[12px] font-bold text-primary">
                          ₹{product.priceFrom}
                        </span>
                        {product.compareAtFrom && (
                          <span className="text-[10px] line-through text-gray-500">
                            ₹{product.compareAtFrom}
                          </span>
                        )}
                      </div>
                      <div className="card-actions justify-end">
                        <div className="badge badge-outline">
                          {product.variants?.length || 0} variants
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Popular Brands */}
        {facetsData?.brands && facetsData.brands.length > 0 && (
          <div className="card bg-base-100 shadow">
            <div className="card-body">
              <h2 className="card-title text-[12px] mb-6">Popular Brands</h2>
              <div className="flex flex-wrap gap-4">
                {facetsData.brands.map((brand: string) => (
                  <button
                    key={brand}
                    onClick={() => router.push(`/products?brand=${brand}`)}
                    className="btn btn-outline"
                  >
                    {brand}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className="card bg-base-100 shadow">
            <div className="card-body text-center">
              <div className="text-4xl mb-4">🚚</div>
              <h3 className="card-title justify-center">Free Shipping</h3>
              <p>On orders over ₹999</p>
            </div>
          </div>
          <div className="card bg-base-100 shadow">
            <div className="card-body text-center">
              <div className="text-4xl mb-4">↩️</div>
              <h3 className="card-title justify-center">Easy Returns</h3>
              <p>30-day return policy</p>
            </div>
          </div>
          <div className="card bg-base-100 shadow">
            <div className="card-body text-center">
              <div className="text-4xl mb-4">🔒</div>
              <h3 className="card-title justify-center">Secure Payment</h3>
              <p>100% secure transactions</p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
