'use client';
import Link from 'next/link';
import React, { useState, useEffect, useMemo } from 'react';
import { useTheme } from 'next-themes';
import { useQuery } from '@tanstack/react-query';
import { useRouter, usePathname } from 'next/navigation';
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
import { MdPersonOutline } from "react-icons/md";
import { FaBagShopping } from "react-icons/fa6";

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
    if (token && userId) {
      setIsLoggedIn(true);
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
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const closeDrawer = () => {
    setSidebar(false);
  };

  const navItems: NavItem[] = useMemo(() => {
    const dynamicCollections: NavItem[] = collections.map((col: any) => ({
      _id: `col-${col._id}`,
      name: col.name,
      href: `/products?collections=${col.slug || col.name}`,
    }));

    const dynamicCategories: NavItem = {
      _id: 'cat-parent',
      name: 'Categories',
      children: categories.map((cat: any) => ({
        _id: `cat-${cat._id}`,
        name: cat.name,
        href: `/products?categories=${cat.name}`,
      })),
    };

    const supportItems: NavItem = {
      _id: 'support-parent',
      name: 'Support',
      children: [
        { _id: 'support-1', name: 'Track Order', href: '/orders' },
        { _id: 'support-2', name: 'Return/Exchange', href: '/return' },
        { _id: 'support-3', name: 'FAQ', href: '/faq' },
      ],
    };

    return [
      ...dynamicCollections,
      dynamicCategories,
      { _id: 'static-1', name: 'All Products', href: '/products' },
      supportItems,
    ];
  }, [collections, categories]);

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
                  <Link href="/" className="drawer__logo w-[130px]">
                    <img src='/logo.svg' alt='nevrfall'/>
                  </Link>
                  <button onClick={() => setSidebar(false)} className="btn btn-ghost btn-circle">
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
            </>
          )}
          </div>
        </div>

        <div className={`navbar-center ${isScrolled ? 'text-black' : 'text-white'}`}>
          <Link href="/" className="text-lg sm:text-xl font-semibold uppercase tracking-wide"><img src='/logo.svg' alt='nevrfall' className='w-[130px]'/></Link>
        <div className={`navbar-center ${isScrolled ? 'text-black' : 'text-white'}`}>
          <Link href="/" className="text-lg sm:text-xl font-semibold uppercase tracking-wide"><img src='/logo.svg' alt='nevrfall' className='w-[130px]'/></Link>
        </div>

        <div className="flex flex-row justify-end items-center gap-1">
        <div className="flex flex-row justify-end items-center gap-1">

          <button className="btn btn-ghost btn-circle" onClick={() => router.push('/search')}>
            <IoSearchSharp size={22} />
          </button>

          {isLoggedIn ? (
            <div className="dropdown dropdown-end">
              <div tabIndex={0} role="button" className="btn btn-ghost btn-circle">
                <div className="">
                  <MdPersonOutline size={22} />
                </div>
              </div>
              <ul
                tabIndex={0}
                className="menu menu-sm dropdown-content text-gray-600 bg-base-100 z-1 mt-3 w-40 p-2 shadow"
              >
                <li><Link className='text-gray-600 text-[10px]' href="/profile">My Profile</Link></li>
                <li><Link className='text-gray-600 text-[10px]' href="/orders">My Orders</Link></li>
                <li><Link className='text-gray-600 text-[10px]' href="/returns">My Returns</Link></li>
                <li><button className='text-gray-600 text-[10px]' onClick={handleLogout}>Logout</button></li>
              </ul>
            </div>
          ) : (
            <div>
              <LoginDialog open={open} setOpen={setOpen} />
            </div>
          {isLoggedIn ? (
            <div className="dropdown dropdown-end">
              <div tabIndex={0} role="button" className="btn btn-ghost btn-circle">
                <div className="">
                  <MdPersonOutline size={22} />
                </div>
              </div>
              <ul
                tabIndex={0}
                className="menu menu-sm dropdown-content text-gray-600 bg-base-100 z-1 mt-3 w-40 p-2 shadow"
              >
                <li><Link className='text-gray-600 text-[10px]' href="/profile">My Profile</Link></li>
                <li><Link className='text-gray-600 text-[10px]' href="/orders">My Orders</Link></li>
                <li><Link className='text-gray-600 text-[10px]' href="/returns">My Returns</Link></li>
                <li><button className='text-gray-600 text-[10px]' onClick={handleLogout}>Logout</button></li>
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
              <FaBagShopping size={22} />
              <FaBagShopping size={22} />
              {cartData && cartData.count > 0 && (
                <span className="badge badge-xs badge-primary indicator-item">
                  {cartData.count}
                </span>
              )}
            </div>
          </button>

          <button
            className="btn btn-ghost btn-circle hidden sm:block"
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