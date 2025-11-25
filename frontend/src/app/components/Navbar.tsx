'use client';

import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { cartAPI, authAPI, productAPI } from '@/services/api';
import LoginDialog from "./LoginDialog";
import secureLocalStorage from 'react-secure-storage';
import { IoMoonSharp, IoSunny, IoClose, IoSearchSharp, IoMenu } from "react-icons/io5";
import { FaOpencart } from "react-icons/fa";
import { BsBagHeartFill } from "react-icons/bs";
import { useProfileStore } from '../store/useProfileStore';
import { useCategoryStore } from '../store/useCategoryStore';
import SearchPopdown from './SearchPopdown';

const Navbar = () => {
  const { categories, fetchCategories } = useCategoryStore();
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { activeTab, setActiveTab } = useProfileStore();
  const [mounted, setMounted] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

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
    setMobileMenuOpen(false);
  };

  const handleCollectionClick = (slugOrName: string) => {
    router.push(`/products?collections=${slugOrName}`);
    setMobileMenuOpen(false);
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
      setUserName(null);
      setMobileMenuOpen(false);
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <>
      {/* Mobile Navbar */}
      <nav className="sticky top-0 z-40 bg-base-100 border-b border-base-300">
        <div className="flex items-center justify-between px-2 py-2">
          {/* Left: Menu */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="btn btn-ghost btn-sm"
          >
            <IoMenu size={28} />
          </button>

          {/* Center: Logo */}
          <Link href="/" className="text-xl font-bold uppercase tracking-widest text-base-content">
            NevrFall
          </Link>

          {/* Right: Search, User, Cart */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setSearchOpen(true)}
              className="btn btn-ghost btn-sm"
            >
              <IoSearchSharp size={24} />
            </button>

            {isLoggedIn ? (
              <Link href="/profile" className="btn btn-ghost btn-sm">
                <div className="w-7 h-7 rounded-full bg-primary text-primary-content flex items-center justify-center text-sm font-bold">
                  {userName?.charAt(0)?.toUpperCase()}
                </div>
              </Link>
            ) : (
              <div onClick={() => setOpen(true)}>
                <button className="btn btn-ghost btn-sm">
                  <svg width="24" height="24" viewBox="0 0 27 27" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.9129 12.935L13.7571 23.0474C13.5348 23.2929 13.1284 23.1084 13.1669 22.7794L14.0816 14.9731H10.6991C10.4034 14.9731 10.2484 14.6219 10.4478 14.4035L20.3133 3.59739C20.5589 3.32834 20.9984 3.58134 20.8891 3.92887L18.2354 12.3664H22.6607C22.9557 12.3664 23.1109 12.7163 22.9129 12.935Z" fill="#FEA203"></path>
                    <path fillRule="evenodd" clipRule="evenodd" d="M16.6079 5.35819C16.4805 5.1933 16.3421 5.03582 16.1932 4.8869C15.2702 3.96387 14.0183 3.44531 12.7129 3.44531C11.4075 3.44531 10.1556 3.96387 9.2326 4.8869C8.30957 5.80993 7.79102 7.06183 7.79102 8.36719C7.79102 9.67255 8.30957 10.9244 9.2326 11.8475C9.48368 12.0986 9.75909 12.3197 10.0533 12.5086L11.0235 11.4503C10.7335 11.2914 10.4649 11.0911 10.227 10.8531C9.56766 10.1938 9.19727 9.29959 9.19727 8.36719C9.19727 7.43479 9.56766 6.54057 10.227 5.88127C10.8863 5.22196 11.7805 4.85156 12.7129 4.85156C13.6453 4.85156 14.5395 5.22196 15.1988 5.88127C15.3636 6.04604 15.5103 6.22549 15.6377 6.41654L16.6079 5.35819ZM20.6413 18.6497L19.6746 19.7132C20.1676 20.4122 20.4473 21.2264 20.4473 22.0781V23.8359C20.4473 24.2243 20.7621 24.5391 21.1504 24.5391C21.5387 24.5391 21.8535 24.2243 21.8535 23.8359V22.0781C21.8535 20.7863 21.4016 19.6103 20.6413 18.6497ZM12.3111 17.5078H10.3026C7.27113 17.5078 4.97852 19.6394 4.97852 22.0781V23.8359C4.97852 24.2243 4.66372 24.5391 4.27539 24.5391C3.88707 24.5391 3.57227 24.2243 3.57227 23.8359V22.0781C3.57227 18.6922 6.67684 16.1016 10.3026 16.1016H12.4885L12.3111 17.5078Z" fill="currentColor" stroke="currentColor"></path>
                  </svg>
                </button>
              </div>
            )}

            <Link href="/cart" className="btn btn-ghost btn-sm relative">
              <FaOpencart size={24} />
              {cartData && cartData.count > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-primary-content text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {cartData.count}
                </span>
              )}
            </Link>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Drawer - Matching gryape.com exactly */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-base-100 overflow-hidden">
          {/* Header with logo and close */}
          <div className="flex items-center justify-between px-5 py-5 border-b border-base-300">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="text-base font-bold uppercase"
              style={{ letterSpacing: '0.2em' }}
            >
              NevrFall
            </Link>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-1 -mr-1"
              aria-label="Close menu"
            >
              <IoClose size={24} className="text-base-content" />
            </button>
          </div>

          {/* Scrollable menu content */}
          <div className="h-[calc(100vh-73px)] overflow-y-auto">
            {/* Main navigation */}
            <ul className="mobile-nav" style={{ fontWeight: 400, letterSpacing: '0.05em' }}>
              {collections.map((collection: any) => (
                <li key={collection._id} className="border-b border-base-300">
                  <button
                    onClick={() => handleCollectionClick(collection.slug || collection.name)}
                    className="block w-full text-left py-4 px-5 text-sm uppercase text-base-content"
                  >
                    {collection.name}
                  </button>
                </li>
              ))}

              {categories.map((category) => (
                <li key={category._id} className="border-b border-base-300">
                  <button
                    onClick={() => handleCategoryClick(category.name)}
                    className="block w-full text-left py-4 px-5 text-sm uppercase text-base-content"
                  >
                    {category.name}
                  </button>
                </li>
              ))}

              <li className="border-b border-base-300">
                <Link
                  href="/contact"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-4 px-5 text-sm uppercase text-base-content"
                >
                  CONTACT US
                </Link>
              </li>

              <li className="border-b border-base-300">
                <Link
                  href="/return"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-4 px-5 text-sm uppercase text-base-content"
                >
                  EXCHANGE
                </Link>
              </li>
            </ul>

            {/* Bottom menu */}
            <ul className="mt-auto border-t border-base-300" style={{ fontWeight: 400 }}>
              {mounted && (
                <li className="border-b border-base-300">
                  <button
                    onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                    className="flex items-center gap-2 w-full text-left py-3 px-5 text-xs text-base-content"
                  >
                    {theme === 'light' ? <IoMoonSharp size={16} /> : <IoSunny size={16} />}
                    {theme === 'light' ? 'Dark' : 'Light'} Mode
                  </button>
                </li>
              )}

              {isLoggedIn ? (
                <>
                  <li className="border-b border-base-300">
                    <Link
                      href="/profile"
                      onClick={() => { setActiveTab(''); setMobileMenuOpen(false); }}
                      className="block py-3 px-5 text-xs text-base-content"
                    >
                      My Account
                    </Link>
                  </li>
                  <li className="border-b border-base-300">
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left py-3 px-5 text-xs text-base-content"
                    >
                      Log out
                    </button>
                  </li>
                </>
              ) : (
                <li className="border-b border-base-300">
                  <button
                    onClick={() => { setMobileMenuOpen(false); setOpen(true); }}
                    className="block w-full text-left py-3 px-5 text-xs text-base-content"
                  >
                    Log in
                  </button>
                </li>
              )}
            </ul>
          </div>
        </div>
      )}

      {/* Search Popdown */}
      <SearchPopdown isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* Login Dialog - only shows when open is true */}
      <LoginDialog open={open} setOpen={setOpen} />
    </>
  );
};

export default Navbar;
