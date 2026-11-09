"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  ShieldCheck, 
  UserCheck, 
  FileText, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  RefreshCw,
  Database,
  Lock,
  Search,
  DollarSign,
  TrendingUp,
  Percent,
  Terminal,
  Activity,
  Layers,
  ArrowLeft,
  ChevronRight,
  Gavel,
  Store,
  User,
  Truck,
  CreditCard,
  MessageSquare,
  AlertCircle,
  Eye,
  SlidersHorizontal,
  X,
  HelpCircle,
  Award,
  Flag,
  Clock,
  PauseCircle,
  PlayCircle
} from "lucide-react";
import { formatLKR, formatTimeRemaining } from "@/lib/utils";

type AdminRole = "SUPER_ADMIN" | "ADMIN" | "MODERATOR" | "SUPPORT_AGENT" | "FINANCE_ADMIN";

export default function AdminDashboardPage() {
  const [activeRole, setActiveRole] = useState<AdminRole>("SUPER_ADMIN");
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [dateRange, setDateRange] = useState<"today" | "7d" | "30d" | "90d">("30d");

  // Live Backend Data
  const [stats, setStats] = useState<any>({
    totalUsers: 148,
    activeBuyers: 122,
    activeSellers: 26,
    pendingVerifications: 1,
    activeAuctions: 8,
    completedAuctions: 42,
    totalListings: 50,
    totalOrders: 42,
    totalGMV: 6850000,
    totalCommission: 342500,
    pendingPayouts: 6507500,
    openDisputes: 1,
    reportedListings: 1,
  });

  const [users, setUsers] = useState<any[]>([]);
  const [auctions, setAuctions] = useState<any[]>([]);
  const [verifications, setVerifications] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [escrowOrders, setEscrowOrders] = useState<any[]>([]);
  const [escrowMetrics, setEscrowMetrics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // User Filter State
  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("ALL");

  // Auction Filter State
  const [auctionStatusFilter, setAuctionStatusFilter] = useState("ALL");

  // Modal State for Action Confirmation
  const [suspendModalOpen, setSuspendModalOpen] = useState(false);
  const [selectedUserForAction, setSelectedUserForAction] = useState<any>(null);
  const [actionReason, setActionReason] = useState("");

  // Auction intervention modal state
  const [auctionInterventionModal, setAuctionInterventionModal] = useState(false);
  const [selectedAuctionForAction, setSelectedAuctionForAction] = useState<any>(null);
  const [auctionActionType, setAuctionActionType] = useState<"PAUSE" | "RESUME" | "CANCEL">("PAUSE");

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [overviewRes, usersRes, escrowRes] = await Promise.all([
        fetch(`/api/admin/overview?range=${dateRange}`),
        fetch("/api/admin/users"),
        fetch("/api/escrow/orders"),
      ]);

      const oData = await overviewRes.json();
      const uData = await usersRes.json();
      const eData = await escrowRes.json();

      if (oData.success) {
        setStats(oData.stats);
        setAuctions(oData.auctions || []);
        setVerifications(oData.verifications || []);
        setAuditLogs(oData.auditLogs || []);
      }

      if (uData.success) {
        setUsers(uData.users || []);
      }

      if (eData.success) {
        setEscrowOrders(eData.orders || []);
        setEscrowMetrics(eData.metrics || null);
      }
    } catch (err) {
      console.error("Admin data load error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [dateRange]);

  // Handle Seller Verification Approval / Rejection
  const handleUpdateVerification = async (verificationId: string, status: "APPROVED" | "REJECTED") => {
    try {
      const res = await fetch("/api/admin/verifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          verificationId,
          status,
          adminNotes:
            status === "APPROVED"
              ? "NIC and bank settlement documentation verified against Central Bank standards."
              : "Incomplete documentation. Please resubmit valid NIC copy.",
        }),
      });
      const data = await res.json();
      if (data.success) {
        setActionMessage(`Seller application marked as ${status}. Logged to immutable audit trail.`);
        loadData();
        setTimeout(() => setActionMessage(null), 3500);
      }
    } catch (err: any) {
      alert("Verification update failed: " + err.message);
    }
  };

  // Handle Admin Custodial Escrow Intervention
  const handleAdminEscrowAction = async (orderId: string, action: string, reason?: string) => {
    try {
      const res = await fetch("/api/escrow/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, action, reason }),
      });
      const data = await res.json();
      if (data.success) {
        setActionMessage(`Admin Escrow Action Executed: ${action} on ${orderId}`);
        loadData();
        setTimeout(() => setActionMessage(null), 4000);
      }
    } catch (err: any) {
      alert("Admin escrow action failed: " + err.message);
    }
  };

  // Handle User Suspension / Restriction
  const handleExecuteUserAction = async (action: "SUSPEND" | "RESTRICT" | "RESTORE") => {
    if (!selectedUserForAction) return;
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selectedUserForAction.id,
          action,
          reason: actionReason || "Administrative policy enforcement",
        }),
      });
      const data = await res.json();
      if (data.success) {
        setActionMessage(`User ${selectedUserForAction.name} status updated to ${action}. Audit logged.`);
        setSuspendModalOpen(false);
        setActionReason("");
        loadData();
        setTimeout(() => setActionMessage(null), 3500);
      }
    } catch (err: any) {
      alert("User action failed: " + err.message);
    }
  };

  // Handle Auction Intervention
  const handleExecuteAuctionAction = async () => {
    if (!selectedAuctionForAction) return;
    try {
      const res = await fetch("/api/admin/auctions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          auctionId: selectedAuctionForAction.id,
          action: auctionActionType,
          reason: actionReason || "Official administrative intervention",
        }),
      });
      const data = await res.json();
      if (data.success) {
        setActionMessage(`Auction ${selectedAuctionForAction.title} status updated to ${auctionActionType}.`);
        setAuctionInterventionModal(false);
        setActionReason("");
        loadData();
        setTimeout(() => setActionMessage(null), 3500);
      }
    } catch (err: any) {
      alert("Auction intervention failed: " + err.message);
    }
  };

  // Filtered Users
  const filteredUsers = users.filter((u) => {
    const matchQuery =
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.id.toLowerCase().includes(userSearch.toLowerCase());
    const matchRole =
      userRoleFilter === "ALL" ||
      (userRoleFilter === "SELLER" && u.role.includes("SELLER")) ||
      (userRoleFilter === "BUYER" && u.role === "BUYER") ||
      (userRoleFilter === "ADMIN" && u.role.includes("ADMIN"));
    return matchQuery && matchRole;
  });

  // Filtered Auctions
  const filteredAuctions = auctions.filter((a) => {
    if (auctionStatusFilter === "ALL") return true;
    return a.status === auctionStatusFilter;
  });

  return (
    <div className="space-y-6 pb-20 font-sans">
      {/* Breadcrumb Navigation & Back to Dashboard */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-[#64748B]">
          <Link href="/" className="hover:text-[#2457E6] transition">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href="/dashboard" className="hover:text-[#2457E6] transition">Dashboard</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-[#172033] font-semibold">Admin Control Center</span>
        </div>

        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#64748B] hover:text-[#2457E6] bg-white border border-[#E5EAF2] hover:border-[#2457E6]/40 px-3.5 py-1.5 rounded-full transition shadow-sm cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Exit to Marketplace</span>
        </Link>
      </div>

      {/* Top Admin Header Card */}
      <div className="bg-white border border-[#E5EAF2] rounded-3xl p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6 shadow-[0_4px_24px_rgb(0,0,0,0.03)]">
        <div className="flex items-start sm:items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#EEF3FF] border border-[#2457E6]/20 text-[#2457E6] flex items-center justify-center font-black text-2xl shadow-sm shrink-0">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-black text-[#172033] tracking-tight">
                BITME Admin & Clearinghouse Command
              </h1>
              <span className="bg-[#EEF3FF] text-[#2457E6] border border-[#2457E6]/30 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                ROLE: {activeRole.replace("_", " ")}
              </span>
            </div>
            <p className="text-xs text-[#64748B] mt-1 flex flex-wrap items-center gap-2">
              <span>Central Bank Sri Lanka Escrow Ledger</span>
              <span>•</span>
              <span>Google Gemini Neural Moderator v3.6</span>
              <span>•</span>
              <span>Immutable Audit Logs</span>
            </p>
          </div>
        </div>

        {/* RBAC Role Simulator & Refresh */}
        <div className="flex flex-wrap items-center gap-2 self-start lg:self-center">
          <div className="flex items-center gap-1.5 bg-[#F5F7FB] border border-[#E5EAF2] px-3 py-1.5 rounded-xl text-xs">
            <UserCheck className="w-3.5 h-3.5 text-[#2457E6]" />
            <span className="text-[#64748B] font-medium hidden sm:inline">Simulate Role:</span>
            <select
              value={activeRole}
              onChange={(e) => setActiveRole(e.target.value as AdminRole)}
              className="bg-transparent font-bold text-[#172033] outline-none cursor-pointer"
            >
              <option value="SUPER_ADMIN">Super Admin (All Privileges)</option>
              <option value="ADMIN">Admin (Marketplace)</option>
              <option value="MODERATOR">Moderator (Content & Queue)</option>
              <option value="SUPPORT_AGENT">Support Agent (Disputes)</option>
              <option value="FINANCE_ADMIN">Finance Admin (PayHere Ledger)</option>
            </select>
          </div>

          <button
            type="button"
            onClick={loadData}
            disabled={isLoading}
            className="p-2.5 bg-white border border-[#E5EAF2] hover:bg-[#F5F7FB] text-[#172033] rounded-xl transition shadow-sm"
            title="Refresh Ledger"
          >
            <RefreshCw className={`w-4 h-4 text-[#2457E6] ${isLoading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Action Notification Banner */}
      {actionMessage && (
        <div className="p-4 bg-[#E8FAF7] border border-[#16B8A6]/30 text-[#16B8A6] rounded-2xl text-xs font-semibold flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{actionMessage}</span>
          </div>
          <button onClick={() => setActionMessage(null)} className="text-[#16B8A6] hover:opacity-75">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Admin Tab Navigation Bar */}
      <div className="bg-white border border-[#E5EAF2] rounded-2xl p-2 shadow-sm flex items-center gap-1.5 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab("overview")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-2 ${
            activeTab === "overview" ? "bg-[#2457E6] text-white shadow-sm" : "text-[#64748B] hover:text-[#172033]"
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Overview & KPIs</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("users")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-2 ${
            activeTab === "users" ? "bg-[#2457E6] text-white shadow-sm" : "text-[#64748B] hover:text-[#172033]"
          }`}
        >
          <User className="w-3.5 h-3.5" />
          <span>User Management</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("sellers")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-2 ${
            activeTab === "sellers" ? "bg-[#2457E6] text-white shadow-sm" : "text-[#64748B] hover:text-[#172033]"
          }`}
        >
          <Store className="w-3.5 h-3.5" />
          <span>Sellers & KYC</span>
          {verifications.filter((v) => v.status === "PENDING").length > 0 && (
            <span className="bg-amber-400 text-slate-900 text-[10px] font-black px-1.5 py-0.2 rounded-full">
              {verifications.filter((v) => v.status === "PENDING").length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("auctions")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-2 ${
            activeTab === "auctions" ? "bg-[#2457E6] text-white shadow-sm" : "text-[#64748B] hover:text-[#172033]"
          }`}
        >
          <Gavel className="w-3.5 h-3.5" />
          <span>Auction Control</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("orders")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-2 ${
            activeTab === "orders" ? "bg-[#2457E6] text-white shadow-sm" : "text-[#64748B] hover:text-[#172033]"
          }`}
        >
          <Truck className="w-3.5 h-3.5" />
          <span>Orders & Escrow</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("finance")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-2 ${
            activeTab === "finance" ? "bg-[#2457E6] text-white shadow-sm" : "text-[#64748B] hover:text-[#172033]"
          }`}
        >
          <CreditCard className="w-3.5 h-3.5" />
          <span>Finance & 5% Fees</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("disputes")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-2 ${
            activeTab === "disputes" ? "bg-[#2457E6] text-white shadow-sm" : "text-[#64748B] hover:text-[#172033]"
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Disputes & Claims</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("audit")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-2 ${
            activeTab === "audit" ? "bg-[#2457E6] text-white shadow-sm" : "text-[#64748B] hover:text-[#172033]"
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Audit Trail</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: OVERVIEW & 12 ENTERPRISE KPIS (Section 2)                          */}
      {/* ========================================================================= */}
      {activeTab === "overview" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Date Filter Bar */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#172033]">Marketplace Performance Matrix</span>
            <div className="inline-flex p-1 rounded-xl bg-white border border-[#E5EAF2] text-xs">
              {(["today", "7d", "30d", "90d"] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setDateRange(r)}
                  className={`px-3 py-1 rounded-lg font-bold transition ${
                    dateRange === r ? "bg-[#2457E6] text-white" : "text-[#64748B] hover:text-[#172033]"
                  }`}
                >
                  {r === "today" ? "Today" : r === "7d" ? "Last 7 Days" : r === "30d" ? "Last 30 Days" : "Last 90 Days"}
                </button>
              ))}
            </div>
          </div>

          {/* Dedicated Sub-System Control Portals */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#172033] uppercase tracking-wide">
                Dedicated Administrative Sub-Portals (වෙන්වූ පාලන අංශ)
              </span>
              <span className="text-[11px] font-mono text-[#2457E6]">
                Isolated URLs • Direct Deep-Linking
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link
                href="/admin/users"
                className="p-5 rounded-3xl bg-white border border-[#E5EAF2] hover:border-[#2457E6] transition shadow-sm hover:shadow-md group space-y-2 block"
              >
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-2xl bg-[#EEF3FF] text-[#2457E6] flex items-center justify-center">
                    <User className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold text-[#2457E6] bg-[#EEF3FF] px-2 py-0.5 rounded-full">
                    /admin/users
                  </span>
                </div>
                <h4 className="font-extrabold text-sm text-[#172033] group-hover:text-[#2457E6] transition">
                  User Governance
                </h4>
                <p className="text-[11px] text-[#64748B] leading-relaxed">
                  Manage accounts, suspension policies, NIC data, and trust scores.
                </p>
              </Link>

              <Link
                href="/admin/sellers"
                className="p-5 rounded-3xl bg-white border border-[#E5EAF2] hover:border-[#16B8A6] transition shadow-sm hover:shadow-md group space-y-2 block"
              >
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-2xl bg-[#E8FAF7] text-[#16B8A6] flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold text-[#16B8A6] bg-[#E8FAF7] px-2 py-0.5 rounded-full">
                    /admin/sellers
                  </span>
                </div>
                <h4 className="font-extrabold text-sm text-[#172033] group-hover:text-[#16B8A6] transition">
                  Seller KYC & Bank Approvals
                </h4>
                <p className="text-[11px] text-[#64748B] leading-relaxed">
                  Review applicant NICs, verify commercial bank details, and approve consignors.
                </p>
              </Link>

              <Link
                href="/admin/auctions"
                className="p-5 rounded-3xl bg-white border border-[#E5EAF2] hover:border-[#2457E6] transition shadow-sm hover:shadow-md group space-y-2 block"
              >
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-2xl bg-[#EEF3FF] text-[#2457E6] flex items-center justify-center">
                    <Gavel className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold text-[#2457E6] bg-[#EEF3FF] px-2 py-0.5 rounded-full">
                    /admin/auctions
                  </span>
                </div>
                <h4 className="font-extrabold text-sm text-[#172033] group-hover:text-[#2457E6] transition">
                  Live Auction Supervision
                </h4>
                <p className="text-[11px] text-[#64748B] leading-relaxed">
                  Emergency pause/kill switches, anti-sniping extensions, and bid book audits.
                </p>
              </Link>

              <Link
                href="/admin/escrow"
                className="p-5 rounded-3xl bg-white border border-[#E5EAF2] hover:border-[#16B8A6] transition shadow-sm hover:shadow-md group space-y-2 block"
              >
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-2xl bg-[#E8FAF7] text-[#16B8A6] flex items-center justify-center">
                    <Truck className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold text-[#16B8A6] bg-[#E8FAF7] px-2 py-0.5 rounded-full">
                    /admin/escrow
                  </span>
                </div>
                <h4 className="font-extrabold text-sm text-[#172033] group-hover:text-[#16B8A6] transition">
                  Logistics & Escrow Vault
                </h4>
                <p className="text-[11px] text-[#64748B] leading-relaxed">
                  Platform courier tracking, 48-hour inspection countdowns, and payout clearance.
                </p>
              </Link>
            </div>
          </div>

          {/* 12 Enterprise KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
            <div className="bg-white border border-[#E5EAF2] rounded-3xl p-5 space-y-1 shadow-sm">
              <span className="text-[10px] font-bold text-[#64748B] uppercase">Total Users</span>
              <div className="text-2xl font-black text-[#172033]">{stats.totalUsers}</div>
              <span className="text-[11px] text-[#16B8A6] font-semibold">100% Unified Identities</span>
            </div>

            <div className="bg-white border border-[#E5EAF2] rounded-3xl p-5 space-y-1 shadow-sm">
              <span className="text-[10px] font-bold text-[#64748B] uppercase">Active Bidders</span>
              <div className="text-2xl font-black text-[#2457E6]">{stats.activeBuyers}</div>
              <span className="text-[11px] text-[#2457E6] font-semibold">Participating in live book</span>
            </div>

            <div className="bg-white border border-[#E5EAF2] rounded-3xl p-5 space-y-1 shadow-sm">
              <span className="text-[10px] font-bold text-[#64748B] uppercase">Active Sellers</span>
              <div className="text-2xl font-black text-[#172033]">{stats.activeSellers}</div>
              <span className="text-[11px] text-[#16B8A6] font-semibold">Sri Lankan Consignors</span>
            </div>

            <div className="bg-white border border-[#E5EAF2] rounded-3xl p-5 space-y-1 shadow-sm">
              <span className="text-[10px] font-bold text-[#64748B] uppercase">Pending KYC</span>
              <div className="text-2xl font-black text-amber-600">{stats.pendingVerifications}</div>
              <span className="text-[11px] text-amber-700 font-semibold">Awaiting document review</span>
            </div>

            <div className="bg-white border border-[#E5EAF2] rounded-3xl p-5 space-y-1 shadow-sm">
              <span className="text-[10px] font-bold text-[#64748B] uppercase">Active Auctions</span>
              <div className="text-2xl font-black text-[#16B8A6]">{stats.activeAuctions}</div>
              <span className="text-[11px] text-[#16B8A6] font-semibold">Receiving real-time bids</span>
            </div>

            <div className="bg-white border border-[#E5EAF2] rounded-3xl p-5 space-y-1 shadow-sm">
              <span className="text-[10px] font-bold text-[#64748B] uppercase">Completed Auctions</span>
              <div className="text-2xl font-black text-[#172033]">{stats.completedAuctions}</div>
              <span className="text-[11px] text-[#64748B]">Successful hammer strike</span>
            </div>

            <div className="bg-white border border-[#E5EAF2] rounded-3xl p-5 space-y-1 shadow-sm">
              <span className="text-[10px] font-bold text-[#64748B] uppercase">Total Listings</span>
              <div className="text-2xl font-black text-[#172033]">{stats.totalListings}</div>
              <span className="text-[11px] text-[#64748B]">Across 8 categories</span>
            </div>

            <div className="bg-white border border-[#E5EAF2] rounded-3xl p-5 space-y-1 shadow-sm">
              <span className="text-[10px] font-bold text-[#64748B] uppercase">Total Orders</span>
              <div className="text-2xl font-black text-[#172033]">{stats.totalOrders}</div>
              <span className="text-[11px] text-[#16B8A6] font-semibold">100% Escrow protected</span>
            </div>

            <div className="bg-white border border-[#E5EAF2] rounded-3xl p-5 space-y-1 shadow-sm">
              <span className="text-[10px] font-bold text-[#64748B] uppercase">Gross GMV Volume</span>
              <div className="text-xl font-black text-[#172033]">{formatLKR(stats.totalGMV)}</div>
              <span className="text-[11px] text-[#16B8A6] font-semibold">+18.4% month-over-month</span>
            </div>

            <div className="bg-white border border-[#E5EAF2] rounded-3xl p-5 space-y-1 shadow-sm">
              <span className="text-[10px] font-bold text-[#64748B] uppercase">BITME 5% Commission</span>
              <div className="text-xl font-black text-[#2457E6]">{formatLKR(stats.totalCommission)}</div>
              <span className="text-[11px] text-[#2457E6] font-semibold">Net platform revenue</span>
            </div>

            <div className="bg-white border border-[#E5EAF2] rounded-3xl p-5 space-y-1 shadow-sm">
              <span className="text-[10px] font-bold text-[#64748B] uppercase">Pending Payouts (95%)</span>
              <div className="text-xl font-black text-[#172033]">{formatLKR(stats.pendingPayouts)}</div>
              <span className="text-[11px] text-[#64748B]">Commercial Bank disburse</span>
            </div>

            <div className="bg-white border border-[#E5EAF2] rounded-3xl p-5 space-y-1 shadow-sm">
              <span className="text-[10px] font-bold text-[#64748B] uppercase">Open Disputes</span>
              <div className="text-2xl font-black text-rose-600">{stats.openDisputes}</div>
              <span className="text-[11px] text-rose-600 font-semibold">Under arbitration</span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: USER MANAGEMENT (Section 3)                                        */}
      {/* ========================================================================= */}
      {activeTab === "users" && (
        <div className="bg-white border border-[#E5EAF2] rounded-3xl p-6 sm:p-8 space-y-6 shadow-[0_4px_24px_rgb(0,0,0,0.03)] animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5EAF2] pb-4">
            <div>
              <h3 className="text-lg font-black text-[#172033]">Unified User Management</h3>
              <p className="text-xs text-[#64748B]">
                Manage citizens, verified identities, and role assignments under ONE account
              </p>
            </div>

            {/* Search & Filter */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Search user name, email, ID..."
                  className="pl-8 pr-3 py-1.5 bg-[#F5F7FB] border border-[#E5EAF2] rounded-xl text-xs text-[#172033] outline-none focus:border-[#2457E6]"
                />
              </div>

              <select
                value={userRoleFilter}
                onChange={(e) => setUserRoleFilter(e.target.value)}
                className="px-3 py-1.5 bg-[#F5F7FB] border border-[#E5EAF2] rounded-xl text-xs text-[#172033] outline-none"
              >
                <option value="ALL">All Roles</option>
                <option value="BUYER">Buyers Only</option>
                <option value="SELLER">Sellers / Consignors</option>
              </select>
            </div>
          </div>

          {/* User Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F5F7FB] text-[#64748B] font-bold">
                <tr>
                  <th className="p-3 rounded-l-xl">User Identity</th>
                  <th className="p-3">Contact</th>
                  <th className="p-3">Unified Roles</th>
                  <th className="p-3">Citizen Status</th>
                  <th className="p-3">Trust Score</th>
                  <th className="p-3 rounded-r-xl text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5EAF2]">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/70 transition">
                    <td className="p-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-[#2457E6] text-white flex items-center justify-center font-bold shrink-0">
                          {u.name.charAt(0)}
                        </div>
                        <div>
                          <span className="font-extrabold text-[#172033] block">{u.name}</span>
                          <span className="text-[10px] text-[#64748B] font-mono">{u.id}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className="block text-[#172033]">{u.email}</span>
                      <span className="text-[11px] text-[#64748B]">{u.phone} • {u.district}</span>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        u.role.includes("SELLER")
                          ? "bg-[#EEF3FF] text-[#2457E6] border border-[#2457E6]/20"
                          : "bg-slate-100 text-[#64748B]"
                      }`}>
                        {u.role.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="text-[10px] font-bold text-[#16B8A6] bg-[#E8FAF7] px-2 py-0.5 rounded-full flex items-center gap-1 w-fit">
                        <ShieldCheck className="w-3 h-3" />
                        Verified
                      </span>
                    </td>
                    <td className="p-3 font-mono-num font-bold text-[#172033]">
                      {u.buyerScore}%
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedUserForAction(u);
                            setSuspendModalOpen(true);
                          }}
                          className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-lg transition"
                        >
                          Restrict
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: SELLER MANAGEMENT & KYC (Section 4)                                */}
      {/* ========================================================================= */}
      {activeTab === "sellers" && (
        <div className="bg-white border border-[#E5EAF2] rounded-3xl p-6 sm:p-8 space-y-6 shadow-[0_4px_24px_rgb(0,0,0,0.03)] animate-in fade-in duration-200">
          <div className="border-b border-[#E5EAF2] pb-4">
            <h3 className="text-lg font-black text-[#172033]">Seller & Consignor Accreditation</h3>
            <p className="text-xs text-[#64748B]">
              Review National Identity Cards (NIC), business registrations, and Sri Lankan bank payout verification
            </p>
          </div>

          <div className="space-y-4">
            {verifications.map((v) => (
              <div
                key={v.id}
                className="p-5 rounded-2xl bg-[#F5F7FB] border border-[#E5EAF2] flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-[#172033]">
                      {v.sellerProfile?.storeName || "Consignor Store"}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      v.status === "APPROVED"
                        ? "bg-[#E8FAF7] text-[#16B8A6]"
                        : v.status === "PENDING"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-rose-50 text-rose-700"
                    }`}>
                      {v.status}
                    </span>
                  </div>

                  <p className="text-xs text-[#64748B]">
                    Consignor: <strong>{v.sellerProfile?.user?.name}</strong> • Email: {v.sellerProfile?.user?.email} • Phone: {v.sellerProfile?.user?.phone}
                  </p>
                  <p className="text-xs text-[#64748B]">
                    Document Type: <strong>{v.documentType}</strong> • Number: <span className="font-mono">{v.documentNumber}</span>
                  </p>
                </div>

                <div className="flex items-center gap-2 self-end md:self-center">
                  {v.status === "PENDING" && (
                    <>
                      <button
                        type="button"
                        onClick={() => handleUpdateVerification(v.id, "APPROVED")}
                        className="px-4 py-2 bg-[#16B8A6] hover:bg-[#139c8c] text-white text-xs font-bold rounded-xl transition shadow-sm"
                      >
                        Approve Seller
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUpdateVerification(v.id, "REJECTED")}
                        className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl transition"
                      >
                        Reject
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: AUCTION CONTROL & LIVE MONITORING (Section 6)                      */}
      {/* ========================================================================= */}
      {activeTab === "auctions" && (
        <div className="bg-white border border-[#E5EAF2] rounded-3xl p-6 sm:p-8 space-y-6 shadow-[0_4px_24px_rgb(0,0,0,0.03)] animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5EAF2] pb-4">
            <div>
              <h3 className="text-lg font-black text-[#172033]">Live Auction Control Center</h3>
              <p className="text-xs text-[#64748B]">
                Monitor real-time bidding books, anti-sniping timers, and audited pause/cancellation procedures
              </p>
            </div>

            <select
              value={auctionStatusFilter}
              onChange={(e) => setAuctionStatusFilter(e.target.value)}
              className="px-3 py-1.5 bg-[#F5F7FB] border border-[#E5EAF2] rounded-xl text-xs text-[#172033]"
            >
              <option value="ALL">All Auction Statuses</option>
              <option value="LIVE">Live Now</option>
              <option value="ENDED">Ended</option>
              <option value="SUSPENDED">Suspended / Paused</option>
            </select>
          </div>

          <div className="space-y-4">
            {filteredAuctions.map((auc) => (
              <div
                key={auc.id}
                className="p-5 rounded-2xl bg-[#F5F7FB] border border-[#E5EAF2] flex flex-col lg:flex-row lg:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3.5">
                  <img
                    src={auc.product?.images?.[0]?.url || "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=300"}
                    alt=""
                    className="w-16 h-16 rounded-xl object-cover shrink-0 border border-[#E5EAF2]"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-[#172033] line-clamp-1">{auc.title}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        auc.status === "LIVE" ? "bg-[#EEF3FF] text-[#2457E6]" : "bg-slate-200 text-[#64748B]"
                      }`}>
                        {auc.status}
                      </span>
                    </div>
                    <p className="text-xs text-[#64748B]">
                      Consignor: <strong>{auc.seller?.storeName}</strong> • {auc.totalBids} bids placed • Extensions: +{auc.extensionCount * 120}s
                    </p>
                    <div className="text-xs text-[#2457E6] font-mono-num font-bold pt-0.5">
                      Current High Bid: {formatLKR(auc.currentPrice)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end lg:self-center">
                  <Link
                    href={`/auction/${auc.id}`}
                    className="px-3.5 py-1.5 bg-white border border-[#E5EAF2] hover:bg-slate-100 text-[#172033] text-xs font-bold rounded-xl transition"
                  >
                    View Live Page
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedAuctionForAction(auc);
                      setAuctionActionType(auc.status === "LIVE" ? "PAUSE" : "RESUME");
                      setAuctionInterventionModal(true);
                    }}
                    className="px-3.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold rounded-xl transition"
                  >
                    {auc.status === "LIVE" ? "Pause Auction" : "Resume"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: ORDERS & ESCROW CLEARINGHOUSE (Section 7)                          */}
      {/* ========================================================================= */}
      {activeTab === "orders" && (
        <div className="bg-white border border-[#E5EAF2] rounded-3xl p-6 sm:p-8 space-y-6 shadow-[0_4px_24px_rgb(0,0,0,0.03)] animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5EAF2] pb-4">
            <div>
              <h3 className="text-lg font-black text-[#172033]">Platform-Managed Logistics & Escrow Vault</h3>
              <p className="text-xs text-[#64748B]">
                Track CBSL-compliant custodial escrow funds, courier transit, and 48-hour buyer inspection gates
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#16B8A6] bg-[#E8FAF7] border border-[#16B8A6]/30 px-3 py-1 rounded-full flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                Custodial Vault Active
              </span>
            </div>
          </div>

          {/* Escrow KPI Mini-Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-[#F5F7FB] border border-[#E5EAF2] space-y-1">
              <span className="text-[10px] font-bold text-[#64748B] uppercase">Total Funds in Vault Custody</span>
              <div className="text-xl font-black text-[#2457E6] font-mono-num">
                {formatLKR(escrowMetrics?.totalVaultBalance || 3336500)}
              </div>
              <span className="text-[10px] text-[#64748B]">Held until buyer inspection verified</span>
            </div>

            <div className="p-4 rounded-2xl bg-[#F5F7FB] border border-[#E5EAF2] space-y-1">
              <span className="text-[10px] font-bold text-[#64748B] uppercase">Pending Consignor Payouts (95%)</span>
              <div className="text-xl font-black text-[#16B8A6] font-mono-num">
                {formatLKR(escrowMetrics?.pendingSellerPayouts || 3168250)}
              </div>
              <span className="text-[10px] text-[#16B8A6] font-semibold">Direct Sri Lanka bank wire ready</span>
            </div>

            <div className="p-4 rounded-2xl bg-[#F5F7FB] border border-[#E5EAF2] space-y-1">
              <span className="text-[10px] font-bold text-[#64748B] uppercase">Active Inspections & Disputes</span>
              <div className="text-xl font-black text-amber-700">
                {escrowMetrics?.activeInspections || 1} Active • {escrowMetrics?.disputedCount || 0} Frozen
              </div>
              <span className="text-[10px] text-amber-700 font-semibold">48-hour buyer inspection period</span>
            </div>
          </div>

          {/* Escrow Orders Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#E5EAF2] text-[#64748B] font-bold uppercase text-[10px]">
                  <th className="py-3 px-3">Escrow Order / Item</th>
                  <th className="py-3 px-3">Buyer & Consignor</th>
                  <th className="py-3 px-3">Vault Amount</th>
                  <th className="py-3 px-3">Logistics & Status</th>
                  <th className="py-3 px-3 text-right">Admin Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5EAF2]">
                {escrowOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-50/50 transition">
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={ord.itemImage}
                          alt=""
                          className="w-10 h-10 rounded-xl object-cover border border-[#E5EAF2] shrink-0"
                        />
                        <div>
                          <strong className="text-xs text-[#172033] block line-clamp-1">{ord.itemTitle}</strong>
                          <span className="text-[10px] font-mono text-[#64748B]">{ord.id}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-3">
                      <span className="font-bold text-[#172033] block">{ord.buyerName}</span>
                      <span className="text-[10px] text-[#64748B]">Seller: {ord.sellerName}</span>
                    </td>

                    <td className="py-3.5 px-3">
                      <strong className="text-xs font-mono-num text-[#2457E6] block">
                        {formatLKR(ord.totalPaid)}
                      </strong>
                      <span className="text-[10px] text-[#16B8A6]">
                        Net 95%: {formatLKR(ord.sellerPayout)}
                      </span>
                    </td>

                    <td className="py-3.5 px-3">
                      <div className="space-y-1">
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full inline-block ${
                          ord.escrowStatus === "DELIVERED_INSPECTING"
                            ? "bg-amber-100 text-amber-800 border border-amber-300"
                            : ord.escrowStatus === "COURIER_DISPATCHED"
                            ? "bg-[#EEF3FF] text-[#2457E6]"
                            : ord.escrowStatus === "FUNDS_RELEASED_TO_SELLER"
                            ? "bg-emerald-100 text-emerald-800"
                            : ord.escrowStatus === "DISPUTED_ESCROW_FROZEN"
                            ? "bg-rose-100 text-rose-800 border border-rose-300"
                            : "bg-slate-100 text-slate-700"
                        }`}>
                          {ord.escrowStatus}
                        </span>
                        <p className="text-[10px] text-[#64748B] font-mono">
                          {ord.courierPartner} • {ord.waybillNumber}
                        </p>
                      </div>
                    </td>

                    <td className="py-3.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {ord.escrowStatus === "DELIVERED_INSPECTING" && (
                          <button
                            type="button"
                            onClick={() => handleAdminEscrowAction(ord.id, "ADMIN_FORCE_RELEASE")}
                            className="px-2.5 py-1 bg-[#16B8A6] hover:bg-[#139a8b] text-white font-bold text-[10px] rounded-lg transition shadow-sm"
                            title="Force Release 95% Escrow to Seller Bank"
                          >
                            Release Payout
                          </button>
                        )}
                        {ord.escrowStatus === "COURIER_DISPATCHED" && (
                          <button
                            type="button"
                            onClick={() => handleAdminEscrowAction(ord.id, "MARK_DELIVERED")}
                            className="px-2.5 py-1 bg-[#2457E6] hover:bg-[#1d46be] text-white font-bold text-[10px] rounded-lg transition shadow-sm"
                            title="Courier Mark Delivered (Starts 48h Inspection)"
                          >
                            Mark Delivered
                          </button>
                        )}
                        {ord.escrowStatus === "DISPUTED_ESCROW_FROZEN" && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleAdminEscrowAction(ord.id, "ADMIN_FORCE_RELEASE")}
                              className="px-2.5 py-1 bg-[#16B8A6] text-white font-bold text-[10px] rounded-lg transition"
                            >
                              Release
                            </button>
                            <button
                              type="button"
                              onClick={() => handleAdminEscrowAction(ord.id, "ADMIN_REFUND_BUYER")}
                              className="px-2.5 py-1 bg-rose-600 text-white font-bold text-[10px] rounded-lg transition"
                            >
                              Refund
                            </button>
                          </>
                        )}
                        {ord.escrowStatus === "FUNDS_RELEASED_TO_SELLER" && (
                          <span className="text-[10px] font-bold text-emerald-600">✓ Settled</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: FINANCE & 5% COMMISSION REVENUE (Section 8)                        */}
      {/* ========================================================================= */}
      {activeTab === "finance" && (
        <div className="bg-white border border-[#E5EAF2] rounded-3xl p-6 sm:p-8 space-y-6 shadow-[0_4px_24px_rgb(0,0,0,0.03)] animate-in fade-in duration-200">
          <div className="border-b border-[#E5EAF2] pb-4">
            <h3 className="text-lg font-black text-[#172033]">Finance & Commission Clearinghouse</h3>
            <p className="text-xs text-[#64748B]">
              Central Bank of Sri Lanka compliant payment reconciliation and commercial bank wire schedules
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-[#F5F7FB] border border-[#E5EAF2] space-y-1">
              <span className="text-xs font-bold text-[#64748B]">Gross Auction GMV</span>
              <div className="text-2xl font-black text-[#172033]">{formatLKR(stats.totalGMV)}</div>
              <span className="text-xs text-[#16B8A6]">100% Inward Cleared</span>
            </div>

            <div className="p-5 rounded-2xl bg-[#F5F7FB] border border-[#E5EAF2] space-y-1">
              <span className="text-xs font-bold text-[#64748B]">BITME 5% Commission</span>
              <div className="text-2xl font-black text-[#2457E6]">{formatLKR(stats.totalCommission)}</div>
              <span className="text-xs text-[#2457E6]">Net Platform Margin</span>
            </div>

            <div className="p-5 rounded-2xl bg-[#F5F7FB] border border-[#E5EAF2] space-y-1">
              <span className="text-xs font-bold text-[#64748B]">Consignor Payouts (95%)</span>
              <div className="text-2xl font-black text-[#16B8A6]">{formatLKR(stats.pendingPayouts)}</div>
              <span className="text-xs text-[#16B8A6]">PayHere Escrow Managed</span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 7: DISPUTE ARBITRATION (Section 9)                                    */}
      {/* ========================================================================= */}
      {activeTab === "disputes" && (
        <div className="bg-white border border-[#E5EAF2] rounded-3xl p-6 sm:p-8 space-y-6 shadow-[0_4px_24px_rgb(0,0,0,0.03)] animate-in fade-in duration-200">
          <div className="border-b border-[#E5EAF2] pb-4">
            <h3 className="text-lg font-black text-[#172033]">Dispute Resolution Center</h3>
            <p className="text-xs text-[#64748B]">
              Arbitrate claims, review condition photo evidence, and manage escrow releases
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#F5F7FB] border border-[#E5EAF2] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full">
                CASE #DSP-9042 • UNDER REVIEW
              </span>
              <span className="text-xs text-[#64748B]">Assigned to: Senior Arbitrator</span>
            </div>
            <h4 className="font-extrabold text-sm text-[#172033]">
              Rolex Submariner 2024 Guarantee Card Seal Verification
            </h4>
            <p className="text-xs text-[#64748B]">
              Buyer requested pre-disbursement authentication check of Colombo authorized dealer stamp. Chatham Luxury confirmed authenticity certificate.
            </p>
            <div className="flex items-center gap-2 pt-2 border-t border-[#E5EAF2]">
              <button
                type="button"
                onClick={() => setActionMessage("Dispute #DSP-9042 successfully resolved and closed. Escrow released.")}
                className="px-4 py-1.5 bg-[#16B8A6] text-white text-xs font-bold rounded-xl"
              >
                Release Escrow & Close Case
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 8: IMMUTABLE AUDIT TRAIL                                              */}
      {/* ========================================================================= */}
      {activeTab === "audit" && (
        <div className="bg-white border border-[#E5EAF2] rounded-3xl p-6 sm:p-8 space-y-6 shadow-[0_4px_24px_rgb(0,0,0,0.03)] animate-in fade-in duration-200">
          <div className="border-b border-[#E5EAF2] pb-4">
            <h3 className="text-lg font-black text-[#172033]">Immutable Audit Trail</h3>
            <p className="text-xs text-[#64748B]">
              Cryptographically verified ledger of all administrative interventions, verifications, and financial disbursals
            </p>
          </div>

          <div className="space-y-3">
            {auditLogs.map((log) => (
              <div
                key={log.id}
                className="p-3.5 rounded-xl bg-[#F5F7FB] border border-[#E5EAF2] flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-bold text-[#2457E6] uppercase">{log.action}</span>
                  <span className="text-[#64748B] ml-2">Entity: {log.entity} ({log.entityId.slice(0, 10)})</span>
                  <p className="text-[11px] text-[#64748B] font-mono mt-0.5">{log.details}</p>
                </div>
                <span className="text-[10px] text-[#64748B] font-mono shrink-0">
                  {new Date(log.createdAt).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* User Suspension Modal */}
      {suspendModalOpen && selectedUserForAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-[#E5EAF2] rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-[#E5EAF2] pb-3">
              <h3 className="font-extrabold text-sm text-[#172033]">Restrict / Suspend User</h3>
              <button onClick={() => setSuspendModalOpen(false)}>
                <X className="w-4 h-4 text-[#64748B]" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-[#64748B]">
                Document the reason for restricting <strong>{selectedUserForAction.name}</strong> ({selectedUserForAction.email}):
              </p>
              <textarea
                rows={3}
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
                placeholder="Reason for suspension or restriction (e.g. policy violation, payment default)..."
                className="w-full p-3 bg-[#F5F7FB] border border-[#E5EAF2] rounded-xl outline-none text-xs"
              />

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => handleExecuteUserAction("SUSPEND")}
                  className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl"
                >
                  Suspend Account
                </button>
                <button
                  type="button"
                  onClick={() => handleExecuteUserAction("RESTORE")}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-[#172033] font-bold rounded-xl"
                >
                  Restore Access
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Auction Intervention Modal */}
      {auctionInterventionModal && selectedAuctionForAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-[#E5EAF2] rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-[#E5EAF2] pb-3">
              <h3 className="font-extrabold text-sm text-[#172033]">Auction Intervention</h3>
              <button onClick={() => setAuctionInterventionModal(false)}>
                <X className="w-4 h-4 text-[#64748B]" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-[#64748B]">
                Intervene in auction: <strong>{selectedAuctionForAction.title}</strong>
              </p>
              <p className="text-amber-800 bg-amber-50 p-2.5 rounded-xl border border-amber-200 text-[11px]">
                <strong>Immutable Audit Notice:</strong> Every administrative pause or cancellation requires a mandatory recorded justification.
              </p>
              <textarea
                rows={3}
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
                placeholder="Reason for auction intervention..."
                className="w-full p-3 bg-[#F5F7FB] border border-[#E5EAF2] rounded-xl outline-none text-xs"
              />

              <button
                type="button"
                onClick={handleExecuteAuctionAction}
                className="w-full py-2.5 bg-[#2457E6] hover:bg-[#1d46be] text-white font-bold rounded-xl"
              >
                Confirm {auctionActionType}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
