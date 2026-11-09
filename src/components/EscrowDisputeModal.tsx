"use client";

import React, { useState } from "react";
import { AlertTriangle, ShieldAlert, X, UploadCloud, CheckCircle2 } from "lucide-react";

interface EscrowDisputeModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: any;
  onSubmitDispute: (orderId: string, reason: string) => Promise<void>;
}

export function EscrowDisputeModal({
  isOpen,
  onClose,
  order,
  onSubmitDispute,
}: EscrowDisputeModalProps) {
  const [category, setCategory] = useState("DAMAGED");
  const [details, setDetails] = useState("");
  const [photoUploaded, setPhotoUploaded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !order) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!details.trim()) return;

    setIsSubmitting(true);
    try {
      const fullReason = `[Category: ${category}] ${details} (Evidence uploaded)`;
      await onSubmitDispute(order.id, fullReason);
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white border border-[#E5EAF2] rounded-3xl w-full max-w-lg shadow-2xl p-6 sm:p-8 space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E5EAF2] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider">
                Escrow Protection & Dispute
              </span>
              <h2 className="text-lg font-black text-[#172033]">
                Freeze Escrow & Report Issue
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

        {/* Warning Callout */}
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 space-y-1 text-xs">
          <div className="font-bold flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>අරමුදල් වහාම අත්හිටුවනු ලැබේ (Immediate Escrow Freeze)</span>
          </div>
          <p className="text-[11px] text-rose-800/90 leading-relaxed">
            මෙම පැමිණිල්ල යොමුකළ වහාම Seller වෙත මුදල් නිදහස් කිරීම නතර කර, BIDME නීතිමය පරීක්ෂණ අංශය විසින් සාක්ෂි පරීක්ෂා කර තීරණයක් ලබාදෙන තුරු මුදල් සුරක්ෂිතව තබා ගැනේ.
          </p>
        </div>

        {/* Dispute Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#172033]">Dispute Category (ගැටලුවේ ස්වභාවය)</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-[#F5F7FB] border border-[#E5EAF2] rounded-xl p-3 text-xs text-[#172033] focus:border-rose-500 focus:bg-white outline-none"
            >
              <option value="DAMAGED">භාණ්ඩය ප්‍රවාහනයේදී කැඩී හෝ හානිවී ඇත (Damaged in Transit)</option>
              <option value="COUNTERFEIT">ව්‍යාජ හෝ නියම නොවන භාණ්ඩයකි (Suspected Counterfeit)</option>
              <option value="MISMATCH">වෙන්දේසි විස්තරයට වඩා වෙනස් භාණ්ඩයකි (Significantly Not as Described)</option>
              <option value="DEFECTIVE">ක්‍රියාත්මක නොවන සැඟවුණු දෝෂ පවතී (Defective / Malfunctioning)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#172033]">Detailed Explanation (විස්තරය)</label>
            <textarea
              required
              rows={3}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="කරුණාකර භාණ්ඩයේ ඇති දෝෂය හෝ ගැටලුව පැහැදිලි කරන්න..."
              className="w-full bg-[#F5F7FB] border border-[#E5EAF2] rounded-xl p-3 text-xs text-[#172033] focus:border-rose-500 focus:bg-white outline-none leading-relaxed"
            ></textarea>
          </div>

          {/* Photo Evidence Simulation */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#172033]">Photographic Evidence (සාක්ෂි ඡායාරූප)</label>
            <button
              type="button"
              onClick={() => setPhotoUploaded(!photoUploaded)}
              className={`w-full p-4 rounded-xl border border-dashed text-xs flex items-center justify-center gap-2 transition ${
                photoUploaded 
                  ? "bg-emerald-50 border-emerald-400 text-emerald-800 font-bold" 
                  : "bg-[#F5F7FB] border-[#E5EAF2] text-[#64748B] hover:border-[#2457E6]"
              }`}
            >
              {photoUploaded ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>2 Inspection Photos Attached (Defect Proof)</span>
                </>
              ) : (
                <>
                  <UploadCloud className="w-4 h-4" />
                  <span>Click to attach photo evidence of damaged item</span>
                </>
              )}
            </button>
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-[#F5F7FB] hover:bg-slate-200 border border-[#E5EAF2] text-[#172033] font-bold text-xs rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !details.trim()}
              className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-black text-xs rounded-xl shadow-sm transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{isSubmitting ? "Freezing Escrow..." : "Freeze Escrow & Submit"}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
