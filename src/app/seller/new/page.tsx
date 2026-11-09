"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Zap, 
  Bot, 
  Gavel, 
  PlusCircle, 
  ArrowRight, 
  ArrowLeft,
  ChevronRight, 
  CheckCircle, 
  AlertCircle,
  Percent,
  DollarSign,
  X
} from "lucide-react";
import { CATEGORIES_CONFIG, SRI_LANKAN_DISTRICTS } from "@/lib/constants";
import { useApp } from "@/context/AppContext";
import { formatLKR } from "@/lib/utils";

export default function NewAuctionPage() {
  const router = useRouter();
  const { addNotification } = useApp();

  const [title, setTitle] = useState("Rolex Submariner Date 41mm (Full Set)");
  const [category, setCategory] = useState("watches");
  const [startingPrice, setStartingPrice] = useState("1850000");
  const [reservePrice, setReservePrice] = useState("2000000");
  const [durationHours, setDurationHours] = useState("24");
  const [district, setDistrict] = useState("Colombo");
  const [imageUrl, setImageUrl] = useState("https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=1000&auto=format&fit=crop&q=80");
  const [description, setDescription] = useState(
    "Authentic Rolex Submariner Date 41mm in Oystersteel with black Cerachrom bezel. Preserved in pristine, unworn collector condition with original box and 2024 guarantee card."
  );

  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Trigger Google Gemini Seller Copilot
  const handleGenerateWithAi = async () => {
    setIsGeneratingAi(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/ai/copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemType: title,
          brand: "Rolex",
          condition: "LIKE_NEW",
          userNotes: "Box and papers included",
        }),
      });

      const data = await res.json();
      if (data.success && data.suggestions) {
        setTitle(data.suggestions.suggestedTitle);
        setDescription(data.suggestions.description);
        setStartingPrice(data.suggestions.suggestedStartingPrice.toString());
      }
    } catch (err: any) {
      setErrorMsg("AI assistance failed: " + err.message);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !startingPrice) {
      setErrorMsg("Please specify item title and starting opening bid.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      // Pre-flight safety check
      const safetyRes = await fetch("/api/ai/moderate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description }),
      });
      const safetyData = await safetyRes.json();
      if (safetyData.success && !safetyData.safety.isSafe) {
        throw new Error(`Item blocked: ${safetyData.safety.reason}`);
      }

      // Publish auction
      const res = await fetch("/api/auctions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sellerId: "usr_buyer_101",
          categoryId: category,
          title,
          description,
          startingPrice,
          reservePrice: reservePrice || null,
          durationHours: parseInt(durationHours),
          locationDistrict: district,
          images: [imageUrl],
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to publish auction.");
      }

      addNotification(`Auction "${title}" is now LIVE on BITME!`);
      router.push(`/auction/${data.auction.id}`);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to create auction.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const parsedPrice = parseFloat(startingPrice) || 0;
  const platformFee = Math.round(parsedPrice * 0.05);
  const estimatedNet = parsedPrice - platformFee;

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-16">
      {/* Prominent High-Visibility Back Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white border border-[#E5EAF2] rounded-2xl shadow-sm">
        <div className="flex items-center gap-2 text-xs text-[#64748B]">
          <Link href="/" className="hover:text-[#2457E6] transition font-semibold">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 text-[#94A3B8]" />
          <Link href="/dashboard?mode=selling" className="hover:text-[#2457E6] transition font-semibold">Seller Dashboard</Link>
          <ChevronRight className="w-3.5 h-3.5 text-[#94A3B8]" />
          <span className="text-[#172033] font-bold">New Listing</span>
        </div>

        <Link
          href="/dashboard?mode=selling"
          className="inline-flex items-center gap-2 text-xs font-bold text-white bg-[#172033] hover:bg-[#2457E6] px-4 py-2 rounded-xl transition shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>← Back to Seller Dashboard</span>
        </Link>
      </div>

      {/* Header Card */}
      <div className="bg-white border border-[#E5EAF2] rounded-3xl p-6 sm:p-8 shadow-[0_4px_24px_rgb(0,0,0,0.03)] space-y-2 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-[#2457E6] uppercase tracking-wider">Consignor Studio</span>
          <Link
            href="/dashboard?mode=selling"
            className="text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition"
          >
            <X className="w-3.5 h-3.5" />
            <span>Cancel & Return</span>
          </Link>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#172033] tracking-tight">
          List an Item for Auction
        </h1>
        <p className="text-xs sm:text-sm text-[#64748B]">
          Consign your high-value items to thousands of verified bidders across Sri Lanka.
        </p>
      </div>

      {/* Error message */}
      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-2xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Form Card */}
      <form onSubmit={handleSubmit} className="bg-white border border-[#E5EAF2] rounded-3xl p-6 sm:p-8 space-y-6 shadow-[0_4px_24px_rgb(0,0,0,0.03)]">
        {/* Item Title & AI Button */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-[#172033]">Item Title / Model</label>
            <button
              type="button"
              onClick={handleGenerateWithAi}
              disabled={isGeneratingAi}
              className="text-xs font-bold text-[#2457E6] hover:text-[#1d46be] flex items-center gap-1 transition cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>{isGeneratingAi ? "Looking up specs..." : "Autofill Specifications"}</span>
            </button>
          </div>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. 2024 Rolex Submariner Date 41mm"
            className="w-full bg-[#F5F7FB] border border-[#E5EAF2] rounded-xl p-3 text-sm text-[#172033] focus:border-[#2457E6] focus:bg-white outline-none transition"
          />
        </div>

        {/* Category & District Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#172033]">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-[#F5F7FB] border border-[#E5EAF2] rounded-xl p-3 text-xs text-[#172033] focus:border-[#2457E6] focus:bg-white outline-none"
            >
              {CATEGORIES_CONFIG.map((cat) => (
                <option key={cat.slug} value={cat.slug}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#172033]">Location District</label>
            <select
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="w-full bg-[#F5F7FB] border border-[#E5EAF2] rounded-xl p-3 text-xs text-[#172033] focus:border-[#2457E6] focus:bg-white outline-none"
            >
              {SRI_LANKAN_DISTRICTS.map((d) => (
                <option key={d} value={d}>
                  {d} District
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Photo URL */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-[#172033]">Photo Image URL</label>
          <input
            type="text"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://images.unsplash.com/..."
            className="w-full bg-[#F5F7FB] border border-[#E5EAF2] rounded-xl p-3 text-xs text-[#172033] focus:border-[#2457E6] focus:bg-white outline-none"
          />
        </div>

        {/* Pricing Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#172033]">Starting Price (Rs.)</label>
            <input
              type="number"
              required
              value={startingPrice}
              onChange={(e) => setStartingPrice(e.target.value)}
              placeholder="10000"
              className="w-full bg-[#F5F7FB] border border-[#E5EAF2] rounded-xl p-3 text-sm font-bold text-[#172033] focus:border-[#2457E6] focus:bg-white outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#172033]">Auction Duration</label>
            <select
              value={durationHours}
              onChange={(e) => setDurationHours(e.target.value)}
              className="w-full bg-[#F5F7FB] border border-[#E5EAF2] rounded-xl p-3 text-xs text-[#172033] focus:border-[#2457E6] focus:bg-white outline-none"
            >
              <option value="24">24 Hours (1 Day)</option>
              <option value="48">48 Hours (2 Days)</option>
              <option value="72">72 Hours (3 Days)</option>
              <option value="168">7 Days (1 Week)</option>
            </select>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-[#172033]">Description & Highlights</label>
          <textarea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Key condition details, warranty, original box..."
            className="w-full bg-[#F5F7FB] border border-[#E5EAF2] rounded-xl p-3 text-xs text-[#172033] focus:border-[#2457E6] focus:bg-white outline-none leading-relaxed"
          ></textarea>
        </div>

        {/* Clean 5% Fee Summary Box */}
        <div className="bg-[#F5F7FB] border border-[#E5EAF2] rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div>
            <span className="text-[#64748B] block">Transparent 5% Platform Fee</span>
            <span className="font-bold text-[#172033]">
              Fee: {formatLKR(platformFee)} • You receive: <strong className="text-[#16B8A6]">{formatLKR(estimatedNet)}</strong>
            </span>
          </div>
          <span className="text-[11px] text-[#64748B]">
            Deducted only after the buyer wins and pays.
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <Link
            href="/dashboard?mode=selling"
            className="w-full sm:w-auto px-6 py-4 bg-[#F5F7FB] hover:bg-slate-200 border border-[#E5EAF2] text-[#172033] font-bold text-xs rounded-2xl transition flex items-center justify-center gap-2 text-center"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Cancel & Back to Dashboard</span>
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 w-full py-4 bg-[#2457E6] hover:bg-[#1d46be] text-white font-black text-sm rounded-2xl shadow-sm transition hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Gavel className="w-4 h-4" />
            <span>{isSubmitting ? "Publishing Auction..." : "Publish Auction Item"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
