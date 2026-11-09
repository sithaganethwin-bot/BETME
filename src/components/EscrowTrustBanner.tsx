"use client";

import React from "react";
import { ShieldCheck, Truck, Clock, CheckCircle2, AlertTriangle, ArrowRight } from "lucide-react";

export function EscrowTrustBanner({ className = "" }: { className?: string }) {
  return (
    <div className={`bg-gradient-to-br from-[#2457E6]/5 via-[#16B8A6]/5 to-transparent border border-[#2457E6]/20 rounded-3xl p-6 sm:p-8 space-y-6 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5EAF2] pb-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#2457E6] text-white flex items-center justify-center shrink-0 shadow-md">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider bg-[#EEF3FF] text-[#2457E6] px-2.5 py-0.5 rounded-full">
                BIDME Trust Vault
              </span>
              <span className="text-[10px] font-bold text-[#16B8A6] bg-[#E8FAF7] px-2.5 py-0.5 rounded-full">
                100% Insured Escrow
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-black text-[#172033] tracking-tight mt-1">
              Platform-Managed Logistics & Custodial Escrow
            </h3>
            <p className="text-xs text-[#64748B]">
              මුදල් BIDME භාරයේ රඳවාගෙන (Escrow), භාණ්ඩය පරීක්ෂා කර සෑහීමකට පත්වූ පසු පමණක් Seller ට මුදල් නිදහස් කෙරේ.
            </p>
          </div>
        </div>

        <div className="text-left sm:text-right shrink-0">
          <span className="text-[11px] font-bold text-[#64748B] block">Buyer Protection Guarantee</span>
          <span className="text-sm font-black text-[#16B8A6] flex items-center sm:justify-end gap-1">
            <CheckCircle2 className="w-4 h-4" /> 48-Hour Inspection Window
          </span>
        </div>
      </div>

      {/* 4 Steps Stepper */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Step 1 */}
        <div className="bg-white border border-[#E5EAF2] rounded-2xl p-4 space-y-2 relative shadow-sm">
          <div className="flex items-center justify-between">
            <span className="w-7 h-7 rounded-full bg-[#2457E6] text-white font-black text-xs flex items-center justify-center">
              1
            </span>
            <span className="text-[10px] font-bold text-[#2457E6] bg-[#EEF3FF] px-2 py-0.5 rounded-full">
              Safe Lock
            </span>
          </div>
          <h4 className="font-extrabold text-sm text-[#172033]">Payment Held in Escrow</h4>
          <p className="text-[11px] text-[#64748B] leading-relaxed">
            Buyer ගෙවන මුදල් Central Bank of Sri Lanka compliant BIDME Trust Vault එකේ සුරක්ෂිතව රඳවා ගැනේ.
          </p>
        </div>

        {/* Step 2 */}
        <div className="bg-white border border-[#E5EAF2] rounded-2xl p-4 space-y-2 relative shadow-sm">
          <div className="flex items-center justify-between">
            <span className="w-7 h-7 rounded-full bg-[#2457E6] text-white font-black text-xs flex items-center justify-center">
              2
            </span>
            <span className="text-[10px] font-bold text-[#16B8A6] bg-[#E8FAF7] px-2 py-0.5 rounded-full">
              Insured
            </span>
          </div>
          <h4 className="font-extrabold text-sm text-[#172033]">Platform Courier Dispatch</h4>
          <p className="text-[11px] text-[#64748B] leading-relaxed">
            BIDME නිල කුරියර් (PromptX / Armored Transit) මගින් digital waybill සහ insurance සමඟ භාණ්ඩය ප්‍රවාහනය කරයි.
          </p>
        </div>

        {/* Step 3 */}
        <div className="bg-white border border-[#16B8A6]/40 rounded-2xl p-4 space-y-2 relative shadow-sm">
          <div className="flex items-center justify-between">
            <span className="w-7 h-7 rounded-full bg-[#16B8A6] text-white font-black text-xs flex items-center justify-center">
              3
            </span>
            <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
              48h Window
            </span>
          </div>
          <h4 className="font-extrabold text-sm text-[#172033]">Inspect & Verify Item</h4>
          <p className="text-[11px] text-[#64748B] leading-relaxed">
            භාණ්ඩය ලැබුණු පසු පැය 48ක් ඇතුළත එහි තත්ත්වය, අව්‍යාජභාවය පරීක්ෂා කිරීමට Buyer ට පූර්ණ අයිතිය ඇත.
          </p>
        </div>

        {/* Step 4 */}
        <div className="bg-white border border-[#E5EAF2] rounded-2xl p-4 space-y-2 relative shadow-sm">
          <div className="flex items-center justify-between">
            <span className="w-7 h-7 rounded-full bg-[#172033] text-white font-black text-xs flex items-center justify-center">
              4
            </span>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
              Settlement
            </span>
          </div>
          <h4 className="font-extrabold text-sm text-[#172033]">Payout to Seller</h4>
          <p className="text-[11px] text-[#64748B] leading-relaxed">
            Buyer තෘප්තිමත් වූ පසු පමණක් 95% මුදල Seller ගේ ලියාපදිංචි බැංකු ගිණුමට (Commercial/Sampath) බැර කෙරේ.
          </p>
        </div>
      </div>
    </div>
  );
}
