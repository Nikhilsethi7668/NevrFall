// frontend/src/app/cart/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { cartAPI, couponAPI, productAPI, authAPI, wishlistAPI } from "@/services/api";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useOrderStore } from "../store/useOrderStore";
import CartRecomendations from "../components/CartRecomendations";
import { toast } from "react-toastify";
import { DELIVERY_CHECK_PINCODE } from "../constants/Constant";
import axios from "axios";
import { FaCaretDown } from "react-icons/fa";

export default function CartPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { coupon, setCoupon, cartRecomendation, address, setAddress } = useOrderStore();
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [mounted, setMounted] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [showAddAddressForm, setShowAddAddressForm] = useState(false);
  const [notDeliverable, setNotDeliverable] = useState(true);
  const [message, setMessage] = useState("");
  const [newAddress, setNewAddress] = useState({
    name: "",
    phone: "",
    pincode: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    country: "India",
  });

  useEffect(() => {
    setMounted(true);
    setUserId(localStorage.getItem("userId"));
  }, []);

  const handleCheckServiceability = async () => {
    const URL = DELIVERY_CHECK_PINCODE + `?pin=` + address.pincode;
    try {
      const res = await axios.get(URL, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const result = res.data.data.delivery_codes;
      if (result.length > 0) {
        setNotDeliverable(false);
        setMessage("")
      } else {
        setNotDeliverable(true);
        setMessage("Change Delivery Address")
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to check serviceability");
    }
  };

  useEffect(() => {
    if (address) {
      handleCheckServiceability();
    }
  }, [address]);

  // Fetch cart
  const { data: cart, isLoading } = useQuery({
    queryKey: ["cart", userId],
    queryFn: async () => {
      if (!userId) return null;
      const res = await cartAPI.get(userId);
      return res.data;
    },
    enabled: !!userId,
  });

  const { data: addresses, isLoading: isLoadingAddresses, refetch: refetchAddresses } = useQuery({
    queryKey: ["userAddresses", userId],
    queryFn: () => authAPI.getAllUserAddress().then(res => res.data.addresses),
    enabled: !!userId,
  });

  const isDisabled = () => {
    if (!address) {
      return true;
    }
    if (notDeliverable) {
      return true;
    }
    return false;
  };

  const addAddressMutation = useMutation({
    mutationFn: (addressData: any) => authAPI.addAddress(addressData),
    onSuccess: (data) => {
      refetchAddresses();
      setShowAddAddressForm(false);
      setNewAddress({
        name: "",
        phone: "",
        pincode: "",
        line1: "",
        line2: "",
        city: "",
        state: "",
        country: "India",
      });
      const newAddr = data.data.address;
      handleSelectAddress(newAddr);
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || "Failed to add address");
    },
  });

  const handleAddAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addAddressMutation.mutate(newAddress);
  };

  const handleSelectAddress = (address: any) => {
    setAddress(address);
  };

  const getCartRecomendation = async () => {
    if (!userId) return null;
    const res = await productAPI.getCartRecommended();
    return res.data;
  };

  useEffect(() => {
    if (cart) {
      getCartRecomendation()
        .then((data: any) => {
          useOrderStore.setState({ cartRecomendation: data });
        })
        .catch((error) => {
          console.error("Error fetching cart recommendations:", error);
        });
    }
  }, [cart]);

  const updateQuantityMutation = useMutation({
    mutationFn: async ({ variantId, action }: { variantId: string; action: "add" | "remove" }) => {
      if (!userId) throw new Error("Please login first");
      if (action === "add") {
        return cartAPI.add({ userId, variantId, quantity: 1 });
      } else {
        const item = cart.items.find((i: any) => (i.variant._id || i.variant) === variantId);
        if (item) {
          return cartAPI.remove({ userId, variantId, size: item.size });
        }
        // As a safeguard, we can throw an error or handle it gracefully.
        throw new Error("Attempted to remove an item that is not in the cart.");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart", userId] });
    },
  });

  const removeItemMutation = useMutation({
    mutationFn: async (variantId: string) => {
      if (!userId) throw new Error("Please login first");
      return cartAPI.delete({ userId, variantId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart", userId] });
    },
  });

  const addToWishlistMutation = useMutation({
    mutationFn: (productId: string) => wishlistAPI.add({ productId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
      toast.success("Added to wishlist!");
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || "Failed to move to wishlist");
    },
  });

  const handleMoveToWishlist = (item: any) => {
    if (!item.product?._id) {
      toast.success("Cannot move to wishlist: Product ID is missing.");
      return;
    }
    addToWishlistMutation.mutate(item.product._id, {
      onSuccess: () => {
        removeItemMutation.mutate(item.variant._id || item.variant);
      }
    });
  };

  const applyCouponMutation = useMutation({
    mutationFn: async () => {
      if (!userId || !cart) throw new Error("Cart not found");
      const items = cart.items.map((item: any) => ({ product: item.product, price: item.price, quantity: item.quantity }));
      const res = await couponAPI.validate({ code: coupon, userId, items });
      return res.data;
    },
    onSuccess: (data) => {
      setAppliedCoupon(data);
      alert(`Coupon applied! You saved ₹${data.discountAmount}`);
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || "Invalid coupon code");
    },
  });

  if (!mounted) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto p-4"><div className="flex justify-center items-center min-h-screen"><span className="loading loading-spinner loading-lg"></span></div></div>
        <Footer />
      </>
    );
  }

  if (!userId) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto p-4"><div className="alert alert-warning"><span>Please login to view your cart</span></div></div>
        <Footer />
      </>
    );
  }

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto p-4"><div className="flex justify-center items-center min-h-screen"><span className="loading loading-spinner loading-lg"></span></div></div>
        <Footer />
      </>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto p-4">
          <div className="text-center py-16">
            <h1 className="text-3xl font-bold mb-4">Your cart is empty</h1>
            <p className="text-gray-600 mb-8">Add some products to get started!</p>
            <button onClick={() => router.push("/products")} className="btn btn-primary">Continue Shopping</button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const subtotal = cart.items.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0);
  const discount = appliedCoupon?.discountAmount || 0;
  const total = subtotal - discount;

  return (
    <>
      <Navbar />
      <div className="container mx-auto p-4">
        <h1 className="text-xl lg:text-3xl font-bold mb-8">Shopping Cart</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {cart.items.map((item: any) => (
              <div key={item.variant._id || item.variant} className="card bg-base-100 shadow-2xl">
                <div className="px-1 h-[14vh]">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex gap-4 flex-1 cursor-pointer">
                      <img src={item.product?.coverImage} alt={item.title} onClick={() => router.push(`/products/${item.product._id}`)} className="w-20 h-30 object-cover rounded" />
                      <div className="flex-1">
                        <h3 className="font-bold text-sm sm:text-lg" onClick={() => router.push(`/products/${item.product._id}`)}>{item.title}</h3>
                        <p className="text-sm text-gray-600">Color: {item.color} | Size: {item.size}</p>
                        <div className="flex flex-col justify-between">
                          <p className="text-xs font-semibold mt-2">₹{item.price}</p>
                          <div className="flex justify-between items-center w-full gap-2 sm:w-auto sm:flex-col sm:items-end sm:justify-between">
                            <div className="flex items-center md:gap-2 lg:gap-2">
                              <button onClick={() => updateQuantityMutation.mutate({ variantId: item.variant._id || item.variant, action: "remove" })} disabled={item.quantity <= 1} className="btn btn-xs btn-outline">-</button>
                              <span className="w-8 text-center">{item.quantity}</span>
                              <button onClick={() => updateQuantityMutation.mutate({ variantId: item.variant._id || item.variant, action: "add" })} className="btn btn-xs btn-outline">+</button>
                            </div>
                            <div>
                              <select name="size" id="size" className="select select-sm lg:select-md rounded-md lg:w-[16vw] p-2 select-bordered">
                                {item.product.availableSizes && item.product.availableSizes.length > 0 &&
                                  item.product.availableSizes.map((variant: any, index: number) => (
                                    <option key={index} value={variant} className={`text-xs md:text-lg lg:text-lg ${variant === item.size ? "selected" : ""}`}>{variant}</option>
                                  ))}
                              </select>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 justify-around">
                  <button onClick={() => removeItemMutation.mutate(item.variant._id || item.variant)} className="btn btn-border text-center">Remove</button>
                  <button
                    onClick={() => handleMoveToWishlist(item)}
                    className="btn btn-border text-center" >
                    Move to Wishlist
                  </button>
                </div>
              </div>
            ))}
            <CartRecomendations cartRecomendation={cartRecomendation} />
          </div>

          <div className="lg:col-span-1">
            <div className="card bg-base-200 sticky top-20">
              <div className="p-3">
                <h2 className="card-title mb-4">Order Summary</h2>

                <div className="bg-base-100 border-base-300 collapse border">
                  <input type="checkbox" className="peer" />
                  <div className="collapse-title flex flex-row justify-between peer-checked:[&>p:last-child]:rotate-180"><p>Shipping Address</p><p className="transition-transform duration-300"><FaCaretDown /></p></div>
                  <div className="collapse-content">
                    {isLoadingAddresses ? (
                      <p>Loading addresses...</p>
                    ) : (
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {addresses && addresses.map((addr: any, index: number) => (
                          <>
                            <div key={addr.index} className={`border p-2 rounded-md cursor-pointer ${address === addr ? !notDeliverable ? 'border-primary' : 'border-error' : 'border-dashed border-neutral'}`} onClick={() => handleSelectAddress(addr)}>
                              {message && address == addr && (<p className="text-error">{message}</p>)}
                              <p className="font-semibold">{addr.name}</p>
                              <p>{addr.line1}</p>
                              <p>{addr.city}, {addr.state} {addr.pincode}</p>
                            </div>
                          </>
                        ))}
                      </div>
                    )}
                    <button className="btn btn-primary btn-dash w-full mt-2" onClick={() => (document.getElementById('my_modal_5') as HTMLDialogElement)?.showModal()}>+ Add New Address</button>
                    <dialog id="my_modal_5" className="modal modal-bottom sm:modal-middle">
                      <div className="modal-box">
                        <h3 className="font-bold text-lg">Add New Address</h3>
                        <div className="modal-action">
                          <form onSubmit={handleAddAddressSubmit} className="space-y-2">
                            <input type="text" placeholder="Full Name" className="input input-bordered w-full" value={newAddress.name} onChange={e => setNewAddress({ ...newAddress, name: e.target.value })} required />
                            <input type="text" placeholder="Phone" className="input input-bordered w-full" value={newAddress.phone} onChange={e => setNewAddress({ ...newAddress, phone: e.target.value })} required />
                            <input type="text" placeholder="Address Line 1" className="input input-bordered w-full" value={newAddress.line1} onChange={e => setNewAddress({ ...newAddress, line1: e.target.value })} required />
                            <input type="text" placeholder="Address Line 2" className="input input-bordered w-full" value={newAddress.line2} onChange={e => setNewAddress({ ...newAddress, line2: e.target.value })} />
                            <input type="text" placeholder="Pincode" className="input input-bordered w-full" value={newAddress.pincode} onChange={e => setNewAddress({ ...newAddress, pincode: e.target.value })} required />
                            <input type="text" placeholder="City" className="input input-bordered w-full" value={newAddress.city} onChange={e => setNewAddress({ ...newAddress, city: e.target.value })} required />
                            <input type="text" placeholder="State" className="input input-bordered w-full" value={newAddress.state} onChange={e => setNewAddress({ ...newAddress, state: e.target.value })} required />
                            <div className="flex gap-2">
                              <button type="button" className="btn" onClick={() => (document.getElementById('my_modal_5') as HTMLDialogElement)?.close()}>Close</button>
                              <button type="submit" className="btn btn-primary" disabled={addAddressMutation.isPending}>Save</button>
                            </div>
                          </form>
                        </div>
                      </div>
                    </dialog>
                  </div>
                </div>

                {showAddAddressForm && (
                  <div className="mt-4">
                    <form onSubmit={handleAddAddressSubmit} className="space-y-2">
                      <input type="text" placeholder="Full Name" className="input input-bordered w-full" value={newAddress.name} onChange={e => setNewAddress({ ...newAddress, name: e.target.value })} required />
                      <input type="text" placeholder="Phone" className="input input-bordered w-full" value={newAddress.phone} onChange={e => setNewAddress({ ...newAddress, phone: e.target.value })} required />
                      <input type="text" placeholder="Address Line 1" className="input input-bordered w-full" value={newAddress.line1} onChange={e => setNewAddress({ ...newAddress, line1: e.target.value })} required />
                      <input type="text" placeholder="Address Line 2" className="input input-bordered w-full" value={newAddress.line2} onChange={e => setNewAddress({ ...newAddress, line2: e.target.value })} />
                      <input type="text" placeholder="Pincode" className="input input-bordered w-full" value={newAddress.pincode} onChange={e => setNewAddress({ ...newAddress, pincode: e.target.value })} required />
                      <input type="text" placeholder="City" className="input input-bordered w-full" value={newAddress.city} onChange={e => setNewAddress({ ...newAddress, city: e.target.value })} required />
                      <input type="text" placeholder="State" className="input input-bordered w-full" value={newAddress.state} onChange={e => setNewAddress({ ...newAddress, state: e.target.value })} required />
                      <div className="flex gap-2">
                        <button type="submit" className="btn btn-primary" disabled={addAddressMutation.isPending}>Save</button>
                      </div>
                    </form>
                  </div>
                )}

                <div className="divider"></div>

                <div className="collapse border">
                  <input type="checkbox" className="peer" />
                  <div className="collapse-title flex flex-row justify-between items-center cursor-pointer font-semibold peer-checked:[&>p:last-child]:rotate-180"><p>Have a coupon?</p><p className="transition-transform duration-300"><FaCaretDown /></p></div>
                  <div className="collapse-content">
                    <div className="join">
                      <input type="text" placeholder="Enter coupon code" className="input input-bordered join-item flex-1" value={coupon} onChange={(e) => setCoupon(e.target.value.toUpperCase())} />
                      <button onClick={() => applyCouponMutation.mutate()} disabled={!coupon || applyCouponMutation.isPending} className="btn join-item btn-primary">Apply</button>
                    </div>
                    {appliedCoupon && (<label className="label"><span className="label-text-alt text-success">✓ Coupon applied: {appliedCoupon.coupon.code}</span></label>)}
                  </div>
                </div>

                <div className="divider"></div>

                <div className="space-y-2">
                  <div className="flex justify-between"><span>Subtotal</span><span>₹{subtotal.toFixed(2)}</span></div>
                  {discount > 0 && (<div className="flex justify-between text-success"><span>Discount</span><span>-₹{discount.toFixed(2)}</span></div>)}
                  <div className="divider"></div>
                  <div className="flex justify-between text-xl font-bold"><span>Total</span><span>₹{total.toFixed(2)}</span></div>
                </div>

                <button onClick={() => router.push("/checkout")} className="btn hidden sm:block btn-primary w-full mt-6" disabled={isDisabled()}>
                  Proceed to Checkout
                </button>

                <button onClick={() => router.push("/products")} className="btn hidden sm:block btn-outline w-full mt-2">Continue Shopping</button>
              </div>
            </div>
          </div>
        </div>
        <div className="flex bg-base-100 fixed bottom-5 left-1/2 -translate-x-1/2 p-4 w-full align-middle justify-evenly items-center flex-row gap-2">
          <div className="flex justify-between text-sm font-bold">₹{total.toFixed(2)}</div>
          <button onClick={() => router.push("/checkout")} className="btn btn-primary" disabled={!address}>
            Proceed to Checkout
          </button>
        </div>
      </div>
      <Footer />
    </>
  );
}