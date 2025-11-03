"use client";
import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";
import { useProfileStore } from "../store/useProfileStore";
import { authAPI } from "@/services/api";
import secureLocalStorage from "react-secure-storage";
import { useRouter } from "next/navigation";

export default function AvatarMenu() {
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement | null>(null);
  const dropdown = useRef<HTMLDivElement | null>(null);
  const { activeTab, setActiveTab } = useProfileStore();
  

  // Close on click outside
  useEffect(() => {
    const clickHandler = (e: MouseEvent) => {
      if (!dropdown.current || !trigger.current) return;
      if (
        !dropdownOpen ||
        dropdown.current.contains(e.target as Node) ||
        trigger.current.contains(e.target as Node)
      )
        return;
      setDropdownOpen(false);
    };
    document.addEventListener("click", clickHandler);
    return () => document.removeEventListener("click", clickHandler);
  }, [dropdownOpen]);

  // Close on Escape key
  useEffect(() => {
    const keyHandler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDropdownOpen(false);
    };
    document.addEventListener("keydown", keyHandler);
    return () => document.removeEventListener("keydown", keyHandler);
  }, []);

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
    <div className="flex justify-center py-10">
      <div className="relative">
        {/* Avatar Button */}
        <button
          ref={trigger}
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-2 rounded-xl bg-base-100 px-3 py-2 shadow-md hover:bg-base-200 transition-all"
        >
          <div className="relative h-10 w-10">
            <img
              src="https://cdn.tailgrids.com/assets/images/core-components/avatar/image-05.jpg"
              alt="avatar"
              className="h-full w-full rounded-full object-cover"
            />
            <span className="absolute bottom-0 right-0 block h-3.5 w-3.5 rounded-full border-2 border-white bg-green-500"></span>
          </div>
          <span className="text-sm font-medium text-base-content">
            Devid Milinear
          </span>
          <svg
            className={`w-5 h-5 transition-transform duration-200 ${
              dropdownOpen ? "rotate-180" : ""
            }`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M10 12.5a.75.75 0 0 1-.53-.22l-5-5a.75.75 0 1 1 1.06-1.06L10 10.69l4.47-4.47a.75.75 0 0 1 1.06 1.06l-5 5a.75.75 0 0 1-.53.22Z" />
          </svg>
        </button>

        {/* Dropdown Menu */}
        <div
          ref={dropdown}
          className={`absolute right-0 mt-2 w-48 origin-top-right rounded-xl bg-base-100 shadow-lg ring-1 ring-base-300 z-50 ${
            dropdownOpen ? "block animate-fadeIn" : "hidden"
          }`}
        >
          <ul className="menu menu-sm p-2 w-full space-y-1">
            <li>
              <Link
                href="/profile"
                onClick={() => setActiveTab("")}
                className="rounded-lg hover:bg-base-200 transition"
              >
                My Profile
              </Link>
            </li>
            <li>
              <Link
                href="/orders"
                onClick={() => setActiveTab("orders")}
                className="rounded-lg hover:bg-base-200 transition"
              >
                My Orders
              </Link>
            </li>
            <li>
              <Link
                href="/returns"
                onClick={() => setActiveTab("returns")}
                className="rounded-lg hover:bg-base-200 transition"
              >
                My Returns
              </Link>
            </li>
            <li>
              <button onClick={handleLogout} className="btn btn-error">
                Logout
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
