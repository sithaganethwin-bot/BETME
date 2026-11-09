"use client";

import React, { useState } from "react";
import { 
  CreditCard, 
  Building2, 
  TrendingUp, 
  DollarSign, 
  Percent, 
  Download, 
  CheckCircle2, 
  ArrowUpRight 
} from "lucide-react";
import { formatLKR } from "@/lib/utils";

export default function AdminFinancePage() {
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const settlements = [
    {
      id: "SET-LK-9081",
      seller: "Colombo Watch Exchange",
      bank: "Commercial Bank of Ceylon (•••• 8009)",
      lot: "Rolex Submariner Date 41mm",
      hammerPrice: 2100000,
      fee5Percent: 105000,
      netPayout: 1995000,
      status: "SETTLED",
      date: "Today at 02:30 PM",
    },
    {
      id: "SET-LK-9082",
      seller: "TechZone Premium Consignments",
      bank: "Sampath Bank PLC (•••• 3314)",
      lot: "iPhone 15 Pro Max 256GB",
      hammerPrice: 385000,
      fee5Percent: 19250,
      netPayout: 365750,
      status: "HELD_IN_VAULT",
      date: "Pending 48h Inspection",
    },
    {
      id: "SET-LK-9083",
      seller: "Ratnapura Gem Bureau",
      bank: "Bank of Ceylon (•••• 9102)",
      lot: "Unheated Ceylon Sapphire 3.42ct",
      hammerPrice: 850000,
      fee5Percent: 42500,
      netPayout: 807500,
      status: "HELD_IN_VAULT",
      date: "Awaiting Courier Dispatch",
    },
    {
      id: "SET-LK-9084",
      seller: "Royal Auto Gallery",
      bank: "Hatton National Bank (•••• 5510)",
      lot: "Mercedes-AMG G63 Edition 1",
      hammerPrice: 82000000,
      fee5Percent: 4100000,
      netPayout: 77900000,
      status: "SETTLED",
      date: "Yesterday at 04:15 PM",
    },
  ];

  const handleDownloadReport = () => {
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-[#2457E6] bg-[#2457E6]/10 px-2.5 py-0.5 rounded-full border border-[#2457E6]/30 uppercase">
              Financial Treasury
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Commission Rate: Fixed 5.0%
            </span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight mt-1">
            Financial Ledger & Commission Clearing
          </h1>
          <p className="text-xs text-slate-400">
            Real-time tracking of platform revenues, CBSL custodial settlements, and consignor payouts
          </p>
        </div>

        <button
          type="button"
          onClick={handleDownloadReport}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl border border-slate-700 transition flex items-center gap-2 self-start sm:self-center"
        >
          <Download className="w-4 h-4 text-[#16B8A6]" />
          <span>{downloadSuccess ? "Report Exported!" : "Export Financial Statement (CSV)"}</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-1 shadow-xl">
          <span className="text-[10px] font-bold text-slate-400 uppercase font-mono">Gross Volume (GMV)</span>
          <div className="text-2xl font-black text-white font-mono">Rs. 85,335,000</div>
          <span className="text-[11px] text-emerald-400 font-semibold">+18.4% this month</span>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-1 shadow-xl">
          <span className="text-[10px] font-bold text-slate-400 uppercase font-mono">5% Commission Earned</span>
          <div className="text-2xl font-black text-[#2457E6] font-mono">Rs. 4,266,750</div>
          <span className="text-[11px] text-slate-400">Net platform revenue</span>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-1 shadow-xl">
          <span className="text-[10px] font-bold text-slate-400 uppercase font-mono">Disbursed to Consignors</span>
          <div className="text-2xl font-black text-[#16B8A6] font-mono">Rs. 79,895,000</div>
          <span className="text-[11px] text-slate-400">Settled to SL bank accounts</span>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-1 shadow-xl">
          <span className="text-[10px] font-bold text-slate-400 uppercase font-mono">Pending in Escrow Vault</span>
          <div className="text-2xl font-black text-amber-400 font-mono">Rs. 1,173,250</div>
          <span className="text-[11px] text-amber-300">Awaiting inspection clearance</span>
        </div>
      </div>

      {/* Settlements Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="p-5 border-b border-slate-800">
          <h3 className="font-bold text-sm text-white">Recent Bank Settlement Logs</h3>
          <p className="text-xs text-slate-400">Direct wire transfers cleared through Sri Lanka automated clearinghouse (SLIPS/CEFT)</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/50 text-slate-400 font-bold uppercase text-[10px]">
                <th className="py-3.5 px-4">Settlement ID</th>
                <th className="py-3.5 px-4">Consignor & Bank</th>
                <th className="py-3.5 px-4">Hammer Price</th>
                <th className="py-3.5 px-4">5% BIDME Fee</th>
                <th className="py-3.5 px-4">Net Payout (95%)</th>
                <th className="py-3.5 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {settlements.map((s) => (
                <tr key={s.id} className="hover:bg-slate-800/30 transition">
                  <td className="py-3.5 px-4 font-mono font-bold text-[#2457E6]">{s.id}</td>
                  <td className="py-3.5 px-4">
                    <strong className="text-white block">{s.seller}</strong>
                    <span className="text-[11px] text-slate-400 font-mono">{s.bank}</span>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-white">{formatLKR(s.hammerPrice)}</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-400">{formatLKR(s.fee5Percent)}</td>
                  <td className="py-3.5 px-4 font-mono font-black text-[#16B8A6]">{formatLKR(s.netPayout)}</td>
                  <td className="py-3.5 px-4 text-right">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block ${
                      s.status === "SETTLED"
                        ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                        : "bg-amber-950 text-amber-400 border border-amber-800"
                    }`}>
                      {s.status}
                    </span>
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
