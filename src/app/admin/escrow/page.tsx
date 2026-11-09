"use client";

import React, { useState, useEffect } from "react";
import { 
  ShieldCheck, 
  Truck, 
  Lock, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  CreditCard,
  Building,
  ArrowRight
} from "lucide-react";
import { formatLKR } from "@/lib/utils";

export default function AdminEscrowPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/escrow/orders");
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders || []);
        setMetrics(data.metrics || null);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleAction = async (orderId: string, action: string, reason?: string) => {
    try {
      const res = await fetch("/api/escrow/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, action, reason }),
      });
      const data = await res.json();
      if (data.success) {
        setActionMsg(`Escrow Action Executed: ${action} on ${orderId}`);
        fetchOrders();
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
            <span className="text-[10px] font-mono text-[#16B8A6] bg-[#16B8A6]/10 px-2.5 py-0.5 rounded-full border border-[#16B8A6]/30 uppercase">
              Custodial Vault Management
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Protected Lots: {orders.length}
            </span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight mt-1">
            Platform-Managed Logistics & Escrow Clearinghouse
          </h1>
          <p className="text-xs text-slate-400">
            100% CBSL-compliant custodial holding, insured courier transit, and 48-hour inspection gates
          </p>
        </div>

        {actionMsg && (
          <div className="p-3 bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs font-bold rounded-xl animate-in fade-in">
            ✓ {actionMsg}
          </div>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-1 shadow-xl">
          <span className="text-[10px] font-bold text-slate-400 uppercase font-mono">Total Locked in Trust Vault</span>
          <div className="text-2xl font-black text-[#2457E6] font-mono">
            {formatLKR(metrics?.totalVaultBalance || 3336500)}
          </div>
          <span className="text-[11px] text-slate-400">Held until buyer verifies authenticity</span>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-1 shadow-xl">
          <span className="text-[10px] font-bold text-slate-400 uppercase font-mono">Pending Consignor Payouts (95%)</span>
          <div className="text-2xl font-black text-[#16B8A6] font-mono">
            {formatLKR(metrics?.pendingSellerPayouts || 3168250)}
          </div>
          <span className="text-[11px] text-[#16B8A6] font-semibold">Ready for direct bank settlement</span>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-1 shadow-xl">
          <span className="text-[10px] font-bold text-slate-400 uppercase font-mono">Active Inspections & Disputes</span>
          <div className="text-2xl font-black text-amber-400 font-mono">
            {metrics?.activeInspections || 1} Active • {metrics?.disputedCount || 0} Frozen
          </div>
          <span className="text-[11px] text-amber-300 font-semibold">48-Hour Buyer Inspection Window</span>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/50 text-slate-400 font-bold uppercase text-[10px]">
                <th className="py-3.5 px-4">Escrow Order / Lot</th>
                <th className="py-3.5 px-4">Buyer & Consignor</th>
                <th className="py-3.5 px-4">Vault Amount</th>
                <th className="py-3.5 px-4">Logistics & Escrow Status</th>
                <th className="py-3.5 px-4 text-right">Admin Override</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {orders.map((ord) => (
                <tr key={ord.id} className="hover:bg-slate-800/30 transition">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={ord.itemImage}
                        alt=""
                        className="w-12 h-12 rounded-2xl object-cover border border-slate-800 shrink-0"
                      />
                      <div>
                        <strong className="text-white block line-clamp-1">{ord.itemTitle}</strong>
                        <span className="text-[10px] font-mono text-[#16B8A6]">{ord.id}</span>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <strong className="text-white block">{ord.buyerName}</strong>
                    <span className="text-[11px] text-slate-400">Seller: {ord.sellerName}</span>
                  </td>

                  <td className="py-3.5 px-4">
                    <strong className="text-white font-mono block">{formatLKR(ord.totalPaid)}</strong>
                    <span className="text-[10px] text-[#16B8A6] font-mono">Net: {formatLKR(ord.sellerPayout)}</span>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="space-y-1">
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full inline-block ${
                        ord.escrowStatus === "DELIVERED_INSPECTING"
                          ? "bg-amber-950 text-amber-300 border border-amber-800 animate-pulse"
                          : ord.escrowStatus === "COURIER_DISPATCHED"
                          ? "bg-[#2457E6]/20 text-[#2457E6] border border-[#2457E6]/40"
                          : ord.escrowStatus === "FUNDS_RELEASED_TO_SELLER"
                          ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                          : ord.escrowStatus === "DISPUTED_ESCROW_FROZEN"
                          ? "bg-rose-950 text-rose-400 border border-rose-800"
                          : "bg-slate-950 text-slate-400"
                      }`}>
                        {ord.escrowStatus}
                      </span>
                      <p className="text-[10px] text-slate-500 font-mono">
                        {ord.courierPartner} • {ord.waybillNumber}
                      </p>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {ord.escrowStatus === "DELIVERED_INSPECTING" && (
                        <button
                          type="button"
                          onClick={() => handleAction(ord.id, "ADMIN_FORCE_RELEASE")}
                          className="px-3 py-1 bg-[#16B8A6] hover:bg-[#139a8b] text-white font-bold text-[10px] rounded-lg transition"
                        >
                          Release Payout
                        </button>
                      )}
                      {ord.escrowStatus === "COURIER_DISPATCHED" && (
                        <button
                          type="button"
                          onClick={() => handleAction(ord.id, "MARK_DELIVERED")}
                          className="px-3 py-1 bg-[#2457E6] hover:bg-[#1d46be] text-white font-bold text-[10px] rounded-lg transition"
                        >
                          Mark Delivered
                        </button>
                      )}
                      {ord.escrowStatus === "DISPUTED_ESCROW_FROZEN" && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleAction(ord.id, "ADMIN_FORCE_RELEASE")}
                            className="px-2.5 py-1 bg-[#16B8A6] text-white font-bold text-[10px] rounded-lg transition"
                          >
                            Release
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAction(ord.id, "ADMIN_REFUND_BUYER")}
                            className="px-2.5 py-1 bg-rose-600 text-white font-bold text-[10px] rounded-lg transition"
                          >
                            Refund
                          </button>
                        </>
                      )}
                      {ord.escrowStatus === "FUNDS_RELEASED_TO_SELLER" && (
                        <span className="text-[11px] font-bold text-emerald-400 font-mono">✓ Settled</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
