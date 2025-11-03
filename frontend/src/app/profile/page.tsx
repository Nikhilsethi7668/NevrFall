"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { authAPI, wishlistAPI, cartAPI, productAPI, addressAPI } from "@/services/api";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import secureLocalStorage from "react-secure-storage";
import { useProfileStore } from "../store/useProfileStore";
import { IoPerson } from "react-icons/io5";
import { BsBagHeartFill } from "react-icons/bs";
import { FaBox } from "react-icons/fa6";
import { LuBadgeIndianRupee } from "react-icons/lu";
import { FaStar } from "react-icons/fa6";
import { FaAngleLeft } from "react-icons/fa6";
import { FaChevronRight } from "react-icons/fa";
import AddressForm from "../components/AddressForm";


export default function ProfilePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { activeTab, setActiveTab } = useProfileStore();
  const [isEditing, setIsEditing] = useState(false);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [mounted, setMounted] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    setUserId(localStorage.getItem("userId"));
  }, []);

  // Fetch user profile
  const { data: user, isLoading } = useQuery({
    queryKey: ["user", userId],
    queryFn: async () => {
      if (!userId) return null;
      const res = await authAPI.me();
      return res.data;
    },
    enabled: !!userId,
  });

  // Fetch addresses
  const { data: addressesData } = useQuery({
    queryKey: ["addresses"],
    queryFn: async () => {
      const res = await addressAPI.get();
      return res.data;
    },
  });

  // Fetch wishlist
  const { data: wishlistData } = useQuery({
    queryKey: ["wishlist"],
    queryFn: async () => {
      const res = await wishlistAPI.get();
      return res.data;
    },
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      // This would need to be implemented in the backend
      return Promise.resolve({ data: { ...user, ...data } });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
      setIsEditing(false);
      alert("Profile updated successfully");
    },
  });

  const addAddressMutation = useMutation({
    mutationFn: async (data: any) => {
      return addressAPI.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
      setIsAddingAddress(false);
    },
  });

  const makeDefaultAddressMutation = useMutation({
    mutationFn: async (id: string) => {
      return addressAPI.makeDefault(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
    },
  });

  // Remove from wishlist mutation
  const removeFromWishlistMutation = useMutation({
    mutationFn: async (productId: string) => {
      return wishlistAPI.remove({ productId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
    },
  });

  const addToCartMutation = useMutation({
    mutationFn: (variantId: string) => {
      if (!userId) throw new Error("User not logged in");
      return cartAPI.add({ userId, variantId, quantity: 1 });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      alert("Added to cart!");
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || "Failed to add to cart");
    },
  });

  const handleAddToCartAndRemoveFromWishlist = async (item: any) => {
    try {
      const productDetails = await productAPI.getDetails(item.product._id);
      const variants = productDetails.data.product.variants;

      if (variants && variants.length === 1) {
        const variantId = variants[0]._id;
        addToCartMutation.mutate(variantId, {
          onSuccess: () => {
            removeFromWishlistMutation.mutate(item.product._id);
          }
        });
      } else {
        router.push(`/products/${item.product._id}`);
      }
    } catch (error) {
      console.error("Error fetching product details:", error);
      router.push(`/products/${item.product._id}`);
    }
  };

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
      });
    }
  }, [user]);

  if (!mounted) {
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

  if (!userId) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto p-4">
          <div className="alert alert-warning">
            <span>Please login to view your profile</span>
          </div>
        </div>
        <Footer />
      </>
    );
  }

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

  const handleSaveProfile = () => {
    updateProfileMutation.mutate(profileData);
  };

  const handleLogout = async () => {
    try {
      await authAPI.logout();
      secureLocalStorage.removeItem("auth_token");
      localStorage.removeItem("userId");
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <>
      <Navbar />
      <div className="container mx-auto p-4">
        <div className="hidden sm:block flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">My Profile</h1>
          <button onClick={handleLogout} className="btn btn-error">
            Logout
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="hidden sm:block lg:col-span-1">
            <div className="card bg-base-200">
              <div className="card-body">
                <ul className="menu">
                  <li>
                    <button
                      onClick={() => setActiveTab("overview")}
                      className={`btn btn-ghost justify-start ${
                        activeTab === "overview" ? "btn-active" : ""
                      }`}
                    >
                      Overview
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => setActiveTab("profile")}
                      className={`btn btn-ghost justify-start ${
                        activeTab === "profile" ? "btn-active" : ""
                      }`}
                    >
                      Profile
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => setActiveTab("address")}
                      className={`btn btn-ghost justify-start ${
                        activeTab === "address" ? "btn-active" : ""
                      }`}
                    >
                      Address
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => setActiveTab("wishlist")}
                      className={`btn btn-ghost justify-start ${
                        activeTab === "wishlist" ? "btn-active" : ""
                      }`}
                    >
                      Wishlist
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => setActiveTab("orders")}
                      className={`btn btn-ghost justify-start ${
                        activeTab === "orders" ? "btn-active" : ""
                      }`}
                    >
                      Orders
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => setActiveTab("refunds")}
                      className={`btn btn-ghost justify-start ${
                        activeTab === "refunds" ? "btn-active" : ""
                      }`}
                    >
                      Refunds
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => setActiveTab("reviews")}
                      className={`btn btn-ghost justify-start ${
                        activeTab === "reviews" ? "btn-active" : ""
                      }`}
                    >
                      Ratings & Reviews
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => setActiveTab("wallet")}
                      className={`btn btn-ghost justify-start ${
                        activeTab === "wallet" ? "btn-active" : ""
                      }`}
                    >
                      Wallet
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            { activeTab !== "" && <span><FaAngleLeft onClick={() => setActiveTab('')} size={20} className="lg:hidden mr-2 mb-2"/></span>}
            {activeTab === "overview" && (
              <div className="card bg-base-100 shadow">
                <div className="card-body">
                  <h2 className="card-title mb-6">Overview</h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div onClick={() => setActiveTab('profile')} className="card bg-base-200 justify-center py-6 gap-2 cursor-pointer text-center items-center hover:scale-105 hover:bg-base-300">
                      <IoPerson size={30}/>
                      <p>Manage Your Profile</p>
                    </div>
                    <div onClick={() => setActiveTab('wishlist')} className="card bg-base-200 justify-center py-6 gap-2 cursor-pointer text-center items-center hover:scale-105 hover:bg-base-300">
                      <BsBagHeartFill size={30}/>
                      <p>Check Your Wishlist</p>
                    </div>
                    <div onClick={() => setActiveTab('orders')} className="card bg-base-200 justify-center py-6 gap-2 cursor-pointer text-center items-center hover:scale-105 hover:bg-base-300">
                      <FaBox size={30}/>
                      <p>Track and manage your orders</p>
                    </div>
                    <div onClick={() => setActiveTab('refunds')} className="card bg-base-200 justify-center py-6 gap-2 cursor-pointer text-center items-center hover:scale-105 hover:bg-base-300">
                      <LuBadgeIndianRupee size={30}/>
                      <p>Track your refunds</p>
                    </div>
                    <div onClick={() => setActiveTab('reviews')} className="card bg-base-200 justify-center py-6 gap-2 cursor-pointer text-center items-center hover:scale-105 hover:bg-base-300">
                      <FaStar size={30}/>
                      <p>Manage Your reviews</p>
                    </div>
                    <div onClick={() => setActiveTab('wallet')} className="card bg-base-200 justify-center py-6 gap-2 cursor-pointer text-center items-center hover:scale-105 hover:bg-base-300">
                      <FaStar size={30}/>
                      <p>Amount in your wallet</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "profile" && (
              <div className="card bg-base-100 shadow">
                <div className="card-body">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="card-title">Profile Information</h2>
                    <button
                      onClick={() => setIsEditing(!isEditing)}
                      className="btn btn-outline"
                    >
                      {isEditing ? "Cancel" : "Edit"}
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Name</span>
                      </label>
                      <input
                        type="text"
                        className="input input-bordered"
                        value={profileData.name}
                        onChange={(e) =>
                          setProfileData({ ...profileData, name: e.target.value })
                        }
                        disabled={!isEditing}
                      />
                    </div>

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Email</span>
                      </label>
                      <input
                        type="email"
                        className="input input-bordered"
                        value={profileData.email}
                        onChange={(e) =>
                          setProfileData({ ...profileData, email: e.target.value })
                        }
                        disabled={!isEditing}
                      />
                    </div>

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Phone</span>
                      </label>
                      <input
                        type="tel"
                        className="input input-bordered"
                        value={profileData.phone}
                        onChange={(e) =>
                          setProfileData({ ...profileData, phone: e.target.value })
                        }
                        disabled={!isEditing}
                      />
                    </div>

                    {isEditing && (
                      <div className="flex gap-2">
                        <button
                          onClick={handleSaveProfile}
                          disabled={updateProfileMutation.isPending}
                          className="btn btn-primary"
                        >
                          {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                        </button>
                        <button
                          onClick={() => setIsEditing(false)}
                          className="btn btn-outline"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "address" && (
              <div className="card bg-base-100 shadow">
                <div className="card-body">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="card-title">My Addresses</h2>
                    <button
                      onClick={() => setIsAddingAddress(true)}
                      className="btn btn-primary"
                    >
                      Add Address
                    </button>
                  </div>

                  {isAddingAddress && (
                    <AddressForm
                      onSave={(data) => addAddressMutation.mutate(data)}
                      onCancel={() => setIsAddingAddress(false)}
                    />
                  )}

                  <div className="space-y-4">
                    {addressesData?.map((address: any) => (
                      <div key={address._id} className="card bg-base-200">
                        <div className="card-body">
                          <p>{address.street}</p>
                          <p>
                            {address.city}, {address.state} {address.zip}
                          </p>
                          <p>{address.country}</p>
                          <div className="card-actions justify-end">
                            {!address.isDefault && (
                              <button
                                onClick={() =>
                                  makeDefaultAddressMutation.mutate(address._id)
                                }
                                className="btn btn-xs btn-outline"
                              >
                                Make Default
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "wishlist" && (
              <div className="card bg-base-100 shadow">
                  <h2 className="card-title mb-6">My Wishlist</h2>
                  {!wishlistData || wishlistData.items?.length === 0 ? (
                    <div className="text-center py-8">
                      <h3 className="text-lg font-semibold mb-2">Your wishlist is empty</h3>
                      <p className="text-gray-600 mb-4">
                        Add some products to your wishlist to see them here
                      </p>
                      <button
                        onClick={() => router.push("/products")}
                        className="btn btn-primary"
                      >
                        Browse Products
                      </button>
                    </div>
                  ) : (
                <div className="lg:col-span-2 space-y-4">
                  {wishlistData.items.map((item: any) => (
                    <div key={item._id} className="card bg-base-100 shadow-2xl">
                      <div className="card-body h-[16vh]">
                        <div className="flex flex-col sm:flex-row gap-4">
                          <div className="flex gap-4 flex-1 cursor-pointer">
                            <img src={item.product?.coverImage} alt={item.product?.title} onClick={() => router.push(`/products/${item.product._id}`)} className="w-24 h-24 object-cover rounded" />
                            <div className="flex flex-col justify-between align-middle">
                              <h3 className="font-bold text-sm align-middle sm:text-lg" onClick={() => router.push(`/products/${item.product._id}`)}>{item.product?.title}</h3>
                              <p className="text-xs align-middle font-semibold mt-2">₹{item.product?.priceFrom}</p>
                              <p className="text-xs align-middle font-semibold mt-2">{item.product?.category ? "item.product?.category" : "No Category"}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 justify-around">
                        <button onClick={() => removeFromWishlistMutation.mutate(item.product._id)} className="btn btn-border text-center">Remove</button>
                        <button onClick={() => handleAddToCartAndRemoveFromWishlist(item)} className="btn btn-border text-center">ADD TO CART</button>
                      </div>
                    </div>
                  ))}
                </div>
                )}
            </div>)}

            {activeTab === "orders" && (
              <div className="card bg-base-100 shadow">
                <div className="card-body">
                  <h2 className="card-title mb-6">Recent Orders</h2>
                  <p className="text-gray-600 mb-4">
                    View and manage your orders
                  </p>
                  <button
                    onClick={() => router.push("/orders")}
                    className="btn btn-primary"
                  >
                    View All Orders
                  </button>
                </div>
              </div>
            )}

            {activeTab === "refunds" && (
              <div className="card bg-base-100 shadow">
                <div className="card-body">
                  <h2 className="card-title mb-6">Refunds</h2>
                  <p className="text-gray-600 mb-4">
                    View and track your refunds.
                  </p>
                  <button
                    onClick={() => router.push("/returns")}
                    className="btn btn-primary"
                  >
                    View Refunds
                  </button>
                </div>
              </div>
            )}

            {activeTab === "reviews" && (
              <div className="card bg-base-100 shadow">
                <div className="card-body">
                  <h2 className="card-title mb-6">Your Reviews</h2>
                  <p className="text-gray-600 mb-4">
                    Here you can see and manage your product reviews.
                  </p>
                  {/* Placeholder for reviews list */}
                  <div className="text-center py-8">
                    <h3 className="text-lg font-semibold mb-2">No reviews yet</h3>
                    <p className="text-gray-600 mb-4">
                      You haven't written any reviews yet.
                    </p>
                    <button
                      onClick={() => router.push("/orders")}
                      className="btn btn-primary"
                    >
                      Review Products from Past Orders
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "wallet" && (
              <div className="card bg-base-100 shadow">
                <div className="card-body">
                  <h2 className="card-title mb-6">Wallet</h2>
                  <p className="text-gray-600 mb-4">
                    Your wallet amount is : ₹0.00
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Sidebar */}
      {activeTab === "" && <div className="md:hidden lg:hidden">
        <ul>
          <li onClick={() => setActiveTab("profile")} className="flex flex-row justify-between rounded p-2 items-center mb-2">
            <button
              className='btn btn-ghost justify-start'
            >
              Profile
            </button>
            <FaChevronRight className='mr-2' />
          </li>
          <li onClick={() => setActiveTab("address")} className="flex flex-row justify-between rounded p-2 items-center mb-2">
            <button
              className='btn btn-ghost justify-start'
            >
              Address
            </button>
            <FaChevronRight className='mr-2' />
          </li>
          <li onClick={() => setActiveTab("wishlist")} className="flex flex-row justify-between rounded p-2 items-center mb-2">
            <button
              className='btn btn-ghost justify-start'
            >
              Wishlist
            </button>
            <FaChevronRight className='mr-2' />
          </li>
          <li onClick={() => setActiveTab("orders")} className="flex flex-row justify-between rounded p-2 items-center mb-2">
            <button
              className='btn btn-ghost justify-start'
            >
              Orders
            </button>
            <FaChevronRight className='mr-2' />
          </li>
          <li onClick={() => setActiveTab("refunds")} className="flex flex-row justify-between rounded p-2 items-center mb-2">
            <button
              className='btn btn-ghost justify-start'
            >
              Refunds
            </button>
            <FaChevronRight className='mr-2' />
          </li>
          <li onClick={() => setActiveTab("reviews")} className="flex flex-row justify-between rounded p-2 items-center mb-2">
            <button
              className='btn btn-ghost justify-start'
            >
              Ratings & Reviews
            </button>
            <FaChevronRight className='mr-2' />
          </li>
          <li onClick={() => setActiveTab("wallet")} className="flex flex-row justify-between rounded p-2 items-center mb-2">
            <button
              className='btn btn-ghost justify-start'
            >
              Wallet
            </button>
            <FaChevronRight className='mr-2' />
          </li>
        </ul>
      </div>}

      <Footer />
    </>
  );
}
