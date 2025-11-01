'use client';
import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { cartAPI, authAPI } from '@/services/api';
import LoginDialog from "./LoginDialog";
import secureLocalStorage from 'react-secure-storage';
import { IoMoonSharp, IoSunny } from "react-icons/io5";
import { FaOpencart } from "react-icons/fa";
import { BsBagHeartFill } from "react-icons/bs";
import { useProfileStore } from '../store/useProfileStore';
import { CiMenuBurger } from "react-icons/ci";
import ProfileCard from './ProfileCard';

const Navbar = () => {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { activeTab, setActiveTab } = useProfileStore();
  const [user, setUser] = useState<any>(null);
  const [mounted, setMounted] = useState(false);

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
      setIsLoggedIn(false);
      setUser(null);
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
            <label htmlFor="my-drawer-1" className="btn-ghost font-semibold drawer-button"><CiMenuBurger/></label>
          </div>
          <div className="drawer-side">
            <label htmlFor="my-drawer-1" aria-label="close sidebar" className="drawer-overlay"></label>
            <ul className="menu bg-base-200 min-h-full w-64 p-4">
              {isLoggedIn ? (
                <ProfileCard />
              ) : (
                <li className="ml-4" onClick={closeDrawer}>
                  <LoginDialog open={open} setOpen={setOpen} />
                </li>
              )}
              <li><Link href='/products'>Products</Link></li>
              <li><Link href='/contact'>Contact</Link></li>
              {mounted && (
                <button className="btn hidden sm:block btn-ghost btn-circle" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
                  {theme === 'light' ? (
                    <IoMoonSharp size={22} />
                  ) : (
                    <IoSunny size={22} />
                  )}
                </button>
              )}
            </ul>
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
                <FaOpencart size={22}/>
                {cartData && cartData.count > 0 && (
                  <span className="badge badge-xs badge-primary indicator-item">
                    {cartData.count}
                  </span>
                )}
              </div>
            </button>

            <button
              className="btn btn-ghost btn-circle"
              onClick={() => {setActiveTab('wishlist'); router.push('/profile');}}
            >
                <BsBagHeartFill size={22}/>
            </button>
            
           {isLoggedIn ? (
            <div className="dropdown dropdown-end hidden sm:block">
              <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
                <div className="w-10 rounded-full">
                  <div className="bg-primary text-primary-content rounded-full w-10 h-10 flex items-center justify-center">
                    {userData?.name?.charAt(0) || 'U'}
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