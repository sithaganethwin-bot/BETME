"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  BadgePlus, 
  Flame, 
  Gavel, 
  Clock, 
  ShieldCheck, 
  ArrowRight, 
  Search,
  PlusCircle,
  Truck,
  CreditCard,
  MapPin,
  CheckCircle,
  Award,
  Zap,
  Lock,
  Mail,
  Send,
  Compass,
  Heart,
  TrendingUp,
  Activity,
  Eye,
  Tag,
  ShoppingBag,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { AuctionCard } from "@/components/AuctionCard";
import { CATEGORIES_CONFIG, SRI_LANKAN_DISTRICTS } from "@/lib/constants";
import { formatLKR, formatTimeRemaining } from "@/lib/utils";
import { LiveActivityTicker } from "@/components/LiveActivityTicker";
import { CategoryVisualCard } from "@/components/CategoryVisualCard";
import { DealDiscoveryFilters, DiscoveryFilterType } from "@/components/DealDiscoveryFilters";
import { QuickPeekDrawer } from "@/components/QuickPeekDrawer";
import { AuctionCountdown } from "@/components/AuctionCountdown";
import { AuctionReminderButton } from "@/components/AuctionReminderButton";
import { HoverImageSwitcher } from "@/components/HoverImageSwitcher";
import { recommendationEngine, RecommendationMatch } from "@/lib/recommendation-engine";

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") || "all";
  const initialSearch = searchParams.get("search") || "";

  const [auctions, setAuctions] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedDistrict, setSelectedDistrict] = useState("all");
  const [sortBy, setSortBy] = useState<"for_you" | "ending_soon" | "bids_count" | "price_high">("for_you");
  const [tasteProfileVersion, setTasteProfileVersion] = useState(0);
  const [discoveryFilter, setDiscoveryFilter] = useState<DiscoveryFilterType>("all");
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});
  const [quickPeekAuction, setQuickPeekAuction] = useState<any | null>(null);
  const [showcaseTab, setShowcaseTab] = useState<"ending_soon" | "recently_added" | "most_active">("ending_soon");
  const [heroSearch, setHeroSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);
  const categoryRailRef = React.useRef<HTMLDivElement>(null);

  // Real-time synchronization with TikTok-style taste profile updates
  useEffect(() => {
    const onProfileChange = () => setTasteProfileVersion((v) => v + 1);
    window.addEventListener("bidme:taste-profile-updated", onProfileChange);
    return () => window.removeEventListener("bidme:taste-profile-updated", onProfileChange);
  }, []);

  const scrollCategoryRail = (direction: "left" | "right") => {
    if (categoryRailRef.current) {
      const scrollAmount = direction === "left" ? -380 : 380;
      categoryRailRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  // Load verified category active item counts
  useEffect(() => {
    fetch("/api/categories/counts")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.counts) {
          setCategoryCounts(data.counts);
        }
      })
      .catch(() => {});
  }, []);

  const fetchAuctions = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory !== "all") params.set("category", selectedCategory);
      if (selectedDistrict !== "all") params.set("district", selectedDistrict);
      if (sortBy && sortBy !== "for_you") params.set("sort", sortBy);
      if (initialSearch) params.set("search", initialSearch);

      const res = await fetch(`/api/auctions?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setAuctions(data.auctions);
      }
    } catch (err) {
      console.error("Failed to fetch auctions:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAuctions();
  }, [selectedCategory, selectedDistrict, sortBy, initialSearch]);

  const spotlightLot = auctions.find((a) => a.id === "auc_rolex_submariner") || auctions[0];

  // Showcase lists
  const endingSoonLots = [...auctions].sort((a, b) => new Date(a.endsAt).getTime() - new Date(b.endsAt).getTime()).slice(0, 4);
  const recentlyAddedLots = [...auctions].reverse().slice(0, 4);
  const mostActiveLots = [...auctions].sort((a, b) => (b.totalBids || 0) - (a.totalBids || 0)).slice(0, 4);

  // Discovery Filter calculation
  const nowMs = Date.now();
  const filteredAuctions = auctions.filter((a) => {
    if (discoveryFilter === "no_bids") return a.totalBids === 0;
    if (discoveryFilter === "under_50k") return a.currentPrice < 50000;
    if (discoveryFilter === "ending_today") {
      const remainingMs = new Date(a.endsAt).getTime() - nowMs;
      return remainingMs > 0 && remainingMs <= 24 * 60 * 60 * 1000;
    }
    if (discoveryFilter === "potential_deals") {
      const belowStarting = a.currentPrice <= a.startingPrice * 1.15;
      const belowBuyNow = a.buyNowPrice && a.currentPrice < a.buyNowPrice * 0.65;
      return Boolean(belowStarting || belowBuyNow);
    }
    if (discoveryFilter === "buy_now") return Boolean(a.buyNowPrice);
    return true;
  });

  // Algorithmic FYP Personalization
  const { ranked: algorithmRankedAuctions, matches: recommendationMatches } = React.useMemo(() => {
    return recommendationEngine.rankAuctions(filteredAuctions);
  }, [filteredAuctions, tasteProfileVersion]);

  const displayedAuctions = sortBy === "for_you"
    ? algorithmRankedAuctions
    : discoveryFilter === "lowest_price"
    ? [...filteredAuctions].sort((a, b) => a.currentPrice - b.currentPrice)
    : filteredAuctions;

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (heroSearch.trim()) {
      recommendationEngine.trackInteraction("SEARCH", { query: heroSearch.trim() });
      router.push(`/search?q=${encodeURIComponent(heroSearch.trim())}`);
    }
  };

  const handleCategorySelect = (slug: string) => {
    if (slug !== "all") {
      recommendationEngine.trackInteraction("CATEGORY_CLICK", { categorySlug: slug });
    }
    setSelectedCategory(selectedCategory === slug ? "all" : slug);
    const element = document.getElementById("live-auctions");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="space-y-16 sm:space-y-20 pb-28">
      {/* ========================================================================= */}
      {/* 1. PREMIUM HERO SECTION (Modern-Light Tech Aesthetic)                      */}
      {/* ========================================================================= */}
      <section className="relative pt-4 sm:pt-6 pb-6">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#2457E6]/5 rounded-full blur-3xl -z-10 pointer-events-none"></div>
        <div className="absolute top-12 left-1/3 w-80 h-80 bg-[#16B8A6]/5 rounded-full blur-3xl -z-10 pointer-events-none"></div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Hero Message */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white dark:bg-slate-800 border border-[#E5EAF2] dark:border-slate-700 text-xs font-semibold text-[#172033] dark:text-slate-200 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-[#16B8A6] animate-pulse"></span>
              <span>Sri Lanka&apos;s Premier Live Auction Marketplace</span>
              <span className="text-[#64748B] dark:text-slate-400">|</span>
              <span className="text-[#2457E6] dark:text-blue-400 font-bold">100% Escrow Protected</span>
            </div>

            <div className="space-y-3">
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-[#172033] dark:text-[#F8FAFC] tracking-tight leading-[1.1]">
                Bid Smart. <br />
                <span className="bg-gradient-to-r from-[#2457E6] via-[#1d46be] to-[#16B8A6] bg-clip-text text-transparent">
                  Own More.
                </span>
              </h1>
              <p className="text-sm sm:text-base text-[#64748B] dark:text-slate-300 max-w-xl leading-relaxed">
                Discover certified watches, supercars, luxury real estate, tech, and rare collectibles. Fair +120s anti-sniping protection with safe PayHere custodial settlement.
              </p>
            </div>

            {/* Quick Hero Search Input */}
            <form onSubmit={handleHeroSearch} className="max-w-xl flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={heroSearch}
                  onChange={(e) => setHeroSearch(e.target.value)}
                  placeholder="Search watches, cars, MacBooks, gems in Sri Lanka..."
                  className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-900 border border-[#E5EAF2] dark:border-slate-800 rounded-2xl text-xs sm:text-sm text-[#172033] dark:text-slate-100 placeholder-[#94A3B8] focus:outline-none focus:border-[#2457E6] shadow-sm transition"
                />
              </div>
              <button
                type="submit"
                className="px-5 sm:px-6 py-3 bg-[#2457E6] hover:bg-[#1d46be] text-white font-bold text-xs sm:text-sm rounded-2xl transition shadow-sm shrink-0 flex items-center gap-1.5"
              >
                <span>Search</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Value Guarantees */}
            <div className="pt-2 flex flex-wrap items-center gap-4 sm:gap-6 text-xs text-[#64748B] dark:text-slate-400">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#16B8A6]" />
                <span>+120s Anti-Sniping Protection</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-[#2457E6]" />
                <span>PayHere Custodial Escrow</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-[#16B8A6]" />
                <span>Islandwide Insured Delivery</span>
              </div>
            </div>
          </div>

          {/* Right Spotlight Auction Card */}
          {spotlightLot && (
            <div className="lg:col-span-5">
              <div className="group relative rounded-3xl bg-white dark:bg-slate-900 border border-[#E5EAF2] dark:border-slate-800 p-4 sm:p-5 shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:shadow-[0_16px_40px_rgb(0,0,0,0.1)] transition-all">
                {/* Spotlight Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 rounded-full text-xs font-black uppercase tracking-wider">
                    <Flame className="w-3.5 h-3.5 fill-rose-500" />
                    <span>Featured Spotlight Lot</span>
                  </div>
                  <AuctionCountdown
                    auctionId={spotlightLot.id}
                    endsAt={spotlightLot.endsAt}
                    variant="pill"
                    showMilliseconds={true}
                  />
                </div>

                {/* Main Photo with Hover Angle Switching */}
                <HoverImageSwitcher
                  images={spotlightLot.product?.images?.map((img: any) => img.url).filter(Boolean) || [
                    spotlightLot.product?.images?.[0]?.url || "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=1000"
                  ]}
                  alt={spotlightLot.title}
                  aspectRatio="aspect-[16/10]"
                  className="rounded-2xl mb-4"
                >
                  <div className="absolute bottom-2 left-2 z-20 px-2.5 py-1 bg-white/95 dark:bg-slate-900/90 text-[#172033] dark:text-slate-200 text-[10px] font-bold rounded-lg shadow-sm border border-[#E5EAF2] dark:border-slate-800">
                    {spotlightLot.locationDistrict || "Colombo"}, Sri Lanka
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setQuickPeekAuction(spotlightLot);
                    }}
                    className="absolute top-2 right-2 z-20 px-3 py-1.5 bg-white/90 dark:bg-slate-900/90 hover:bg-[#2457E6] hover:text-white text-[#172033] dark:text-white text-xs font-bold rounded-xl shadow-md transition flex items-center gap-1.5 backdrop-blur-sm"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Quick Peek</span>
                  </button>
                </HoverImageSwitcher>

                {/* Details */}
                <div className="space-y-3">
                  <h3 className="font-extrabold text-base sm:text-lg text-[#172033] dark:text-[#F8FAFC] line-clamp-1">
                    {spotlightLot.title}
                  </h3>

                  <div className="flex items-baseline justify-between pt-1 border-t border-[#E5EAF2] dark:border-slate-800">
                    <div>
                      <span className="text-xs text-[#64748B] dark:text-slate-400 block">Current High Bid</span>
                      <span className="text-xl sm:text-2xl font-black text-[#172033] dark:text-[#F8FAFC]">
                        {formatLKR(spotlightLot.currentPrice)}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-[#64748B] dark:text-slate-400 block">{spotlightLot.totalBids} bids placed</span>
                      <span className="text-xs font-bold text-[#16B8A6]">Verified Consignor</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setQuickPeekAuction(spotlightLot)}
                      className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-[#172033] dark:text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Quick View</span>
                    </button>
                    {new Date(spotlightLot.endsAt).getTime() <= Date.now() ? (
                      <button
                        type="button"
                        disabled
                        aria-disabled="true"
                        className="w-full py-2.5 bg-slate-200/80 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold text-xs rounded-xl border border-slate-300/80 dark:border-slate-700/80 cursor-not-allowed pointer-events-none select-none flex items-center justify-center gap-1.5 shadow-none"
                        title="This auction has ended"
                      >
                        <span>Auction Ended</span>
                      </button>
                    ) : (
                      <Link
                        href={`/auction/${spotlightLot.id}`}
                        className="w-full py-2.5 bg-[#2457E6] hover:bg-[#1d46be] text-white font-bold text-xs rounded-xl transition shadow-sm flex items-center justify-center gap-1.5"
                      >
                        <span>Bid on this Lot</span>
                        {spotlightLot.reservePrice ? (
                          spotlightLot.currentPrice >= spotlightLot.reservePrice ? (
                            <span className="text-[9px] font-bold bg-[#16B8A6] text-white px-1.5 py-0.5 rounded shadow-xs">
                              Reserve Met
                            </span>
                          ) : (
                            <span className="text-[9px] font-bold bg-white/20 text-white px-1.5 py-0.5 rounded">
                              Reserved
                            </span>
                          )
                        ) : null}
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. VISUAL & INTERACTIVE TRENDING CATEGORIES (14 Dynamic Cards)             */}
      {/* ========================================================================= */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E5EAF2] dark:border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#2457E6] animate-ping"></span>
              <h2 className="text-xl sm:text-2xl font-black text-[#172033] dark:text-[#F8FAFC]">
                Trending Categories
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-[#64748B] dark:text-slate-400 mt-0.5">
              Explore 14 curated marketplace departments with real-time live active lot counts
            </p>
          </div>
          {selectedCategory !== "all" ? (
            <button
              onClick={() => setSelectedCategory("all")}
              className="text-xs font-bold text-rose-500 hover:underline flex items-center gap-1"
            >
              <span>Clear Category Filter ({selectedCategory})</span>
            </button>
          ) : (
            <Link href="/search" className="text-xs font-bold text-[#2457E6] hover:underline flex items-center gap-1">
              <span>View All Listings</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>

        {/* 14 Distinctive Visual Category Cards in a Single Continuous Rail ("Eka Digata") */}
        <div className="relative group/rail">
          {/* Scroll Left Button */}
          <button
            type="button"
            onClick={() => scrollCategoryRail("left")}
            className="absolute -left-3.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/95 dark:bg-slate-900/95 shadow-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200 hover:text-[#2457E6] hover:scale-105 transition-all opacity-0 group-hover/rail:opacity-100 hidden sm:flex cursor-pointer"
            aria-label="Scroll categories left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Continuous Horizontal Scroll Rail */}
          <div
            ref={categoryRailRef}
            className="flex items-center gap-2.5 sm:gap-3 overflow-x-auto no-scrollbar scroll-smooth py-2 px-1 [&::-webkit-scrollbar]:hidden"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {CATEGORIES_CONFIG.map((cat) => {
              const isSelected = selectedCategory === cat.slug;
              const liveCount = categoryCounts[cat.slug] || 0;

              return (
                <CategoryVisualCard
                  key={cat.slug}
                  name={cat.name}
                  slug={cat.slug}
                  description={cat.description}
                  itemCount={liveCount}
                  isSelected={isSelected}
                  onClick={() => handleCategorySelect(cat.slug)}
                />
              );
            })}
          </div>

          {/* Scroll Right Button */}
          <button
            type="button"
            onClick={() => scrollCategoryRail("right")}
            className="absolute -right-3.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/95 dark:bg-slate-900/95 shadow-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200 hover:text-[#2457E6] hover:scale-105 transition-all opacity-0 group-hover/rail:opacity-100 hidden sm:flex cursor-pointer"
            aria-label="Scroll categories right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. LIVE AUCTIONS & DEAL DISCOVERY FILTERS                                  */}
      {/* ========================================================================= */}
      <section id="live-auctions" className="space-y-6 scroll-mt-24">
        <div className="flex flex-col gap-4 border-b border-[#E5EAF2] dark:border-slate-800 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#16B8A6] animate-pulse"></span>
                <h2 className="text-xl sm:text-2xl font-black text-[#172033] dark:text-[#F8FAFC]">
                  Live Auctions
                </h2>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#EEF3FF] text-[#2457E6] dark:bg-blue-950 dark:text-blue-300">
                  {displayedAuctions.length} Active Lots
                </span>
              </div>
              <p className="text-xs text-[#64748B] dark:text-slate-400 mt-0.5">
                Real-time bidding feeds, certified sellers, and synchronized countdown timers
              </p>
            </div>

            {/* TikTok-Style Algorithmic & Standard Sort Controls */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => setSortBy("for_you")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs ${
                  sortBy === "for_you"
                    ? "bg-gradient-to-r from-[#2457E6] to-[#16B8A6] text-white shadow-md ring-2 ring-blue-400/30"
                    : "bg-white dark:bg-slate-800 border border-[#E5EAF2] dark:border-slate-700 text-[#64748B] dark:text-slate-300 hover:text-[#172033]"
                }`}
              >
                <Flame className="w-3.5 h-3.5 fill-current text-amber-300" />
                <span>For You (FYP)</span>
              </button>

              <button
                type="button"
                onClick={() => setSortBy("ending_soon")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  sortBy === "ending_soon"
                    ? "bg-[#2457E6] text-white shadow-sm"
                    : "bg-white dark:bg-slate-800 border border-[#E5EAF2] dark:border-slate-700 text-[#64748B] dark:text-slate-300 hover:text-[#172033]"
                }`}
              >
                Ending Soon
              </button>

              <button
                type="button"
                onClick={() => setSortBy("bids_count")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  sortBy === "bids_count"
                    ? "bg-[#2457E6] text-white shadow-sm"
                    : "bg-white dark:bg-slate-800 border border-[#E5EAF2] dark:border-slate-700 text-[#64748B] dark:text-slate-300 hover:text-[#172033]"
                }`}
              >
                Most Active
              </button>

              <button
                type="button"
                onClick={() => setSortBy("price_high")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  sortBy === "price_high"
                    ? "bg-[#2457E6] text-white shadow-sm"
                    : "bg-white dark:bg-slate-800 border border-[#E5EAF2] dark:border-slate-700 text-[#64748B] dark:text-slate-300 hover:text-[#172033]"
                }`}
              >
                Highest Value
              </button>
            </div>
          </div>

          {/* Deal Discovery Quick Tags (Low Commitment Exploration) */}
          <div className="pt-1">
            <DealDiscoveryFilters
              activeFilter={discoveryFilter}
              onChange={(newFilter) => setDiscoveryFilter(newFilter)}
            />
          </div>
        </div>

        {/* Auction Cards Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 py-12">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <div key={n} className="rounded-2xl bg-white dark:bg-slate-800/60 border border-[#E5EAF2] dark:border-slate-700 p-4 h-80 animate-pulse flex flex-col justify-between">
                <div className="bg-slate-100 dark:bg-slate-700 h-44 rounded-xl"></div>
                <div className="space-y-2">
                  <div className="bg-slate-100 dark:bg-slate-700 h-4 w-3/4 rounded"></div>
                  <div className="bg-slate-100 dark:bg-slate-700 h-3 w-1/2 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : displayedAuctions.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {displayedAuctions.map((auction) => (
              <AuctionCard
                key={auction.id}
                auction={auction}
                onQuickView={(item) => setQuickPeekAuction(item)}
                recommendationMatch={recommendationMatches[auction.id]}
              />
            ))}
          </div>
        ) : (
          <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-[#E5EAF2] dark:border-slate-800 space-y-3">
            <p className="text-sm font-semibold text-[#64748B] dark:text-slate-400">
              No auctions match your active filter settings.
            </p>
            <div className="flex justify-center gap-3">
              {discoveryFilter !== "all" && (
                <button
                  onClick={() => setDiscoveryFilter("all")}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-xs font-bold rounded-xl text-[#172033] dark:text-white"
                >
                  Clear Discovery Tag
                </button>
              )}
              {selectedCategory !== "all" && (
                <button
                  onClick={() => setSelectedCategory("all")}
                  className="px-4 py-2 bg-[#2457E6] text-white text-xs font-bold rounded-xl"
                >
                  Reset Category
                </button>
              )}
            </div>
          </div>
        )}
      </section>

      {/* ========================================================================= */}
      {/* 4. INTERACTIVE SHOWCASE: ENDING SOON, RECENTLY ADDED, & MOST ACTIVE        */}
      {/* ========================================================================= */}
      <section className="bg-white dark:bg-slate-900 border border-[#E5EAF2] dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-[0_4px_24px_rgb(0,0,0,0.03)] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5EAF2] dark:border-slate-800 pb-4">
          <div>
            <h3 className="font-black text-xl text-[#172033] dark:text-[#F8FAFC]">
              Interactive Auction Showcase
            </h3>
            <p className="text-xs text-[#64748B] dark:text-slate-400 mt-0.5">
              Target high-urgency closings, newly listed lots, or intense bidding wars
            </p>
          </div>

          {/* Interactive Segment Controls */}
          <div className="flex items-center gap-1.5 p-1 bg-[#F5F7FB] dark:bg-slate-800/80 rounded-2xl border border-[#E5EAF2] dark:border-slate-700">
            <button
              type="button"
              onClick={() => setShowcaseTab("ending_soon")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                showcaseTab === "ending_soon"
                  ? "bg-white dark:bg-slate-900 text-[#2457E6] shadow-xs"
                  : "text-[#64748B] dark:text-slate-400 hover:text-[#172033]"
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-rose-500" />
              <span>Ending Soon</span>
            </button>
            <button
              type="button"
              onClick={() => setShowcaseTab("recently_added")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                showcaseTab === "recently_added"
                  ? "bg-white dark:bg-slate-900 text-[#2457E6] shadow-xs"
                  : "text-[#64748B] dark:text-slate-400 hover:text-[#172033]"
              }`}
            >
              <BadgePlus className="w-3.5 h-3.5 text-[#2457E6]" />
              <span>Recently Added</span>
            </button>
            <button
              type="button"
              onClick={() => setShowcaseTab("most_active")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                showcaseTab === "most_active"
                  ? "bg-white dark:bg-slate-900 text-[#2457E6] shadow-xs"
                  : "text-[#64748B] dark:text-slate-400 hover:text-[#172033]"
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-amber-500" />
              <span>Most Active</span>
            </button>
          </div>
        </div>

        {/* Tab Content List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {(showcaseTab === "ending_soon"
            ? endingSoonLots
            : showcaseTab === "recently_added"
            ? recentlyAddedLots
            : mostActiveLots
          ).map((item) => (
            <div
              key={item.id}
              className="group p-3.5 rounded-2xl bg-[#F8FAFC] dark:bg-slate-800/40 border border-[#E5EAF2] dark:border-slate-800 hover:border-[#2457E6]/40 transition-all flex flex-col justify-between space-y-3"
            >
              <div className="space-y-2.5">
                <HoverImageSwitcher
                  images={item.product?.images?.map((img: any) => img.url).filter(Boolean) || [
                    item.product?.images?.[0]?.url || "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400"
                  ]}
                  alt={item.title}
                  aspectRatio="aspect-[16/10]"
                  className="rounded-xl"
                >
                  <div className="absolute top-2 left-2 z-20">
                    <AuctionCountdown
                      auctionId={item.id}
                      endsAt={item.endsAt}
                      variant="pill"
                      showMilliseconds={true}
                    />
                  </div>
                  <div className="absolute top-2 right-2 z-20">
                    <AuctionReminderButton
                      auctionId={item.id}
                      auctionTitle={item.title}
                      endsAt={item.endsAt}
                    />
                  </div>
                </HoverImageSwitcher>

                <Link href={`/auction/${item.id}`}>
                  <h4 className="text-xs font-bold text-[#172033] dark:text-[#F8FAFC] group-hover:text-[#2457E6] transition line-clamp-1">
                    {item.title}
                  </h4>
                </Link>
              </div>

              <div className="pt-2 border-t border-[#E5EAF2] dark:border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-[#64748B] dark:text-slate-400 block">High Bid</span>
                  <span className="text-sm font-black text-[#172033] dark:text-[#F8FAFC]">
                    {formatLKR(item.currentPrice)}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setQuickPeekAuction(item)}
                    className="p-2 bg-white dark:bg-slate-800 border border-[#E5EAF2] dark:border-slate-700 hover:border-[#2457E6] text-[#64748B] dark:text-slate-300 hover:text-[#2457E6] rounded-xl transition"
                    title="Quick Peek"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                  {item.status === "ENDED" || new Date(item.endsAt).getTime() <= Date.now() ? (
                    <button
                      type="button"
                      disabled
                      aria-disabled="true"
                      className="px-2.5 py-1.5 bg-slate-200/80 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs font-bold rounded-xl border border-slate-300/80 dark:border-slate-700/80 cursor-not-allowed pointer-events-none select-none flex items-center gap-1 shadow-none"
                      title="This auction has ended. Click title to inspect details."
                    >
                      <span>Ended</span>
                    </button>
                  ) : (
                    <Link
                      href={`/auction/${item.id}`}
                      className="px-3 py-1.5 bg-[#2457E6] hover:bg-[#1d46be] text-white text-xs font-bold rounded-xl transition shadow-xs flex items-center gap-1"
                    >
                      <span>Bid</span>
                      {item.reservePrice ? (
                        item.currentPrice >= item.reservePrice ? (
                          <span className="text-[9px] font-bold bg-[#16B8A6] text-white px-1 py-0.2 rounded">
                            Met
                          </span>
                        ) : (
                          <span className="text-[9px] font-bold bg-white/20 text-white px-1 py-0.2 rounded">
                            Reserved
                          </span>
                        )
                      ) : null}
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. HOW BIDME WORKS (3-Step Modern Guide)                                  */}
      {/* ========================================================================= */}
      <section id="how-it-works" className="bg-white dark:bg-slate-900 border border-[#E5EAF2] dark:border-slate-800 rounded-3xl p-8 sm:p-12 shadow-[0_4px_24px_rgb(0,0,0,0.03)] space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold text-[#2457E6] uppercase tracking-wider">Simple & Transparent</span>
          <h2 className="text-2xl sm:text-3xl font-black text-[#172033] dark:text-[#F8FAFC]">How BIDME Works</h2>
          <p className="text-xs sm:text-sm text-[#64748B] dark:text-slate-400">
            A state-of-the-art auction ecosystem built for security, fairness, and speed.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 rounded-2xl bg-[#F5F7FB] dark:bg-slate-800/50 border border-[#E5EAF2] dark:border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#EEF3FF] dark:bg-blue-950 text-[#2457E6] dark:text-blue-300 flex items-center justify-center font-black text-sm">
              01
            </div>
            <h4 className="font-extrabold text-base text-[#172033] dark:text-[#F8FAFC]">Discover & Inspect</h4>
            <p className="text-xs text-[#64748B] dark:text-slate-400 leading-relaxed">
              Explore certified lots across Sri Lanka. Inspect verified consignor profiles, high-resolution condition photos, and ask Google Gemini AI technical questions instantly.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#F5F7FB] dark:bg-slate-800/50 border border-[#E5EAF2] dark:border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#E8FAF7] dark:bg-teal-950 text-[#16B8A6] dark:text-teal-300 flex items-center justify-center font-black text-sm">
              02
            </div>
            <h4 className="font-extrabold text-base text-[#172033] dark:text-[#F8FAFC]">Live Bidding & Anti-Sniping</h4>
            <p className="text-xs text-[#64748B] dark:text-slate-400 leading-relaxed">
              Place manual bids or set your maximum auto-bid ceiling. If any bid lands in the final 2 minutes, +120s anti-sniping automatically activates to prevent bot snipe attacks.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#F5F7FB] dark:bg-slate-800/50 border border-[#E5EAF2] dark:border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#EEF3FF] dark:bg-blue-950 text-[#2457E6] dark:text-blue-300 flex items-center justify-center font-black text-sm">
              03
            </div>
            <h4 className="font-extrabold text-base text-[#172033] dark:text-[#F8FAFC]">PayHere Escrow & Delivery</h4>
            <p className="text-xs text-[#64748B] dark:text-slate-400 leading-relaxed">
              Winning payments are held safely in custodial escrow. The seller ships islandwide with door-to-door tracking; funds disburse only after delivery is confirmed.
            </p>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. BENEFITS FOR BUYERS & SELLERS                                          */}
      {/* ========================================================================= */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-[#E5EAF2] dark:border-slate-800 p-8 space-y-5 shadow-[0_4px_24px_rgb(0,0,0,0.03)]">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EEF3FF] dark:bg-blue-950 text-[#2457E6] dark:text-blue-300 text-xs font-bold">
            <Gavel className="w-3.5 h-3.5" />
            <span>For Bidders & Collectors</span>
          </div>
          <h3 className="text-xl font-black text-[#172033] dark:text-[#F8FAFC]">Why Buy on BIDME?</h3>
          <ul className="space-y-3 text-xs sm:text-sm text-[#64748B] dark:text-slate-400">
            <li className="flex items-start gap-2.5">
              <CheckCircle className="w-4 h-4 text-[#16B8A6] shrink-0 mt-0.5" />
              <span><strong>No Last-Second Bot Sniping:</strong> Fair +120s soft-close window gives human bidders equal time to counter.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle className="w-4 h-4 text-[#16B8A6] shrink-0 mt-0.5" />
              <span><strong>Custodial Buyer Protection:</strong> Funds held in PayHere escrow until the lot arrives safely in your hands.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle className="w-4 h-4 text-[#16B8A6] shrink-0 mt-0.5" />
              <span><strong>BIDME AI Assistant:</strong> Instantly check specifications, authenticity hallmarks, and historical price comparisons.</span>
            </li>
          </ul>
        </div>

        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-[#E5EAF2] dark:border-slate-800 p-8 space-y-5 shadow-[0_4px_24px_rgb(0,0,0,0.03)]">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8FAF7] dark:bg-teal-950 text-[#16B8A6] dark:text-teal-300 text-xs font-bold">
            <Award className="w-3.5 h-3.5" />
            <span>For Consignors & Merchants</span>
          </div>
          <h3 className="text-xl font-black text-[#172033] dark:text-[#F8FAFC]">Why Sell on BIDME?</h3>
          <ul className="space-y-3 text-xs sm:text-sm text-[#64748B] dark:text-slate-400">
            <li className="flex items-start gap-2.5">
              <CheckCircle className="w-4 h-4 text-[#2457E6] shrink-0 mt-0.5" />
              <span><strong>Industry-Low 5% Platform Fee:</strong> Keep 95% of your final hammer price with direct bank wire settlement.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle className="w-4 h-4 text-[#2457E6] shrink-0 mt-0.5" />
              <span><strong>Seller Copilot AI:</strong> Gemini AI crafts compelling descriptions and optimizes starting prices in seconds.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle className="w-4 h-4 text-[#2457E6] shrink-0 mt-0.5" />
              <span><strong>Guaranteed Serious Bidders:</strong> Certified identity verification minimizes defaults and fake inquiries.</span>
            </li>
          </ul>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. TRUST & SAFETY BANNER                                                  */}
      {/* ========================================================================= */}
      <section className="bg-gradient-to-r from-[#2457E6] to-[#16B8A6] rounded-3xl p-8 sm:p-12 text-white shadow-xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-8 space-y-4">
            <span className="text-xs font-extrabold uppercase tracking-widest text-white/80">Security & Integrity</span>
            <h2 className="text-2xl sm:text-4xl font-black leading-tight">
              A Legitimate, Transparent Secondary Market for Sri Lanka.
            </h2>
            <p className="text-sm text-white/90 max-w-xl leading-relaxed">
              BIDME is strictly a product and auction marketplace. We do not support gambling, sweepstakes, or unverified listings. All high-value items undergo seller KYC and automated safety checks.
            </p>
          </div>
          <div className="lg:col-span-4 flex justify-start lg:justify-end">
            <Link
              href="/seller/new"
              className="px-7 py-3.5 bg-white text-[#172033] hover:bg-slate-100 font-extrabold text-sm rounded-xl transition shadow-lg hover:scale-105 active:scale-95"
            >
              Consign an Item
            </Link>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 8. NEWSLETTER / UPDATES SUBSCRIPTION                                       */}
      {/* ========================================================================= */}
      <section className="bg-white dark:bg-slate-900 border border-[#E5EAF2] dark:border-slate-800 rounded-3xl p-8 sm:p-10 text-center max-w-2xl mx-auto space-y-5 shadow-[0_4px_24px_rgb(0,0,0,0.03)]">
        <div className="w-12 h-12 rounded-2xl bg-[#EEF3FF] dark:bg-blue-950 text-[#2457E6] dark:text-blue-300 flex items-center justify-center mx-auto">
          <Mail className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h3 className="text-xl font-black text-[#172033] dark:text-[#F8FAFC]">Never Miss a Rare Lot</h3>
          <p className="text-xs text-[#64748B] dark:text-slate-400">Get curated drop alerts for luxury watches, supercars, and certified gemstones.</p>
        </div>

        {newsletterSubscribed ? (
          <div className="p-3 bg-[#E8FAF7] dark:bg-teal-950 text-[#16B8A6] dark:text-teal-300 text-xs font-bold rounded-xl flex items-center justify-center gap-2">
            <CheckCircle className="w-4 h-4" />
            <span>Thank you! You will receive high-value lot alerts.</span>
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (newsletterEmail) setNewsletterSubscribed(true);
            }}
            className="flex items-center gap-2 max-w-md mx-auto"
          >
            <input
              type="email"
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              placeholder="Enter your email address"
              className="flex-1 px-4 py-2.5 bg-[#F5F7FB] dark:bg-slate-800 border border-[#E5EAF2] dark:border-slate-700 rounded-xl text-xs text-[#172033] dark:text-white focus:outline-none focus:border-[#2457E6]"
              required
            />
            <button
              type="submit"
              className="px-5 py-2.5 bg-[#2457E6] hover:bg-[#1d46be] text-white font-bold text-xs rounded-xl shadow-sm transition"
            >
              Subscribe
            </button>
          </form>
        )}

        <p className="text-[10px] text-[#64748B] dark:text-slate-500 pt-2">
          Production Auction Environment • All listed items and transactions are escrow-secured under Sri Lankan Consumer Law.
        </p>
      </section>

      {/* ========================================================================= */}
      {/* 9. NO-NAVIGATION QUICK PEEK DRAWER / MODAL                                */}
      {/* ========================================================================= */}
      <QuickPeekDrawer
        auction={quickPeekAuction}
        isOpen={Boolean(quickPeekAuction)}
        onClose={() => setQuickPeekAuction(null)}
        onBidSuccess={() => {
          fetchAuctions();
        }}
      />

      {/* ========================================================================= */}
      {/* 10. REAL-TIME LIVE BIDDING ACTIVITY TICKER                                */}
      {/* ========================================================================= */}
      <LiveActivityTicker />
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<div className="py-24 text-center text-xs text-slate-400">Loading BIDME...</div>}>
      <HomeContent />
    </Suspense>
  );
}