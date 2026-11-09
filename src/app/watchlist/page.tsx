"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Heart, ArrowLeft, Gavel } from "lucide-react";
import { AuctionCard } from "@/components/AuctionCard";
import { useApp } from "@/context/AppContext";

export default function WatchlistPage() {
  const { watchlist } = useApp();
  const [auctions, setAuctions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadWatchlist() {
      try {
        const res = await fetch("/api/auctions");
        const data = await res.json();
        if (data.success) {
          const watched = data.auctions.filter((a: any) => watchlist.includes(a.id));
          setAuctions(watched);
        }
      } catch (err) {
        console.error("Failed to load watchlist:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadWatchlist();
  }, [watchlist]);

  return (
    <div className="space-y-6 pb-16">
      <div className="flex items-center gap-3">
        <Link href="/" className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl hover:text-brand-500 transition">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
            <span>My Auction Watchlist</span>
          </h1>
          <p className="text-xs text-slate-500">
            Keep track of countdowns, outbid alerts, and active bids.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="h-40 flex items-center justify-center text-xs text-slate-400">
          Loading saved auctions...
        </div>
      ) : auctions.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center">
          <Heart className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
            Your Watchlist is Empty
          </h3>
          <p className="text-xs text-slate-500 mb-4 max-w-sm mx-auto">
            Click the heart icon on any auction lot to receive real-time outbid warnings and closing notifications.
          </p>
          <Link href="/" className="inline-flex items-center gap-1.5 bg-brand-500 text-slate-950 font-bold text-xs px-4 py-2.5 rounded-xl">
            <Gavel className="w-4 h-4" />
            <span>Browse Active Auctions</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {auctions.map((auc) => (
            <AuctionCard key={auc.id} auction={auc} />
          ))}
        </div>
      )}
    </div>
  );
}
