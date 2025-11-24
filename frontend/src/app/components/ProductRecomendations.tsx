"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { productAPI, wishlistAPI } from "@/services/api";
import { FaRegHeart } from "react-icons/fa";

export default function ProductRecomendations({ productId }: { productId: string }) {
  const queryClient = useQueryClient();
  const [hoveredProductId, setHoveredProductId] = useState<string | null>(null);

  const { data: productRecomendations } = useQuery({
    queryKey: ["productRecomendations", productId],
    queryFn: async () => (await productAPI.getProductRecomendations(productId)).data,
    enabled: !!productId,
  });

  const addToWishlistMutation = useMutation({
    mutationFn: (productId: string) => wishlistAPI.add({ productId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
      alert("Added to wishlist!");
    },
    onError: (error: Error) => {
      alert(error.message || "Failed to add to wishlist");
    },
  });

  const handleAddToWishlist = (
    e: React.MouseEvent,
    productId: string
  ) => {
    e.preventDefault();
    e.stopPropagation();
    addToWishlistMutation.mutate(productId);
  };

  if (!productRecomendations || !productRecomendations.items?.length) return null;

  return (
    <div className="bg-base-200 py-10">
      <div className="container mx-auto px-4 md:px-8">
        <h2 className="text-xl font-bold text-center mb-8">
          You Might Also Like
        </h2>

        <div className="flex items-stretch overflow-x-auto py-4 gap-2 scrollbar-hide">
          {productRecomendations.items.map((product: any) => (
            <div
              key={product._id}
              className="shrink-0 w-[32vw] sm:w-[45vw] md:w-[30vw] lg:w-[22vw]"
              onMouseEnter={() => setHoveredProductId(product._id)}
              onMouseLeave={() => setHoveredProductId(null)}
            >
              <Link
                href={`/products/${product.slug || product._id}`}
                className="block shadow-sm hover:shadow-lg transition-all duration-300 rounded-md overflow-hidden bg-white"
              >
                {/* Product Image */}
                <div className="h-[20vh] lg:h-[576px] bg-[#FFEEE7] flex items-center justify-center overflow-hidden rounded-md">
                  <Image
                    src={product.coverImage || "/placeholder.png"}
                    alt={product.title}
                    className="object-cover h-full w-full"
                    width={300}
                    height={310}
                    loading="lazy"
                  />
                </div>

                {/* Product Details */}
                <div className="mx-1 py-2 lg:px-4">
                  <div className="flex justify-between items-start">
                    <h5 className="text-left text-[#585c70] font-semibold line-clamp-1">
                      {product.title}
                    </h5>

                    {/* Wishlist Button */}
                    <button
                      onClick={(e) => handleAddToWishlist(e, product._id)}
                      className={`p-1 cursor-pointer transition-transform duration-200 ${
                        hoveredProductId === product._id
                          ? "transform scale-125"
                          : ""
                      }`}
                    >
                      <FaRegHeart size={20} />
                    </button>
                  </div>

                  {/* Brand or Collection */}
                  {product.brand && (
                    <div className="text-sm text-gray-500">
                      <span>{product.brand}</span>
                    </div>
                  )}
                  {product.collections && product.collections.length > 0 ? (
                    <div className="text-sm text-gray-500">
                      <span>{product.collections.join(", ")}</span>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500">
                      <span className="line-clamp-1">{product.slug}</span>
                    </div>
                  )}

                  {/* Price */}
                  <div className="mt-1">
                    <span className="font-semibold text-sm">
                      ₹{product.priceFrom}
                    </span>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
