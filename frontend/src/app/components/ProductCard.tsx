"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { wishlistAPI } from "@/services/api";
import { FaRegHeart, FaHeart } from "react-icons/fa";
import { toast } from "react-toastify";
import secureLocalStorage from "react-secure-storage";
import { addToGuestWishlist, removeFromGuestWishlist, isInGuestWishlist } from "@/utils/guestStorage";

interface Variant {
  _id: string;
}

interface ProductCardProps {
  product: {
    _id: string;
    title: string;
    brand?: string;
    coverImage?: string;
    hoverImage?: string;
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
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check authentication status
  useEffect(() => {
    const token = secureLocalStorage.getItem('auth_token');
    setIsAuthenticated(!!token);

    // Check if product is in guest wishlist (for non-authenticated users)
    if (!token) {
      setIsWishlisted(isInGuestWishlist(product._id));
    }
  }, [product._id]);

  // Add to wishlist mutation (for authenticated users)
  const addToWishlistMutation = useMutation({
    mutationFn: () => wishlistAPI.add({ productId: product._id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
      setIsWishlisted(true);
      toast.success("Added to wishlist!");
    },
    onError: (error: Error) => {
      console.error("Failed to add to wishlist:", error);
      toast.error("Failed to add to wishlist");
    },
  });

  // Remove from wishlist mutation (for authenticated users)
  const removeFromWishlistMutation = useMutation({
    mutationFn: () => wishlistAPI.remove({ productId: product._id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
      setIsWishlisted(false);
      toast.success("Removed from wishlist");
    },
    onError: (error: Error) => {
      console.error("Failed to remove from wishlist:", error);
      toast.error("Failed to remove from wishlist");
    },
  });

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isAuthenticated) {
      // Authenticated user - use API
      if (isWishlisted) {
        removeFromWishlistMutation.mutate();
      } else {
        addToWishlistMutation.mutate();
      }
    } else {
      // Guest user - use localStorage
      if (isWishlisted) {
        removeFromGuestWishlist(product._id);
        setIsWishlisted(false);
        toast.success("Removed from wishlist");
      } else {
        addToGuestWishlist(product._id);
        setIsWishlisted(true);
        toast.success("Added to wishlist!");
      }
    }
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
              onClick={handleToggleWishlist}
              aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
              className={`absolute top-2 right-3 z-10 p-2 focus:outline-none transform transition-transform duration-200 ${isHovered ? "scale-110" : "scale-100"
                }`}
            >
              {isWishlisted ? (
                <FaHeart size={10} className="text-red-500" />
              ) : (
                <FaRegHeart size={10} />
              )}
            </button>
          )}

          {/* Main Image */}
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
            decoding="async"
          />

          {/* Hover Image (if available) */}
          {product.hoverImage && (
            <Image
              src={product.hoverImage}
              alt={`${product.title} - alternate view`}
              fill
              sizes="(min-width: 1440px) calc((100vw - 120px - 60px) / 4), (min-width: 1024px) calc((100vw - 120px - 60px) / 4), (min-width: 768px) calc((100vw - 40px - 40px) / 3), calc((100vw - 40px - 20px) / 2)"
              className={`object-cover object-center transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'
                }`}
              priority={false}
              loading="lazy"
              decoding="async"
            />
          )}
        </div>

        {/* Content area */}
        <div className="flex flex-col my-3.5 gap-1">
          <p className="text-left text-[9px] text-gray-600 leading-none uppercase tracking-widest font-semibold line-clamp-2">
            {product.title}
          </p>
          <div className="flex items-center justify-between">
            <div>
              <span className="block text-[11px]">₹{product.priceFrom}</span>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}


