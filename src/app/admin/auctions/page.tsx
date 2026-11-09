"use client";

import React, { useState, useEffect } from "react";
import { 
  Gavel, 
  Search, 
  Pause, 
  Play, 
  XCircle, 
  AlertTriangle, 
  CheckCircle2, 
  Clock,
  Eye,
  ArrowRight
} from "lucide-react";
import { formatLKR } from "@/lib/utils";

export default function AdminAuctionsPage() {
  const [auctions, setAuctions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  const fetchAuctions = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/overview");
      const data = await res.json();
      if (data.success && data.auctions) {
        setAuctions(data.auctions);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAuctions();
  }, []);

  const handleIntervention = async (auctionId: string, action: "PAUSE" | "RESUME" | "CANCEL") => {
    try {
      const res = await fetch("/api/admin/auctions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          auctionId,
          action,
          reason: "Emergency administrator intervention protocol.",
        }),
      });
      const data = await res.json();
      if (data.success) {
        setActionMsg(`Auction ${action} protocol executed successfully.`);
        fetchAuctions();
        setTimeout(() => setActionMsg(null), 3500);
      }
    } catch (e: any) {
      alert("Failed: " + e.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-[#2457E6] bg-[#2457E6]/10 px-2.5 py-0.5 rounded-full border border-[#2457E6]/30 uppercase">
              Bidding Arena Supervision
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Live Lots: {auctions.filter((a) => a.status === "ACTIVE" || a.status === "LIVE").length}
            </span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight mt-1">
            Live Auction Supervision & Emergency Control
          </h1>
          <p className="text-xs text-slate-400">
            Real-time auction engine monitoring, anti-sniping extensions, and kill-switch overrides
          </p>
        </div>

        {actionMsg && (
          <div className="p-3 bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs font-bold rounded-xl animate-in fade-in">
            ✓ {actionMsg}
          </div>
        )}
      </div>

      {/* Auctions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {auctions.map((auc) => (
          <div
            key={auc.id}
            className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-xl flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded-md border border-slate-800">
                  {auc.id}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  auc.status === "ACTIVE" || auc.status === "LIVE"
                    ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                    : auc.status === "PAUSED"
                    ? "bg-amber-950 text-amber-400 border border-amber-800 animate-pulse"
                    : "bg-slate-950 text-slate-400"
                }`}>
                  {auc.status}
                </span>
              </div>

              <div className="flex items-center gap-3.5">
                <img
                  src={auc.product?.images?.[0]?.url || "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=300"}
                  alt=""
                  className="w-16 h-16 rounded-2xl object-cover border border-slate-800 shrink-0"
                />
                <div>
                  <h3 className="font-bold text-sm text-white line-clamp-1">{auc.title}</h3>
                  <p className="text-xs text-slate-400">Consignor: {auc.seller?.storeName || "Certified Consignor"}</p>
                  <div className="text-xs font-mono font-bold text-[#2457E6] pt-0.5">
                    Current High Bid: {formatLKR(auc.currentPrice)}
                  </div>
                </div>
              </div>
            </div>

            {/* Emergency Action Controls */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-800/80">
              <span className="text-[11px] text-slate-500 font-mono">
                {auc.totalBids || 0} bids placed
              </span>

              <div className="flex items-center gap-2">
                {auc.status === "PAUSED" ? (
                  <button
                    type="button"
                    onClick={() => handleIntervention(auc.id, "RESUME")}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition flex items-center gap-1"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Resume Auction</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleIntervention(auc.id, "PAUSE")}
                    className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl transition flex items-center gap-1"
                  >
                    <Pause className="w-3.5 h-3.5" />
                    <span>Pause Bidding</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => handleIntervention(auc.id, "CANCEL")}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-rose-900/40 text-slate-400 hover:text-rose-400 border border-slate-700 font-bold text-xs rounded-xl transition flex items-center gap-1"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Cancel Lot</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
