"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { 
  Search, 
  Heart, 
  ShoppingBag,
  PlusCircle, 
  User, 
  Store, 
  Menu, 
  X, 
  Compass, 
  ChevronDown, 
  MessageSquare, 
  Settings, 
  LogOut, 
  ShieldCheck, 
  ArrowRight,
  Bell,
  HelpCircle,
  Layers,
  Gavel,
  Home,
  Trophy,
  Sun,
  Moon
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { BidmeLogo } from "@/components/BitmeLogo";
import { CATEGORIES_CONFIG } from "@/lib/constants";
import { recommendationEngine } from "@/lib/recommendation-engine";

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { 
    currentUser, 
    cart, 
    favorites, 
    notifications, 
    setIsCartOpen, 
    setIsFavoritesOpen,
    theme,
    toggleTheme
  } = useApp();

  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isDropdownClicked, setIsDropdownClicked] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const categoryRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setIsDropdownOpen(true);
  };

  const handleMouseLeave = () => {
    if (isDropdownClicked) {
      // Do not auto-close if user explicitly clicked it open
      return;
    }
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
    }
    closeTimeoutRef.current = setTimeout(() => {
      setIsDropdownOpen(false);
    }, 350);
  };

  const handleToggleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setIsDropdownOpen((prev) => {
      const next = !prev;
      setIsDropdownClicked(next);
      return next;
    });
  };

  // Click outside listener for all popovers
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (dropdownRef.current && !dropdownRef.current.contains(target)) {
        setIsDropdownOpen(false);
        setIsDropdownClicked(false);
      }
      if (categoryRef.current && !categoryRef.current.contains(target)) {
        setIsCategoryOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(target)) {
        setIsNotificationsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    };
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      recommendationEngine.trackInteraction("SEARCH", { query: searchQuery.trim() });
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    } else {
      router.push("/search");
    }
  };

  const handleSignOut = () => {
    setIsDropdownOpen(false);
    try {
      localStorage.removeItem("bidme_user");
      localStorage.removeItem("bitme_user");
    } catch (e) {}
    router.push("/auth");
  };

  const firstName = currentUser?.name ? currentUser.name.split(" ")[0] : "Kasun";
  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <>
      {/* Top Floating Modern-Light Dynamic Header */}
      <div className="fixed top-3 sm:top-5 inset-x-0 z-50 flex justify-center px-3 sm:px-6 pointer-events-none">
        <div className="w-full max-w-7xl flex items-center justify-between gap-2.5 sm:gap-3">
          {/* Main Floating Island Header */}
          <header
            className={`pointer-events-auto flex-1 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-slate-200/90 dark:border-slate-700/80 ${
              mobileMenuOpen ? "rounded-3xl" : "rounded-full"
            } px-3.5 sm:px-5 py-2 sm:py-2.5 text-[#0F172A] dark:text-[#F8FAFC] shadow-[0_10px_35px_rgba(0,0,0,0.10)] dark:shadow-[0_10px_35px_rgba(0,0,0,0.4)] transition-all duration-300`}
          >
          <div className="flex items-center justify-between gap-3 sm:gap-4">
            {/* Custom BIDME Logo Concept */}
            <BidmeLogo size="md" showTagline={false} />

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5">
              <Link
                href="/search"
                className={`text-xs font-extrabold px-3 py-1.5 rounded-full transition-all ${
                  pathname === "/search"
                    ? "text-[#2457E6] dark:text-blue-400 bg-blue-50 dark:bg-blue-950/80 shadow-xs"
                    : "text-slate-900 dark:text-slate-100 hover:text-[#2457E6] dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                Explore
              </Link>

              {/* Categories Dropdown */}
              <div ref={categoryRef} className="relative">
                <button
                  type="button"
                  onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                  className={`flex items-center gap-1 text-xs font-extrabold px-3 py-1.5 rounded-full transition-all ${
                    isCategoryOpen
                      ? "text-[#2457E6] dark:text-blue-400 bg-blue-50 dark:bg-blue-950/80"
                      : "text-slate-900 dark:text-slate-100 hover:text-[#2457E6] dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  <span>Categories</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isCategoryOpen ? "rotate-180 text-[#2457E6]" : "text-slate-600 dark:text-slate-300"}`} />
                </button>

                {isCategoryOpen && (
                  <div className="absolute left-0 top-full pt-2 w-64 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                    <div className="bg-white/98 dark:bg-slate-900/98 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-2 space-y-1">
                      {CATEGORIES_CONFIG.map((cat) => (
                        <Link
                          key={cat.slug}
                          href={`/search?category=${cat.slug}`}
                          onClick={() => setIsCategoryOpen(false)}
                          className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-900 dark:text-slate-100 hover:text-[#2457E6] transition"
                        >
                          <span>{cat.name}</span>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-md font-medium">
                            Browse
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <Link
                href="/#how-it-works"
                className="text-xs font-extrabold text-slate-900 dark:text-slate-100 hover:text-[#2457E6] dark:hover:text-blue-400 px-3 py-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
              >
                How It Works
              </Link>
            </nav>

            {/* Smart Search Bar */}
            <form onSubmit={handleSearch} className="flex-1 max-w-xs xl:max-w-sm hidden md:block">
              <div className="relative flex items-center">
                <Search className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 absolute left-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search watches, cars, laptops, gems..."
                  className="w-full bg-slate-100/80 hover:bg-slate-100 dark:bg-slate-800/70 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 rounded-full pl-9 pr-16 py-1.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:outline-none focus:border-[#2457E6] focus:bg-white dark:focus:bg-slate-800 transition"
                />
                <button
                  type="submit"
                  className="absolute right-1 px-3 py-0.5 bg-[#2457E6] hover:bg-[#1d46be] text-white font-bold text-[11px] rounded-full transition shadow-sm"
                >
                  Search
                </button>
              </div>
            </form>

            {/* Right Action Icons & Buttons */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              {/* Notifications Popover */}
              <div ref={notifRef} className="relative hidden sm:block">
                <button
                  type="button"
                  onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                  className="relative p-2 text-slate-700 dark:text-slate-200 hover:text-[#2457E6] dark:hover:text-blue-400 rounded-full hover:bg-slate-100/80 dark:hover:bg-slate-800/80 transition"
                  title="Notifications"
                >
                  <Bell className="w-4 h-4" />
                  {notifications.length > 0 && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-[#2457E6] rounded-full"></span>
                  )}
                </button>

                {isNotificationsOpen && (
                  <div className="absolute right-0 top-full pt-2 w-80 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                    <div className="bg-white dark:bg-slate-900 border border-[#E5EAF2] dark:border-slate-800 rounded-2xl shadow-xl p-3">
                      <div className="flex items-center justify-between pb-2 border-b border-[#E5EAF2] dark:border-slate-800">
                        <span className="text-xs font-bold text-[#172033] dark:text-white">Notifications</span>
                        <span className="text-[10px] font-semibold text-[#16B8A6] bg-[#E8FAF7] dark:bg-teal-950/40 px-2 py-0.5 rounded-full">
                          Live Updates
                        </span>
                      </div>
                      <div className="space-y-2 py-2 max-h-56 overflow-y-auto">
                        {notifications.length > 0 ? (
                          notifications.map((msg, i) => (
                            <div key={i} className="p-2 rounded-xl bg-[#F5F7FB] dark:bg-slate-800 text-xs text-[#172033] dark:text-slate-200 leading-snug">
                              {msg}
                            </div>
                          ))
                        ) : (
                          <p className="text-xs text-[#64748B] dark:text-slate-400 text-center py-4">No new notifications.</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Favorites (Heart Icon) -> Opens Favorites Drawer */}
              <button
                type="button"
                onClick={() => setIsFavoritesOpen(true)}
                className="relative p-2 text-slate-700 dark:text-slate-200 hover:text-rose-600 rounded-full hover:bg-rose-50/70 dark:hover:bg-rose-950/40 transition"
                title="Favorites & Watchlist"
                aria-label="Open Favorites"
              >
                <Heart className="w-4 h-4" />
                {favorites.length > 0 && (
                  <span className="absolute top-0.5 right-0.5 w-3.5 h-3.5 bg-rose-500 text-white text-[9px] font-black rounded-full flex items-center justify-center shadow-sm">
                    {favorites.length}
                  </span>
                )}
              </button>

              {/* Won Auctions & Settlement (Trophy Icon) -> Opens Won Lots Checkout Drawer */}
              <button
                type="button"
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 text-slate-700 dark:text-slate-200 hover:text-amber-600 rounded-full hover:bg-amber-50/70 dark:hover:bg-amber-950/40 transition"
                title="Won Auctions & Settlement (ජයග්‍රහණය කළ වෙන්දේසි)"
                aria-label="Open Won Auctions"
              >
                <Trophy className="w-4 h-4 text-amber-500" />
                {cartItemCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 w-3.5 h-3.5 bg-amber-500 text-white text-[9px] font-black rounded-full flex items-center justify-center shadow-sm">
                    {cartItemCount}
                  </span>
                )}
              </button>

              {/* Theme Toggle (Light / Dark Mode) */}
              <button
                type="button"
                onClick={toggleTheme}
                className="relative p-2 text-slate-700 dark:text-slate-200 hover:text-[#2457E6] dark:hover:text-blue-400 rounded-full hover:bg-slate-100/80 dark:hover:bg-slate-800/80 transition"
                title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
                aria-label="Toggle theme"
              >
                {theme === "dark" ? (
                  <Sun className="w-4 h-4 text-amber-400" />
                ) : (
                  <Moon className="w-4 h-4 text-slate-700 dark:text-slate-200" />
                )}
              </button>

              {/* Sell on BIDME Button */}
              <Link
                href="/seller/new"
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#2457E6] hover:bg-[#1d46be] text-white text-xs font-bold rounded-full shadow-sm hover:scale-105 active:scale-95 transition"
              >
                <PlusCircle className="w-3.5 h-3.5 text-white" />
                <span className="hidden sm:inline">Sell on BIDME</span>
                <span className="sm:hidden">Sell</span>
              </Link>

              {/* Mobile menu toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-1.5 text-slate-700 dark:text-slate-200 hover:text-[#172033] dark:hover:text-white"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Drawer (Inside Header) */}
          {mobileMenuOpen && (
            <div className="lg:hidden mt-3 pt-3 border-t border-[#E5EAF2] space-y-2">
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search items..."
                  className="w-full bg-[#F5F7FB] border border-[#E5EAF2] rounded-full px-3 py-1.5 text-xs text-[#172033] outline-none"
                />
              </form>
              <div className="grid grid-cols-2 gap-2 text-xs font-semibold pt-1">
                <Link
                  href="/search"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2.5 rounded-xl bg-[#F5F7FB] text-center text-[#172033]"
                >
                  Explore Auctions
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setIsFavoritesOpen(true);
                  }}
                  className="p-2.5 rounded-xl bg-rose-50 text-rose-700 font-bold text-center flex items-center justify-center gap-1.5"
                >
                  <Heart className="w-3.5 h-3.5" />
                  <span>Favorites ({favorites.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setIsCartOpen(true);
                  }}
                  className="p-2.5 rounded-xl bg-[#EEF3FF] text-[#2457E6] font-bold text-center flex items-center justify-center gap-1.5"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Cart ({cartItemCount})</span>
                </button>
                <Link
                  href="/dashboard?mode=selling"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2.5 rounded-xl bg-[#E8FAF7] text-[#16B8A6] border border-[#16B8A6]/30 text-center font-bold"
                >
                  Consignor Studio
                </Link>
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#172033] font-bold text-center flex items-center justify-center gap-1.5 transition col-span-2"
                >
                  {theme === "dark" ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5" />}
                  <span>{theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}</span>
                </button>
              </div>
            </div>
          )}
        </header>

        {/* STANDALONE SEPARATE USER PROFILE PILL ON THE RIGHT */}
        <div
          ref={dropdownRef}
          className="pointer-events-auto relative shrink-0"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <button
            type="button"
            onClick={handleToggleClick}
            className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white pl-1.5 pr-3 py-1.5 sm:py-2 rounded-full bg-white/80 dark:bg-slate-900/85 backdrop-blur-2xl border border-white/80 dark:border-slate-700/60 hover:border-[#2457E6]/40 hover:bg-white/90 dark:hover:bg-slate-900/95 transition cursor-pointer shadow-[0_8px_32px_rgba(0,0,0,0.08)]"
            aria-expanded={isDropdownOpen}
          >
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#2457E6] text-white flex items-center justify-center font-black text-[11px] sm:text-xs shadow-sm shrink-0">
              {firstName.charAt(0)}
            </div>
            <span className="tracking-tight max-w-[85px] sm:max-w-[130px] truncate">
              {currentUser?.name || "Kasun Jayasuriya"}
            </span>
            <ChevronDown className={`w-3.5 h-3.5 text-slate-600 dark:text-slate-400 transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`} />
          </button>

          {/* DROPDOWN MENU - Minimalist & Refined */}
          {isDropdownOpen && (
            <div 
              className="absolute right-0 top-full pt-2 w-64 z-50 pointer-events-auto before:content-[''] before:absolute before:-top-3 before:inset-x-0 before:h-5 before:bg-transparent animate-in fade-in slide-in-from-top-1 duration-150"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <div className="bg-white border border-[#E5EAF2] rounded-2xl shadow-[0_12px_32px_rgba(0,0,0,0.08)] p-1.5">
                {/* Clean Minimalist Header */}
                <div className="px-3 py-2.5 border-b border-[#F1F5F9] mb-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-xs text-[#172033] truncate">
                      {currentUser?.name || "Kasun Jayasuriya"}
                    </span>
                    <span className="text-[9px] font-bold bg-[#E8FAF7] text-[#16B8A6] px-1.5 py-0.5 rounded-md shrink-0 flex items-center gap-1">
                      <ShieldCheck className="w-2.5 h-2.5" />
                      Verified
                    </span>
                  </div>
                  <p className="text-[11px] text-[#64748B] truncate mt-0.5">
                    {currentUser?.email || "kasun.jayasuriya@example.com"}
                  </p>
                </div>

                {/* Dropdown Navigation Links */}
                <div className="space-y-0.5">
                  <Link
                    href="/dashboard?mode=buying"
                    onClick={() => setIsDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#172033] hover:text-[#2457E6] hover:bg-[#F8FAFC] transition group"
                  >
                    <Gavel className="w-4 h-4 text-[#64748B] group-hover:text-[#2457E6] transition shrink-0" />
                    <span>Buyer Dashboard</span>
                  </Link>

                  <Link
                    href="/dashboard?mode=selling"
                    onClick={() => setIsDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#172033] hover:text-[#2457E6] hover:bg-[#F8FAFC] transition group"
                  >
                    <Store className="w-4 h-4 text-[#64748B] group-hover:text-[#2457E6] transition shrink-0" />
                    <span>Seller Dashboard</span>
                  </Link>

                  <Link
                    href="/seller/new"
                    onClick={() => setIsDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#172033] hover:text-[#2457E6] hover:bg-[#F8FAFC] transition group"
                  >
                    <PlusCircle className="w-4 h-4 text-[#64748B] group-hover:text-[#2457E6] transition shrink-0" />
                    <span>List an Item</span>
                  </Link>

                  <Link
                    href="/messages"
                    onClick={() => setIsDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#172033] hover:text-[#2457E6] hover:bg-[#F8FAFC] transition group"
                  >
                    <MessageSquare className="w-4 h-4 text-[#64748B] group-hover:text-[#2457E6] transition shrink-0" />
                    <span>Messages & Support</span>
                  </Link>

                  <Link
                    href="/account/settings"
                    onClick={() => setIsDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#172033] hover:text-[#2457E6] hover:bg-[#F8FAFC] transition group"
                  >
                    <Settings className="w-4 h-4 text-[#64748B] group-hover:text-[#2457E6] transition shrink-0" />
                    <span>Account Settings</span>
                  </Link>

                  {/* Dark Mode Toggle inside Dropdown */}
                  <button
                    type="button"
                    onClick={toggleTheme}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-[#172033] hover:text-[#2457E6] hover:bg-[#F8FAFC] transition group"
                  >
                    <div className="flex items-center gap-2.5">
                      {theme === "dark" ? (
                        <Sun className="w-4 h-4 text-amber-400 shrink-0" />
                      ) : (
                        <Moon className="w-4 h-4 text-[#64748B] group-hover:text-[#2457E6] transition shrink-0" />
                      )}
                      <span>Appearance</span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-[#64748B]">
                      {theme === "dark" ? "Dark" : "Light"}
                    </span>
                  </button>
                </div>

                {/* Footer / Switch User */}
                <div className="pt-1 mt-1 border-t border-[#F1F5F9]">
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#64748B] hover:text-rose-600 hover:bg-rose-50/60 transition group text-left"
                  >
                    <LogOut className="w-4 h-4 text-[#94A3B8] group-hover:text-rose-600 transition shrink-0" />
                    <span>Sign Out or Switch Account</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>

      {/* Mobile Bottom Navigation Bar (Section 2 & 8: Home, Explore, Favorites Drawer, Cart Drawer, Profile) */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-50 bg-white/95 backdrop-blur-md border-t border-[#E5EAF2] px-4 py-2 flex items-center justify-around shadow-lg">
        <Link
          href="/"
          className={`flex flex-col items-center gap-0.5 text-[10px] font-bold ${
            pathname === "/" ? "text-[#2457E6]" : "text-[#64748B]"
          }`}
        >
          <Home className="w-4 h-4" />
          <span>Home</span>
        </Link>

        <Link
          href="/search"
          className={`flex flex-col items-center gap-0.5 text-[10px] font-bold ${
            pathname === "/search" ? "text-[#2457E6]" : "text-[#64748B]"
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>Explore</span>
        </Link>

        {/* Favorites trigger without leaving page */}
        <button
          type="button"
          onClick={() => setIsFavoritesOpen(true)}
          className="relative flex flex-col items-center gap-0.5 text-[10px] font-bold text-[#64748B] hover:text-rose-600"
        >
          <Heart className="w-4 h-4" />
          {favorites.length > 0 && (
            <span className="absolute -top-1 right-2 w-3.5 h-3.5 bg-rose-500 text-white text-[8px] font-black rounded-full flex items-center justify-center">
              {favorites.length}
            </span>
          )}
          <span>Favorites</span>
        </button>

        {/* Won Lots trigger without leaving page */}
        <button
          type="button"
          onClick={() => setIsCartOpen(true)}
          className="relative flex flex-col items-center gap-0.5 text-[10px] font-bold text-[#64748B] hover:text-amber-600"
        >
          <Trophy className="w-4 h-4 text-amber-500" />
          {cartItemCount > 0 && (
            <span className="absolute -top-1 right-1 w-3.5 h-3.5 bg-amber-500 text-white text-[8px] font-black rounded-full flex items-center justify-center">
              {cartItemCount}
            </span>
          )}
          <span>Won Lots</span>
        </button>

        <Link
          href="/dashboard"
          className="flex flex-col items-center gap-0.5 text-[10px] font-bold text-[#64748B]"
        >
          <User className="w-4 h-4" />
          <span>Profile</span>
        </Link>
      </div>
    </>
  );
}
