"use client";

import React, { useState } from "react";
import { 
  AlertTriangle, 
  ShieldAlert, 
  CheckCircle2, 
  XCircle, 
  Search, 
  MessageSquare, 
  Image, 
  ArrowRight,
  Gavel
} from "lucide-react";
import { formatLKR } from "@/lib/utils";

export default function AdminDisputesPage() {
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  const [disputes, setDisputes] = useState([
    {
      id: "DSP-LK-401",
      orderId: "escrow_ord_103",
      lotTitle: "Unheated Royal Blue Ceylon Sapphire 3.42ct (GIA Certified)",
      buyerName: "Kasun Jayasuriya",
      sellerName: "Ratnapura Gem Bureau",
      frozenAmount: 850000,
      reason: "Buyer noted minor certificate discrepancy under daylight inspection. Requesting gemologist re-scan.",
      status: "UNDER_INVESTIGATION",
      openedAt: "Today at 11:20 AM",
      evidence: "2 High-Res Microscopic Photographs Attached",
    },
    {
      id: "DSP-LK-398",
      orderId: "escrow_ord_094",
      lotTitle: "Sony Alpha A7 IV Mirrorless Kit",
      buyerName: "Nuwan Pradeep",
      sellerName: "Colombo Digital Hub",
      frozenAmount: 460000,
      reason: "Sensor shutter count higher than advertised in listing.",
      status: "RESOLVED_REFUNDED",
      openedAt: "3 days ago",
      evidence: "EXIF Diagnostic Log Attached",
    },
  ]);

  const handleResolve = (disputeId: string, outcome: "REFUND_BUYER" | "RELEASE_SELLER") => {
    setDisputes((prev) =>
      prev.map((d) =>
        d.id === disputeId
          ? {
              ...d,
              status: outcome === "REFUND_BUYER" ? "RESOLVED_REFUNDED" : "RESOLVED_RELEASED",
            }
          : d
      )
    );
    setActionMsg(`Dispute ${disputeId} resolved: ${outcome === "REFUND_BUYER" ? "100% Refunded to Buyer" : "95% Released to Consignor"}`);
    setTimeout(() => setActionMsg(null), 3500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-rose-400 bg-rose-950/40 px-2.5 py-0.5 rounded-full border border-rose-800/40 uppercase">
              Arbitration Tribunal
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Open Disputes: {disputes.filter((d) => d.status === "UNDER_INVESTIGATION").length}
            </span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight mt-1">
            Dispute Resolution & Escrow Arbitration
          </h1>
          <p className="text-xs text-slate-400">
            Formal buyer and seller dispute mediation with legally binding escrow release or refund actions
          </p>
        </div>

        {actionMsg && (
          <div className="p-3 bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs font-bold rounded-xl animate-in fade-in">
            ✓ {actionMsg}
          </div>
        )}
      </div>

      {/* Disputes List */}
      <div className="space-y-4">
        {disputes.map((d) => (
          <div
            key={d.id}
            className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-xl"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-950/40 border border-rose-800/40 text-rose-400 flex items-center justify-center shrink-0 font-bold">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-white">{d.id}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      d.status === "UNDER_INVESTIGATION"
                        ? "bg-amber-950 text-amber-300 border border-amber-800 animate-pulse"
                        : "bg-emerald-950 text-emerald-400 border border-emerald-800"
                    }`}>
                      {d.status}
                    </span>
                  </div>
                  <h3 className="font-bold text-sm text-white mt-0.5">{d.lotTitle}</h3>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-mono text-slate-400 block uppercase">Frozen in Trust Vault</span>
                <span className="text-base font-black font-mono text-rose-400">
                  {formatLKR(d.frozenAmount)}
                </span>
              </div>
            </div>

            {/* Parties & Evidence */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1 p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800">
                <span className="text-[10px] font-mono text-slate-500 block">Complainant (Buyer)</span>
                <strong className="text-white block">{d.buyerName}</strong>
                <p className="text-slate-400 text-[11px] pt-1">
                  Reason: &quot;{d.reason}&quot;
                </p>
              </div>

              <div className="space-y-1 p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800">
                <span className="text-[10px] font-mono text-slate-500 block">Respondent (Consignor)</span>
                <strong className="text-white block">{d.sellerName}</strong>
                <p className="text-slate-400 text-[11px] pt-1">
                  Evidence: <span className="text-[#16B8A6] font-mono">{d.evidence}</span>
                </p>
              </div>
            </div>

            {/* Arbitration Actions */}
            {d.status === "UNDER_INVESTIGATION" && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <span className="text-xs text-slate-500 font-mono">
                  Opened {d.openedAt}
                </span>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => handleResolve(d.id, "REFUND_BUYER")}
                    className="flex-1 sm:flex-none px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-lg transition"
                  >
                    Uphold Dispute: Refund 100% to Buyer
                  </button>
                  <button
                    type="button"
                    onClick={() => handleResolve(d.id, "RELEASE_SELLER")}
                    className="flex-1 sm:flex-none px-4 py-2 bg-[#16B8A6] hover:bg-[#139a8b] text-white font-bold text-xs rounded-xl shadow-lg transition"
                  >
                    Dismiss Dispute: Release 95% to Consignor
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
