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
  className = "",
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
      className={`group ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image container */}
      <div>
        {/* Image container with exact aspect ratio from reference */}
        <div className="relative w-full bg-base-200 overflow-hidden" style={{ aspectRatio: '0.6756373937677054' }}>
          {/* Wishlist button overlay on top-right of image */}
          {showWishlist && (
            <button
              onClick={handleAddToWishlist}
              aria-label="Add to wishlist"
              className="absolute top-2 right-2 z-10 rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-base-100 shadow-sm focus:outline-none"
            >
              <FaRegHeart size={14} className="text-base-content" />
            </button>
          )}
          <Link
            href={`/products/${product.slug || product._id}`}
            aria-label={product.title}
          >
            <Image
              src={product.coverImage || "/placeholder.png"}
              alt={product.title}
              width={800}
              height={1200}
              sizes="(max-width: 768px) 50vw, 25vw"
              className="w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
              priority={false}
              loading="lazy"
            />
          </Link>
        </div>
      </div>

      {/* Info container - matching reference structure */}
      <div className="mt-2">
        <Link
          href={`/products/${product.slug || product._id}`}
          className="block text-base-content no-underline hover:text-base-content"
          aria-label={product.title}
        >
          <div className="text-[11px] leading-[1.3] uppercase tracking-wide mb-1">
            {product.title}
          </div>
        </Link>

        <Link
          href={`/products/${product.slug || product._id}`}
          className="block text-base-content no-underline hover:text-base-content"
        >
          <div className="text-[11px] leading-[1.3]">
            ₹ {product.priceFrom.toLocaleString()}
          </div>
        </Link>
      </div>
    </div>
  );
}
