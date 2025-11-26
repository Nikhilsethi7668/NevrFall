'use client';
import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { useQuery } from '@tanstack/react-query';
import { useRouter, usePathname } from 'next/navigation';
import { cartAPI, authAPI, productAPI } from '@/services/api';
import LoginDialog from "./LoginDialog";
import secureLocalStorage from 'react-secure-storage';
import { IoMoonSharp, IoSunny, IoClose } from "react-icons/io5";
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
  const [openCollection, setOpenCollection] = useState(false);
  const [openCategories, setOpenCategories] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [sidebar, setSidebar] = useState(false);
  const pathname = usePathname();

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

  useEffect(() => {
    const handleScroll = () => {
      const isNotHome = pathname !== '/';
      if (isNotHome || window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    handleScroll();

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [pathname]);

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
      <div className={`grid grid-cols-3 w-full py-2 ${isScrolled ? 'bg-base-100 shadow sticky text-black' : "fixed text-white" } top-0 z-20`}>
        <div className="navbar-start gap-7">
          <div>
          <label onClick={() => setSidebar(!sidebar)} className="btn-ghost font-semibold"><CiMenuBurger  size={20} className='ml-2' /></label>
          {sidebar && (
            <>
              <div
                className="fixed inset-0 bg-opacity-50 backdrop-blur-md z-40 transition-opacity duration-300 ease-in-out"
                onClick={() => setSidebar(false)}
              ></div>
              <div
                className={`fixed inset-y-0 left-0 w-full md:w-[600px] lg:w-[600px] bg-base-100 text-black p-4 z-50 flex flex-col transform transition-transform duration-300 ease-in-out ${
                  sidebar ? "translate-x-0" : "-translate-x-full"
                }`}
              >
                <div className="flex justify-between items-center mb-6">
                  <Link href="/" className="drawer__logo">
                    <span className="text-2xl font-bold">NevrFall</span>
                  </Link>
                  <button onClick={() => setSidebar(false)} className="btn btn-ghost btn-circle">
                    <IoClose size={24} />
                  </button>
                </div>

                <ul className="space-y-2">
                  {collections.map((collection: any) => (
                    <li key={collection._id}>
                      <Link href={`/products?collections=${collection.slug || collection.name}`} onClick={closeDrawer} className="uppercase text-[10px] text-gray-500 tracking-widest font-semibold">
                        {collection.name}
                      </Link>
                    </li>
                  ))}

                  <li>
                    <button onClick={() => setOpenCategories(!openCategories)} className="flex flex-row mobile-navlink text-[10px] text-gray-500 tracking-widest font-semibold w-full text-left justify-between items-center">
                      <span className='text-red-800'>SHOP BY CATEGORY</span>
                      <span className='text-2xl font-light'>{openCategories ? '-' : '+'}</span>
                    </button>
                    {openCategories && (
                      <ul className="pl-4 my-2">
                        {categories.map((category) => (
                          <li key={category._id}>
                            <a
                              className="cursor-pointer mobile-navlink uppercase text-[10px] text-gray-500 tracking-widest font-semibold"
                              onClick={() => { handleCategoryClick(category.name); closeDrawer(); }}
                            >
                              {category.name}
                            </a>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>

                  <li><Link href="/contact" onClick={closeDrawer} className="mobile-navlink text-[10px] text-gray-500 tracking-widest font-semibold">CONTACT US</Link></li>
                  <li><Link href="/products" onClick={closeDrawer} className="mobile-navlink text-[10px] text-gray-500 tracking-widest font-semibold">ALL PRODUCTS</Link></li>
                  <li><Link href="/return" onClick={closeDrawer} className="mobile-navlink text-[10px] text-gray-500 tracking-widest font-semibold">EXCHANGE</Link></li>
                </ul>

                <div className="flex flex-col gap-4 pt-2 border-t-2 border-gray-600 mt-20">
                  {isLoggedIn && (
                      <ul className="flex flex-row justify-between items-center mb-4">
                        <li>
                          <Link href="/profile" onClick={() => { setActiveTab(""); closeDrawer(); }} className="mobile-navlink text-[10px] text-gray-500 tracking-widest">
                            My Profile
                          </Link>
                        </li>
                        <li>
                          <Link href="/orders" onClick={() => { setActiveTab("orders"); closeDrawer(); }} className="mobile-navlink text-[10px] text-gray-500 tracking-widest">
                            My Orders
                          </Link>
                        </li>
                        <li>
                          <Link href="/returns" onClick={() => { setActiveTab("returns"); closeDrawer(); }} className="mobile-navlink text-[10px] text-gray-500 tracking-widest">
                            My Returns
                          </Link>
                        </li>
                      </ul>
                  )}

                  <Link href="/profile" onClick={() => { setActiveTab(""); closeDrawer(); }} className="mobile-navlink text-[10px] text-gray-500 font-bold tracking-widest">
                    My Account
                  </Link>

                  {isLoggedIn ? (
                    <button onClick={() => { handleLogout(); closeDrawer(); }} className="mobile-navlink text-[10px] text-left text-gray-500 font-bold tracking-widest">
                      Log out
                    </button>
                  ) : (
                    <div onClick={closeDrawer}>
                      <LoginDialog open={open} setOpen={setOpen} />
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
          </div>
        </div>

        <div className={`navbar-center ${isScrolled ? 'text-black' : 'text-white'}`}>
          <Link href="/" className="text-lg sm:text-xl font-semibold uppercase tracking-wide">NevrFall</Link>
        </div>

        <div className="flex flex-row justify-end items-center gap-1">

          <button className="btn btn-ghost btn-circle" onClick={() => router.push('/search')}>
            <IoSearchSharp size={22} />
          </button>

          {isLoggedIn ? (
            <div className="dropdown dropdown-end">
              <div tabIndex={0} role="button" className="btn btn-ghost btn-circle">
                <div className="">
                  <svg width="25" height="25" viewBox="0 0 27 27" fill="none" xmlns="http://www.w3.org/2000/svg" id="svgkp">
                    <path d="M22.9129 12.935L13.7571 23.0474C13.5348 23.2929 13.1284 23.1084 13.1669 22.7794L14.0816 14.9731H10.6991C10.4034 14.9731 10.2484 14.6219 10.4478 14.4035L20.3133 3.59739C20.5589 3.32834 20.9984 3.58134 20.8891 3.92887L18.2354 12.3664H22.6607C22.9557 12.3664 23.1109 12.7163 22.9129 12.935Z" fill="#FEA203"></path>
                    <path id="svgkp-path" fillRule="evenodd" clipRule="evenodd" d="M16.6079 5.35819C16.4805 5.1933 16.3421 5.03582 16.1932 4.8869C15.2702 3.96387 14.0183 3.44531 12.7129 3.44531C11.4075 3.44531 10.1556 3.96387 9.2326 4.8869C8.30957 5.80993 7.79102 7.06183 7.79102 8.36719C7.79102 9.67255 8.30957 10.9244 9.2326 11.8475C9.48368 12.0986 9.75909 12.3197 10.0533 12.5086L11.0235 11.4503C10.7335 11.2914 10.4649 11.0911 10.227 10.8531C9.56766 10.1938 9.19727 9.29959 9.19727 8.36719C9.19727 7.43479 9.56766 6.54057 10.227 5.88127C10.8863 5.22196 11.7805 4.85156 12.7129 4.85156C13.6453 4.85156 14.5395 5.22196 15.1988 5.88127C15.3636 6.04604 15.5103 6.22549 15.6377 6.41654L16.6079 5.35819ZM20.6413 18.6497L19.6746 19.7132C20.1676 20.4122 20.4473 21.2264 20.4473 22.0781V23.8359C20.4473 24.2243 20.7621 24.5391 21.1504 24.5391C21.5387 24.5391 21.8535 24.2243 21.8535 23.8359V22.0781C21.8535 20.7863 21.4016 19.6103 20.6413 18.6497ZM12.3111 17.5078H10.3026C7.27113 17.5078 4.97852 19.6394 4.97852 22.0781V23.8359C4.97852 24.2243 4.66372 24.5391 4.27539 24.5391C3.88707 24.5391 3.57227 24.2243 3.57227 23.8359V22.0781C3.57227 18.6922 6.67684 16.1016 10.3026 16.1016H12.4885L12.3111 17.5078Z" fill="currentColor" stroke="currentColor"></path>
                  </svg>
                </div>
              </div>
              <ul
                tabIndex={0}
                className="menu menu-sm dropdown-content text-black bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow"
              >
                <li><Link href="/profile">My Profile</Link></li>
                <li><Link href="/orders">My Orders</Link></li>
                <li><Link href="/returns">My Returns</Link></li>
                <li><button onClick={handleLogout}>Logout</button></li>
              </ul>
            </div>
          ) : (
            <div>
              <LoginDialog open={open} setOpen={setOpen} />
            </div>
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
            className="btn btn-ghost btn-circle hidden sm:block"
            onClick={() => { setActiveTab('wishlist'); router.push('/profile'); }}
          >
            <BsBagHeartFill size={22} />
          </button>
        </div>
      </div>
    </>
  )
}

export default Navbar;
