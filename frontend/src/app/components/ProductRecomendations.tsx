"use client";

import { useQuery } from "@tanstack/react-query";
import { productAPI } from "@/services/api";
import ProductCard from "./ProductCard";

export default function ProductRecomendations({ productId }: { productId: string }) {
  const { data: productRecomendations } = useQuery({
    queryKey: ["productRecomendations", productId],
    queryFn: async () => (await productAPI.getProductRecomendations(productId)).data,
    enabled: !!productId,
  });

  if (!productRecomendations || !productRecomendations.items?.length) return null;

  return (
    <div className="bg-base-200 py-10">
      <div className="container">
        <h2 className="text-[12px] font-bold mb-8">
          You Might Also Like
        </h2>

        <div className="flex items-stretch overflow-x-auto gap-px scrollbar-hide">
          {productRecomendations.items.map((product: any) => (
            <div
              key={product._id}
              className="shrink-0 w-[45vw] sm:w-[40vw] md:w-[30vw] lg:w-[22vw]"
            >
              <ProductCard
                product={product}
                showWishlist={true}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
