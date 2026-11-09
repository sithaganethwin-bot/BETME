"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { 
  ShieldCheck, 
  MapPin, 
  Truck, 
  Clock, 
  Heart, 
  Bot, 
  ArrowLeft, 
  CheckCircle,
  CreditCard,
  Send,
  Star,
  Info,
  Award,
  ChevronRight,
  ShoppingBag
} from "lucide-react";
import { LiveBiddingPanel } from "@/components/LiveBiddingPanel";
import { AuctionCard } from "@/components/AuctionCard";
import { formatLKR } from "@/lib/utils";
import { useApp } from "@/context/AppContext";
import { recommendationEngine } from "@/lib/recommendation-engine";

export default function AuctionDetailPage() {
  const params = useParams();
  const { 
    favorites, 
    toggleFavorite, 
    addToCart, 
    setIsCartOpen, 
    setIsFavoritesOpen 
  } = useApp();
  const id = params.id as string;

  const [auction, setAuction] = useState<any>(null);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [relatedAuctions, setRelatedAuctions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // AI Assistant state
  const [aiQuestion, setAiQuestion] = useState("");
  const [aiAnswers, setAiAnswers] = useState<Array<{ q: string; a: string }>>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const fetchAuction = async () => {
    try {
      const res = await fetch(`/api/auctions/${id}`);
      const data = await res.json();
      if (data.success) {
        setAuction(data.auction);
        const primary =
          data.auction.product.images?.find((img: any) => img.isPrimary)?.url ||
          data.auction.product.images?.[0]?.url;
        setSelectedImage(primary);
        setIsLoading(false); // Unblock main UI immediately

        // Algorithmic telemetry ingestion (TikTok-style view signal)
        recommendationEngine.trackInteraction("VIEW_DETAIL", {
          auctionId: data.auction.id,
          title: data.auction.title,
          categorySlug: data.auction.category?.slug,
          price: data.auction.currentPrice,
          district: data.auction.locationDistrict,
        });

        // Fetch related items in background without blocking initial render
        fetch(`/api/auctions?category=${data.auction.categoryId || "all"}&limit=4`)
          .then((r) => r.json())
          .then((relData) => {
            if (relData.success) {
              setRelatedAuctions(relData.auctions.filter((a: any) => a.id !== id).slice(0, 4));
            }
          })
          .catch(() => {});
      }
    } catch (err) {
      console.error("Failed to fetch auction details:", err);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAuction();
  }, [id]);

  // Track dwell time (>8 seconds spent on listing represents high interest)
  useEffect(() => {
    if (!auction?.id) return;
    const timer = setTimeout(() => {
      recommendationEngine.trackInteraction("DWELL", {
        auctionId: auction.id,
        title: auction.title,
        categorySlug: auction.category?.slug,
        price: auction.currentPrice,
        district: auction.locationDistrict,
      });
    }, 8000);
    return () => clearTimeout(timer);
  }, [auction?.id]);

  const handleAskSpecialist = async (overrideQ?: string) => {
    const q = overrideQ || aiQuestion;
    if (!q.trim() || isAiLoading) return;

    setIsAiLoading(true);
    try {
      const res = await fetch("/api/ai/bidmate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          auctionId: auction.id,
          question: q,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setAiAnswers((prev) => [{ q, a: data.answer }, ...prev]);
        setAiQuestion("");
      }
    } catch (err) {
      console.error("Specialist query failed:", err);
    } finally {
      setIsAiLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-24 text-center space-y-3">
        <div className="w-8 h-8 border-2 border-[#2457E6] border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-xs text-[#64748B]">Loading auction details...</p>
      </div>
    );
  }

  if (!auction) {
    return (
      <div className="py-24 text-center space-y-4">
        <h2 className="text-xl font-bold text-[#172033]">Auction Item Not Found</h2>
        <p className="text-xs text-[#64748B]">This auction may have concluded or been removed.</p>
        <Link href="/" className="inline-block bg-[#2457E6] text-white font-bold px-5 py-2.5 rounded-xl text-xs">
          Return to Auctions
        </Link>
      </div>
    );
  }

  const isFavorited = favorites.some((f) => f.id === auction.id);
  const images = auction.product?.images || [];

  return (
    <div className="space-y-10 pb-16">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs text-[#64748B]">
        <Link href="/" className="hover:text-[#2457E6] transition">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link href="/search" className="hover:text-[#2457E6] transition">Explore</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-[#172033] font-semibold truncate max-w-xs">{auction.title}</span>
      </div>

      {/* Main Auction Showcase Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
        {/* Left Column: Visual Gallery & Description */}
        <div className="lg:col-span-7 space-y-8">
          {/* Main Photo Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-[4/3] rounded-3xl overflow-hidden bg-white border border-[#E5EAF2] shadow-[0_4px_24px_rgb(0,0,0,0.04)]">
              <img
                src={selectedImage || "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=1000"}
                alt={auction.title}
                className="w-full h-full object-cover"
              />

              {/* Favorites / Watchlist Toggle */}
              <button
                type="button"
                onClick={() =>
                  toggleFavorite({
                    id: auction.id,
                    title: auction.title,
                    currentPrice: auction.currentPrice,
                    startingPrice: auction.startingPrice || auction.currentPrice,
                    endsAt: auction.endsAt,
                    sellerName: auction.seller?.storeName || "Certified Consignor",
                    imageUrl: selectedImage || auction.product?.images?.[0]?.url || "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600",
                    status: (auction.status as any) || "LIVE",
                    totalBids: auction.totalBids || 0,
                    isOutbid: false,
                    buyNowPrice: auction.buyNowPrice || undefined,
                    locationDistrict: auction.locationDistrict || "Colombo",
                  })
                }
                className={`absolute top-4 right-4 p-3 rounded-full backdrop-blur-md transition shadow-md ${
                  isFavorited
                    ? "bg-rose-500 text-white"
                    : "bg-white/95 text-[#64748B] hover:text-rose-500 hover:bg-white"
                }`}
                title={isFavorited ? "Saved in Favorites" : "Save to Favorites"}
              >
                <Heart className={`w-5 h-5 ${isFavorited ? "fill-white" : ""}`} />
              </button>

              <div className="absolute bottom-4 left-4 px-3 py-1 bg-white/95 text-[#172033] text-xs font-bold rounded-lg shadow-sm border border-[#E5EAF2]">
                {auction.locationDistrict}, Sri Lanka
              </div>
            </div>

            {/* Thumbnail Selectors */}
            {images.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-1">
                {images.map((img: any, idx: number) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImage(img.url)}
                    className={`w-20 h-20 rounded-2xl overflow-hidden border-2 transition shrink-0 ${
                      selectedImage === img.url
                        ? "border-[#2457E6] shadow-sm"
                        : "border-[#E5EAF2] opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Description & Specifications */}
          <div className="bg-white border border-[#E5EAF2] rounded-3xl p-6 sm:p-8 space-y-6 shadow-[0_4px_24px_rgb(0,0,0,0.03)]">
            <div className="space-y-2">
              <span className="text-xs font-bold text-[#2457E6] uppercase tracking-wider">
                {auction.category?.name || "Collector Lot"}
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-[#172033] tracking-tight">
                {auction.title}
              </h1>
            </div>

            <div className="border-t border-[#E5EAF2] pt-4 space-y-3">
              <h3 className="font-extrabold text-sm text-[#172033]">Lot Description</h3>
              <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed whitespace-pre-line">
                {auction.product?.description || "No detailed description provided by the consignor."}
              </p>
            </div>

            {/* Attributes Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 border-t border-[#E5EAF2] pt-4">
              <div className="p-3 rounded-xl bg-[#F5F7FB] border border-[#E5EAF2]">
                <span className="text-[10px] text-[#64748B] block">Condition</span>
                <span className="text-xs font-bold text-[#172033]">{auction.product?.condition || "Pristine"}</span>
              </div>
              <div className="p-3 rounded-xl bg-[#F5F7FB] border border-[#E5EAF2]">
                <span className="text-[10px] text-[#64748B] block">Starting Price</span>
                <span className="text-xs font-bold text-[#172033]">{formatLKR(auction.startingPrice)}</span>
              </div>
              <div className="p-3 rounded-xl bg-[#F5F7FB] border border-[#E5EAF2]">
                <span className="text-[10px] text-[#64748B] block">Location</span>
                <span className="text-xs font-bold text-[#172033]">{auction.locationDistrict}</span>
              </div>
            </div>
          </div>

          {/* Seller Profile & Reputation */}
          <div className="bg-white border border-[#E5EAF2] rounded-3xl p-6 sm:p-8 shadow-[0_4px_24px_rgb(0,0,0,0.03)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#EEF3FF] text-[#2457E6] flex items-center justify-center font-black text-lg shrink-0">
                {auction.seller?.storeName?.charAt(0) || "S"}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-extrabold text-sm text-[#172033]">
                    {auction.seller?.storeName || "Certified Consignor"}
                  </h4>
                  {auction.seller?.isVerified && (
                    <span className="text-[10px] font-bold text-[#16B8A6] bg-[#E8FAF7] px-2 py-0.5 rounded-full flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      Verified
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs text-[#64748B] mt-0.5">
                  <span className="flex items-center gap-1 text-amber-500 font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-500" />
                    <span>{auction.seller?.reputationScore || 4.9}</span>
                  </span>
                  <span>•</span>
                  <span>Sri Lanka Registered Consignor</span>
                </div>
              </div>
            </div>

            <Link
              href="/messages"
              className="px-4 py-2 bg-[#F5F7FB] hover:bg-slate-200 border border-[#E5EAF2] text-[#172033] font-bold text-xs rounded-xl transition text-center shrink-0"
            >
              Ask Consignor
            </Link>
          </div>

          {/* Ask BidMate AI Specialist */}
          <div className="bg-white border border-[#E5EAF2] rounded-3xl p-6 sm:p-8 space-y-4 shadow-[0_4px_24px_rgb(0,0,0,0.03)]">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#EEF3FF] text-[#2457E6] flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-[#172033]">Ask BidMate AI Assistant</h3>
                <p className="text-[11px] text-[#64748B]">Grounded answers about lot condition, provenance, and pricing</p>
              </div>
            </div>

            {/* Quick question chips */}
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleAskSpecialist("Is this item genuine and does it come with original papers?")}
                className="text-[11px] font-semibold text-[#2457E6] bg-[#EEF3FF] hover:bg-[#2457E6] hover:text-white px-3 py-1 rounded-full transition"
              >
                Check Authenticity & Papers
              </button>
              <button
                type="button"
                onClick={() => handleAskSpecialist("What is the estimated market value of this lot in Sri Lanka?")}
                className="text-[11px] font-semibold text-[#2457E6] bg-[#EEF3FF] hover:bg-[#2457E6] hover:text-white px-3 py-1 rounded-full transition"
              >
                Market Value Estimation
              </button>
            </div>

            {/* Input */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={aiQuestion}
                onChange={(e) => setAiQuestion(e.target.value)}
                placeholder="Ask any question about this auction..."
                className="flex-1 px-4 py-2.5 bg-[#F5F7FB] border border-[#E5EAF2] rounded-xl text-xs text-[#172033] focus:outline-none focus:border-[#2457E6]"
              />
              <button
                type="button"
                onClick={() => handleAskSpecialist()}
                disabled={isAiLoading || !aiQuestion.trim()}
                className="px-4 py-2.5 bg-[#2457E6] hover:bg-[#1d46be] disabled:bg-slate-300 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isAiLoading ? "Analyzing..." : "Ask AI"}</span>
              </button>
            </div>

            {/* Q&A stream */}
            {aiAnswers.length > 0 && (
              <div className="space-y-3 pt-2">
                {aiAnswers.map((item, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-[#F5F7FB] border border-[#E5EAF2] space-y-1.5 text-xs">
                    <p className="font-bold text-[#172033]">Q: {item.q}</p>
                    <p className="text-[#64748B] leading-relaxed whitespace-pre-line">{item.a}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Live Bidding Panel & Trust Info */}
        <div className="lg:col-span-5 space-y-6">
          {/* Live Bidding Panel */}
          <LiveBiddingPanel
            auction={auction}
            onBidSuccess={() => fetchAuction()}
          />

          {/* Delivery & Escrow Details */}
          <div className="bg-white border border-[#2457E6]/20 rounded-3xl p-6 space-y-4 shadow-[0_4px_24px_rgb(0,0,0,0.03)]">
            <div className="flex items-center justify-between">
              <h4 className="font-extrabold text-sm text-[#172033]">Platform-Managed Logistics & Escrow</h4>
              <span className="text-[10px] font-bold text-[#16B8A6] bg-[#E8FAF7] px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                100% Protected
              </span>
            </div>

            <div className="space-y-3 text-xs text-[#64748B]">
              <div className="flex items-start gap-3">
                <CreditCard className="w-4 h-4 text-[#2457E6] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[#172033] block">BIDME Trust Vault Escrow (මුදල් රඳවා ගැනීම)</strong>
                  <span>ඔබ ගෙවන මුදල් Central Bank of Sri Lanka compliant custodial vault එකේ රඳවා ගැනේ. Seller ට මුදල් ලබා නොදේ.</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Truck className="w-4 h-4 text-[#16B8A6] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[#172033] block">Platform Insured Courier (සුරක්ෂිත ප්‍රවාහනය)</strong>
                  <span>PromptX / BIDME Express මගින් 100% insurance සහ live digital waybill tracking සමඟ භාණ්ඩය නිවසටම ප්‍රවාහනය කෙරේ.</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <ShieldCheck className="w-4 h-4 text-[#172033] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[#172033] block">48-Hour Inspection Gate (පරීක්ෂා කර බැලීමේ කාලය)</strong>
                  <span>භාණ්ඩය ලැබුණු පසු ඔබ එය පරීක්ෂා කර බලා සෑහීමකට පත්වීම තහවුරු කළ පසු පමණක් Seller ට මුදල් නිදහස් කෙරේ.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Auctions */}
      {relatedAuctions.length > 0 && (
        <div className="space-y-6 pt-10 border-t border-[#E5EAF2]">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black text-[#172033]">Related Live Lots</h3>
            <Link href="/search" className="text-xs font-bold text-[#2457E6] hover:underline">
              Explore All Lots
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedAuctions.map((rel) => (
              <AuctionCard key={rel.id} auction={rel} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
