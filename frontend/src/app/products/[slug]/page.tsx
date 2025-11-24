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
  const [quantity] = useState(1);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewData, setReviewData] = useState({ rating: 5, body: "" });

  // Fetch product details
  const { data: product, isLoading } = useQuery<{product: Product, variants: Variant[], parent: {description: string}}>({
    queryKey: ["product", slug],
    queryFn: async () => {
      const res = await productAPI.getDetails(slug);
      return res.data;
    },
  });

  // Fetch reviews
  const { data: reviewsData } = useQuery<{items: Review[]}>({
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
      alert("Added to cart successfully!");
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
      alert("Added to wishlist!");
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
      alert("Review submitted successfully!");
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

  return (
    <>
      <Navbar />
      <div className="container mx-auto p-4">
        {/* Breadcrumbs */}
        <div className="breadcrumbs text-sm mb-4">
          <ul>
            <li><a onClick={() => router.push("/")}>Home</a></li>
            <li><a onClick={() => router.push("/products")}>Products</a></li>
            <li>{product.product.title}</li>
          </ul>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <div>
            <div className="mb-4">
              <Image
                src={images[selectedImage]?.url}
                alt={product.product.title}
                width={500}
                height={500}
                className="w-full h-[300px] sm:h-[400px] lg:h-[500px] object-cover rounded-lg"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto">
              {images.map((img: { url: string }, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`flex-shrink-0 ${
                    selectedImage === idx ? "ring-2 ring-primary" : ""
                  }`}
                >
                  <Image
                    src={img.url}
                    alt={`${product.product.title} ${idx + 1}`}
                    width={80}
                    height={80}
                    className="w-20 h-20 object-cover rounded"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div>
            <h1 className="lg:text-2xl font-semibold mb-2">{product.product.title}</h1>
            
            {/* Price */}
            <div className="flex items-center gap-4 mb-4">
              <span className="text-lg lg:text-2xl lg:font-bold text-primary">
                ₹{selectedVariant?.price || product.product.priceFrom}
              </span>
            </div>

            {/* Size Selection */}
            <div className="form-control mb-4">
              <label className="label">
                <span className="label-text mb-2 font-semibold">Select Size</span>
              </label>
              <div className="flex gap-2 flex-wrap">
                {product.variants.map((variant: Variant) => (
                  <button
                    key={variant._id}
                    onClick={() => setSelectedSize(variant.size)}
                    disabled={variant.stock === 0}
                    className={`btn ${
                      selectedSize === variant.size
                        ? "btn-primary"
                        : "btn-outline"
                    } ${variant.stock === 0 ? "btn-disabled" : ""}`}
                  >
                    {variant.size}
                    {variant.stock === 0 && " (Out)"}
                  </button>
                ))}
              </div>
            </div>

            {/* Check Serviceability */}
            <div className="bg-base-300 border-base-300 collapse border">
              <input type="checkbox" className="peer" />
              <div className="collapse-title">Check Serviceability</div>
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
                      if (pinCode.length === 6){
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
            <div className="flex hidden sm:block gap-4 mb-6">
              <button
                onClick={() => addToCartMutation.mutate()}
                disabled={!selectedSize || addToCartMutation.isPending}
                className="btn btn-primary flex-1"
              >
                {addToCartMutation.isPending ? (
                  <span className="loading loading-spinner"></span>
                ) : (
                  "ADD TO CART"
                )}
              </button>
              <button
                onClick={() => addToWishlistMutation.mutate()}
                className="btn btn-outline"
              >
                ADD TO WISHLIST
              </button>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="bg-base-100 border-base-300 collapse border">
          <input type="checkbox" className="peer" />
          <div className="collapse-title flex flex-row justify-between items-center cursor-pointer font-semibold peer-checked:[&>p:last-child]:rotate-180"><p>PRODUCT DETAILS</p><p className="transition-transform duration-300"><FaChevronDown /></p></div>
          <div className="collapse-content">
          {product.parent?.description && (
            <div className="prose">
              <p className="text-sm lg:text-lg">{product.parent.description}</p>
            </div>
          )}
          </div>
        </div>

                  
          {/* Product Recomendations */}
          <ProductRecomendations productId={product.product._id} />

        {/* Reviews Section */}
        <div className="mt-12">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <h2 className="text-xl sm:text-2xl font-bold">Customer Reviews</h2>
            <button
              onClick={() => setShowReviewForm(!showReviewForm)}
              className="btn btn-outline"
            >
              Write a Review
            </button>
          </div>

          {/* Review Form */}
          {showReviewForm && (
            <div className="card bg-base-200 p-6 mb-6">
              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text">Rating</span>
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
                  <span className="label-text">Your Review</span>
                </label>
                <textarea
                  className="textarea textarea-bordered h-24"
                  placeholder="Share your experience with this product..."
                  value={reviewData.body}
                  onChange={(e) => setReviewData({ ...reviewData, body: e.target.value })}
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => submitReviewMutation.mutate()}
                  disabled={submitReviewMutation.isPending}
                  className="btn btn-primary"
                >
                  {submitReviewMutation.isPending ? "Submitting..." : "Submit Review"}
                </button>
                <button
                  onClick={() => setShowReviewForm(false)}
                  className="btn btn-outline"
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
                    <span className="text-sm text-gray-500">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p>{review.body}</p>
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
              <div className="text-center text-gray-500 py-8">
                No reviews yet. Be the first to review!
              </div>
            )}
          </div>
        </div>
        <div className="flex md:hidden lg:hidden fixed justify-center p-4 bottom-0 left-0 mb-4 w-full bg-base-100 gap-4">
          <button
            onClick={() => addToCartMutation.mutate()}
            disabled={!selectedSize || addToCartMutation.isPending}
            className="btn btn-primary"
          >
            {addToCartMutation.isPending ? (
              <span className="loading loading-spinner"></span>
            ) : (
              "ADD TO CART"
            )}
          </button>
          <button
            onClick={() => addToWishlistMutation.mutate()}
            className="btn btn-outline"
          >
            <FaRegHeart /> ADD TO WISHLIST
          </button>
        </div>
      </div>
      <Footer />
    </>
  );
}