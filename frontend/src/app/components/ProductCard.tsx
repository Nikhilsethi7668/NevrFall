"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { wishlistAPI } from "@/services/api";
import { FaRegHeart } from "react-icons/fa";
import { toast } from "react-toastify";

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
      toast.success("Added to wishlist!");
    },
    onError: (error: Error) => {
      alert(error.message || "Failed to add to wishlist");
    },
  });

  const handleAddToWishlist = (e: React.MouseEvent) => {
    // prevent Link navigation when clicking heart
    e.preventDefault();
    e.stopPropagation();
    addToWishlistMutation.mutate();
  };

  return (
    <div
      className={`group bg-base-100 overflow-hidden pb-3 transition-shadow hover:shadow-md ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link
        href={`/products/${product.slug || product._id}`}
        className="block"
        aria-label={product.title}
      >
        {/* Image container - perfectly square */}
        <div className="relative aspect-[2/3] w-full">
          {/* Wishlist button overlay on top-right of image */}
          {showWishlist && (
            <button
              onClick={handleAddToWishlist}
              aria-label="Add to wishlist"
              className={`absolute top-2 right-3 z-10 p-2 focus:outline-none transform transition-transform duration-200 ${isHovered ? "scale-110" : "scale-100"
                }`}
            >
              <FaRegHeart size={10} />
            </button>
          )}

          <Image
            src={product.coverImage || "/placeholder.png"}
            alt={product.title}
            fill
            sizes="
              (min-width: 1440px) calc((100vw - 120px - 60px) / 4),
              (min-width: 1024px) calc((100vw - 120px - 60px) / 4),
              (min-width: 768px) calc((100vw - 40px - 40px) / 3),
              calc((100vw - 40px - 20px) / 2)
            "
            className="object-cover object-center transition-transform duration-300 group-hover:scale-105"
            priority={false}
            loading="lazy"
          />
        </div>

        {/* Content area */}
        <div className="flex flex-col my-3.5 gap-1">
          <p className="text-left text-[9px] text-gray-600 leading-none uppercase tracking-widest font-semibold line-clamp-2">
            {product.title}
          </p>

          <div className=" flex items-center justify-between">
            <div>
              <span className="block tracking-widest text-[11px]">₹ {product.priceFrom}</span>
            </div>

            {/* small chevron or placeholder for alignment — remove if not needed */}
            <div className="text-right text-xs text-muted hidden lg:block"> &nbsp;</div>
          </div>
        </div>
      </Link>
    </div>
  );
}
