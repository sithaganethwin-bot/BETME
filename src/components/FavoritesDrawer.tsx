"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Heart, 
  X, 
  Trash2, 
  ShoppingBag, 
  Clock, 
  Gavel, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle,
  ExternalLink
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { formatLKR, formatTimeRemaining } from "@/lib/utils";

export function FavoritesDrawer() {
  const { 
    favorites, 
    isFavoritesOpen, 
    setIsFavoritesOpen, 
    removeFromFavorites, 
    clearFavorites,
    moveFavoriteToCart 
  } = useApp();

  const [confirmClear, setConfirmClear] = useState(false);

  if (!isFavoritesOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden font-sans">
      {/* Darkened Backdrop Overlay */}
      <div 
        onClick={() => setIsFavoritesOpen(false)}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
      />

      {/* Sliding Right Drawer */}
      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
        <aside className="w-screen max-w-md sm:max-w-lg bg-white border-l border-[#E5EAF2] shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300">
          {/* Drawer Header */}
          <div className="p-5 sm:p-6 border-b border-[#E5EAF2] flex items-center justify-between bg-white sticky top-0 z-10">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                <Heart className="w-4 h-4 fill-rose-600" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-[#172033] flex items-center gap-2">
                  <span>Favorites & Watchlist</span>
                  <span className="text-[11px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
                    {favorites.length} {favorites.length === 1 ? "item" : "items"}
                  </span>
                </h3>
                <p className="text-[11px] text-[#64748B]">Monitored auctions and saved lots</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {favorites.length > 0 && !confirmClear && (
                <button
                  type="button"
                  onClick={() => setConfirmClear(true)}
                  className="text-[11px] font-semibold text-[#64748B] hover:text-rose-600 px-2.5 py-1 rounded-lg hover:bg-slate-100 transition"
                >
                  Clear All
                </button>
              )}

              <button
                type="button"
                onClick={() => setIsFavoritesOpen(false)}
                className="p-2 rounded-full text-[#64748B] hover:text-[#172033] hover:bg-slate-100 transition"
                aria-label="Close favorites drawer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Confirm Clear Banner */}
          {confirmClear && (
            <div className="p-3 bg-rose-50 border-b border-rose-200 flex items-center justify-between text-xs text-rose-700 animate-in fade-in">
              <span className="font-medium">Clear all saved items?</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setConfirmClear(false)}
                  className="px-2.5 py-1 rounded-lg bg-white border border-rose-200 text-rose-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    clearFavorites();
                    setConfirmClear(false);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-rose-600 text-white font-bold"
                >
                  Confirm
                </button>
              </div>
            </div>
          )}

          {/* Favorites List / Empty State */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
            {favorites.length > 0 ? (
              favorites.map((item) => {
                const timeRemaining = formatTimeRemaining(item.endsAt);
                return (
                  <div 
                    key={item.id}
                    className="p-4 rounded-2xl bg-[#F5F7FB] border border-[#E5EAF2] space-y-3 relative group transition hover:border-[#2457E6]/30 hover:bg-white"
                  >
                    <div className="flex items-start gap-3.5">
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-18 h-18 sm:w-20 sm:h-20 rounded-xl object-cover shrink-0 border border-[#E5EAF2]"
                      />
                      <div className="space-y-1 flex-1 min-w-0">
                        {/* Status & Timer Tag */}
                        <div className="flex items-center justify-between gap-2">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                            item.status === "ENDING_SOON"
                              ? "bg-rose-50 text-rose-600 border border-rose-200"
                              : "bg-[#E8FAF7] text-[#16B8A6] border border-[#16B8A6]/30"
                          }`}>
                            <Clock className="w-3 h-3" />
                            <span>{timeRemaining.formatted}</span>
                          </span>

                          <button
                            type="button"
                            onClick={() => removeFromFavorites(item.id)}
                            className="text-[#64748B] hover:text-rose-600 p-1 rounded-lg hover:bg-slate-200/60 transition"
                            title="Remove from favorites"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <Link 
                          href={`/auction/${item.id}`}
                          onClick={() => setIsFavoritesOpen(false)}
                        >
                          <h4 className="font-extrabold text-xs sm:text-sm text-[#172033] hover:text-[#2457E6] transition line-clamp-1">
                            {item.title}
                          </h4>
                        </Link>

                        <p className="text-[11px] text-[#64748B]">Consignor: {item.sellerName}</p>

                        <div className="flex items-baseline justify-between pt-1">
                          <div>
                            <span className="text-[10px] text-[#64748B] block">Current High Bid</span>
                            <span className="font-mono-num font-black text-sm text-[#172033]">
                              {formatLKR(item.currentPrice)}
                            </span>
                          </div>

                          {item.totalBids > 0 && (
                            <span className="text-[10px] text-[#64748B]">
                              {item.totalBids} bids placed
                            </span>
                          )}
                        </div>

                        {/* Outbid Alert Pill */}
                        {item.isOutbid && (
                          <div className="mt-2 p-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-[11px] font-bold flex items-center gap-1.5 animate-pulse">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                            <span>You have been outbid on this lot!</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions Bar */}
                    <div className="pt-2 border-t border-[#E5EAF2]">
                      <Link
                        href={`/auction/${item.id}`}
                        onClick={() => setIsFavoritesOpen(false)}
                        className="w-full py-2.5 bg-[#2457E6] hover:bg-[#1d46be] text-white text-xs font-bold rounded-xl transition text-center shadow-sm flex items-center justify-center gap-1.5"
                      >
                        <Gavel className="w-3.5 h-3.5" />
                        <span>Place Bid on this Lot</span>
                      </Link>
                    </div>
                  </div>
                );
              })
            ) : (
              /* Section 5: Favorites Empty State */
              <div className="py-20 text-center space-y-4">
                <div className="w-20 h-20 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto shadow-inner">
                  <Heart className="w-10 h-10 stroke-[1.5]" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-lg font-black text-[#172033]">Keep the things you love.</h4>
                  <p className="text-xs text-[#64748B] max-w-xs mx-auto">
                    Save interesting products and auctions to find them easily later.
                  </p>
                </div>
                <Link
                  href="/search"
                  onClick={() => setIsFavoritesOpen(false)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#2457E6] hover:bg-[#1d46be] text-white font-bold text-xs rounded-xl shadow-sm transition"
                >
                  <span>Explore Auctions</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>

          {/* Drawer Footer */}
          {favorites.length > 0 && (
            <div className="p-5 sm:p-6 border-t border-[#E5EAF2] bg-[#F5F7FB]/70 space-y-3 sticky bottom-0">
              <Link
                href="/dashboard?mode=buying"
                onClick={() => setIsFavoritesOpen(false)}
                className="w-full py-3 bg-white border border-[#E5EAF2] hover:bg-[#F5F7FB] text-[#172033] font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 text-center"
              >
                <span>View Full Bidding Arena & Watchlist</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <p className="text-[10px] text-[#64748B] text-center">
                Saving an auction monitors price changes and alerts you when outbid.
              </p>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
