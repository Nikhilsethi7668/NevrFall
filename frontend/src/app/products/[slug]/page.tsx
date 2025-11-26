"use client";

import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { productAPI, cartAPI, wishlistAPI, reviewAPI } from "@/services/api";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import { FaChevronDown } from "react-icons/fa";
import { FaRegHeart } from "react-icons/fa6";
import ProductRecomendations from "@/app/components/ProductRecomendations";
import { toast } from "react-toastify";
import { DELIVERY_CHECK_PINCODE } from "@/app/constants/Constant";
import axios from "axios";

interface Product {
  _id: string;
  title: string;
  priceFrom: number;
  images: { url: string }[];
  description: string;
}

interface Variant {
  _id: string;
  size: string;
  price: number;
  stock: number;
}

interface Review {
  _id: string;
  rating: number;
  body: string;
  images: { url: string }[];
  createdAt: string;
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const slug = params.slug as string;

  const [selectedSize, setSelectedSize] = useState<string>("");
  const [pinCode, setPinCode] = useState<string>("");
  const [selectedImage, setSelectedImage] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [quantity] = useState(1);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewData, setReviewData] = useState({ rating: 5, body: "" });

  // Fetch product details
  const { data: product, isLoading } = useQuery<{ product: Product, variants: Variant[], parent: { description: string } }>({
    queryKey: ["product", slug],
    queryFn: async () => {
      const res = await productAPI.getDetails(slug);
      return res.data;
    },
  });

  // Fetch reviews
  const { data: reviewsData } = useQuery<{ items: Review[] }>({
    queryKey: ["reviews", product?.product?._id],
    queryFn: async () => {
      if (!product?.product?._id) return null;
      const res = await reviewAPI.getProductReviews({
        parentProductId: product.product._id,
        limit: 10,
      });
      return res.data;
    },
    enabled: !!product?.product?._id,
  });

  const handleCheckServiceability = useCallback(async () => {
    const URL = DELIVERY_CHECK_PINCODE + `?pin=` + pinCode;
    try {
      const res = await axios.get(URL, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      const result = res.data.data.delivery_codes;
      if (result.length > 0) {
        toast.success("We deliver at your location");
      } else {
        toast.error("We do not deliver at your location");
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message);
      } else {
        toast.error("An unexpected error occurred");
      }
    }
  }, [pinCode]);

  // Add to cart mutation
  const addToCartMutation = useMutation({
    mutationFn: async () => {
      const userId = localStorage.getItem("userId");
      if (!userId) throw new Error("Please login first");

      const selectedVariant = product?.variants.find(
        (v: Variant) => v.size === selectedSize
      );

      if (!selectedVariant) throw new Error("Please select a size");

      return cartAPI.add({
        userId,
        variantId: selectedVariant._id,
        quantity,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      toast.success("Added to cart successfully!");
    },
    onError: (error: Error) => {
      alert(error.message || "Failed to add to cart");
    },
  });

  // Add to wishlist mutation
  const addToWishlistMutation = useMutation({
    mutationFn: () => wishlistAPI.add({ productId: product!.product._id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
      toast.success("Added to wishlist!");
    },
  });

  // Submit review mutation
  const submitReviewMutation = useMutation({
    mutationFn: () =>
      reviewAPI.create({
        productId: product!.product._id,
        rating: reviewData.rating,
        body: reviewData.body,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews", product!.product._id] });
      setShowReviewForm(false);
      setReviewData({ rating: 5, body: "" });
      toast.success("Review submitted successfully!");
    },
  });

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto p-4">
          <div className="flex justify-center items-center min-h-screen">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!product) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto p-4">
          <div className="alert alert-error">Product not found</div>
        </div>
        <Footer />
      </>
    );
  }

  const images = product.product.images || [];
  const selectedVariant = product.variants.find((v: Variant) => v.size === selectedSize);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const minSwipeDistance = 50;

    if (distance > minSwipeDistance) {
      // Swiped Left -> Previous
      setSelectedImage((prev) => (prev > 0 ? prev - 1 : images.length - 1));
    } else if (distance < -minSwipeDistance) {
      // Swiped Right -> Next
      setSelectedImage((prev) => (prev < images.length - 1 ? prev + 1 : 0));
    }
    setTouchEnd(0);
    setTouchStart(0);
  };

  return (
    <>
      <Navbar />
      <div className="container mx-auto p-1">
        {/* Breadcrumbs */}
        <div className="breadcrumbs text-[10px] text-gray-500 mb-4">
          <ul>
            <li><a onClick={() => router.push("/")}>Home</a></li>
            <li><a onClick={() => router.push("/products")}>Products</a></li>
            <li>{product.product.title}</li>
          </ul>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <div>
            <div
              className="relative aspect-[2/3] w-full mb-2 overflow-hidden"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <div
                className="flex h-full transition-transform duration-500 ease-out"
                style={{ transform: `translateX(-${selectedImage * 100}%)` }}
              >
                {images.map((img: { url: string }, idx: number) => (
                  <div key={idx} className="relative w-full h-full flex-shrink-0">
                    <Image
                      src={img.url}
                      alt={`${product.product.title} - ${idx + 1}`}
                      fill
                      className="object-cover object-center"
                      sizes="
                        (min-width: 1440px) 500px,
                        (min-width: 1024px) 450px,
                        (min-width: 768px) 400px,
                        300px
                      "
                      priority={idx === 0}
                      loading={idx === 0 ? "eager" : "lazy"}
                    />
                  </div>
                ))}
              </div>
            </div>
            <div className="flex gap-1 overflow-x-auto">
              {images.map((img: { url: string }, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className="flex-shrink-0">
                  <Image
                    src={img.url}
                    alt={`${product.product.title} ${idx + 1}`}
                    width={80}
                    height={80}
                    className="w-20 h-20 object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div>
            <h1 className="text-[12px] text-[#707070] font-bold mb-2 uppercase tracking-wide">{product.product.title}</h1>

            {/* Price */}
            <div className="mb-2">
              <span className="text-[12px] text-[#545454] font-normal">
                ₹ {selectedVariant?.price?.toLocaleString() || product.product.priceFrom?.toLocaleString()}
              </span>
            </div>

            <p className="text-[10px] text-gray-500 mb-6">
              Tax included. <span className="underline cursor-pointer">Shipping</span> calculated at checkout.
            </p>

            {/* Size Selection */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-3">
                <span className="font-bold tracking-wide text-[10px]">SIZE</span>
                <button className="text-[10px] underline flex items-center gap-1 text-gray-600 hover:text-black">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M3 12h18M3 18h18" /></svg>
                  SIZE GUIDE
                </button>
              </div>
              <div className="grid grid-cols-6 gap-2">
                {product.variants.map((variant: Variant) => (
                  <button
                    key={variant._id}
                    onClick={() => setSelectedSize(variant.size)}
                    disabled={variant.stock === 0}
                    className={`h-8 p-4 flex items-center justify-center border text-xs transition-all duration-200
                      ${selectedSize === variant.size
                        ? "bg-black text-white border-black"
                        : "bg-transparent text-black border-gray-200 hover:border-black"
                      } 
                      ${variant.stock === 0 ? "opacity-50 cursor-not-allowed decoration-slice line-through" : ""}
                    `}
                  >
                    {variant.size}
                  </button>
                ))}
              </div>
            </div>

            {/* Check Serviceability */}
            <div className="bg-white border border-gray-200 collapse rounded-none mb-4">
              <input type="checkbox" className="peer" />
              <div className="collapse-title text-[12px]">Check Serviceability</div>
              <div className="collapse-content">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    className="input input-bordered w-full"
                    value={pinCode}
                    onChange={(e) => {
                      let value = e.target.value.replace(/\D/g, "");
                      value = value.replace(/^0+/, "");
                      if (Number(value) < 1000000) {
                        setPinCode(value);
                      }
                    }
                    }
                  />
                  <button
                    onClick={() => {
                      if (pinCode.length === 6) {
                        handleCheckServiceability();
                      }
                    }}
                    className={`btn ${pinCode.length === 6 ? "btn-primary" : "btn-outline"}`}
                  >
                    Check Serviceability
                  </button>
                </div>
              </div>
            </div>

            {/* Stock Status */}
            {/* {selectedVariant && (
              <div className="mb-4">
                <span className={`badge ${selectedVariant.stock > 0 ? "badge-success" : "badge-error"}`}>
                  {selectedVariant.stock > 0
                    ? `${selectedVariant.stock} in stock`
                    : "Out of stock"}
                </span>
              </div>
            )} */}

            {/* Quantity */}
            {/* <div className="form-control mb-6">
              <label className="label">
                <span className="label-text font-semibold">Quantity</span>
              </label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="btn btn-outline btn-sm"
                >
                  -
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                  className="input input-bordered w-20 text-center"
                  min="1"
                />
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="btn btn-outline btn-sm"
                >
                  +
                </button>
              </div>
            </div> */}

            {/* Action Buttons */}
            <div className="flex flex-col hidden sm:block gap-3 mb-8">
              <button
                onClick={() => addToCartMutation.mutate()}
                disabled={!selectedSize || addToCartMutation.isPending}
                className="w-full h-12 border border-black bg-white text-black hover:bg-gray-50 uppercase tracking-widest text-[10px] font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {addToCartMutation.isPending ? (
                  <span className="loading loading-spinner loading-sm"></span>
                ) : (
                  `ADD TO CART • ₹ ${selectedVariant?.price?.toLocaleString() || product.product.priceFrom?.toLocaleString()}`
                )}
              </button>
              <button
                onClick={() => addToWishlistMutation.mutate()}
                className="w-full h-12 mt-2 bg-black text-white hover:bg-gray-900 uppercase tracking-widest text-[10px] font-medium transition-colors"
              >
                ADD TO WISHLIST
              </button>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="bg-white border-t border-b border-gray-200 collapse rounded-none">
          <input type="checkbox" className="peer" />
          <div className="collapse-title flex flex-row justify-between items-center cursor-pointer font-semibold peer-checked:[&>p:last-child]:rotate-180"><p className="text-[12px]">PRODUCT DETAILS</p><p className="transition-transform duration-300"><FaChevronDown /></p></div>
          <div className="collapse-content">
            {product.parent?.description && (
              <div className="prose">
                <p className="text-[10px] lg:text-[12px]">{product.parent.description}</p>
              </div>
            )}
          </div>
        </div>


        {/* Product Recomendations */}
        <ProductRecomendations productId={product.product._id} />

        {/* Reviews Section */}
        <div className="mt-12">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <h2 className="text-[12px] font-bold">Customer Reviews</h2>
            <button
              onClick={() => setShowReviewForm(!showReviewForm)}
              className="btn btn-outline text-[12px]"
            >
              Write a Review
            </button>
          </div>

          {/* Review Form */}
          {showReviewForm && (
            <div className="card bg-base-200 p-6 mb-6">
              <div className="flex flex-col form-control mb-4">
                <label className="label">
                  <span className="label-text text-[12px]">Rating</span>
                </label>
                <div className="rating rating-lg">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <input
                      key={star}
                      type="radio"
                      name="rating"
                      className="mask mask-star-2 bg-orange-400"
                      checked={reviewData.rating === star}
                      onChange={() => setReviewData({ ...reviewData, rating: star })}
                    />
                  ))}
                </div>
              </div>
              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text text-[11px]">Your Review</span>
                </label>
                <textarea
                  className="textarea textarea-bordered h-24 text-[10px]"
                  placeholder="Share your experience with this product..."
                  value={reviewData.body}
                  onChange={(e) => setReviewData({ ...reviewData, body: e.target.value })}
                />
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => submitReviewMutation.mutate()}
                  disabled={submitReviewMutation.isPending}
                  className="btn bg-black text-white text-[12px]"
                >
                  {submitReviewMutation.isPending ? "Submitting..." : "Submit Review"}
                </button>
                <button
                  onClick={() => setShowReviewForm(false)}
                  className="btn text-[12px] btn-outline"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Reviews List */}
          <div className="space-y-4">
            {reviewsData?.items?.map((review: Review) => (
              <div key={review._id} className="card bg-base-100 shadow">
                <div className="card-body">
                  <div className="flex items-center justify-between mb-2">
                    <div className="rating rating-sm">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <input
                          key={star}
                          type="radio"
                          className="mask mask-star-2 bg-orange-400"
                          checked={review.rating === star}
                          disabled
                        />
                      ))}
                    </div>
                    <span className="text-[10px] text-gray-500 text-[12px]">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-[12px]">{review.body}</p>
                  {review.images && review.images.length > 0 && (
                    <div className="flex gap-2 mt-2">
                      {review.images.map((img: { url: string }, idx: number) => (
                        <Image
                          key={idx}
                          src={img.url}
                          alt={`Review ${idx + 1}`}
                          width={80}
                          height={80}
                          className="w-20 h-20 object-cover rounded"
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {!reviewsData?.items?.length && (
              <div className="text-center text-[12px] text-gray-500 py-8">
                No reviews yet. Be the first to review!
              </div>
            )}
          </div>
        </div>
        <div className="flex md:hidden lg:hidden fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 p-4 gap-3 z-50">
          <button
            onClick={() => addToCartMutation.mutate()}
            disabled={!selectedSize || addToCartMutation.isPending}
            className="flex-1 h-12 border border-black bg-white text-black uppercase text-xs font-bold tracking-wider disabled:opacity-50"
          >
            {addToCartMutation.isPending ? "..." : `ADD TO CART • ₹ ${selectedVariant?.price?.toLocaleString() || product.product.priceFrom?.toLocaleString()}`}
          </button>
          <button
            onClick={() => addToWishlistMutation.mutate()}
            className="flex-1 h-12 bg-black text-white uppercase text-xs font-bold tracking-wider"
          >
            ADD TO WISHLIST
          </button>
        </div>
      </div>
      <Footer />
    </>
  );
}