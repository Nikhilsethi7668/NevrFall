"use client";

import ProductCard from "./ProductCard";
import { wishlistAPI } from "@/services/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

export default function YouMightAlsoLike({ cartRecomendation }: any) {
  const queryClient = useQueryClient();

  const addToWishlistMutation = useMutation({
    mutationFn: (productId: string) => wishlistAPI.add({ productId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
      toast.success("Added to wishlist!");
    },
    onError: (error: Error) => alert(error.message || "Failed to add to wishlist"),
  });

  if (!cartRecomendation || !cartRecomendation.items?.length) return null;

  return (
    <div className="bg-base-200 py-5">
      <div className="container mx-auto md:px-8">
        <h2 className="text-[12px] font-bold text-center mb-2">
          You Might Also Like
        </h2>

        <div className="flex overflow-x-auto gap-3 py-4 scrollbar-hide">
          {cartRecomendation.items.map((product: any) => (
            <div
              key={product._id}
              className="shrink-0 w-[45vw] sm:w-[40vw] md:w-[30vw] lg:w-[22vw]"
            >
              <ProductCard
                product={product}
                showWishlist={true}
                className="rounded-none shadow-sm hover:shadow-md"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
