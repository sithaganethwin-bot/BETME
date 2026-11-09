"use client";

import React, { useState } from "react";
import { 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  X, 
  Lock, 
  Building2, 
  Truck, 
  ArrowRight,
  HelpCircle
} from "lucide-react";
import { formatLKR } from "@/lib/utils";

interface EscrowInspectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: any;
  onConfirmRelease: (orderId: string) => Promise<void>;
  onOpenDispute: (order: any) => void;
}

export function EscrowInspectionModal({
  isOpen,
  onClose,
  order,
  onConfirmRelease,
  onOpenDispute,
}: EscrowInspectionModalProps) {
  const [checkedSeals, setCheckedSeals] = useState(false);
  const [checkedAuth, setCheckedAuth] = useState(false);
  const [checkedCondition, setCheckedCondition] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !order) return null;

  const allChecked = checkedSeals && checkedAuth && checkedCondition;

  const handleApprove = async () => {
    if (!allChecked) return;
    setIsSubmitting(true);
    try {
      await onConfirmRelease(order.id);
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white border border-[#E5EAF2] rounded-3xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E5EAF2] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#E8FAF7] text-[#16B8A6] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-[#16B8A6] uppercase tracking-wider">
                Custodial Escrow Settlement
              </span>
              <h2 className="text-lg font-black text-[#172033]">
                Confirm Inspection & Accept Item
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#64748B] hover:text-[#172033] hover:bg-slate-100 rounded-full transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Item Card */}
        <div className="flex gap-4 p-4 rounded-2xl bg-[#F5F7FB] border border-[#E5EAF2]">
          <img
            src={order.itemImage}
            alt={order.itemTitle}
            className="w-20 h-20 rounded-xl object-cover shrink-0 border border-[#E5EAF2]"
          />
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-[#2457E6] bg-[#EEF3FF] px-2 py-0.5 rounded-full">
              Waybill: {order.waybillNumber}
            </span>
            <h4 className="font-extrabold text-xs sm:text-sm text-[#172033] line-clamp-2">
              {order.itemTitle}
            </h4>
            <p className="text-[11px] text-[#64748B]">
              Consignor: <strong className="text-[#172033]">{order.sellerName}</strong>
            </p>
            <div className="text-xs font-mono-num font-bold text-[#2457E6]">
              Escrow Value Held: {formatLKR(order.totalPaid)}
            </div>
          </div>
        </div>

        {/* Trust Alert */}
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/70 text-amber-900 space-y-1.5 text-xs">
          <div className="flex items-center gap-1.5 font-bold text-amber-800">
            <Lock className="w-4 h-4 text-amber-700 shrink-0" />
            <span>අරමුදල් නිකුත් කිරීමේ තහවුරු කිරීම (Escrow Release)</span>
          </div>
          <p className="text-[11px] text-amber-800/90 leading-relaxed">
            ඔබ මෙම භාණ්ඩය පිළිගත් පසු, BIDME Trust Vault හි රඳවා ඇති මුදලින් 95% ක් ({formatLKR(order.sellerPayout)}) Seller ගේ ලියාපදිංචි <strong>{order.sellerBank} ({order.sellerAccount})</strong> ගිණුමට ස්වයංක්‍රීයව බැර කෙරේ.
          </p>
        </div>

        {/* Inspection Verification Checklist */}
        <div className="space-y-3">
          <h4 className="text-xs font-black text-[#172033] uppercase tracking-wide">
            Buyer Inspection Checklist (පරීක්ෂා කර සලකුණු කරන්න):
          </h4>

          <label className="flex items-start gap-3 p-3 rounded-xl border border-[#E5EAF2] hover:bg-[#F5F7FB] transition cursor-pointer">
            <input
              type="checkbox"
              checked={checkedSeals}
              onChange={(e) => setCheckedSeals(e.target.checked)}
              className="mt-0.5 w-4 h-4 text-[#2457E6] rounded border-[#E5EAF2] focus:ring-0"
            />
            <div className="text-xs space-y-0.5">
              <span className="font-bold text-[#172033] block">1. Security Seal & Packaging Intact</span>
              <span className="text-[#64748B] text-[11px]">
                කුරියර් මගින් ලබාදුන් මුද්‍රා තැබූ ඇසුරුම කිසිදු හානියකින් තොරව නිවැරදිව ලැබුණි.
              </span>
            </div>
          </label>

          <label className="flex items-start gap-3 p-3 rounded-xl border border-[#E5EAF2] hover:bg-[#F5F7FB] transition cursor-pointer">
            <input
              type="checkbox"
              checked={checkedAuth}
              onChange={(e) => setCheckedAuth(e.target.checked)}
              className="mt-0.5 w-4 h-4 text-[#2457E6] rounded border-[#E5EAF2] focus:ring-0"
            />
            <div className="text-xs space-y-0.5">
              <span className="font-bold text-[#172033] block">2. Authenticity & Description Match</span>
              <span className="text-[#64748B] text-[11px]">
                වෙන්දේසියේ සඳහන් ඡායාරූප, අනුක්‍රමික අංක (Serial numbers) සහ සත්‍යතාවය නිවැරදිව තහවුරු විය.
              </span>
            </div>
          </label>

          <label className="flex items-start gap-3 p-3 rounded-xl border border-[#E5EAF2] hover:bg-[#F5F7FB] transition cursor-pointer">
            <input
              type="checkbox"
              checked={checkedCondition}
              onChange={(e) => setCheckedCondition(e.target.checked)}
              className="mt-0.5 w-4 h-4 text-[#2457E6] rounded border-[#E5EAF2] focus:ring-0"
            />
            <div className="text-xs space-y-0.5">
              <span className="font-bold text-[#172033] block">3. Operational & Condition Satisfaction</span>
              <span className="text-[#64748B] text-[11px]">
                භාණ්ඩය නිසිලෙස ක්‍රියාත්මක වන අතර කිසිදු සැඟවුණු දෝෂයක් නොමැති බවට සෑහීමකට පත්වෙමි.
              </span>
            </div>
          </label>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 pt-2 border-t border-[#E5EAF2]">
          <button
            type="button"
            disabled={!allChecked || isSubmitting}
            onClick={handleApprove}
            className="w-full py-3.5 bg-[#16B8A6] hover:bg-[#139a8b] disabled:bg-slate-200 disabled:text-slate-400 text-white font-black text-sm rounded-2xl shadow-sm transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>
              {isSubmitting 
                ? "Releasing Escrow Funds..." 
                : `Accept Item & Release ${formatLKR(order.sellerPayout)} to Seller`}
            </span>
          </button>

          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenDispute(order);
              }}
              className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1.5 transition"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>භාණ්ඩයේ ගැටලුවක්ද? Freeze Escrow & Dispute</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="text-xs font-bold text-[#64748B] hover:text-[#172033] transition"
            >
              Later (පසුව පරීක්ෂා කරන්න)
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
