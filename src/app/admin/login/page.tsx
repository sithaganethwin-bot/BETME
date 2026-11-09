"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  ShieldCheck, 
  Lock, 
  KeyRound, 
  Fingerprint, 
  AlertTriangle, 
  ArrowRight, 
  CheckCircle2,
  Terminal,
  Server
} from "lucide-react";
import { useAdmin, AdminRole } from "@/context/AdminContext";

export default function AdminLoginPage() {
  const router = useRouter();
  const { login, isAuthenticated } = useAdmin();

  const [selectedRole, setSelectedRole] = useState<AdminRole>("SUPER_ADMIN");
  const [adminKey, setAdminKey] = useState("••••••••••••••••");
  const [twoFactorCode, setTwoFactorCode] = useState("892410");
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthenticating(true);

    setTimeout(() => {
      login(selectedRole);
      router.push("/admin");
    }, 700);
  };

  return (
    <div className="min-h-screen bg-[#070A0F] text-[#E2E8F0] flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden font-sans">
      {/* Background Grid Pattern & Glows */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293715_1px,transparent_1px),linear-gradient(to_bottom,#1f293715_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none"></div>
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#2457E6]/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-[#16B8A6]/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10 space-y-6">
        
        {/* Logo & Platform Identifier */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-700/60 text-xs font-mono text-[#16B8A6] shadow-inner">
            <span className="w-2 h-2 rounded-full bg-[#16B8A6] animate-ping"></span>
            <span>BIDME SECURE PORTAL GATE</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center justify-center gap-2">
            <span>BIDME</span>
            <span className="text-[#2457E6] text-xs font-mono uppercase bg-[#2457E6]/10 border border-[#2457E6]/30 px-2 py-0.5 rounded-md">
              Operations Center
            </span>
          </h1>
          <p className="text-xs text-slate-400">
            Dedicated Administrative Portal & Operational Control Center
          </p>
        </div>

        {/* Security Warning Box */}
        <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-600/30 text-amber-200/90 text-[11px] leading-relaxed space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-amber-300">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>RESTRICTED ACCESS — AUTHORIZED PERSONNEL ONLY</span>
          </div>
          <p>
            This portal is strictly segregated from the public marketplace. Unauthorized access attempts are actively monitored, rate-limited, and reported to the Sri Lanka CERT Coordination Center.
          </p>
        </div>

        {/* Login Form Card */}
        <form onSubmit={handleLogin} className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl backdrop-blur-xl">
          
          {/* Role Preset Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
              <span>Select Administrative Role:</span>
              <span className="text-[10px] font-mono text-[#16B8A6]">RBAC Enforced</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSelectedRole("SUPER_ADMIN")}
                className={`p-2.5 rounded-xl border text-left text-xs font-bold transition flex items-center gap-2 ${
                  selectedRole === "SUPER_ADMIN"
                    ? "bg-[#2457E6] border-[#2457E6] text-white shadow-md shadow-[#2457E6]/20"
                    : "bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-white"
                }`}
              >
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span className="truncate">Super Admin</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedRole("ADMIN")}
                className={`p-2.5 rounded-xl border text-left text-xs font-bold transition flex items-center gap-2 ${
                  selectedRole === "ADMIN"
                    ? "bg-[#2457E6] border-[#2457E6] text-white shadow-md shadow-[#2457E6]/20"
                    : "bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-white"
                }`}
              >
                <Terminal className="w-4 h-4 shrink-0" />
                <span className="truncate">Admin Ops</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedRole("FINANCE_ADMIN")}
                className={`p-2.5 rounded-xl border text-left text-xs font-bold transition flex items-center gap-2 ${
                  selectedRole === "FINANCE_ADMIN"
                    ? "bg-[#16B8A6] border-[#16B8A6] text-white shadow-md shadow-[#16B8A6]/20"
                    : "bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-white"
                }`}
              >
                <Server className="w-4 h-4 shrink-0" />
                <span className="truncate">Finance Admin</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedRole("MODERATOR")}
                className={`p-2.5 rounded-xl border text-left text-xs font-bold transition flex items-center gap-2 ${
                  selectedRole === "MODERATOR"
                    ? "bg-[#16B8A6] border-[#16B8A6] text-white shadow-md shadow-[#16B8A6]/20"
                    : "bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-white"
                }`}
              >
                <Lock className="w-4 h-4 shrink-0" />
                <span className="truncate">Moderator</span>
              </button>
            </div>
          </div>

          {/* Identity Passphrase Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">Master Secret Passphrase</label>
            <div className="relative">
              <input
                type="password"
                required
                value={adminKey}
                onChange={(e) => setAdminKey(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs font-mono text-white focus:outline-none focus:border-[#2457E6] transition"
              />
              <KeyRound className="w-4 h-4 text-slate-500 absolute right-3.5 top-3.5" />
            </div>
          </div>

          {/* 2FA Token Code */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <label className="font-bold text-slate-300">Hardware 2FA / Authenticator Token</label>
              <span className="text-[10px] font-mono text-[#16B8A6]">Auto-synced</span>
            </div>
            <div className="relative">
              <input
                type="text"
                required
                maxLength={6}
                value={twoFactorCode}
                onChange={(e) => setTwoFactorCode(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-center text-sm font-mono font-bold tracking-[0.5em] text-[#16B8A6] focus:outline-none focus:border-[#16B8A6] transition"
              />
              <Fingerprint className="w-4 h-4 text-slate-500 absolute right-3.5 top-3.5" />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isAuthenticating}
            className="w-full py-3.5 bg-gradient-to-r from-[#2457E6] to-[#1d46be] hover:from-[#1d46be] hover:to-[#2457E6] text-white font-black text-xs sm:text-sm rounded-xl shadow-lg shadow-[#2457E6]/25 transition flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01] active:scale-95 disabled:opacity-50"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{isAuthenticating ? "Authenticating Session..." : `Access Control Center as ${selectedRole.replace("_", " ")}`}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Back to Public Marketplace */}
        <div className="text-center pt-2">
          <Link
            href="/"
            className="text-xs text-slate-500 hover:text-slate-300 font-semibold transition inline-flex items-center gap-1.5"
          >
            <span>← Return to Public Marketplace (bidme.lk)</span>
          </Link>
        </div>

      </div>
    </div>
  );
}
