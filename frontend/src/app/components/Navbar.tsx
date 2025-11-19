'use client';
import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { cartAPI, authAPI, productAPI } from '@/services/api';
import LoginDialog from "./LoginDialog";
import secureLocalStorage from 'react-secure-storage';
import { IoMoonSharp, IoSunny } from "react-icons/io5";
import { FaOpencart } from "react-icons/fa";
import { BsBagHeartFill } from "react-icons/bs";
import { useProfileStore } from '../store/useProfileStore';
import { CiMenuBurger } from "react-icons/ci";
import { IoSearchSharp } from "react-icons/io5";
import { useCategoryStore } from '../store/useCategoryStore';

const Navbar = () => {
  const { categories, fetchCategories } = useCategoryStore();
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { activeTab, setActiveTab } = useProfileStore();
  const [user, setUser] = useState<any>(null);
  const [mounted, setMounted] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const { data: collectionsData } = useQuery({
    queryKey: ['collections'],
    queryFn: async () => {
      const res = await productAPI.getAllCollections();
      return res.data;
    },
  });
  const collections = collectionsData?.data || [];

  const handleCategoryClick = (categoryName: string) => {
    router.push(`/products?categories=${categoryName}`);
  };

  const handleCollectionClick = (slugOrName: string) => {
    router.push(`/products?collections=${slugOrName}`);
  };

  // Check if user is logged in
  useEffect(() => {
    setMounted(true);
    const token = secureLocalStorage.getItem('auth_token');
    const userId = localStorage.getItem('userId');
    const storedUserName = localStorage.getItem('userName');
    if (token && userId) {
      setIsLoggedIn(true);
      setUserName(storedUserName);
    }
  }, []);

  // Fetch user data
  const { data: userData } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const res = await authAPI.me();
      return res.data;
    },
    enabled: isLoggedIn,
  });

  // Fetch cart count
  const { data: cartData } = useQuery({
    queryKey: ['cart-count'],
    queryFn: async () => {
      const userId = localStorage.getItem('userId');
      if (!userId) return { count: 0 };
      const res = await cartAPI.get(userId);
      return { count: res.data?.items?.length || 0 };
    },
    enabled: isLoggedIn,
  });

  const handleLogout = async () => {
    try {
      await authAPI.logout();
      secureLocalStorage.removeItem('auth_token');
      localStorage.removeItem('userId');
      localStorage.removeItem('userName');
      setIsLoggedIn(false);
      setUser(null);
      setUserName(null);
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const closeDrawer = () => {
    const drawer = document.getElementById('my-drawer-1') as HTMLInputElement | null;
    if (drawer) {
      drawer.checked = false;
    }
  };

  return (
    <>
      <div className="navbar bg-base-100/40 shadow-sm sticky top-0 z-10 backdrop-blur-md">
        <div className="navbar-start">
          <div className="drawer md:hidden lg:hidden">
            <input id="my-drawer-1" type="checkbox" className="drawer-toggle" />
            <div className="drawer-content">
              <label htmlFor="my-drawer-1" className="btn-ghost font-semibold drawer-button"><CiMenuBurger /></label>
            </div>
            <div className="drawer-side">
              <label htmlFor="my-drawer-1" aria-label="close sidebar" className="drawer-overlay"></label>
              <div className="menu bg-base-200 min-h-full w-64 p-1 flex flex-col justify-between overflow-y-auto">
                <div>
                  {isLoggedIn ? (
                    <div className="flex items-center gap-2 rounded-xl px-3 py-2 mb-4">
                      <div className="relative h-10 w-10">
                        <div className="h-full w-full rounded-full bg-primary flex items-center justify-center text-white object-cover">{userName?.charAt(0)?.toUpperCase()}</div>
                        <span className="absolute bottom-0 right-0 block h-3.5 w-3.5 rounded-full border-2 border-white bg-green-500"></span>
                      </div>
                      <span className="text-sm font-medium text-base-content">
                        {userName}
                      </span>
                    </div>
                  ) : (
                    <div className="ml-4 mb-4" onClick={closeDrawer}>
                      <LoginDialog open={open} setOpen={setOpen} />
                    </div>
                  )}

                  <ul className="space-y-2">
                    <li>
                      <h1 className='text-center font-semibold text-xl my-2'>Categories</h1>
                      <div className="grid grid-cols-3 gap-2">
                        {categories.map((category) => (
                          <div
                            key={category._id}
                            className="flex flex-col items-center justify-center text-center cursor-pointer"
                            onClick={() => { handleCategoryClick(category.name); closeDrawer(); }}
                          >
                            <img
                              src={category.image}
                              alt={category.name}
                              className="h-20 w-20 object-fill rounded-md"
                            />
                            <h3 className='py-1 px-2 text-sm'>
                              {category.name}
                            </h3>
                          </div>
                        ))}
                      </div>
                    </li>
                    <li>
                      <h1 className='text-center font-semibold text-xl my-2'>Collections</h1>
                      <div className="grid grid-cols-3 gap-2">
                        {collections.map((collection: any) => (
                          <div
                            key={collection._id}
                            className="flex flex-col items-center justify-center text-center cursor-pointer"
                            onClick={() => { handleCollectionClick(collection.slug || collection.name); closeDrawer(); }}
                          >
                            <img
                              src={collection.image}
                              alt={collection.name}
                              className="h-20 w-20 object-fill rounded-md"
                            />
                            <h3 className='py-1 px-2 text-sm'>
                              {collection.name}
                            </h3>
                          </div>
                        ))}
                      </div>
                    </li>
                    <li><Link href='/products' onClick={closeDrawer} className="text-lg">Products</Link></li>
                    <li><Link href='/contact' onClick={closeDrawer} className="text-lg">Contact</Link></li>
                    {isLoggedIn && (
                      <>
                        <li>
                          <Link
                            href="/profile"
                            onClick={() => {
                              setActiveTab("");
                              closeDrawer();
                            }}
                            className="rounded-lg hover:bg-base-200 transition text-lg"
                          >
                            My Profile
                          </Link>
                        </li>
                        <li>
                          <Link
                            href="/orders"
                            onClick={() => {
                              setActiveTab("orders");
                              closeDrawer();
                            }}
                            className="rounded-lg hover:bg-base-200 transition text-lg"
                          >
                            My Orders
                          </Link>
                        </li>
                        <li>
                          <Link
                            href="/returns"
                            onClick={() => {
                              setActiveTab("returns");
                              closeDrawer();
                            }}
                            className="rounded-lg hover:bg-base-200 transition text-lg"
                          >
                            My Returns
                          </Link>
                        </li>
                      </>
                    )}
                  </ul>
                </div>

                <div className="space-y-2">
                  {mounted && (
                    <button className="btn btn-ghost w-full" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
                      {theme === 'light' ? <IoMoonSharp size={22} /> : <IoSunny size={22} />}
                      <span className="ml-2">{theme === 'light' ? 'Dark' : 'Light'} Mode</span>
                    </button>
                  )}
                  {isLoggedIn && (
                    <button onClick={() => {
                      handleLogout();
                      closeDrawer();
                    }} className="btn btn-error w-full">
                      Logout
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
          <Link href="/" className="btn btn-ghost text-lg sm:text-xl">NeverFall</Link>
        </div>

        <div className="navbar-center hidden sm:flex">
          <ul className="menu menu-horizontal px-1">
            <li><Link href='/products'>Products</Link></li>
            <li><Link href='/contact'>Contact</Link></li>
          </ul>
        </div>

        <div className="navbar-end gap-4">

          <button className="btn btn-ghost btn-circle" onClick={() => router.push('/search')}>
            <IoSearchSharp size={22} />
          </button>

          {mounted && (
            <button className="btn hidden sm:block btn-ghost btn-circle" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
              {theme === 'light' ? (
                <IoMoonSharp size={22} />
              ) : (
                <IoSunny size={22} />
              )}
            </button>
          )}

          <button
            className="btn btn-ghost btn-circle"
            onClick={() => router.push('/cart')}
          >
            <div className="indicator">
              <FaOpencart size={22} />
              {cartData && cartData.count > 0 && (
                <span className="badge badge-xs badge-primary indicator-item">
                  {cartData.count}
                </span>
              )}
            </div>
          </button>

          <button
            className="btn btn-ghost btn-circle"
            onClick={() => { setActiveTab('wishlist'); router.push('/profile'); }}
          >
            <BsBagHeartFill size={22} />
          </button>

          {isLoggedIn ? (
            <div className="dropdown dropdown-end hidden sm:block">
              <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
                <div className="w-10 rounded-full">
                  <div className="bg-primary text-primary-content rounded-full w-10 h-10 flex items-center justify-center">
                    {userName?.charAt(0)?.toUpperCase()}
                  </div>
                </div>
              </div>
              <ul
                tabIndex={0}
                className="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow"
              >
                <li><Link href="/profile">My Profile</Link></li>
                <li><Link href="/orders">My Orders</Link></li>
                <li><Link href="/returns">My Returns</Link></li>
                <li><button onClick={handleLogout}>Logout</button></li>
              </ul>
            </div>
          ) : (
            <div className="ml-4 hidden sm:block">
              <LoginDialog open={open} setOpen={setOpen} />
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default Navbar