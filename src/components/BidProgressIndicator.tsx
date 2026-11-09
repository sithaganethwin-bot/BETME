"use client";

import React from "react";
import { formatLKR } from "@/lib/utils";
import { TrendingUp, ShieldCheck } from "lucide-react";

interface BidProgressIndicatorProps {
  startingPrice: number;
  currentPrice: number;
  reservePrice?: number | null;
  totalBids: number;
  className?: string;
  compact?: boolean;
}

export function BidProgressIndicator({
  startingPrice,
  currentPrice,
  reservePrice,
  totalBids,
  className = "",
  compact = false,
}: BidProgressIndicatorProps) {
  const diff = Math.max(0, currentPrice - startingPrice);
  const percentageOverStarting = startingPrice > 0 ? Math.round((diff / startingPrice) * 100) : 0;

  // Determine reserve status without leaking confidential information
  let reserveLabel = "Standard Auction";
  let reserveColor = "text-[#64748B]";
  let isReserveMet = false;

  if (reservePrice === null || reservePrice === undefined) {
    reserveLabel = "No Reserve • Sells to highest bidder";
    reserveColor = "text-[#16B8A6] font-semibold";
    isReserveMet = true;
  } else if (reservePrice > 0) {
    if (currentPrice >= reservePrice) {
      reserveLabel = "Reserve Met • Item will sell";
      reserveColor = "text-[#16B8A6] font-bold";
      isReserveMet = true;
    } else {
      reserveLabel = "Reserve in Place";
      reserveColor = "text-amber-600 font-semibold";
      isReserveMet = false;
    }
  }

  // Calculate visual bar percentage (clamped between 5% and 100%)
  const barPercent = Math.min(100, Math.max(8, totalBids > 0 ? Math.min(100, 20 + totalBids * 15) : 5));

  if (compact) {
    return (
      <div className={`space-y-1 ${className}`}>
        <div className="flex items-center justify-between text-[10px] text-[#64748B]">
          <span>Bid activity: +{percentageOverStarting}%</span>
          <span className={reserveColor}>{reserveLabel}</span>
        </div>
        <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isReserveMet ? "bg-[#16B8A6]" : "bg-[#2457E6]"
            }`}
            style={{ width: `${barPercent}%` }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className={`p-3 rounded-2xl bg-[#F5F7FB] dark:bg-slate-800/60 border border-[#E5EAF2] dark:border-slate-800 space-y-2 text-xs ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 font-bold text-[#172033] dark:text-[#F8FAFC]">
          <TrendingUp className="w-3.5 h-3.5 text-[#2457E6]" />
          <span>Bidding Momentum</span>
        </div>
        <span className="text-[11px] font-mono-num font-black text-[#2457E6] dark:text-blue-400">
          +{percentageOverStarting}% over starting
        </span>
      </div>

      {/* Progress Track */}
      <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${
            isReserveMet
              ? "bg-gradient-to-r from-[#2457E6] to-[#16B8A6]"
              : "bg-[#2457E6]"
          }`}
          style={{ width: `${barPercent}%` }}
        />
      </div>

      <div className="flex items-center justify-between text-[11px]">
        <span className="text-[#64748B]">
          Starting: <strong>{formatLKR(startingPrice)}</strong>
        </span>
        <span className={reserveColor}>
          {reserveLabel}
        </span>
      </div>
    </div>
  );
}
