"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { 
  Heart, 
  MapPin, 
  ArrowRight, 
  ShieldCheck, 
  Eye,
  Zap,
  Flame
} from "lucide-react";
import { formatLKR } from "@/lib/utils";
import { useApp } from "@/context/AppContext";
import { AuctionCountdown } from "@/components/AuctionCountdown";
import { AuctionReminderButton } from "@/components/AuctionReminderButton";
import { globalTimer } from "@/lib/timer-engine";
import { recommendationEngine } from "@/lib/recommendation-engine";

export interface AuctionCardProps {
  auction: {
    id: string;
    title: string;
    slug?: string;
    currentPrice: number;
    startingPrice: number;
    reservePrice?: number | null;
    buyNowPrice?: number | null;
    totalBids: number;
    endsAt: string | Date;
    status?: string;
    locationDistrict?: string;
    product?: {
      condition?: string;
      images?: Array<{ url: string; isPrimary?: boolean }>;
    };
    seller?: {
      storeName?: string;
      isVerified?: boolean;
      reputationScore?: number;
    };
    category?: {
      name?: string;
      slug?: string;
    };
  };
  onQuickView?: (auction: any) => void;
  showBidProgress?: boolean;
  recommendationMatch?: {
    matchPercentage: number;
    matchReason: string;
  };
}

export function AuctionCard({ auction, onQuickView, showBidProgress = true, recommendationMatch }: AuctionCardProps) {
  const { favorites, toggleFavorite } = useApp();
  const isWatched = favorites.some((f) => f.id === auction.id);

  const [hasEnded, setHasEnded] = useState(() => {
    return auction.status?.toUpperCase() === "ENDED" || new Date(auction.endsAt).getTime() <= Date.now();
  });

  useEffect(() => {
    const isEnded = auction.status?.toUpperCase() === "ENDED" || new Date(auction.endsAt).getTime() <= Date.now();
    if (isEnded) {
      setHasEnded(true);
      return;
    }
    const unsubscribe = globalTimer.subscribe(
      auction.id,
      auction.endsAt,
      (breakdown) => {
        setHasEnded(breakdown.hasEnded);
      }
    );
    return () => unsubscribe();
  }, [auction.id, auction.endsAt, auction.status]);

  // Extract all available product photos
  const rawImages = auction.product?.images?.map((img) => img.url).filter(Boolean) || [];
  const fallbackUrl = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80";
  const primaryUrl = auction.product?.images?.find((img) => img.isPrimary)?.url || rawImages[0] || fallbackUrl;
  
  // Array of distinct photos for hover switching
  const images = rawImages.length > 0 ? Array.from(new Set([primaryUrl, ...rawImages])) : [primaryUrl];

  // Hover image switcher states
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isHoveringImage, setIsHoveringImage] = useState(false);
  const cycleIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-cycle through photos on hover
  const handleMouseEnter = () => {
    setIsHoveringImage(true);
    if (images.length > 1) {
      if (cycleIntervalRef.current) clearInterval(cycleIntervalRef.current);
      cycleIntervalRef.current = setInterval(() => {
        setActiveImageIndex((prev) => (prev + 1) % images.length);
      }, 1200);
    }
  };

  // Allow scrubbing through photos by moving mouse horizontally
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (images.length <= 1) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, e.clientX - rect.left);
    const segmentWidth = rect.width / images.length;
    const targetIndex = Math.min(Math.floor(x / segmentWidth), images.length - 1);
    
    setActiveImageIndex(targetIndex);

    // Reset interval timer so it stays on user's hovered position before continuing
    if (cycleIntervalRef.current) {
      clearInterval(cycleIntervalRef.current);
      cycleIntervalRef.current = setInterval(() => {
        setActiveImageIndex((prev) => (prev + 1) % images.length);
      }, 1400);
    }
  };

  // Reset back to primary cover image when mouse leaves
  const handleMouseLeave = () => {
    setIsHoveringImage(false);
    if (cycleIntervalRef.current) {
      clearInterval(cycleIntervalRef.current);
      cycleIntervalRef.current = null;
    }
    setActiveImageIndex(0);
  };

  useEffect(() => {
    return () => {
      if (cycleIntervalRef.current) clearInterval(cycleIntervalRef.current);
    };
  }, []);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    recommendationEngine.trackInteraction("FAVORITE", {
      auctionId: auction.id,
      title: auction.title,
      categorySlug: auction.category?.slug,
      price: auction.currentPrice,
      district: auction.locationDistrict,
    });
    toggleFavorite({
      id: auction.id,
      title: auction.title,
      sellerName: auction.seller?.storeName || "Verified Consignor",
      currentPrice: auction.currentPrice,
      startingPrice: auction.startingPrice,
      imageUrl: primaryUrl,
      endsAt: auction.endsAt,
      status: "LIVE",
      totalBids: auction.totalBids,
      buyNowPrice: auction.buyNowPrice,
      locationDistrict: auction.locationDistrict || "Colombo",
    });
  };

  return (
    <div className="group relative rounded-2xl bg-white dark:bg-slate-900 border border-[#E5EAF2] dark:border-slate-800 hover:border-[#2457E6]/40 dark:hover:border-blue-500/40 transition-all duration-300 flex flex-col overflow-hidden shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_12px_32px_rgb(0,0,0,0.08)] hover:-translate-y-1">
      {/* Product Image & Top Overlays */}
      <div 
        className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100 dark:bg-slate-800 cursor-pointer"
        onMouseEnter={handleMouseEnter}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* Rendered Stacked Photos with Smooth Fade Transition */}
        {images.map((imgUrl, idx) => (
          <img
            key={imgUrl + idx}
            src={imgUrl}
            alt={`${auction.title} - photo ${idx + 1}`}
            loading={idx === 0 ? "eager" : "lazy"}
            decoding="async"
            className={`absolute inset-0 w-full h-full object-cover transition-all duration-500 ${
              idx === activeImageIndex
                ? "opacity-100 scale-105 z-0"
                : "opacity-0 scale-100 pointer-events-none -z-10"
            }`}
          />
        ))}

        {/* Live Shared Countdown Pill */}
        <div className="absolute top-3 left-3 z-20 pointer-events-none">
          <AuctionCountdown
            auctionId={auction.id}
            endsAt={auction.endsAt}
            variant="pill"
            showMilliseconds={true}
          />
        </div>

        {/* Action Controls: Reminder & Favorites */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5 z-20">
          <AuctionReminderButton
            auctionId={auction.id}
            auctionTitle={auction.title}
            endsAt={auction.endsAt}
          />
          <button
            type="button"
            onClick={handleFavoriteClick}
            className={`p-2 rounded-full backdrop-blur-md transition shadow-sm ${
              isWatched
                ? "bg-rose-500 text-white"
                : "bg-white/90 text-[#64748B] hover:text-rose-500 hover:bg-white dark:bg-slate-900/90 dark:text-slate-300"
            }`}
            title="Save to Favorites"
          >
            <Heart className={`w-4 h-4 ${isWatched ? "fill-white" : ""}`} />
          </button>
        </div>

        {/* Multi-Photo Indicator Dots / Bars */}
        {images.length > 1 && (
          <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20 pointer-events-none px-2 py-1 rounded-full bg-slate-900/40 backdrop-blur-sm">
            {images.map((_, idx) => (
              <span
                key={idx}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === activeImageIndex
                    ? "w-4 bg-white shadow-xs"
                    : "w-1.5 bg-white/40"
                }`}
              />
            ))}
          </div>
        )}

        {/* Multi-Photo Angle Badge Counter on Hover */}
        {images.length > 1 && isHoveringImage && (
          <span className="absolute bottom-2.5 right-2.5 z-20 bg-slate-900/75 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-md pointer-events-none animate-in fade-in duration-200">
            {activeImageIndex + 1}/{images.length}
          </span>
        )}

        {/* Desktop Quick Peek Hover Button (Non-blocking glass pill) */}
        {onQuickView && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 hidden md:flex items-center justify-center z-20 pointer-events-none group-hover:pointer-events-auto">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                recommendationEngine.trackInteraction("QUICK_PEEK", {
                  auctionId: auction.id,
                  title: auction.title,
                  categorySlug: auction.category?.slug,
                  price: auction.currentPrice,
                  district: auction.locationDistrict,
                });
                onQuickView(auction);
              }}
              className="px-3.5 py-1.5 bg-white/95 dark:bg-slate-900/95 text-[#172033] dark:text-white hover:bg-[#2457E6] hover:text-white text-xs font-bold rounded-xl shadow-xl border border-white/50 dark:border-slate-700 backdrop-blur-md transition-all duration-200 flex items-center gap-1.5 transform translate-y-2 group-hover:translate-y-0"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Quick Peek</span>
            </button>
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-2">
          {/* Category, Location & Verification Tag */}
          <div className="flex items-center justify-between text-xs text-[#64748B] dark:text-slate-400">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#2457E6] dark:text-blue-400 truncate max-w-[120px]">
                {auction.category?.name || "Auction Lot"}
              </span>
              {recommendationMatch && recommendationMatch.matchPercentage >= 70 && (
                <span
                  className="text-[9px] font-black text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-500/25 px-1.5 py-0.2 rounded-md flex items-center gap-0.5 shrink-0"
                  title={recommendationMatch.matchReason}
                >
                  <Flame className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-400 fill-emerald-600 dark:fill-emerald-400" />
                  <span>{recommendationMatch.matchPercentage}%</span>
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="truncate max-w-[95px]">{auction.locationDistrict || "Colombo"}</span>
              {auction.seller?.isVerified && (
                <span className="text-[10px] font-bold text-[#16B8A6] bg-[#E8FAF7] dark:bg-teal-950/40 dark:text-teal-300 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                  <ShieldCheck className="w-3 h-3" />
                  Verified
                </span>
              )}
            </div>
          </div>

          {/* Title */}
          <Link 
            href={`/auction/${auction.id}`}
            onClick={() => {
              recommendationEngine.trackInteraction("VIEW_DETAIL", {
                auctionId: auction.id,
                title: auction.title,
                categorySlug: auction.category?.slug,
                price: auction.currentPrice,
                district: auction.locationDistrict,
              });
            }}
          >
            <h3 className="font-extrabold text-[#172033] dark:text-[#F8FAFC] group-hover:text-[#2457E6] dark:group-hover:text-blue-400 transition-colors line-clamp-2 text-sm leading-snug">
              {auction.title}
            </h3>
          </Link>
        </div>

        {/* Price & Actions Section (Spacious 2-Row Design) */}
        <div className="pt-3 border-t border-[#E5EAF2] dark:border-slate-800 space-y-2.5">
          {/* Row 1: Prices */}
          <div className="flex items-baseline justify-between gap-2">
            <div>
              <span className="text-[10px] font-semibold text-[#64748B] dark:text-slate-400 block uppercase tracking-wider">
                {hasEnded ? "Winning High Bid" : "Current High Bid"}
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-base sm:text-lg font-black text-[#172033] dark:text-[#F8FAFC] tracking-tight">
                  {formatLKR(auction.currentPrice)}
                </span>
                <span className="text-[10px] text-[#64748B] dark:text-slate-400">
                  ({auction.totalBids} {auction.totalBids === 1 ? "bid" : "bids"})
                </span>
              </div>
            </div>

            {auction.buyNowPrice && !hasEnded && (
              <div className="text-right shrink-0">
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 block uppercase tracking-wider">
                  ⚡ Buy Now
                </span>
                <span className="text-xs sm:text-sm font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
                  {formatLKR(auction.buyNowPrice)}
                </span>
              </div>
            )}
          </div>

          {/* Row 2: Full-Width Action Buttons */}
          <div className="flex items-center gap-2 pt-1 w-full">
            {/* Mobile Quick View Action */}
            {onQuickView && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  recommendationEngine.trackInteraction("QUICK_PEEK", {
                    auctionId: auction.id,
                    title: auction.title,
                    categorySlug: auction.category?.slug,
                    price: auction.currentPrice,
                    district: auction.locationDistrict,
                  });
                  onQuickView(auction);
                }}
                className="p-2 border border-[#E5EAF2] dark:border-slate-700 hover:border-[#2457E6] text-[#64748B] dark:text-slate-300 hover:text-[#2457E6] rounded-xl transition md:hidden shrink-0"
                title="Quick Peek"
              >
                <Eye className="w-4 h-4" />
              </button>
            )}

            {hasEnded ? (
              <button
                type="button"
                disabled
                aria-disabled="true"
                className="w-full py-2.5 px-3 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700/80 cursor-not-allowed select-none flex items-center justify-center gap-1.5 shadow-none"
                title="This auction has ended. Click the item title to view full details."
              >
                <span>Auction Ended</span>
              </button>
            ) : (
              <Link
                href={`/auction/${auction.id}`}
                className="w-full py-2 px-3.5 bg-[#2457E6] hover:bg-[#1d46be] text-white text-xs font-bold rounded-xl transition shadow-sm flex items-center justify-between group/btn"
              >
                <span className="font-extrabold tracking-wide">Bid Now</span>
                <div className="flex items-center gap-1.5">
                  {auction.reservePrice ? (
                    auction.currentPrice >= auction.reservePrice ? (
                      <span className="text-[10px] font-bold bg-[#16B8A6] text-white px-2 py-0.5 rounded shadow-xs">
                        Reserve Met
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold bg-white/20 text-white px-2 py-0.5 rounded">
                        Reserved
                      </span>
                    )
                  ) : null}
                  <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
                </div>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}