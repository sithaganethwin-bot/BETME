"use client";

import React from "react";
import { Flame, Tag, Clock, Zap, ShoppingBag, X } from "lucide-react";

export type DiscoveryFilterType = 
  | "all"
  | "no_bids"
  | "under_50k"
  | "ending_today"
  | "potential_deals"
  | "buy_now"
  | "lowest_price";

interface DealDiscoveryFiltersProps {
  activeFilter: DiscoveryFilterType;
  onChange: (filter: DiscoveryFilterType) => void;
  className?: string;
}

export function DealDiscoveryFilters({
  activeFilter,
  onChange,
  className = "",
}: DealDiscoveryFiltersProps) {
  const filters: Array<{ id: DiscoveryFilterType; label: string; icon: any }> = [
    { id: "all", label: "All Listings", icon: null },
    { id: "no_bids", label: "No Bids Yet", icon: Tag },
    { id: "under_50k", label: "Under Rs. 50,000", icon: Zap },
    { id: "ending_today", label: "Ending Today", icon: Clock },
    { id: "potential_deals", label: "Potential Deals", icon: Flame },
    { id: "buy_now", label: "Buy Now Available", icon: ShoppingBag },
    { id: "lowest_price", label: "Lowest Current Bid", icon: Tag },
  ];

  return (
    <div className={`flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs ${className}`}>
      {filters.map((f) => {
        const Icon = f.icon;
        const isActive = activeFilter === f.id;

        return (
          <button
            key={f.id}
            type="button"
            onClick={() => onChange(isActive && f.id !== "all" ? "all" : f.id)}
            className={`px-3 py-1.5 rounded-full font-bold whitespace-nowrap transition flex items-center gap-1.5 shrink-0 border ${
              isActive
                ? "bg-[#2457E6] text-white border-[#2457E6] shadow-xs"
                : "bg-white dark:bg-slate-800/80 text-[#64748B] dark:text-slate-300 border-[#E5EAF2] dark:border-slate-700 hover:border-[#2457E6]/40 hover:text-[#172033]"
            }`}
          >
            {Icon && <Icon className="w-3.5 h-3.5" />}
            <span>{f.label}</span>
            {isActive && f.id !== "all" && (
              <X className="w-3 h-3 ml-0.5" />
            )}
          </button>
        );
      })}
    </div>
  );
}
