"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { wishlistAPI } from "@/services/api";
import { FaRegHeart } from "react-icons/fa";

interface Variant {
  _id: string;
}

interface ProductCardProps {
  product: {
    _id: string;
    title: string;
    brand?: string;
    coverImage?: string;
    priceFrom: number;
    compareAtFrom?: number;
    variants?: Variant[];
    slug?: string;
    collections?: string[];
  };
  showWishlist?: boolean;
  className?: string;
}

export default function ProductCard({ 
  product, 
  showWishlist = true, 
  className = ""
}: ProductCardProps) {
  const queryClient = useQueryClient();
  const [isHovered, setIsHovered] = useState(false);

  // Add to wishlist mutation
  const addToWishlistMutation = useMutation({
    mutationFn: () => wishlistAPI.add({ productId: product._id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
      alert("Added to wishlist!");
    },
    onError: (error: Error) => {
      alert(error.message || "Failed to add to wishlist");
    },
  });

  const handleAddToWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToWishlistMutation.mutate();
  };

  return (
    <div 
      className={`hover:shadow-lg transition-all duration-300 overflow-hidden ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/products/${product.slug || product._id}`} className="block">
        <div 
          className="imgBlockNew custom-border listhover h-[30vh] lg:h-[576px] bg-[#FFEEE7] flex items-center justify-center overflow-hidden"
        >
          <Image
            src={product.coverImage || '/placeholder.png'}
            alt={product.title}
            className="custom-border img-auto object-cover h-full w-full"
            width={300}
            height={310}
            loading="lazy"
          />
        </div>
        <div className="mx-1 py-2 lg:px-4">
          <div className="flex justify-between items-start">
            <p className="text-left text-xs lg:text-xl text-[#585c70] font-semibold line-clamp-2">
              {product.title}
            </p>
            {showWishlist && (
              <button
                onClick={handleAddToWishlist}
                className={`p-1 wishlistIconNew cursor-pointer ${
                  isHovered ? "transform scale-125" : ""
                } transition-opacity duration-200`}
              >
                <FaRegHeart size={20}/>
              </button>
            )}
          </div>
          {product.brand && (
            <div className="listprice ecltext text-sm text-gray-500">
              <span>{product.brand}</span>
            </div>
          )}
          {product.collections && product.collections.length > 0 ? (
            <div className="listprice ecltext text-sm text-gray-500">
              <span>{product.collections.join(", ")}</span>
            </div>
          ) : (
            <div className="listprice ecltext text-sm text-gray-500">
              <span className="line-clamp-1">{product.slug}</span>
            </div>
          )}
          <div>
            <div className="col-12 special-products_pricingicing">
              <div className="price-block">
                <span className="offer font-semibold text-sm">
                  ₹{product.priceFrom}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}