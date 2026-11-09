"use client";

import React from "react";

export const CATEGORY_IMAGE_MAP: Record<string, string> = {
  watches: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=400&auto=format&fit=crop&q=80",
  vehicles: "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=400&auto=format&fit=crop&q=80",
  realestate: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&auto=format&fit=crop&q=80",
  computers: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&auto=format&fit=crop&q=80",
  cameras: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&auto=format&fit=crop&q=80",
  phones: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&auto=format&fit=crop&q=80",
  gems: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&auto=format&fit=crop&q=80",
  antiques: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=400&auto=format&fit=crop&q=80",
  fashion: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&auto=format&fit=crop&q=80",
  audio: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&auto=format&fit=crop&q=80",
  machinery: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=400&auto=format&fit=crop&q=80",
  home: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&auto=format&fit=crop&q=80",
  sports: "https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?w=400&auto=format&fit=crop&q=80",
  collectibles: "https://images.unsplash.com/photo-1621416894569-0f39ed31d247?w=400&auto=format&fit=crop&q=80",
};

export const SHORT_CATEGORY_NAMES: Record<string, string> = {
  watches: "Watches",
  vehicles: "Vehicles",
  realestate: "Real Estate",
  computers: "Computers",
  cameras: "Cameras",
  phones: "Phones",
  gems: "Gemstones",
  antiques: "Art & Antiques",
  fashion: "Fashion",
  audio: "Audio & Music",
  machinery: "Machinery",
  home: "Home Living",
  sports: "Sports & Marine",
  collectibles: "Collectibles",
};

interface CategoryVisualCardProps {
  name: string;
  slug: string;
  description?: string;
  itemCount?: number;
  isSelected?: boolean;
  onClick?: () => void;
}

export function CategoryVisualCard({
  name,
  slug,
  description,
  itemCount = 0,
  isSelected = false,
  onClick,
}: CategoryVisualCardProps) {
  const imageUrl = CATEGORY_IMAGE_MAP[slug] || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400";
  const displayName = SHORT_CATEGORY_NAMES[slug] || name;

  return (
    <button
      type="button"
      onClick={onClick}
      title={`${name} - ${itemCount > 0 ? `${itemCount} active live lots` : "Explore department"}`}
      className={`group relative text-center shrink-0 w-[96px] sm:w-[108px] p-2 sm:p-2.5 rounded-2xl bg-white dark:bg-slate-900 border transition-all duration-200 flex flex-col items-center justify-between cursor-pointer focus:outline-none select-none ${
        isSelected
          ? "border-[#2457E6] ring-2 ring-[#2457E6]/30 bg-blue-50/40 dark:bg-blue-950/30 shadow-sm"
          : "border-[#E5EAF2] dark:border-slate-800 hover:border-[#2457E6]/60 dark:hover:border-blue-500/60 shadow-[0_2px_8px_rgb(0,0,0,0.02)] hover:shadow-[0_8px_20px_rgb(0,0,0,0.06)] hover:-translate-y-0.5"
      }`}
    >
      {/* Live Badge (Only if active items > 0) */}
      {itemCount > 0 && (
        <span className="absolute top-1.5 right-1.5 z-10 flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-black bg-[#16B8A6] text-white shadow-xs">
          <span className="w-1 h-1 rounded-full bg-white animate-pulse" />
          <span>{itemCount}</span>
        </span>
      )}

      {/* High-Resolution Photography Squircle */}
      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl overflow-hidden relative ring-1 ring-slate-200/80 dark:ring-slate-700/80 group-hover:ring-2 group-hover:ring-[#2457E6] transition-all shrink-0 bg-slate-100 dark:bg-slate-800">
        <img
          src={imageUrl}
          alt={displayName}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
        />
      </div>

      {/* Category Name & Status Subtext */}
      <div className="mt-2 w-full">
        <h3 className="font-extrabold text-xs text-[#172033] dark:text-[#F8FAFC] group-hover:text-[#2457E6] dark:group-hover:text-blue-400 transition-colors truncate">
          {displayName}
        </h3>
        <p className="text-[10px] font-semibold mt-0.5 truncate transition-colors text-slate-400 dark:text-slate-500 group-hover:text-[#2457E6]/80">
          {itemCount > 0 ? (
            <span className="text-[#16B8A6] font-bold">{itemCount} Live</span>
          ) : (
            <span>Explore</span>
          )}
        </p>
      </div>

      {/* Selected Indicator Pill */}
      {isSelected && (
        <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 px-2 py-0.2 rounded-full bg-[#2457E6] text-white text-[8px] font-black uppercase tracking-wider shadow-xs">
          Selected
        </div>
      )}
    </button>
  );
}
