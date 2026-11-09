"use client";

import React, { useState, useEffect } from "react";
import { 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  Search, 
  FileText, 
  Building2, 
  CreditCard,
  User,
  Clock
} from "lucide-react";

export default function AdminSellersPage() {
  const [verifications, setVerifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  const fetchVerifications = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/overview");
      const data = await res.json();
      if (data.success && data.verifications) {
        setVerifications(data.verifications);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVerifications();
  }, []);

  const handleUpdate = async (verificationId: string, status: "APPROVED" | "REJECTED") => {
    try {
      const res = await fetch("/api/admin/verifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          verificationId,
          status,
          adminNotes: status === "APPROVED" 
            ? "NIC and bank settlement documentation verified against CBSL standards."
            : "Incomplete documentation. Please resubmit valid NIC copy.",
        }),
      });
      const data = await res.json();
      if (data.success) {
        setActionMsg(`Seller verification marked as ${status}`);
        fetchVerifications();
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
              KYC & Compliance
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Pending Applications: {verifications.filter((v) => v.status === "PENDING_REVIEW").length}
            </span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight mt-1">
            Seller KYC & Bank Verifications
          </h1>
          <p className="text-xs text-slate-400">
            National Identity Card (NIC), store documentation, and Central Bank compliant bank payout approvals
          </p>
        </div>

        {actionMsg && (
          <div className="p-3 bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs font-bold rounded-xl animate-in fade-in">
            ✓ {actionMsg}
          </div>
        )}
      </div>

      {/* Verifications List */}
      <div className="space-y-4">
        {verifications.map((v) => (
          <div
            key={v.id}
            className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-xl"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-[#16B8A6]/10 border border-[#16B8A6]/30 text-[#16B8A6] flex items-center justify-center font-bold text-sm shrink-0">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base text-white">{v.storeName}</h3>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      v.status === "APPROVED"
                        ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                        : v.status === "REJECTED"
                        ? "bg-rose-950 text-rose-400 border border-rose-800"
                        : "bg-amber-950 text-amber-400 border border-amber-800"
                    }`}>
                      {v.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Applicant: <strong className="text-white">{v.applicantName}</strong> • {v.district} District
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {v.status === "PENDING_REVIEW" ? (
                  <>
                    <button
                      type="button"
                      onClick={() => handleUpdate(v.id, "REJECTED")}
                      className="px-4 py-2 bg-slate-800 hover:bg-rose-900/40 text-slate-300 hover:text-rose-400 border border-slate-700 font-bold text-xs rounded-xl transition"
                    >
                      Reject Application
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUpdate(v.id, "APPROVED")}
                      className="px-5 py-2 bg-[#16B8A6] hover:bg-[#139a8b] text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Approve Seller KYC</span>
                    </button>
                  </>
                ) : (
                  <span className="text-xs font-mono text-slate-400">
                    Decision Logged: {v.status}
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-800/80 text-xs">
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-[10px] text-slate-500 font-mono block">Sri Lanka NIC Document</span>
                <span className="font-mono text-white font-bold">{v.nicNumber}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-[10px] text-slate-500 font-mono block">Designated Bank Account</span>
                <span className="text-white font-bold">{v.bankName}</span>
                <span className="text-[11px] text-slate-400 font-mono block">Acc: {v.bankAccount}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-[10px] text-slate-500 font-mono block">Registered Phone / Contact</span>
                <span className="text-white font-bold">{v.phone}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
