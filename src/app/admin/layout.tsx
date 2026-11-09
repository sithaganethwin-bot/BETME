"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  AdminProvider, 
  useAdmin 
} from "@/context/AdminContext";
import { 
  LayoutDashboard, 
  Users, 
  ShieldCheck, 
  Gavel, 
  Truck, 
  CreditCard, 
  AlertTriangle, 
  FileText, 
  LogOut, 
  ExternalLink,
  Lock,
  Radio,
  Server
} from "lucide-react";

function AdminLayoutInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { admin, role, isAuthenticated, logout, switchRole } = useAdmin();

  // If on login page, render cleanly without the enterprise shell
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  // If unauthenticated on protected admin routes, prompt login
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#070A0F] text-[#E2E8F0] flex flex-col items-center justify-center p-6 space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-rose-500/10 border border-rose-500/30 text-rose-500 flex items-center justify-center">
          <Lock className="w-8 h-8" />
        </div>
        <div className="text-center space-y-2 max-w-sm">
          <h2 className="text-xl font-black text-white">Administrative Session Required</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Direct access to the BITME Operational Control Center is restricted. Please authenticate with your operator credentials.
          </p>
        </div>
        <Link
          href="/admin/login"
          className="px-6 py-3 bg-[#2457E6] hover:bg-[#1d46be] text-white font-black text-xs rounded-xl shadow-lg transition"
        >
          Sign In to Admin Portal
        </Link>
      </div>
    );
  }

  const navItems = [
    { href: "/admin", label: "Overview", icon: LayoutDashboard },
    { href: "/admin/users", label: "User Governance", icon: Users },
    { href: "/admin/sellers", label: "Seller KYC", icon: ShieldCheck },
    { href: "/admin/auctions", label: "Live Auctions", icon: Gavel },
    { href: "/admin/escrow", label: "Logistics & Escrow", icon: Truck },
    { href: "/admin/finance", label: "5% Commissions", icon: CreditCard },
    { href: "/admin/disputes", label: "Dispute Arbitration", icon: AlertTriangle },
    { href: "/admin/audit", label: "Immutable Audit", icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-[#070A0F] text-[#E2E8F0] flex flex-col font-sans">
      
      {/* Top Enterprise Status Bar */}
      <header className="bg-[#0B0F17] border-b border-slate-800/80 px-4 sm:px-8 py-3 sticky top-0 z-50 flex items-center justify-between gap-4">
        
        {/* Brand & Status Indicator */}
        <div className="flex items-center gap-4">
          <Link href="/admin" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#2457E6] to-[#16B8A6] flex items-center justify-center font-black text-white text-xs shadow-md">
              B
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-black text-white tracking-tight text-sm">BITME</span>
              <span className="text-[10px] font-mono text-[#16B8A6] uppercase tracking-wider">Control Center</span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-2 pl-3 border-l border-slate-800 text-[11px] text-slate-400 font-mono">
            <span className="inline-flex items-center gap-1.5 text-emerald-400 bg-emerald-950/40 border border-emerald-700/40 px-2 py-0.5 rounded-full text-[10px]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              CBSL COMPLIANT
            </span>
            <span className="text-slate-600">•</span>
            <span>Latency: 14ms</span>
          </div>
        </div>

        {/* Role Switcher & Operator Profile */}
        <div className="flex items-center gap-3">
          {/* Quick Role Simulator */}
          <div className="hidden sm:flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-xl text-[10px] font-bold">
            {(["SUPER_ADMIN", "ADMIN", "MODERATOR", "FINANCE_ADMIN"] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => switchRole(r)}
                className={`px-2.5 py-1 rounded-lg transition ${
                  role === r
                    ? "bg-[#2457E6] text-white shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {r.replace("_", " ")}
              </button>
            ))}
          </div>

          {/* Operator Identity */}
          <div className="flex items-center gap-2 pl-3 border-l border-slate-800">
            <div className="text-right hidden sm:block">
              <span className="text-xs font-bold text-white block">{admin?.name}</span>
              <span className="text-[10px] font-mono text-[#16B8A6] block">{role}</span>
            </div>

            <button
              type="button"
              onClick={logout}
              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-900 rounded-xl transition"
              title="Lock Session / Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Enterprise Sub-Navigation Bar */}
      <nav className="bg-[#0B0F17]/90 border-b border-slate-800/80 px-4 sm:px-8 py-2 overflow-x-auto">
        <div className="flex items-center gap-1 min-w-max">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                  isActive
                    ? "bg-[#2457E6] text-white shadow-md shadow-[#2457E6]/20 font-black"
                    : "text-slate-400 hover:text-white hover:bg-slate-900"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </Link>
            );
          })}

          <div className="ml-auto pl-4">
            <Link
              href="/"
              target="_blank"
              className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition font-semibold"
            >
              <span>View Marketplace</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Admin Content Body */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-8">
        {children}
      </main>

      {/* Enterprise Footer */}
      <footer className="border-t border-slate-800/80 bg-[#0B0F17] py-4 px-4 sm:px-8 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-2">
        <span>BITME Enterprise Operational Control System • Sri Lanka</span>
        <span className="font-mono text-slate-600">Build: v2.4.9 • Node: col-dc-01</span>
      </footer>

    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminProvider>
      <AdminLayoutInner>{children}</AdminLayoutInner>
    </AdminProvider>
  );
}
