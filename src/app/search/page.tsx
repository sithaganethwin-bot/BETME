"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { 
  Search, 
  MapPin, 
  Gavel, 
  SlidersHorizontal,
  X,
  Clock,
  LayoutGrid,
  List
} from "lucide-react";
import { AuctionCard } from "@/components/AuctionCard";
import { CATEGORIES_CONFIG, SRI_LANKAN_DISTRICTS } from "@/lib/constants";
import { formatLKR } from "@/lib/utils";
import { recommendationEngine } from "@/lib/recommendation-engine";

function SearchContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const initialCategory = searchParams.get("category") || "";

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sortBy, setSortBy] = useState("ending_soon");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const [auctions, setAuctions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchAuctions = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory) params.set("category", selectedCategory);
      if (selectedDistrict) params.set("district", selectedDistrict);
      if (searchQuery) params.set("q", searchQuery);
      if (sortBy) params.set("sort", sortBy);

      const res = await fetch(`/api/auctions?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        let results = data.auctions;
        if (maxPrice) {
          const limit = parseFloat(maxPrice);
          if (!isNaN(limit)) {
            results = results.filter((a: any) => a.currentPrice <= limit);
          }
        }
        setAuctions(results);
      }
    } catch (err) {
      console.error("Search fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAuctions();
  }, [selectedCategory, selectedDistrict, sortBy]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      recommendationEngine.trackInteraction("SEARCH", { query: searchQuery.trim() });
    }
    fetchAuctions();
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("");
    setSelectedDistrict("");
    setMaxPrice("");
    setSortBy("ending_soon");
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header and Search Input */}
      <div className="bg-white border border-[#E5EAF2] rounded-3xl p-6 sm:p-8 shadow-[0_4px_24px_rgb(0,0,0,0.03)] space-y-4">
        <div>
          <span className="text-xs font-bold text-[#2457E6] uppercase tracking-wider">Auction Discovery</span>
          <h1 className="text-2xl sm:text-3xl font-black text-[#172033] tracking-tight">
            Explore All Live Auctions
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B]">
            Find authenticated items across Sri Lanka with real-time bidding feeds.
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by keywords, brand, model, or condition..."
              className="w-full bg-[#F5F7FB] border border-[#E5EAF2] rounded-2xl pl-10 pr-4 py-3 text-xs sm:text-sm text-[#172033] placeholder:text-[#64748B] focus:outline-none focus:border-[#2457E6]"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3 bg-[#2457E6] hover:bg-[#1d46be] text-white font-bold text-xs sm:text-sm rounded-2xl shadow-sm transition"
          >
            Search
          </button>
        </form>
      </div>

      {/* Main Discovery Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Filters Sidebar */}
        <aside className="lg:col-span-3 bg-white border border-[#E5EAF2] rounded-3xl p-6 space-y-6 shadow-[0_4px_24px_rgb(0,0,0,0.03)]">
          <div className="flex items-center justify-between border-b border-[#E5EAF2] pb-3">
            <h3 className="font-extrabold text-sm text-[#172033] flex items-center gap-1.5">
              <SlidersHorizontal className="w-4 h-4 text-[#2457E6]" />
              <span>Filters</span>
            </h3>
            <button
              onClick={handleResetFilters}
              className="text-[11px] font-bold text-[#2457E6] hover:underline"
            >
              Reset All
            </button>
          </div>

          {/* Categories Filter */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#172033] block">Category</label>
            <div className="space-y-1 max-h-48 overflow-y-auto">
              <button
                type="button"
                onClick={() => setSelectedCategory("")}
                className={`w-full text-left px-3 py-1.5 rounded-xl text-xs transition ${
                  !selectedCategory
                    ? "bg-[#EEF3FF] text-[#2457E6] font-bold"
                    : "text-[#64748B] hover:bg-[#F5F7FB]"
                }`}
              >
                All Categories
              </button>
              {CATEGORIES_CONFIG.map((cat) => (
                <button
                  key={cat.slug}
                  type="button"
                  onClick={() => setSelectedCategory(cat.slug)}
                  className={`w-full text-left px-3 py-1.5 rounded-xl text-xs transition ${
                    selectedCategory === cat.slug
                      ? "bg-[#EEF3FF] text-[#2457E6] font-bold"
                      : "text-[#64748B] hover:bg-[#F5F7FB]"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* District Filter */}
          <div className="space-y-2 border-t border-[#E5EAF2] pt-4">
            <label className="text-xs font-bold text-[#172033] block">Sri Lankan District</label>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="w-full bg-[#F5F7FB] border border-[#E5EAF2] rounded-xl px-3 py-2 text-xs text-[#172033] focus:outline-none focus:border-[#2457E6]"
            >
              <option value="">All 25 Districts</option>
              {SRI_LANKAN_DISTRICTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* Price Ceiling */}
          <div className="space-y-2 border-t border-[#E5EAF2] pt-4">
            <label className="text-xs font-bold text-[#172033] block">Maximum Price (LKR)</label>
            <input
              type="number"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              placeholder="e.g. 500000"
              className="w-full bg-[#F5F7FB] border border-[#E5EAF2] rounded-xl px-3 py-2 text-xs text-[#172033] focus:outline-none focus:border-[#2457E6]"
            />
          </div>
        </aside>

        {/* Results Column */}
        <main className="lg:col-span-9 space-y-6">
          {/* Controls Bar: Sort & View Toggle */}
          <div className="bg-white border border-[#E5EAF2] rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-sm">
            <span className="text-xs text-[#64748B] font-medium">
              Showing <strong className="text-[#172033]">{auctions.length}</strong> live auction lots
            </span>

            <div className="flex items-center gap-3">
              {/* Sort By Select */}
              <div className="flex items-center gap-2 text-xs text-[#64748B]">
                <span>Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-[#F5F7FB] border border-[#E5EAF2] rounded-xl px-2.5 py-1.5 text-xs text-[#172033] font-semibold focus:outline-none"
                >
                  <option value="ending_soon">Ending Soonest</option>
                  <option value="price_low">Price: Low to High</option>
                  <option value="price_high">Price: High to Low</option>
                  <option value="bids_count">Most Active Bids</option>
                  <option value="newest">Recently Listed</option>
                </select>
              </div>

              {/* Grid / List View Toggle */}
              <div className="flex items-center rounded-xl bg-[#F5F7FB] p-0.5 border border-[#E5EAF2]">
                <button
                  type="button"
                  onClick={() => setViewMode("grid")}
                  className={`p-1.5 rounded-lg transition ${
                    viewMode === "grid"
                      ? "bg-white text-[#2457E6] shadow-sm font-bold"
                      : "text-[#64748B] hover:text-[#172033]"
                  }`}
                  title="Grid View"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("list")}
                  className={`p-1.5 rounded-lg transition ${
                    viewMode === "list"
                      ? "bg-white text-[#2457E6] shadow-sm font-bold"
                      : "text-[#64748B] hover:text-[#172033]"
                  }`}
                  title="List View"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Results Grid or List */}
          {isLoading ? (
            <div className="py-20 text-center">
              <div className="w-8 h-8 border-2 border-[#2457E6] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-xs text-[#64748B]">Loading auctions...</p>
            </div>
          ) : auctions.length > 0 ? (
            viewMode === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {auctions.map((auction) => (
                  <AuctionCard key={auction.id} auction={auction} />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {auctions.map((auction) => (
                  <div
                    key={auction.id}
                    className="bg-white border border-[#E5EAF2] rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 hover:border-[#2457E6]/40 transition shadow-sm"
                  >
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                      <img
                        src={auction.product?.images?.[0]?.url || "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=300"}
                        alt={auction.title}
                        className="w-20 h-20 rounded-xl object-cover shrink-0"
                      />
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-[#2457E6] uppercase">
                          {auction.category?.name || "Lot"}
                        </span>
                        <h4 className="font-extrabold text-sm text-[#172033] line-clamp-1">{auction.title}</h4>
                        <span className="text-xs text-[#64748B] block">{auction.locationDistrict}, Sri Lanka</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-[#E5EAF2]">
                      <div className="text-left sm:text-right">
                        <span className="text-[10px] text-[#64748B] block">Current Bid</span>
                        <span className="text-base font-black text-[#172033]">{formatLKR(auction.currentPrice)}</span>
                      </div>
                      <a
                        href={`/auction/${auction.id}`}
                        className="px-4 py-2 bg-[#2457E6] hover:bg-[#1d46be] text-white text-xs font-bold rounded-xl transition shadow-sm"
                      >
                        View & Bid
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            <div className="p-12 text-center bg-white rounded-3xl border border-[#E5EAF2] space-y-3">
              <p className="text-sm font-semibold text-[#64748B]">No auction listings matched your query.</p>
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-xs font-bold text-[#2457E6] underline"
              >
                Clear all filters
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="py-24 text-center text-xs text-slate-400">Loading discovery...</div>}>
      <SearchContent />
    </Suspense>
  );
}
