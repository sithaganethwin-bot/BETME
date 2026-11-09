"use client";

import React, { useState } from "react";
import confetti from "canvas-confetti";
import { 
  Store, 
  X, 
  CheckCircle, 
  ShieldCheck, 
  Building, 
  CreditCard, 
  ArrowRight,
  AlertCircle,
  Truck,
  Percent
} from "lucide-react";
import { useApp } from "@/context/AppContext";

interface SellerOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function SellerOnboardingModal({ isOpen, onClose, onSuccess }: SellerOnboardingModalProps) {
  const { currentUser, submitSellerApplication } = useApp();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [storeName, setStoreName] = useState(currentUser.storeName || `${currentUser.name.split(" ")[0]}'s Curated Vault`);
  const [storeDescription, setStoreDescription] = useState(
    currentUser.storeDescription || "Verified consignor of authentic luxury goods, electronics, and collectibles in Sri Lanka."
  );
  const [bankName, setBankName] = useState(currentUser.bankName || "Commercial Bank of Ceylon");
  const [bankBranch, setBankBranch] = useState(currentUser.bankBranch || "Colombo Foreign Exchange Branch");
  const [bankAccount, setBankAccount] = useState(currentUser.bankAccount || "8009124810");
  const [nic, setNic] = useState(currentUser.nic || "199428102941");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      submitSellerApplication({
        storeName,
        storeDescription,
        bankName,
        bankAccount,
        nic,
      });

      setIsSubmitting(false);
      setIsSuccess(true);

      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (err) {}

      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
      }, 2000);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white border border-[#E5EAF2] rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl animate-in zoom-in-95 duration-200 relative">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-[#64748B] hover:text-[#172033] hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {isSuccess ? (
          <div className="py-10 text-center space-y-4">
            <div className="w-20 h-20 rounded-full bg-[#E8FAF7] text-[#16B8A6] flex items-center justify-center mx-auto shadow-inner animate-bounce">
              <CheckCircle className="w-10 h-10" />
            </div>
            <div className="space-y-1">
              <h3 className="text-2xl font-black text-[#172033]">Seller Account Approved!</h3>
              <p className="text-xs text-[#64748B] max-w-xs mx-auto">
                Welcome to Consignor Studio. You can now consign items, configure auction rules, and receive 95% net payouts under your existing BIDME account.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-[#2457E6]">
                <Store className="w-5 h-5" />
                <span className="text-xs font-bold uppercase tracking-wider">Unified Account System</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-[#172033] tracking-tight">
                Become a BIDME Consignor & Seller
              </h2>
              <p className="text-xs text-[#64748B]">
                Upgrade your existing buyer account to sell and consign products without creating another profile.
              </p>
            </div>

            {/* Stepper Indicator */}
            <div className="grid grid-cols-3 gap-2">
              <div className={`h-1.5 rounded-full transition ${step >= 1 ? "bg-[#2457E6]" : "bg-slate-100"}`} />
              <div className={`h-1.5 rounded-full transition ${step >= 2 ? "bg-[#2457E6]" : "bg-slate-100"}`} />
              <div className={`h-1.5 rounded-full transition ${step >= 3 ? "bg-[#2457E6]" : "bg-slate-100"}`} />
            </div>

            {/* Step 1: Benefits & Requirements */}
            {step === 1 && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="space-y-3">
                  <div className="p-3.5 rounded-2xl bg-[#F5F7FB] border border-[#E5EAF2] flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-[#EEF3FF] text-[#2457E6] flex items-center justify-center shrink-0 font-bold">
                      <Percent className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#172033]">Transparent 95% Net Payout</h4>
                      <p className="text-[11px] text-[#64748B] leading-snug">
                        BIDME charges only 5% on successful auctions. 95% is settled directly to your Sri Lankan bank account.
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[#F5F7FB] border border-[#E5EAF2] flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-[#E8FAF7] text-[#16B8A6] flex items-center justify-center shrink-0 font-bold">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#172033]">PayHere Custodial Escrow Guarantee</h4>
                      <p className="text-[11px] text-[#64748B] leading-snug">
                        All bids are binding and verified. Buyers deposit funds before you ship. Zero non-paying bidder risk.
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[#F5F7FB] border border-[#E5EAF2] flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0 font-bold">
                      <Truck className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#172033]">Islandwide Tracked Courier Pickup</h4>
                      <p className="text-[11px] text-[#64748B] leading-snug">
                        Our integrated courier partners collect packages from your doorstep in Colombo, Kandy, Galle or Jaffna.
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="w-full py-3 bg-[#2457E6] hover:bg-[#1d46be] text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center justify-center gap-2"
                >
                  <span>Continue to Store Setup</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Step 2: Storefront Details */}
            {step === 2 && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-[#172033] block mb-1">
                      Consignor / Store Name *
                    </label>
                    <input
                      type="text"
                      value={storeName}
                      onChange={(e) => setStoreName(e.target.value)}
                      placeholder="e.g. Colombo Vintage Timepieces"
                      required
                      className="w-full px-4 py-2.5 bg-[#F5F7FB] border border-[#E5EAF2] rounded-xl text-xs text-[#172033] focus:outline-none focus:border-[#2457E6]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[#172033] block mb-1">
                      Store Bio / Specialization *
                    </label>
                    <textarea
                      rows={3}
                      value={storeDescription}
                      onChange={(e) => setStoreDescription(e.target.value)}
                      placeholder="Describe what items you consign (watches, gems, art, electronics)..."
                      required
                      className="w-full px-4 py-2 bg-[#F5F7FB] border border-[#E5EAF2] rounded-xl text-xs text-[#172033] focus:outline-none focus:border-[#2457E6]"
                    />
                  </div>

                  <div className="p-3 rounded-xl bg-[#EEF3FF] border border-[#2457E6]/20 text-[11px] text-[#2457E6]">
                    <strong>Shared Identity:</strong> Your store will be linked to your existing verified phone (+94 77 123 4567) and email.
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 py-3 bg-[#F5F7FB] hover:bg-slate-200 text-[#172033] font-bold text-xs rounded-xl transition"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    disabled={!storeName.trim()}
                    className="flex-2 py-3 bg-[#2457E6] hover:bg-[#1d46be] disabled:bg-slate-300 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center justify-center gap-2"
                  >
                    <span>Payout & Bank Details</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Identity & Bank Settlement Information */}
            {step === 3 && (
              <form onSubmit={handleSubmit} className="space-y-4 animate-in fade-in duration-200">
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-[#172033] block mb-1">
                      National Identity Card (NIC) / Passport *
                    </label>
                    <input
                      type="text"
                      value={nic}
                      onChange={(e) => setNic(e.target.value)}
                      placeholder="e.g. 199428102941 or 942810294V"
                      required
                      className="w-full px-4 py-2.5 bg-[#F5F7FB] border border-[#E5EAF2] rounded-xl text-xs text-[#172033] focus:outline-none focus:border-[#2457E6]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-[#172033] block mb-1">
                        Bank Name *
                      </label>
                      <select
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                        className="w-full px-3 py-2.5 bg-[#F5F7FB] border border-[#E5EAF2] rounded-xl text-xs text-[#172033] focus:outline-none focus:border-[#2457E6]"
                      >
                        <option value="Commercial Bank of Ceylon">Commercial Bank</option>
                        <option value="Sampath Bank">Sampath Bank</option>
                        <option value="Hatton National Bank (HNB)">HNB</option>
                        <option value="Bank of Ceylon (BOC)">BOC</option>
                        <option value="Nations Trust Bank (NTB)">NTB</option>
                        <option value="Seylan Bank">Seylan Bank</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-[#172033] block mb-1">
                        Bank Account Number *
                      </label>
                      <input
                        type="text"
                        value={bankAccount}
                        onChange={(e) => setBankAccount(e.target.value)}
                        placeholder="8009124810"
                        required
                        className="w-full px-4 py-2.5 bg-[#F5F7FB] border border-[#E5EAF2] rounded-xl text-xs text-[#172033] focus:outline-none focus:border-[#2457E6]"
                      />
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200/60 text-[11px] text-amber-800">
                    <strong>Settlement Security:</strong> All auction payouts are wired directly to this Sri Lankan bank account upon 48h delivery clearance.
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="flex-1 py-3 bg-[#F5F7FB] hover:bg-slate-200 text-[#172033] font-bold text-xs rounded-xl transition"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !bankAccount.trim() || !nic.trim()}
                    className="flex-2 py-3 bg-[#2457E6] hover:bg-[#1d46be] disabled:bg-slate-300 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <span>Verifying & Approving...</span>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>Submit & Activate Seller Hub</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}
