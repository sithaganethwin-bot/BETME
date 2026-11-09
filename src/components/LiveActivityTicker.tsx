"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Gavel, Clock, ChevronRight, X, Minimize2, Maximize2, Zap } from "lucide-react";
import { formatLKR } from "@/lib/utils";

interface ActivityItem {
  id: string;
  type: "bid" | "ending_soon";
  bidderName?: string;
  amount?: number;
  currentPrice?: number;
  isAutoBid?: boolean;
  auctionId: string;
  auctionTitle: string;
  timestamp: string;
  endsAt?: string;
  totalBids?: number;
}

export function LiveActivityTicker() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Check reduced motion preference
  useEffect(() => {
    if (typeof window !== "undefined") {
      const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
      setPrefersReducedMotion(mediaQuery.matches);
      const listener = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
      mediaQuery.addEventListener("change", listener);
      return () => mediaQuery.removeEventListener("change", listener);
    }
  }, []);

  // Fetch real activities from backend
  const fetchFeed = async () => {
    try {
      const res = await fetch("/api/activity/feed");
      const data = await res.json();
      if (data.success) {
        const combined: ActivityItem[] = [];
        if (data.feed) combined.push(...data.feed);
        if (data.alerts) combined.push(...data.alerts);
        if (combined.length > 0) {
          setActivities(combined);
        }
      }
    } catch (e) {
      // Graceful offline fallback
    }
  };

  useEffect(() => {
    fetchFeed();
    const pollInterval = setInterval(fetchFeed, 6000); // 6s poll
    return () => clearInterval(pollInterval);
  }, []);

  // Rotate ticker item
  useEffect(() => {
    if (activities.length <= 1 || isMinimized || prefersReducedMotion) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activities.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [activities.length, isMinimized, prefersReducedMotion]);

  if (isDismissed || activities.length === 0) return null;

  const current = activities[currentIndex] || activities[0];

  const getRelativeTime = (isoString: string) => {
    const diffSeconds = Math.max(1, Math.floor((Date.now() - new Date(isoString).getTime()) / 1000));
    if (diffSeconds < 60) return `${diffSeconds}s ago`;
    const mins = Math.floor(diffSeconds / 60);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    return `${hours}h ago`;
  };

  // Minimized Floating Pill
  if (isMinimized) {
    return (
      <div className="fixed bottom-4 left-4 z-40 animate-in fade-in slide-in-from-bottom-2 duration-200">
        <button
          type="button"
          onClick={() => setIsMinimized(false)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/95 dark:bg-[#131B2B]/95 border border-[#E5EAF2] dark:border-slate-800 shadow-md text-xs font-bold text-[#172033] dark:text-[#F8FAFC] hover:border-[#2457E6] transition group"
          title="Expand Live Auction Activity"
        >
          <span className="w-2 h-2 rounded-full bg-[#16B8A6] animate-pulse"></span>
          <span>Live Bids</span>
          <Maximize2 className="w-3 h-3 text-[#64748B] group-hover:text-[#2457E6]" />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:right-auto sm:max-w-md z-40 animate-in fade-in slide-in-from-bottom-3 duration-300">
      <div className="bg-white/95 dark:bg-[#131B2B]/95 backdrop-blur-xl border border-[#E5EAF2] dark:border-slate-800 rounded-2xl p-2.5 sm:p-3 shadow-[0_8px_30px_rgb(0,0,0,0.08)] flex items-center justify-between gap-3 text-xs">
        {/* Left Pulse & Icon */}
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div className="relative shrink-0">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white shadow-xs ${
              current.type === "ending_soon" ? "bg-rose-500" : "bg-[#2457E6]"
            }`}>
              {current.type === "ending_soon" ? (
                <Clock className="w-3.5 h-3.5" />
              ) : (
                <Gavel className="w-3.5 h-3.5" />
              )}
            </div>
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#16B8A6] animate-pulse"></span>
          </div>

          {/* Activity Content */}
          <div className="min-w-0 flex-1">
            <Link
              href={`/auction/${current.auctionId}`}
              className="block group"
            >
              {current.type === "ending_soon" ? (
                <div className="truncate">
                  <span className="font-bold text-rose-600 dark:text-rose-400">Ending Soon: </span>
                  <span className="font-semibold text-[#172033] dark:text-[#F8FAFC] group-hover:text-[#2457E6] transition">
                    {current.auctionTitle}
                  </span>
                  <span className="text-[11px] text-[#64748B] block mt-0.5">
                    High Bid: <strong>{formatLKR(current.currentPrice || 0)}</strong> ({current.totalBids} bids)
                  </span>
                </div>
              ) : (
                <div className="truncate">
                  <span className="font-extrabold text-[#172033] dark:text-[#F8FAFC]">
                    {current.bidderName}
                  </span>
                  <span className="text-[#64748B]"> bid </span>
                  <span className="font-mono-num font-black text-[#2457E6] dark:text-blue-400">
                    {formatLKR(current.amount || 0)}
                  </span>
                  {current.isAutoBid && (
                    <span className="ml-1 px-1 py-0.2 bg-blue-50 text-[#2457E6] text-[9px] font-bold rounded">
                      Auto
                    </span>
                  )}
                  <span className="text-[#64748B] block truncate text-[11px] mt-0.5">
                    on <strong className="text-[#172033] dark:text-slate-200 group-hover:text-[#2457E6]">{current.auctionTitle}</strong> • {getRelativeTime(current.timestamp)}
                  </span>
                </div>
              )}
            </Link>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1 shrink-0 text-[#64748B]">
          <Link
            href={`/auction/${current.auctionId}`}
            className="p-1.5 hover:text-[#2457E6] hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
            title="View Auction"
          >
            <ChevronRight className="w-4 h-4" />
          </Link>
          <button
            type="button"
            onClick={() => setIsMinimized(true)}
            className="p-1.5 hover:text-[#172033] hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
            title="Minimize Ticker"
          >
            <Minimize2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setIsDismissed(true)}
            className="p-1.5 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
            title="Dismiss Ticker"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
