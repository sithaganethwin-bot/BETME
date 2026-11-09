"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import confetti from "canvas-confetti";
import { 
  X, 
  Clock, 
  MapPin, 
  ShieldCheck, 
  Gavel, 
  ArrowRight, 
  ExternalLink, 
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Lock,
  ChevronLeft,
  ChevronRight,
  Eye,
  Zap,
  ShoppingBag
} from "lucide-react";
import { formatLKR, calculateBidIncrement } from "@/lib/utils";
import { useApp } from "@/context/AppContext";
import { AuctionCountdown } from "@/components/AuctionCountdown";
import { AuctionReminderButton } from "@/components/AuctionReminderButton";
import { recommendationEngine } from "@/lib/recommendation-engine";

export interface QuickPeekAuctionData {
  id: string;
  title: string;
  currentPrice: number;
  startingPrice: number;
  reservePrice?: number | null;
  buyNowPrice?: number | null;
  totalBids: number;
  endsAt: string | Date;
  status?: string;
  locationDistrict: string;
  product: {
    condition: string;
    description?: string;
    brand?: string | null;
    model?: string | null;
    images: Array<{ url: string; isPrimary: boolean }>;
  };
  seller: {
    storeName: string;
    isVerified: boolean;
    reputationScore: number;
  };
  category: {
    name: string;
    slug: string;
  };
}

interface QuickPeekDrawerProps {
  auction: QuickPeekAuctionData | null;
  isOpen: boolean;
  onClose: () => void;
  onBidSuccess?: (updatedAuction: any) => void;
}

export function QuickPeekDrawer({
  auction,
  isOpen,
  onClose,
  onBidSuccess,
}: QuickPeekDrawerProps) {
  const { currentUser, addNotification } = useApp();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [bids, setBids] = useState<any[]>([]);
  const [isLoadingBids, setIsLoadingBids] = useState(false);

  // Quick bid state
  const [currentPrice, setCurrentPrice] = useState(auction?.currentPrice || 0);
  const [totalBids, setTotalBids] = useState(auction?.totalBids || 0);
  const [endsAt, setEndsAt] = useState(auction?.endsAt || new Date());
  const [bidAmount, setBidAmount] = useState(0);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showBuyNowModal, setShowBuyNowModal] = useState(false);
  const [isBuyNowSubmitting, setIsBuyNowSubmitting] = useState(false);
  const [shippingAddress, setShippingAddress] = useState(
    currentUser?.address || "No. 42/B, Ward Place, Colombo 07"
  );
  const [buyNowSuccess, setBuyNowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const increment = calculateBidIncrement(currentPrice);
  const minNextBid = totalBids === 0 ? (auction?.startingPrice || 0) : currentPrice + increment;

  // Sync state whenever auction opens
  useEffect(() => {
    if (auction) {
      setCurrentPrice(auction.currentPrice);
      setTotalBids(auction.totalBids);
      setEndsAt(auction.endsAt);
      setSelectedImageIndex(0);
      setErrorMsg(null);
      setSuccessMsg(null);

      // Algorithmic signal ingestion (Quick Peek inspection)
      recommendationEngine.trackInteraction("QUICK_PEEK", {
        auctionId: auction.id,
        title: auction.title,
        categorySlug: (auction as any).category?.slug,
        price: auction.currentPrice,
        district: auction.locationDistrict,
      });

      const inc = calculateBidIncrement(auction.currentPrice);
      const nextMin = auction.totalBids === 0 ? auction.startingPrice : auction.currentPrice + inc;
      setBidAmount(nextMin);

      // Load real latest 5 bids
      setIsLoadingBids(true);
      fetch(`/api/auctions/${auction.id}/bids`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.bids) {
            setBids(data.bids);
          }
        })
        .catch(() => {})
        .finally(() => setIsLoadingBids(false));
    }
  }, [auction]);

  // Handle escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !auction) return null;

  const images = auction.product.images?.length > 0
    ? auction.product.images
    : [{ url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800", isPrimary: true }];

  const currentImageUrl = images[selectedImageIndex]?.url || images[0].url;

  const handleQuickAdd = (amount: number) => {
    setBidAmount((prev) => Math.max(minNextBid, prev + amount));
  };

  const handleOpenConfirmation = () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    if (bidAmount < minNextBid) {
      setErrorMsg(`Minimum valid bid is ${formatLKR(minNextBid)}.`);
      return;
    }
    setShowConfirmModal(true);
  };

  const handleExecuteBid = async () => {
    setShowConfirmModal(false);
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch(`/api/auctions/${auction.id}/bid`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bidderId: currentUser?.id || "usr_buyer_101",
          amount: bidAmount,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Bid could not be processed.");
      }

      // Update state immediately
      const updatedLot = data.auction;
      if (updatedLot) {
        setCurrentPrice(updatedLot.currentPrice);
        setTotalBids(updatedLot.totalBids);
        if (updatedLot.endsAt) setEndsAt(updatedLot.endsAt);
      } else {
        setCurrentPrice(bidAmount);
        setTotalBids((prev) => prev + 1);
      }

      setSuccessMsg(
        data.extensionTriggered
          ? "Bid accepted! Soft-close anti-sniping activated (+2 mins added)."
          : `Bid of ${formatLKR(bidAmount)} successfully placed!`
      );

      addNotification(`Your bid of ${formatLKR(bidAmount)} on "${auction.title}" was accepted!`);

      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ["#2457E6", "#16B8A6", "#172033"],
      });

      // Refresh bids list
      fetch(`/api/auctions/${auction.id}/bids`)
        .then((r) => r.json())
        .then((d) => {
          if (d.success && d.bids) setBids(d.bids);
        })
        .catch(() => {});

      if (onBidSuccess && updatedLot) {
        onBidSuccess(updatedLot);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to place bid.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExecuteBuyNow = async () => {
    setIsBuyNowSubmitting(true);
    setErrorMsg(null);
    try {
      const res = await fetch(`/api/auctions/${auction.id}/buynow`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          buyerId: currentUser?.id || "usr_buyer_101",
          shippingAddress,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Instant Buy transaction failed.");
      }

      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        colors: ["#16B8A6", "#2457E6", "#10B981", "#F59E0B"],
      });

      setBuyNowSuccess(true);
      setShowBuyNowModal(false);
      setSuccessMsg("🎉 Instant Buy Successful! You won this lot. Escrow order created in BIDME Trust Vault.");

      if (data.auction) {
        setCurrentPrice(data.auction.currentPrice);
        setTotalBids(data.auction.totalBids);
      }

      addNotification(
        `⚡ Instant Buy won! You purchased "${auction.title}" for ${formatLKR(auction.buyNowPrice || 0)}.`
      );

      if (onBidSuccess && data.auction) {
        onBidSuccess(data.auction);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to process Instant Buy.");
      setShowBuyNowModal(false);
    } finally {
      setIsBuyNowSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-4 sm:pl-10">
        <div className="w-screen max-w-xl bg-white dark:bg-[#131B2B] shadow-2xl flex flex-col h-full overflow-hidden animate-in slide-in-from-right duration-300">
          
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-[#E5EAF2] dark:border-slate-800 flex items-center justify-between bg-[#F5F7FB] dark:bg-[#0E1420]/60">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#16B8A6] animate-pulse"></span>
              <span className="text-xs font-bold uppercase tracking-wider text-[#16B8A6]">
                Quick Peek
              </span>
              <span className="text-xs text-[#64748B]">•</span>
              <span className="text-xs font-semibold text-[#64748B] dark:text-slate-400 truncate max-w-[200px]">
                {auction.category?.name}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <AuctionReminderButton
                auctionId={auction.id}
                auctionTitle={auction.title}
                endsAt={endsAt}
              />
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-full text-[#64748B] hover:text-[#172033] dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
            
            {/* 1. Image Gallery with Carousel & Indicators */}
            <div className="space-y-3">
              <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-[#E5EAF2] dark:border-slate-800 group">
                <img
                  src={currentImageUrl}
                  alt={auction.title}
                  className="w-full h-full object-cover transition-transform duration-300"
                />

                {/* Left/Right Carousel arrows if multiple images */}
                {images.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() => setSelectedImageIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1))}
                      className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-white/90 dark:bg-black/80 text-[#172033] dark:text-white shadow-sm opacity-0 group-hover:opacity-100 transition"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0))}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-white/90 dark:bg-black/80 text-[#172033] dark:text-white shadow-sm opacity-0 group-hover:opacity-100 transition"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </>
                )}

                {/* Image Counter Badge */}
                <div className="absolute bottom-2.5 right-2.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-bold">
                  {selectedImageIndex + 1} / {images.length}
                </div>

                {/* Condition Pill */}
                <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-md bg-white/95 dark:bg-black/80 text-[#172033] dark:text-white text-[10px] font-bold shadow-sm">
                  {auction.product?.condition?.replace("_", " ")}
                </div>
              </div>

              {/* Thumbnails Strip */}
              {images.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`relative w-14 h-14 rounded-xl overflow-hidden shrink-0 border-2 transition ${
                        selectedImageIndex === idx
                          ? "border-[#2457E6] scale-105"
                          : "border-transparent opacity-70 hover:opacity-100"
                      }`}
                    >
                      <img src={img.url} alt="thumbnail" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 2. Title & Live Stats */}
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg sm:text-xl font-black text-[#172033] dark:text-[#F8FAFC] leading-snug">
                    {auction.title}
                  </h2>
                  <div className="flex items-center gap-2 text-xs text-[#64748B] dark:text-slate-400 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-[#2457E6]" />
                    <span>{auction.locationDistrict}, Sri Lanka</span>
                    <span>•</span>
                    <span className="font-semibold">{auction.seller.storeName}</span>
                    {auction.seller.isVerified && (
                      <span className="text-[#16B8A6] flex items-center gap-0.5 font-bold text-[10px]">
                        <ShieldCheck className="w-3 h-3" /> Verified
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Countdown Banner with Milliseconds support */}
              <AuctionCountdown
                auctionId={auction.id}
                endsAt={endsAt}
                variant="banner"
              />
            </div>

            {/* 3. Pricing Matrix */}
            <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-[#F5F7FB] dark:bg-slate-800/60 border border-[#E5EAF2] dark:border-slate-800">
              <div>
                <span className="text-[11px] font-medium text-[#64748B] dark:text-slate-400 block">
                  Current High Bid
                </span>
                <span className="text-xl sm:text-2xl font-black text-[#172033] dark:text-white font-mono-num">
                  {formatLKR(currentPrice)}
                </span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[10px] text-[#64748B] block">
                    {totalBids} bids recorded
                  </span>
                  {auction.reservePrice ? (
                    currentPrice >= auction.reservePrice ? (
                      <span className="text-[9px] font-bold bg-[#E8FAF7] text-[#16B8A6] dark:bg-teal-950/60 dark:text-teal-300 px-1.5 py-0.5 rounded">
                        Reserve Met
                      </span>
                    ) : (
                      <span className="text-[9px] font-semibold bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-300 px-1.5 py-0.5 rounded">
                        Reserved
                      </span>
                    )
                  ) : null}
                </div>
              </div>

              <div>
                <span className="text-[11px] font-bold text-[#2457E6] dark:text-blue-400 block">
                  Next Valid Bid
                </span>
                <span className="text-xl sm:text-2xl font-black text-[#2457E6] dark:text-blue-400 font-mono-num">
                  {formatLKR(minNextBid)}
                </span>
                <span className="text-[10px] text-[#2457E6]/80 block mt-0.5">
                  +Rs. {increment.toLocaleString("en-LK")} step
                </span>
              </div>
            </div>

            {/* Clean & Compact Buy It Now Strip */}
            {auction.buyNowPrice && !(auction.status === "ENDED" || new Date(endsAt).getTime() <= Date.now()) && !buyNowSuccess && (
              <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-500/25">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Zap className="w-4 h-4 fill-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200">Buy It Now:</span>
                      <span className="text-sm font-black text-emerald-700 dark:text-emerald-400 font-mono-num">
                        {formatLKR(auction.buyNowPrice)}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block -mt-0.5">
                      Instant purchase • Bypasses auction
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowBuyNowModal(true)}
                  disabled={isSubmitting || isBuyNowSubmitting}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 shrink-0 hover:scale-[1.02] active:scale-95 cursor-pointer"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Buy Now</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            )}

            {/* 4. Quick Bidding Interface */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#131B2B] border border-[#E5EAF2] dark:border-slate-800 space-y-4 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-xs text-[#172033] dark:text-[#F8FAFC] flex items-center gap-1.5">
                  <Gavel className="w-4 h-4 text-[#2457E6]" />
                  <span>Place Quick Bid</span>
                </span>
                <span className="text-[11px] font-semibold text-[#16B8A6]">
                  +120s Anti-Sniping Protection
                </span>
              </div>

              {auction.status === "ENDED" || new Date(endsAt).getTime() <= Date.now() ? (
                <div className="space-y-3 pt-1">
                  <div className="p-3 bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl text-center">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                      This auction has ended. Bidding is permanently closed.
                    </span>
                  </div>
                  <button
                    type="button"
                    disabled
                    aria-disabled="true"
                    className="w-full py-3.5 bg-slate-200/80 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-black text-xs sm:text-sm rounded-xl border border-slate-300/80 dark:border-slate-700/80 cursor-not-allowed pointer-events-none select-none flex items-center justify-center gap-2 shadow-none"
                  >
                    <Clock className="w-4 h-4" />
                    <span>Auction Ended — Bidding Closed</span>
                  </button>
                </div>
              ) : (
                <>
                  {/* Increment Quick Add Chips */}
                  <div className="grid grid-cols-4 gap-2">
                    {[500, 1000, 2500, 5000].map((add) => (
                      <button
                        key={add}
                        type="button"
                        onClick={() => handleQuickAdd(add)}
                        className="py-1.5 bg-[#F5F7FB] dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-[#E5EAF2] dark:border-slate-700 rounded-xl text-xs font-bold text-[#172033] dark:text-slate-200 transition"
                      >
                        +Rs. {add >= 1000 ? `${add / 1000}k` : add}
                      </button>
                    ))}
                  </div>

                  {/* Input */}
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[#64748B]">
                      Rs.
                    </span>
                    <input
                      type="number"
                      value={bidAmount}
                      onChange={(e) => setBidAmount(parseFloat(e.target.value) || minNextBid)}
                      min={minNextBid}
                      step={increment}
                      className="w-full bg-[#F5F7FB] dark:bg-slate-800 border border-[#E5EAF2] dark:border-slate-700 rounded-2xl pl-10 pr-4 py-3 font-mono-num font-black text-lg text-[#172033] dark:text-white focus:outline-none focus:border-[#2457E6]"
                    />
                  </div>

                  {errorMsg && (
                    <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-semibold rounded-xl flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  {successMsg && (
                    <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-300 text-xs font-semibold rounded-xl flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 shrink-0" />
                      <span>{successMsg}</span>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleOpenConfirmation}
                    disabled={isSubmitting}
                    className="w-full py-3.5 bg-[#2457E6] hover:bg-[#1d46be] disabled:bg-slate-300 text-white font-black text-xs sm:text-sm rounded-xl shadow-sm transition flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-95"
                  >
                    <Gavel className="w-4 h-4" />
                    <span>Review & Submit Bid of {formatLKR(bidAmount)}</span>
                  </button>
                </>
              )}
            </div>

            {/* 6. Recent Bid History (5 genuine records) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#172033] dark:text-[#F8FAFC] flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-[#2457E6]" />
                  <span>Latest Bid History</span>
                </span>
                <span className="text-[10px] text-[#64748B] dark:text-slate-400">
                  {totalBids} verified bids
                </span>
              </div>

              {isLoadingBids ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((n) => (
                    <div key={n} className="h-10 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : bids.length > 0 ? (
                <div className="space-y-1.5">
                  {bids.map((b, idx) => (
                    <div
                      key={b.id || idx}
                      className={`p-2.5 rounded-xl border flex items-center justify-between text-xs ${
                        idx === 0
                          ? "bg-[#EEF3FF] dark:bg-blue-950/40 border-[#2457E6]/30 text-[#172033] dark:text-white font-bold"
                          : "bg-[#F5F7FB] dark:bg-slate-800/50 border-[#E5EAF2] dark:border-slate-800 text-[#64748B] dark:text-slate-300"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                          idx === 0 ? "bg-[#2457E6] text-white" : "bg-slate-200 dark:bg-slate-700 text-[#172033] dark:text-slate-200"
                        }`}>
                          {idx === 0 ? "★" : idx + 1}
                        </div>
                        <span className="truncate max-w-[120px]">{b.bidderName}</span>
                        {b.isAutoBid && (
                          <span className="px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900 text-[#2457E6] dark:text-blue-300 text-[9px] font-black rounded flex items-center gap-0.5">
                            <Zap className="w-2.5 h-2.5" /> Auto
                          </span>
                        )}
                      </div>
                      <div className="text-right font-mono-num font-bold">
                        {formatLKR(b.amount)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[#64748B] text-center py-3 bg-[#F5F7FB] dark:bg-slate-800/40 rounded-xl">
                  No bids placed yet. Be the first to open this lot!
                </p>
              )}
            </div>

          </div>

          {/* Footer CTA: View Full Auction Page */}
          <div className="p-4 sm:p-5 border-t border-[#E5EAF2] dark:border-slate-800 bg-[#F5F7FB] dark:bg-[#0E1420]/80 flex items-center justify-between gap-3">
            <Link
              href={`/auction/${auction.id}`}
              onClick={onClose}
              className="w-full py-3 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-[#172033] dark:text-white border border-[#E5EAF2] dark:border-slate-700 font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-2"
            >
              <span>View Complete Auction Details & Specifications</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>

        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#131B2B] border border-[#E5EAF2] dark:border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-[#E5EAF2] dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-[#172033] dark:text-white">
                <Gavel className="w-5 h-5 text-[#2457E6]" />
                <h3 className="font-extrabold text-base">Confirm Your Auction Bid</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="p-1 rounded-full text-[#64748B] hover:text-[#172033]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-[#F5F7FB] dark:bg-slate-800/60 border border-[#E5EAF2] dark:border-slate-700 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Item:</span>
                  <span className="font-bold text-[#172033] dark:text-white truncate max-w-[200px]">{auction.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Current High:</span>
                  <span className="font-bold text-[#172033] dark:text-white">{formatLKR(currentPrice)}</span>
                </div>
                <div className="flex justify-between border-t border-[#E5EAF2] dark:border-slate-700 pt-2">
                  <span className="font-bold text-[#2457E6] dark:text-blue-400">Your Confirmed Bid:</span>
                  <span className="font-black text-base text-[#2457E6] dark:text-blue-400">{formatLKR(bidAmount)}</span>
                </div>
              </div>

              <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-xl text-[11px] text-amber-800 dark:text-amber-300">
                <Lock className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span>
                  Bids placed on BIDME are legally binding commitments. If your bid wins at auction close, PayHere custodial escrow checkout will be initiated.
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 text-[#172033] dark:text-slate-200 font-bold text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteBid}
                className="flex-1 py-2.5 bg-[#2457E6] hover:bg-[#1d46be] text-white font-bold text-xs rounded-xl shadow-sm transition"
              >
                Confirm & Submit Bid
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Instant Buy Confirmation Modal */}
      {showBuyNowModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#131B2B] border border-[#E5EAF2] dark:border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-[#E5EAF2] dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-[#172033] dark:text-white">
                <Zap className="w-5 h-5 text-emerald-500 fill-emerald-500" />
                <h3 className="font-extrabold text-base">Confirm Instant Buy</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowBuyNowModal(false)}
                className="p-1 rounded-full text-[#64748B] hover:text-[#172033]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-[#F5F7FB] dark:bg-slate-800/60 border border-[#E5EAF2] dark:border-slate-700 space-y-2">
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Item:</span>
                  <span className="font-bold text-[#172033] dark:text-white truncate max-w-[200px]">{auction.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Instant Buy Price:</span>
                  <span className="font-black text-emerald-600 dark:text-emerald-400 font-mono-num">{formatLKR(auction.buyNowPrice || 0)}</span>
                </div>
                <div className="flex justify-between border-t border-[#E5EAF2] dark:border-slate-700 pt-2 font-bold">
                  <span>Escrow & Shipping:</span>
                  <span className="text-[#16B8A6]">100% Guaranteed & Free</span>
                </div>
              </div>

              {/* Delivery Destination Input */}
              <div className="space-y-1">
                <label className="font-bold text-[#172033] dark:text-white flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#2457E6]" />
                  <span>Delivery Address</span>
                </label>
                <input
                  type="text"
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  placeholder="Street address, city, district"
                  className="w-full px-3 py-2 bg-[#F5F7FB] dark:bg-slate-800 border border-[#E5EAF2] dark:border-slate-700 rounded-xl text-xs text-[#172033] dark:text-white outline-none focus:border-[#2457E6]"
                />
              </div>

              <div className="flex items-start gap-2 p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 rounded-xl text-[11px] text-emerald-800 dark:text-emerald-300">
                <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
                <span>
                  <strong>100% Escrow Protection:</strong> Funds held in BIDME Trust Vault until you inspect for 48 hours. Auction closes immediately for other bidders.
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowBuyNowModal(false)}
                className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 text-[#172033] dark:text-slate-200 font-bold text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteBuyNow}
                disabled={isBuyNowSubmitting}
                className="flex-[2] py-2.5 bg-gradient-to-r from-[#16B8A6] to-[#0D9488] hover:from-[#0D9488] hover:to-[#0F766E] disabled:bg-slate-300 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center justify-center gap-2"
              >
                {isBuyNowSubmitting ? "Processing..." : `Confirm & Pay ${formatLKR(auction.buyNowPrice || 0)}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
