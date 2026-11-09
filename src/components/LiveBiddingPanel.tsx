"use client";

import React, { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import { 
  Gavel, 
  ShieldCheck, 
  Clock, 
  Zap, 
  AlertCircle, 
  CheckCircle,
  TrendingUp,
  X,
  Lock,
  ArrowRight,
  ShoppingBag,
  MapPin
} from "lucide-react";
import { formatLKR, formatTimeRemaining, calculateBidIncrement } from "@/lib/utils";
import { useApp } from "@/context/AppContext";
import { recommendationEngine } from "@/lib/recommendation-engine";

export interface LiveBiddingPanelProps {
  auction: {
    id: string;
    title: string;
    currentPrice: number;
    startingPrice: number;
    reservePrice?: number | null;
    buyNowPrice?: number | null;
    totalBids: number;
    endsAt: string | Date;
    extensionCount: number;
    status: string;
    bids: Array<{
      id: string;
      amount: number;
      isAutoBid: boolean;
      createdAt: string | Date;
      bidder: {
        id: string;
        name: string;
        avatarUrl?: string | null;
        buyerScore: number;
      };
    }>;
    category?: {
      slug?: string;
      name?: string;
    };
    locationDistrict?: string;
  };
  onBidSuccess?: (updatedAuction: any) => void;
}

export function LiveBiddingPanel({ auction, onBidSuccess }: LiveBiddingPanelProps) {
  const { currentUser, addNotification, addToCart, setIsCartOpen } = useApp();
  const [currentPrice, setCurrentPrice] = useState(auction.currentPrice);
  const [totalBids, setTotalBids] = useState(auction.totalBids);
  const [endsAt, setEndsAt] = useState(auction.endsAt);
  const [bidsList, setBidsList] = useState(auction.bids || []);

  const [bidAmount, setBidAmount] = useState<number>(0);
  const [autoBidMax, setAutoBidMax] = useState<number>(0);
  const [activeAutoBidRule, setActiveAutoBidRule] = useState<{
    id?: string;
    maxAmount: number;
    isActive: boolean;
  } | null>(null);

  const [activeTab, setActiveTab] = useState<"manual" | "autobid">("manual");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showBuyNowModal, setShowBuyNowModal] = useState(false);
  const [isBuyNowSubmitting, setIsBuyNowSubmitting] = useState(false);
  const [shippingAddress, setShippingAddress] = useState(
    currentUser?.address || "No. 42/B, Ward Place, Colombo 07"
  );
  const [buyNowSuccess, setBuyNowSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [timeState, setTimeState] = useState(formatTimeRemaining(endsAt));

  const increment = calculateBidIncrement(currentPrice);
  const minNextBid = totalBids === 0 ? auction.startingPrice : currentPrice + increment;

  useEffect(() => {
    setBidAmount(minNextBid);
    if (!activeAutoBidRule || !activeAutoBidRule.isActive) {
      setAutoBidMax(minNextBid + increment * 5);
    }
  }, [minNextBid, increment]);

  // Load existing user auto-bid rule on mount or user change
  useEffect(() => {
    if (!currentUser?.id || !auction?.id) return;
    fetch(`/api/auctions/${auction.id}/autobid?userId=${currentUser.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.rule) {
          setActiveAutoBidRule(data.rule);
          if (data.rule.isActive && data.rule.maxAmount > currentPrice) {
            setAutoBidMax(data.rule.maxAmount);
          }
        }
      })
      .catch(() => {});
  }, [currentUser?.id, auction?.id, currentPrice]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeState(formatTimeRemaining(endsAt));
    }, 1000);
    return () => clearInterval(timer);
  }, [endsAt]);

  const handleQuickAdd = (additional: number) => {
    if (activeTab === "manual") {
      setBidAmount((prev) => Math.max(minNextBid, prev + additional));
    } else {
      setAutoBidMax((prev) => Math.max(minNextBid + increment, (prev || minNextBid) + additional));
    }
  };

  // Open confirmation modal
  const handleOpenConfirmation = () => {
    setErrorMsg(null);
    setSuccessMsg(null);

    if (activeTab === "manual") {
      if (bidAmount < minNextBid) {
        setErrorMsg(`Minimum valid bid is ${formatLKR(minNextBid)}.`);
        return;
      }
    } else {
      if (autoBidMax <= currentPrice) {
        setErrorMsg(`Auto-Bid ceiling must exceed current high bid of ${formatLKR(currentPrice)}.`);
        return;
      }
    }
    setShowConfirmModal(true);
  };

  // Execute confirmed bid or auto-bid ceiling
  const handleExecuteConfirmedBid = async () => {
    setShowConfirmModal(false);
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      if (activeTab === "manual") {
        const res = await fetch(`/api/auctions/${auction.id}/bid`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            bidderId: currentUser.id,
            amount: bidAmount,
          }),
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || "Bid could not be processed.");
        }

        const updatedLot = data.auction;
        if (updatedLot) {
          setCurrentPrice(updatedLot.currentPrice);
          setTotalBids(updatedLot.totalBids);
          if (updatedLot.endsAt) setEndsAt(updatedLot.endsAt);
          if (updatedLot.bids) setBidsList(updatedLot.bids);
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

        recommendationEngine.trackInteraction("BID", {
          auctionId: auction.id,
          title: auction.title,
          categorySlug: auction.category?.slug,
          price: bidAmount,
          district: auction.locationDistrict,
        });

        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
          colors: ["#2457E6", "#16B8A6", "#172033"],
        });

        if (onBidSuccess && updatedLot) {
          onBidSuccess(updatedLot);
        }
      } else {
        // Auto-Bid Proxy Ceiling setup
        const res = await fetch(`/api/auctions/${auction.id}/autobid`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: currentUser.id,
            maxAmount: autoBidMax,
          }),
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || "Failed to configure Auto-Bid ceiling.");
        }

        if (data.rule) {
          setActiveAutoBidRule(data.rule);
        }

        const updatedLot = data.auction;
        if (updatedLot) {
          setCurrentPrice(updatedLot.currentPrice);
          setTotalBids(updatedLot.totalBids);
          if (updatedLot.endsAt) setEndsAt(updatedLot.endsAt);
          if (updatedLot.bids) setBidsList(updatedLot.bids);
        }

        setSuccessMsg(
          `⚡ Auto-Bid Ceiling active up to ${formatLKR(autoBidMax)}! BIDME will automatically counter-bid whenever you are outbid.`
        );

        addNotification(
          `Auto-Bid ceiling set up to ${formatLKR(autoBidMax)} on "${auction.title}".`
        );

        confetti({
          particleCount: 65,
          spread: 70,
          origin: { y: 0.7 },
          colors: ["#16B8A6", "#2457E6", "#10B981"],
        });

        if (onBidSuccess && updatedLot) {
          onBidSuccess(updatedLot);
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to submit bid.");
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
        particleCount: 160,
        spread: 80,
        origin: { y: 0.6 },
        colors: ["#16B8A6", "#2457E6", "#10B981", "#F59E0B"],
      });

      setBuyNowSuccess(true);
      setShowBuyNowModal(false);
      setSuccessMsg("🎉 Instant Buy Successful! You won this lot. Escrow order has been created in your BIDME Vault.");

      if (data.auction) {
        setCurrentPrice(data.auction.currentPrice);
        setTotalBids(data.auction.totalBids);
      }
      setTimeState({ ...timeState, hasEnded: true });

      addNotification(
        `⚡ Instant Buy won! You purchased "${auction.title}" for ${formatLKR(auction.buyNowPrice || 0)}.`
      );

      recommendationEngine.trackInteraction("BID", {
        auctionId: auction.id,
        title: auction.title,
        categorySlug: auction.category?.slug,
        price: auction.buyNowPrice || currentPrice,
        district: auction.locationDistrict,
      });

      if (onBidSuccess) onBidSuccess(data.auction);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to process Instant Buy.");
      setShowBuyNowModal(false);
    } finally {
      setIsBuyNowSubmitting(false);
    }
  };

  return (
    <div className="bg-white border border-[#E5EAF2] rounded-3xl p-5 sm:p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-4 relative">
      {/* Countdown and Live Status Banner */}
      <div className="flex items-center justify-between pb-3 border-b border-[#E5EAF2]">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#16B8A6] animate-pulse"></span>
          <span className="text-xs font-bold text-[#16B8A6] uppercase tracking-wide">
            Live Auction
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-bold text-[#172033] bg-[#F5F7FB] px-3 py-1 rounded-full border border-[#E5EAF2]">
          <Clock className="w-3.5 h-3.5 text-[#2457E6]" />
          <span>{timeState.formatted} remaining</span>
        </div>
      </div>

      {/* Pricing and Stats Display */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 sm:p-3.5 rounded-xl bg-[#F5F7FB] border border-[#E5EAF2]">
          <span className="text-[11px] font-medium text-[#64748B] block">Current High Bid</span>
          <span className="text-xl sm:text-2xl font-black text-[#172033] tracking-tight font-mono-num">
            {formatLKR(currentPrice)}
          </span>
          <span className="text-[10px] text-[#64748B] block mt-0.5">
            {totalBids} bids placed
          </span>
        </div>

        <div className="p-3 sm:p-3.5 rounded-xl bg-[#EEF3FF] border border-[#2457E6]/20">
          <span className="text-[11px] font-bold text-[#2457E6] block">Next Permitted Bid</span>
          <span className="text-xl sm:text-2xl font-black text-[#2457E6] tracking-tight font-mono-num">
            {formatLKR(minNextBid)}
          </span>
          <span className="text-[10px] text-[#2457E6]/80 block mt-0.5">
            +Rs. {increment.toLocaleString("en-LK")} min step
          </span>
        </div>
      </div>

      {/* Active Auto-Bid Ceiling Status Chip */}
      {activeAutoBidRule && activeAutoBidRule.isActive && (
        <div className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-blue-50/80 border border-blue-200 text-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 text-[#2457E6] shrink-0" />
            <span className="font-semibold text-slate-700">Auto-Bid Ceiling:</span>
            <span className="font-extrabold text-[#2457E6] font-mono-num">{formatLKR(activeAutoBidRule.maxAmount)}</span>
            {bidsList[0]?.bidder?.id === currentUser?.id ? (
              <span className="px-1.5 py-0.5 rounded-full text-[9px] font-black bg-[#16B8A6] text-white">
                Winning
              </span>
            ) : currentPrice >= activeAutoBidRule.maxAmount ? (
              <span className="px-1.5 py-0.5 rounded-full text-[9px] font-black bg-rose-500 text-white">
                Outbid
              </span>
            ) : (
              <span className="px-1.5 py-0.5 rounded-full text-[9px] font-black bg-[#2457E6] text-white">
                Active
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => {
              setActiveTab("autobid");
              setAutoBidMax(Math.max(activeAutoBidRule.maxAmount + increment * 5, currentPrice + increment * 10));
            }}
            className="text-xs font-bold text-[#2457E6] hover:underline shrink-0"
          >
            Edit
          </button>
        </div>
      )}

      {/* Clean & Compact Buy It Now Strip */}
      {auction.buyNowPrice && !timeState.hasEnded && !buyNowSuccess && (
        <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50/80 border border-emerald-500/25">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Zap className="w-4 h-4 fill-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-bold text-slate-700">Buy It Now:</span>
                <span className="text-sm font-black text-emerald-700 font-mono-num">
                  {formatLKR(auction.buyNowPrice)}
                </span>
              </div>
              <span className="text-[10px] text-slate-500 block -mt-0.5">Instant purchase • Bypasses auction</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowBuyNowModal(true)}
            disabled={isSubmitting || isBuyNowSubmitting || timeState.hasEnded}
            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 shrink-0 hover:scale-[1.02] active:scale-95 cursor-pointer"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Buy Now</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Manual vs Auto-Bid Mode Switch */}
      <div className="flex rounded-xl bg-[#F5F7FB] p-1 border border-[#E5EAF2]">
        <button
          type="button"
          onClick={() => setActiveTab("manual")}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
            activeTab === "manual"
              ? "bg-[#2457E6] text-white shadow-sm"
              : "text-[#64748B] hover:text-[#172033]"
          }`}
        >
          Manual Instant Bid
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("autobid")}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 ${
            activeTab === "autobid"
              ? "bg-[#2457E6] text-white shadow-sm"
              : "text-[#64748B] hover:text-[#172033]"
          }`}
        >
          <Zap className="w-3.5 h-3.5 text-[#16B8A6]" />
          <span>Auto-Bid Ceiling</span>
        </button>
      </div>

      {/* Quick Increment Chips */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-[#172033] block">
          {activeTab === "manual" ? "Select Your Bid Amount" : "Set Your Maximum Auto-Bid Ceiling (Rs.)"}
        </label>

        <div className="flex items-center gap-2">
          {activeTab === "manual" ? (
            <>
              <button
                type="button"
                onClick={() => handleQuickAdd(500)}
                className="flex-1 py-1.5 bg-[#F5F7FB] hover:bg-slate-200 border border-[#E5EAF2] rounded-xl text-xs font-bold text-[#172033] transition"
              >
                +Rs. 500
              </button>
              <button
                type="button"
                onClick={() => handleQuickAdd(1000)}
                className="flex-1 py-1.5 bg-[#F5F7FB] hover:bg-slate-200 border border-[#E5EAF2] rounded-xl text-xs font-bold text-[#172033] transition"
              >
                +Rs. 1,000
              </button>
              <button
                type="button"
                onClick={() => handleQuickAdd(2500)}
                className="flex-1 py-1.5 bg-[#F5F7FB] hover:bg-slate-200 border border-[#E5EAF2] rounded-xl text-xs font-bold text-[#172033] transition"
              >
                +Rs. 2,500
              </button>
              <button
                type="button"
                onClick={() => handleQuickAdd(5000)}
                className="flex-1 py-1.5 bg-[#F5F7FB] hover:bg-slate-200 border border-[#E5EAF2] rounded-xl text-xs font-bold text-[#172033] transition"
              >
                +Rs. 5,000
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => handleQuickAdd(5000)}
                className="flex-1 py-1.5 bg-[#F5F7FB] hover:bg-slate-200 border border-[#E5EAF2] rounded-xl text-xs font-bold text-[#172033] transition"
              >
                +Rs. 5,000
              </button>
              <button
                type="button"
                onClick={() => handleQuickAdd(10000)}
                className="flex-1 py-1.5 bg-[#F5F7FB] hover:bg-slate-200 border border-[#E5EAF2] rounded-xl text-xs font-bold text-[#172033] transition"
              >
                +Rs. 10k
              </button>
              <button
                type="button"
                onClick={() => handleQuickAdd(25000)}
                className="flex-1 py-1.5 bg-[#F5F7FB] hover:bg-slate-200 border border-[#E5EAF2] rounded-xl text-xs font-bold text-[#172033] transition"
              >
                +Rs. 25k
              </button>
              <button
                type="button"
                onClick={() => handleQuickAdd(50000)}
                className="flex-1 py-1.5 bg-[#F5F7FB] hover:bg-slate-200 border border-[#E5EAF2] rounded-xl text-xs font-bold text-[#172033] transition"
              >
                +Rs. 50k
              </button>
            </>
          )}
        </div>

        {/* Input Field */}
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[#64748B]">
            Rs.
          </span>
          <input
            type="number"
            value={activeTab === "manual" ? bidAmount : autoBidMax}
            onChange={(e) => {
              const val = parseFloat(e.target.value) || 0;
              if (activeTab === "manual") {
                setBidAmount(val);
              } else {
                setAutoBidMax(val);
              }
            }}
            min={activeTab === "manual" ? minNextBid : minNextBid + increment}
            step={increment}
            className="w-full bg-[#F5F7FB] border border-[#E5EAF2] rounded-2xl pl-10 pr-4 py-3 font-mono-num font-black text-lg text-[#172033] focus:outline-none focus:border-[#2457E6] focus:bg-white transition"
          />
        </div>

        {activeTab === "autobid" && (
          <p className="text-[11px] text-[#64748B] leading-relaxed pt-1 flex items-start gap-1.5">
            <Zap className="w-3.5 h-3.5 text-[#16B8A6] shrink-0 mt-0.5" />
            <span>
              Enter the absolute highest price you are willing to pay. BIDME will automatically place the lowest possible winning bid (+Rs. {increment.toLocaleString("en-LK")} step) each time you are outbid, up to Rs. {autoBidMax.toLocaleString("en-LK")}.
            </span>
          </p>
        )}
      </div>

      {/* Error or Success feedback message */}
      {errorMsg && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-3 bg-[#E8FAF7] border border-[#16B8A6]/30 text-[#16B8A6] text-xs font-semibold rounded-xl flex items-center gap-2">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Place Bid Button (Opens Confirmation Modal) */}
      {timeState.hasEnded ? (
        <button
          type="button"
          disabled
          aria-disabled="true"
          className="w-full py-4 bg-slate-200/80 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-black text-sm rounded-2xl border border-slate-300/80 dark:border-slate-700/80 cursor-not-allowed pointer-events-none select-none flex items-center justify-center gap-2 shadow-none"
        >
          <Clock className="w-4 h-4" />
          <span>Auction Ended — Bidding Closed</span>
        </button>
      ) : (
        <button
          type="button"
          onClick={handleOpenConfirmation}
          disabled={isSubmitting}
          className="w-full py-4 bg-[#2457E6] hover:bg-[#1d46be] disabled:bg-slate-300 text-white font-black text-sm rounded-2xl shadow-sm hover:scale-[1.01] active:scale-95 transition flex items-center justify-center gap-2"
        >
          {activeTab === "manual" ? (
            <>
              <Gavel className="w-4 h-4" />
              <span>Review & Place Bid of {formatLKR(bidAmount)}</span>
            </>
          ) : (
            <>
              <Zap className="w-4 h-4 text-[#16B8A6]" />
              <span>Activate Auto-Bid Ceiling ({formatLKR(autoBidMax)})</span>
            </>
          )}
        </button>
      )}

      {/* Anti-Sniping Protection Guarantee Pill */}
      <div className="p-3 rounded-2xl bg-[#F5F7FB] border border-[#E5EAF2] flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-[#64748B]">
          <ShieldCheck className="w-4 h-4 text-[#16B8A6]" />
          <span>Anti-Sniping Soft Close Active</span>
        </div>
        <span className="text-[11px] font-bold text-[#2457E6]">+120s Extension</span>
      </div>

      {/* ========================================================================= */}
      {/* BID CONFIRMATION MODAL (Section 6: Clear Confirmation Step)               */}
      {/* ========================================================================= */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-[#E5EAF2] rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-[#E5EAF2] pb-3">
              <div className="flex items-center gap-2 text-[#172033]">
                {activeTab === "manual" ? (
                  <Gavel className="w-5 h-5 text-[#2457E6]" />
                ) : (
                  <Zap className="w-5 h-5 text-[#16B8A6]" />
                )}
                <h3 className="font-extrabold text-base">
                  {activeTab === "manual" ? "Confirm Your Auction Bid" : "Confirm Auto-Bid Ceiling"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="p-1 rounded-full text-[#64748B] hover:text-[#172033] hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-xs text-[#64748B]">
                {activeTab === "manual"
                  ? "Please review your binding bid details before committing to the auction book:"
                  : "Configure your proxy bidding ceiling. BIDME will automatically protect your position:"}
              </p>

              <div className="p-4 rounded-2xl bg-[#F5F7FB] border border-[#E5EAF2] space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-[#64748B]">Item:</span>
                  <span className="font-bold text-[#172033] truncate max-w-[200px]">{auction.title}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-[#64748B]">Current High Bid:</span>
                  <span className="font-bold text-[#172033]">{formatLKR(currentPrice)}</span>
                </div>
                {activeTab === "autobid" && (
                  <div className="flex justify-between text-xs">
                    <span className="text-[#64748B]">Immediate Next Bid:</span>
                    <span className="font-bold text-[#16B8A6]">{formatLKR(minNextBid)}</span>
                  </div>
                )}
                <div className="flex justify-between text-xs border-t border-[#E5EAF2] pt-2">
                  <span className="font-bold text-[#2457E6]">
                    {activeTab === "manual" ? "Your Confirmed Bid:" : "Max Auto-Bid Ceiling:"}
                  </span>
                  <span className="font-black text-base text-[#2457E6]">
                    {formatLKR(activeTab === "manual" ? bidAmount : autoBidMax)}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-800">
                <Lock className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span>
                  {activeTab === "manual"
                    ? "Bids placed on BIDME are legally binding commitments. If your bid wins at auction close, PayHere custodial escrow checkout will be initiated."
                    : "The system will only bid the minimum required amount (+increment) to keep you in the lead. You will never pay more than your ceiling, and often significantly less!"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-[#172033] font-bold text-xs rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteConfirmedBid}
                className="flex-1 py-2.5 bg-[#2457E6] hover:bg-[#1d46be] text-white font-bold text-xs rounded-xl shadow-sm transition"
              >
                {activeTab === "manual" ? "Confirm & Submit Bid" : "Authorize Auto-Bid Ceiling"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CONFIRM INSTANT BUY (BUY IT NOW) MODAL                                    */}
      {/* ========================================================================= */}
      {showBuyNowModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-[#E5EAF2] dark:border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#E5EAF2] dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                  <Zap className="w-5 h-5 fill-emerald-600 dark:fill-emerald-400" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-[#172033] dark:text-white">
                    Confirm Instant Buy (Buy It Now)
                  </h3>
                  <p className="text-[11px] text-[#64748B] dark:text-slate-400">
                    Bypass the auction & secure ownership now
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowBuyNowModal(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-[#64748B]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Lot Summary */}
            <div className="p-3.5 rounded-2xl bg-[#F5F7FB] dark:bg-slate-800/60 border border-[#E5EAF2] dark:border-slate-700 space-y-1">
              <span className="text-[10px] text-[#64748B] dark:text-slate-400 font-bold block uppercase tracking-wider">Lot Details</span>
              <p className="text-xs font-black text-[#172033] dark:text-white line-clamp-2">
                {auction.title}
              </p>
            </div>

            {/* Price & Escrow Breakdown */}
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-[#64748B] dark:text-slate-400">
                <span>Fixed Buy Now Price:</span>
                <span className="font-bold text-[#172033] dark:text-white font-mono-num">
                  {formatLKR(auction.buyNowPrice || 0)}
                </span>
              </div>
              <div className="flex justify-between text-[#64748B] dark:text-slate-400">
                <span>Platform Escrow Protection:</span>
                <span className="font-bold text-[#16B8A6]">INCLUDED (FREE)</span>
              </div>
              <div className="flex justify-between text-[#64748B] dark:text-slate-400">
                <span>PromptX Insured Courier:</span>
                <span className="font-bold text-[#16B8A6]">FREE</span>
              </div>
              <div className="pt-2 border-t border-[#E5EAF2] dark:border-slate-800 flex justify-between items-baseline font-black text-sm text-[#172033] dark:text-white">
                <span>Total Due Now:</span>
                <span className="text-lg text-[#2457E6] dark:text-blue-400 font-mono-num font-black">
                  {formatLKR(auction.buyNowPrice || 0)}
                </span>
              </div>
            </div>

            {/* Delivery Destination Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#172033] dark:text-white flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#2457E6]" />
                <span>Delivery Address (Sri Lanka)</span>
              </label>
              <input
                type="text"
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                placeholder="Street address, city, district"
                className="w-full px-3.5 py-2.5 bg-[#F5F7FB] dark:bg-slate-800 border border-[#E5EAF2] dark:border-slate-700 rounded-xl text-xs text-[#172033] dark:text-white focus:outline-none focus:border-[#2457E6]"
              />
            </div>

            {/* Escrow Guarantee Notice */}
            <div className="p-3 bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 rounded-xl flex items-start gap-2.5 text-[11px] text-emerald-800 dark:text-emerald-300">
              <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
              <span>
                <strong>100% Escrow Protection:</strong> Your payment remains securely locked in the BIDME Trust Vault until you receive the package and inspect it for 48 hours. Seller receives payment only upon your satisfaction.
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowBuyNowModal(false)}
                className="flex-1 py-2.5 border border-[#E5EAF2] dark:border-slate-700 text-[#64748B] dark:text-slate-300 text-xs font-bold rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteBuyNow}
                disabled={isBuyNowSubmitting}
                className="flex-[2] py-2.5 bg-gradient-to-r from-[#16B8A6] to-[#0D9488] hover:from-[#0D9488] hover:to-[#0F766E] disabled:bg-slate-300 text-white text-xs font-black rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
              >
                {isBuyNowSubmitting ? (
                  <span>Processing Order...</span>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    <span>Confirm & Pay {formatLKR(auction.buyNowPrice || 0)}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Live Bidder History */}
      <div className="space-y-3 pt-2 border-t border-[#E5EAF2]">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-[#172033] flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-[#2457E6]" />
            <span>Recent Bid Log</span>
          </span>
          <span className="text-[10px] text-[#64748B]">{bidsList.length} verified bids</span>
        </div>

        <div className="space-y-2 max-h-44 overflow-y-auto">
          {bidsList.length > 0 ? (
            bidsList.slice(0, 5).map((b, idx) => (
              <div
                key={b.id || idx}
                className={`p-2.5 rounded-xl border flex items-center justify-between text-xs ${
                  idx === 0
                    ? "bg-[#EEF3FF] border-[#2457E6]/30 text-[#172033] font-bold"
                    : "bg-[#F5F7FB] border-[#E5EAF2] text-[#64748B]"
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    idx === 0 ? "bg-[#2457E6] text-white" : "bg-slate-200 text-[#172033]"
                  }`}>
                    {idx === 0 ? "★" : idx + 1}
                  </div>
                  <span className="truncate max-w-[120px] font-medium text-[#172033]">{b.bidder?.name || "Verified Bidder"}</span>
                  {b.isAutoBid && (
                    <span className="px-1.5 py-0.5 bg-[#E8FAF7] text-[#16B8A6] border border-[#16B8A6]/30 text-[9px] font-black rounded-md flex items-center gap-0.5">
                      <Zap className="w-2.5 h-2.5 text-[#16B8A6]" /> Auto
                    </span>
                  )}
                </div>
                <div className="text-right font-mono-num font-bold text-[#172033]">
                  {formatLKR(b.amount)}
                </div>
              </div>
            ))
          ) : (
            <p className="text-xs text-[#64748B] text-center py-2">No bids recorded yet. Be the first!</p>
          )}
        </div>
      </div>
    </div>
  );
}
