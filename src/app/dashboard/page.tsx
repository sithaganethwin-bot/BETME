"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { 
  User, 
  Gavel, 
  Store, 
  PlusCircle, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  ArrowRight, 
  ShieldCheck, 
  Heart, 
  Truck, 
  Building, 
  Eye,
  Percent,
  Wallet,
  ArrowUpRight,
  ExternalLink,
  Flame,
  Zap,
  Settings,
  Bell,
  Package,
  Calendar,
  Layers,
  ChevronRight,
  Compass,
  Star,
  FileText,
  DollarSign,
  Send,
  X,
  CreditCard,
  Edit3,
  Lock,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { formatLKR, formatTimeRemaining } from "@/lib/utils";
import { SellerOnboardingModal } from "@/components/SellerOnboardingModal";
import { EscrowTrustBanner } from "@/components/EscrowTrustBanner";
import { EscrowInspectionModal } from "@/components/EscrowInspectionModal";
import { EscrowDisputeModal } from "@/components/EscrowDisputeModal";

interface FulfilOrder {
  id: string;
  title: string;
  buyerName: string;
  buyerLocation: string;
  finalBid: number;
  status: string;
  orderedAt: string;
  image: string;
  trackingNumber?: string;
}

function DashboardContent() {
  const searchParams = useSearchParams();
  const urlMode = searchParams.get("mode");
  const urlTab = searchParams.get("tab");

  const { 
    currentUser, 
    updateUserProfile,
    preferredDashboard, 
    setPreferredDashboard,
    favorites, 
    cart,
    removeFromFavorites,
    addNotification
  } = useApp();

  // Mode: "buying" or "selling"
  const [mode, setMode] = useState<"buying" | "selling">(
    urlMode === "selling" || preferredDashboard === "SELLER" ? "selling" : "buying"
  );

  // Active sub-section within the selected mode
  const [activeTab, setActiveTab] = useState<string>(urlTab || "overview");

  const [auctions, setAuctions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [wireSuccessMsg, setWireSuccessMsg] = useState<string | null>(null);

  // Fulfillment simulation modal state
  const [fulfilModalOpen, setFulfilModalOpen] = useState(false);
  const [selectedOrderToFulfil, setSelectedOrderToFulfil] = useState<any>(null);
  const [waybillInput, setWaybillInput] = useState("PRM-CMB-88914");
  const [isDispatching, setIsDispatching] = useState(false);

  // Profile Edit modal / tab state
  const [editName, setEditName] = useState(currentUser.name);
  const [editPhone, setEditPhone] = useState(currentUser.phone);
  const [editDistrict, setEditDistrict] = useState(currentUser.district);
  const [editAddress, setEditAddress] = useState(currentUser.address);
  const [editStoreName, setEditStoreName] = useState(currentUser.storeName);
  const [editStoreDesc, setEditStoreDesc] = useState(currentUser.storeDescription || "");
  const [profileSavedMsg, setProfileSavedMsg] = useState<string | null>(null);

  // Platform-Managed Logistics (Escrow) State
  const [escrowOrders, setEscrowOrders] = useState<any[]>([]);
  const [isEscrowLoading, setIsEscrowLoading] = useState(true);
  const [inspectionModalOpen, setInspectionModalOpen] = useState(false);
  const [disputeModalOpen, setDisputeModalOpen] = useState(false);
  const [selectedEscrowOrder, setSelectedEscrowOrder] = useState<any>(null);

  const fetchEscrowOrders = async () => {
    try {
      const res = await fetch("/api/escrow/orders");
      const data = await res.json();
      if (data.success) {
        setEscrowOrders(data.orders);
      }
    } catch (e) {
      console.error("Failed to fetch escrow orders:", e);
    } finally {
      setIsEscrowLoading(false);
    }
  };

  useEffect(() => {
    fetchEscrowOrders();
  }, []);

  // Escrow Action Handlers
  const handleConfirmInspectionRelease = async (orderId: string) => {
    try {
      const res = await fetch("/api/escrow/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, action: "CONFIRM_INSPECTION_RELEASE" }),
      });
      const data = await res.json();
      if (data.success) {
        addNotification(`🎉 Inspection Verified! Rs. ${data.order.sellerPayout?.toLocaleString()} released to seller.`);
        await fetchEscrowOrders();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleRaiseEscrowDispute = async (orderId: string, reason: string) => {
    try {
      const res = await fetch("/api/escrow/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, action: "RAISE_DISPUTE", reason }),
      });
      const data = await res.json();
      if (data.success) {
        addNotification("⚠️ Escrow Frozen! Dispute submitted to BIDME arbitration.");
        await fetchEscrowOrders();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSimulateDelivery = async (orderId: string) => {
    try {
      const res = await fetch("/api/escrow/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, action: "MARK_DELIVERED" }),
      });
      const data = await res.json();
      if (data.success) {
        addNotification("📦 Courier delivered! 48-Hour Buyer Inspection Window has commenced.");
        await fetchEscrowOrders();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Handle URL mode changes
  useEffect(() => {
    if (urlMode === "selling") {
      setMode("selling");
      setPreferredDashboard("SELLER");
    } else if (urlMode === "buying") {
      setMode("buying");
      setPreferredDashboard("BUYER");
    }
  }, [urlMode, setPreferredDashboard]);

  // Load Auctions from backend
  useEffect(() => {
    async function loadAuctions() {
      try {
        const res = await fetch("/api/auctions");
        const data = await res.json();
        if (data.success) {
          setAuctions(data.auctions);
        }
      } catch (err) {
        console.error("Failed to load auctions:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadAuctions();
  }, []);

  const handleModeSwitch = (newMode: "buying" | "selling") => {
    if (newMode === "selling" && currentUser.sellerStatus !== "APPROVED") {
      // Launch Seller Onboarding flow if not approved
      setIsOnboardingOpen(true);
      return;
    }
    setMode(newMode);
    setActiveTab("overview");
    setPreferredDashboard(newMode === "selling" ? "SELLER" : "BUYER");
  };

  // 1. Items user is bidding on (Buyer Mode)
  const myBidsItems = auctions.slice(0, 3).map((auc, idx) => {
    const isLeading = idx !== 1;
    return {
      ...auc,
      myBidAmount: isLeading ? auc.currentPrice : auc.currentPrice - 50000,
      currentLeadAmount: auc.currentPrice,
      isLeading,
      outbidBy: isLeading ? 0 : 50000,
      situation: isLeading ? "LEADING" : "OUTBID",
    };
  });

  // 2. Items user listed for sale (Seller Mode)
  const mySellingItems = auctions.slice(2, 6).map((auc, idx) => {
    const fee = Math.round(auc.currentPrice * 0.05);
    const netPayout = auc.currentPrice - fee;
    const isReserveMet = !auc.reservePrice || auc.currentPrice >= auc.reservePrice;
    return {
      ...auc,
      fee,
      netPayout,
      isReserveMet,
      recentBidders: [
        { name: "Bidder ***89", amount: auc.currentPrice, time: "2 mins ago" },
        { name: "Bidder ***42", amount: auc.currentPrice - 25000, time: "18 mins ago" },
        { name: "Bidder ***14", amount: auc.currentPrice - 50000, time: "1 hour ago" },
      ],
    };
  });

  // Pending order to fulfil
  const [ordersToFulfil, setOrdersToFulfil] = useState<FulfilOrder[]>([
    {
      id: "ord_fulfil_901",
      title: "Sony Alpha A7 III Mirrorless Camera Kit",
      buyerName: "Kasun Jayasuriya",
      buyerLocation: "Colombo 07, Western Province",
      finalBid: 275000,
      status: "AWAITING_DISPATCH",
      orderedAt: "Today at 02:15 PM",
      image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500",
    },
  ]);

  const handleConfirmDispatch = () => {
    setIsDispatching(true);
    setTimeout(() => {
      setOrdersToFulfil((prev) =>
        prev.map((o) =>
          o.id === selectedOrderToFulfil?.id
            ? { ...o, status: "DISPATCHED", trackingNumber: waybillInput }
            : o
        )
      );
      setIsDispatching(false);
      setFulfilModalOpen(false);
      addNotification(`📦 Order #${selectedOrderToFulfil?.id} marked as Dispatched via ${waybillInput}!`);
    }, 1000);
  };

  const totalSoldVolume = mySellingItems.reduce((acc, a) => acc + a.currentPrice, 0);
  const totalSellerFees = Math.round(totalSoldVolume * 0.05);
  const netEarnings = totalSoldVolume - totalSellerFees;

  const handleRequestWirePayout = () => {
    const ref = `BTME-LK-${Math.floor(100000 + Math.random() * 900000)}`;
    setWireSuccessMsg(
      `Direct Bank Wire scheduled! Rs. ${netEarnings.toLocaleString("en-LK")} will be credited to ${currentUser.bankName} (${currentUser.bankAccount}). Ref: ${ref}`
    );
    addNotification(`💸 Payout of Rs. ${netEarnings.toLocaleString("en-LK")} initiated to ${currentUser.bankName}. Ref: ${ref}`);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile({
      name: editName,
      phone: editPhone,
      district: editDistrict,
      address: editAddress,
      storeName: editStoreName,
      storeDescription: editStoreDesc,
    });
    setProfileSavedMsg("Profile information saved successfully across both Buyer & Seller roles.");
    setTimeout(() => setProfileSavedMsg(null), 3000);
  };

  return (
    <div className="space-y-8 pb-20 font-sans">
      {/* ========================================================================= */}
      {/* 1. TOP UNIFIED ACCOUNT BANNER & MODE SWITCHER                             */}
      {/* ========================================================================= */}
      <div className="bg-white border border-[#E5EAF2] rounded-3xl p-6 sm:p-8 shadow-[0_4px_24px_rgb(0,0,0,0.03)] flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-[#2457E6] text-white flex items-center justify-center font-black text-2xl shadow-sm shrink-0">
            {currentUser.name.charAt(0)}
          </div>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-[#172033] tracking-tight">
                {currentUser.name}
              </h1>
              <span className="text-xs font-bold bg-[#E8FAF7] text-[#16B8A6] border border-[#16B8A6]/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                Verified Citizen
              </span>
              {currentUser.sellerStatus === "APPROVED" ? (
                <span className="text-xs font-bold bg-[#EEF3FF] text-[#2457E6] border border-[#2457E6]/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <Store className="w-3.5 h-3.5" />
                  Accredited Consignor
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsOnboardingOpen(true)}
                  className="text-xs font-bold bg-amber-50 text-amber-700 border border-amber-300/50 hover:bg-amber-100 px-2.5 py-0.5 rounded-full transition flex items-center gap-1"
                >
                  <PlusCircle className="w-3 h-3 text-amber-600" />
                  Become a Seller
                </button>
              )}
            </div>
            <p className="text-xs text-[#64748B]">
              {currentUser.email} • {currentUser.phone} • {currentUser.district}, Sri Lanka
            </p>
            <div className="text-[11px] font-semibold text-[#2457E6] flex items-center gap-3 pt-0.5">
              <span>NIC: {currentUser.nic}</span>
              <span>•</span>
              <span>Buyer Trust Score: {currentUser.buyerScore}%</span>
              <span>•</span>
              <span>Consignor Rating: {currentUser.reputationScore} ★</span>
            </div>
          </div>
        </div>

        {/* Account Health & Status Verification Indicator */}
        <div className="flex flex-col items-start lg:items-end gap-1.5 self-start lg:self-center text-xs text-[#64748B]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#16B8A6] animate-pulse"></span>
            <span className="font-extrabold text-[#172033]">All-in-One Account Active</span>
          </div>
          <p className="text-[11px] text-[#64748B]">
            PayHere Escrow & Sri Lanka Citizen Verified
          </p>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. PROMINENT ACCOUNT MODE SWITCHER (Section 2)                           */}
      {/* ========================================================================= */}
      <div className="bg-white border border-[#E5EAF2] rounded-2xl p-2.5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="inline-flex p-1 rounded-xl bg-[#F5F7FB] border border-[#E5EAF2]">
          <button
            type="button"
            onClick={() => handleModeSwitch("buying")}
            className={`px-5 py-2 rounded-lg font-black text-xs transition flex items-center gap-2 cursor-pointer ${
              mode === "buying"
                ? "bg-[#2457E6] text-white shadow-sm"
                : "text-[#64748B] hover:text-[#172033]"
            }`}
          >
            <Gavel className="w-4 h-4" />
            <span>BUYER MODE</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
              mode === "buying" ? "bg-white/20 text-white" : "bg-slate-200 text-[#64748B]"
            }`}>
              {myBidsItems.length} Bids
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleModeSwitch("selling")}
            className={`px-5 py-2 rounded-lg font-black text-xs transition flex items-center gap-2 cursor-pointer ${
              mode === "selling"
                ? "bg-[#2457E6] text-white shadow-sm"
                : "text-[#64748B] hover:text-[#172033]"
            }`}
          >
            <Store className="w-4 h-4" />
            <span>SELLER MODE</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
              mode === "selling" ? "bg-white/20 text-white" : "bg-slate-200 text-[#64748B]"
            }`}>
              {mySellingItems.length} Live
            </span>
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs text-[#64748B] px-2">
          <span className="w-2 h-2 rounded-full bg-[#16B8A6] animate-pulse"></span>
          <span>
            {mode === "buying"
              ? "Viewing Bidding Arena, active bids & orders to pay."
              : "Viewing Consignor Studio, live listings & 95% payouts."}
          </span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. UNIFIED LAYOUT: SIDEBAR + CONTENT                                      */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Desktop Sidebar Navigation */}
        <aside className="lg:col-span-3 space-y-6">
          <div className="bg-white border border-[#E5EAF2] rounded-3xl p-5 shadow-[0_4px_24px_rgb(0,0,0,0.03)] space-y-6">
            {/* Mode Specific Navigation Links */}
            {mode === "buying" ? (
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider px-3 block mb-2">
                  Buyer Operations
                </span>

                <button
                  type="button"
                  onClick={() => setActiveTab("overview")}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition text-left ${
                    activeTab === "overview"
                      ? "bg-[#EEF3FF] text-[#2457E6]"
                      : "text-[#64748B] hover:bg-[#F5F7FB] hover:text-[#172033]"
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <Gavel className="w-4 h-4" />
                    <span>Buyer Overview</span>
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("my-bids")}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition text-left ${
                    activeTab === "my-bids"
                      ? "bg-[#EEF3FF] text-[#2457E6]"
                      : "text-[#64748B] hover:bg-[#F5F7FB] hover:text-[#172033]"
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <TrendingUp className="w-4 h-4" />
                    <span>My Bids</span>
                  </span>
                  <span className="text-[10px] font-bold bg-slate-100 px-2 py-0.5 rounded-full">
                    {myBidsItems.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("watchlist")}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition text-left ${
                    activeTab === "watchlist"
                      ? "bg-[#EEF3FF] text-[#2457E6]"
                      : "text-[#64748B] hover:bg-[#F5F7FB] hover:text-[#172033]"
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <Heart className="w-4 h-4" />
                    <span>My Watchlist</span>
                  </span>
                  <span className="text-[10px] font-bold bg-slate-100 px-2 py-0.5 rounded-full">
                    {favorites.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("won-orders")}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition text-left ${
                    activeTab === "won-orders"
                      ? "bg-[#EEF3FF] text-[#2457E6]"
                      : "text-[#64748B] hover:bg-[#F5F7FB] hover:text-[#172033]"
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <CheckCircle className="w-4 h-4" />
                    <span>Won Lots & Settlements</span>
                  </span>
                  <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                    {cart.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("escrow")}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition text-left ${
                    activeTab === "escrow"
                      ? "bg-[#E8FAF7] text-[#16B8A6] font-black border border-[#16B8A6]/30 shadow-sm"
                      : "text-[#64748B] hover:bg-[#F5F7FB] hover:text-[#172033]"
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-[#16B8A6]" />
                    <span>Escrow & Deliveries</span>
                  </span>
                  <span className="text-[10px] font-bold bg-[#E8FAF7] text-[#16B8A6] px-2 py-0.5 rounded-full">
                    {escrowOrders.filter((o) => o.escrowStatus === "DELIVERED_INSPECTING").length > 0 ? "Inspect (48h)" : "Protected"}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("purchases")}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition text-left ${
                    activeTab === "purchases"
                      ? "bg-[#EEF3FF] text-[#2457E6]"
                      : "text-[#64748B] hover:bg-[#F5F7FB] hover:text-[#172033]"
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <Package className="w-4 h-4" />
                    <span>Purchase History</span>
                  </span>
                </button>
              </div>
            ) : (
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider px-3 block mb-2">
                  Seller Operations
                </span>

                <button
                  type="button"
                  onClick={() => setActiveTab("overview")}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition text-left ${
                    activeTab === "overview"
                      ? "bg-[#EEF3FF] text-[#2457E6]"
                      : "text-[#64748B] hover:bg-[#F5F7FB] hover:text-[#172033]"
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <Store className="w-4 h-4" />
                    <span>Seller Overview</span>
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("listings")}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition text-left ${
                    activeTab === "listings"
                      ? "bg-[#EEF3FF] text-[#2457E6]"
                      : "text-[#64748B] hover:bg-[#F5F7FB] hover:text-[#172033]"
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <Layers className="w-4 h-4" />
                    <span>My Listings</span>
                  </span>
                  <span className="text-[10px] font-bold bg-slate-100 px-2 py-0.5 rounded-full">
                    {mySellingItems.length}
                  </span>
                </button>

                <Link
                  href="/seller/new"
                  className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold text-[#64748B] hover:bg-[#F5F7FB] hover:text-[#172033] transition text-left"
                >
                  <span className="flex items-center gap-2.5">
                    <PlusCircle className="w-4 h-4 text-[#2457E6]" />
                    <span>Create Listing</span>
                  </span>
                  <span className="text-[10px] font-bold bg-[#EEF3FF] text-[#2457E6] px-2 py-0.5 rounded-full">
                    AI Auto
                  </span>
                </Link>

                <button
                  type="button"
                  onClick={() => setActiveTab("orders-fulfil")}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition text-left ${
                    activeTab === "orders-fulfil"
                      ? "bg-[#EEF3FF] text-[#2457E6]"
                      : "text-[#64748B] hover:bg-[#F5F7FB] hover:text-[#172033]"
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <Truck className="w-4 h-4" />
                    <span>Orders to Fulfil</span>
                  </span>
                  <span className="text-[10px] font-bold bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full">
                    {ordersToFulfil.filter((o) => o.status === "AWAITING_DISPATCH").length} Action
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("analytics")}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition text-left ${
                    activeTab === "analytics"
                      ? "bg-[#EEF3FF] text-[#2457E6]"
                      : "text-[#64748B] hover:bg-[#F5F7FB] hover:text-[#172033]"
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <TrendingUp className="w-4 h-4" />
                    <span>Sales Analytics</span>
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("payouts")}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition text-left ${
                    activeTab === "payouts"
                      ? "bg-[#EEF3FF] text-[#2457E6]"
                      : "text-[#64748B] hover:bg-[#F5F7FB] hover:text-[#172033]"
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <Wallet className="w-4 h-4" />
                    <span>Bank Payouts</span>
                  </span>
                </button>
              </div>
            )}

            {/* Shared Account Settings */}
            <div className="pt-4 border-t border-[#E5EAF2] space-y-1">
              <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider px-3 block mb-2">
                Shared Profile
              </span>

              <button
                type="button"
                onClick={() => setActiveTab("profile")}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition text-left ${
                  activeTab === "profile"
                    ? "bg-[#EEF3FF] text-[#2457E6]"
                    : "text-[#64748B] hover:bg-[#F5F7FB] hover:text-[#172033]"
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <User className="w-4 h-4" />
                  <span>Profile & Security</span>
                </span>
              </button>

              <Link
                href="/messages"
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold text-[#64748B] hover:bg-[#F5F7FB] hover:text-[#172033] transition text-left"
              >
                <span className="flex items-center gap-2.5">
                  <Send className="w-4 h-4" />
                  <span>Messages & Concierge</span>
                </span>
              </Link>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="lg:col-span-9 space-y-8">
          {/* ========================================================================= */}
          {/* SUB-VIEW 1: BUYER DASHBOARD OVERVIEW & SECTIONS                           */}
          {/* ========================================================================= */}
          {mode === "buying" && activeTab === "overview" && (
            <div className="space-y-8 animate-in fade-in duration-300">
              {/* Overview Metric Cards (Section 3) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                <div className="bg-white border border-[#E5EAF2] rounded-3xl p-5 space-y-1 shadow-[0_2px_12px_rgb(0,0,0,0.02)]">
                  <span className="text-xs font-bold text-[#64748B] uppercase">Active Bids</span>
                  <div className="text-2xl font-black text-[#172033]">{myBidsItems.length} Lots</div>
                  <span className="text-xs text-[#16B8A6] font-semibold">2 Currently Leading</span>
                </div>

                <div className="bg-white border border-[#E5EAF2] rounded-3xl p-5 space-y-1 shadow-[0_2px_12px_rgb(0,0,0,0.02)]">
                  <span className="text-xs font-bold text-[#64748B] uppercase">Auctions Won</span>
                  <div className="text-2xl font-black text-[#16B8A6]">{cart.length} Lots Won</div>
                  <span className="text-xs text-[#64748B]">Awaiting Escrow Settlement</span>
                </div>

                <div className="bg-white border border-[#E5EAF2] rounded-3xl p-5 space-y-1 shadow-[0_2px_12px_rgb(0,0,0,0.02)]">
                  <span className="text-xs font-bold text-[#64748B] uppercase">Watchlist</span>
                  <div className="text-2xl font-black text-[#2457E6]">{favorites.length} Saved</div>
                  <span className="text-xs text-[#64748B]">Real-time countdown alerts</span>
                </div>

                <div className="bg-white border border-[#E5EAF2] rounded-3xl p-5 space-y-1 shadow-[0_2px_12px_rgb(0,0,0,0.02)]">
                  <span className="text-xs font-bold text-[#64748B] uppercase">Active Deliveries</span>
                  <div className="text-2xl font-black text-[#172033]">1 In Transit</div>
                  <span className="text-xs text-[#16B8A6] font-semibold">Colombo Hub Dispatched</span>
                </div>
              </div>

              {/* My Bids Quick Showcase */}
              <div className="bg-white border border-[#E5EAF2] rounded-3xl p-6 sm:p-8 space-y-5 shadow-[0_4px_24px_rgb(0,0,0,0.03)]">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-black text-base text-[#172033]">Active Bidding Arena</h3>
                    <p className="text-xs text-[#64748B]">Lots where you currently hold an active binding bid</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab("my-bids")}
                    className="text-xs font-bold text-[#2457E6] hover:underline"
                  >
                    View All Bids →
                  </button>
                </div>

                <div className="space-y-3">
                  {myBidsItems.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 rounded-2xl bg-[#F5F7FB] border border-[#E5EAF2] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3.5">
                        <img
                          src={item.product?.images?.[0]?.url || "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=300"}
                          alt=""
                          className="w-16 h-16 rounded-xl object-cover shrink-0 border border-[#E5EAF2]"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-extrabold text-xs sm:text-sm text-[#172033] line-clamp-1">
                              {item.title}
                            </h4>
                            {item.isLeading ? (
                              <span className="text-[10px] font-bold bg-[#E8FAF7] text-[#16B8A6] px-2 py-0.5 rounded-full">
                                🏆 Leading
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold bg-rose-50 text-rose-600 px-2 py-0.5 rounded-full">
                                ⚠️ Outbid
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-[#64748B] flex items-center gap-2 mt-1">
                            <span>My Bid: <strong>{formatLKR(item.myBidAmount)}</strong></span>
                            <span>•</span>
                            <span>High: <strong>{formatLKR(item.currentLeadAmount)}</strong></span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <Link
                          href={`/auction/${item.id}`}
                          className={`px-4 py-2 text-xs font-bold rounded-xl transition ${
                            item.isLeading
                              ? "bg-white border border-[#E5EAF2] text-[#172033] hover:bg-slate-100"
                              : "bg-[#2457E6] text-white hover:bg-[#1d46be] shadow-sm"
                          }`}
                        >
                          {item.isLeading ? "View Lot" : "Counter-Bid Now"}
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* SUB-VIEW: MY BIDS (Section 3.A) */}
          {mode === "buying" && activeTab === "my-bids" && (
            <div className="bg-white border border-[#E5EAF2] rounded-3xl p-6 sm:p-8 space-y-6 shadow-[0_4px_24px_rgb(0,0,0,0.03)] animate-in fade-in duration-200">
              <div className="flex items-center justify-between border-b border-[#E5EAF2] pb-4">
                <div>
                  <h3 className="text-lg font-black text-[#172033]">My Active Bids & History</h3>
                  <p className="text-xs text-[#64748B]">Real-time status of all your binding auction bids</p>
                </div>
                <Link
                  href="/search"
                  className="px-4 py-2 bg-[#2457E6] text-white text-xs font-bold rounded-xl shadow-sm"
                >
                  Browse More Lots
                </Link>
              </div>

              <div className="space-y-4">
                {myBidsItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-5 rounded-2xl bg-[#F5F7FB] border border-[#E5EAF2] space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <img
                          src={item.product?.images?.[0]?.url || "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=300"}
                          alt=""
                          className="w-20 h-20 rounded-2xl object-cover shrink-0 border border-[#E5EAF2]"
                        />
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-[#2457E6] uppercase">
                              {item.category?.name || "Auction Item"}
                            </span>
                            {item.isLeading ? (
                              <span className="text-[10px] font-bold bg-[#E8FAF7] text-[#16B8A6] px-2 py-0.5 rounded-full flex items-center gap-1">
                                <CheckCircle className="w-3 h-3" />
                                Top High Bidder
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold bg-rose-50 text-rose-600 px-2 py-0.5 rounded-full flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                Outbid by Rs. 50,000
                              </span>
                            )}
                          </div>
                          <h4 className="font-extrabold text-sm text-[#172033]">{item.title}</h4>
                          <p className="text-xs text-[#64748B]">Consignor: {item.seller?.storeName || "Certified Consignor"}</p>
                        </div>
                      </div>

                      <div className="flex flex-col sm:items-end gap-2">
                        <div className="text-right">
                          <span className="text-[10px] text-[#64748B] block">Current Lead</span>
                          <span className="font-mono-num font-black text-base text-[#172033]">
                            {formatLKR(item.currentLeadAmount)}
                          </span>
                        </div>
                        <Link
                          href={`/auction/${item.id}`}
                          className={`px-4 py-2 text-xs font-bold rounded-xl transition ${
                            item.isLeading
                              ? "bg-white border border-[#E5EAF2] text-[#172033] hover:bg-slate-100"
                              : "bg-[#2457E6] text-white hover:bg-[#1d46be] shadow-sm"
                          }`}
                        >
                          {item.isLeading ? "Monitor Live Lot" : "Counter-Bid Now"}
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SUB-VIEW: WATCHLIST (Section 3.B) */}
          {mode === "buying" && activeTab === "watchlist" && (
            <div className="bg-white border border-[#E5EAF2] rounded-3xl p-6 sm:p-8 space-y-6 shadow-[0_4px_24px_rgb(0,0,0,0.03)] animate-in fade-in duration-200">
              <div className="flex items-center justify-between border-b border-[#E5EAF2] pb-4">
                <div>
                  <h3 className="text-lg font-black text-[#172033]">Saved Watchlist Lots</h3>
                  <p className="text-xs text-[#64748B]">Monitored auctions with real-time countdown alerts</p>
                </div>
                <span className="text-xs font-bold text-[#2457E6] bg-[#EEF3FF] px-3 py-1 rounded-full">
                  {favorites.length} saved
                </span>
              </div>

              {favorites.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {favorites.map((fav) => (
                    <div
                      key={fav.id}
                      className="p-4 rounded-2xl bg-[#F5F7FB] border border-[#E5EAF2] space-y-3"
                    >
                      <div className="flex items-start gap-3">
                        <img
                          src={fav.imageUrl}
                          alt=""
                          className="w-16 h-16 rounded-xl object-cover shrink-0 border border-[#E5EAF2]"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-extrabold text-xs text-[#172033] truncate">{fav.title}</h4>
                          <p className="text-[11px] text-[#64748B]">Consignor: {fav.sellerName}</p>
                          <div className="font-mono-num font-black text-sm text-[#2457E6] pt-1">
                            {formatLKR(fav.currentPrice)}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-[#E5EAF2]">
                        <button
                          type="button"
                          onClick={() => removeFromFavorites(fav.id)}
                          className="text-xs text-[#64748B] hover:text-rose-600 font-semibold"
                        >
                          Remove
                        </button>
                        <Link
                          href={`/auction/${fav.id}`}
                          className="px-3.5 py-1.5 bg-[#2457E6] text-white font-bold text-xs rounded-xl shadow-sm"
                        >
                          Place Bid
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center space-y-3">
                  <Heart className="w-10 h-10 text-slate-300 mx-auto" />
                  <p className="text-xs text-[#64748B]">No auctions saved in your watchlist yet.</p>
                  <Link href="/search" className="inline-block px-4 py-2 bg-[#2457E6] text-white text-xs font-bold rounded-xl">
                    Explore Auctions
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* SUB-VIEW: WON LOTS & ORDERS (Section 3.C) */}
          {mode === "buying" && activeTab === "won-orders" && (
            <div className="bg-white border border-[#E5EAF2] rounded-3xl p-6 sm:p-8 space-y-6 shadow-[0_4px_24px_rgb(0,0,0,0.03)] animate-in fade-in duration-200">
              <div className="flex items-center justify-between border-b border-[#E5EAF2] pb-4">
                <div>
                  <h3 className="text-lg font-black text-[#172033]">Won Lots & Active Orders</h3>
                  <p className="text-xs text-[#64748B]">Auctions you have won awaiting settlement or delivery</p>
                </div>
              </div>

              {cart.map((item) => (
                <div
                  key={item.id}
                  className="p-5 rounded-2xl bg-[#F5F7FB] border border-[#E5EAF2] space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <img
                        src={item.imageUrl}
                        alt=""
                        className="w-18 h-18 rounded-2xl object-cover shrink-0 border border-[#E5EAF2]"
                      />
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                          🏆 Won Lot — Ready for Settlement
                        </span>
                        <h4 className="font-extrabold text-sm text-[#172033]">{item.title}</h4>
                        <p className="text-xs text-[#64748B]">Consignor: {item.sellerName} • {item.condition}</p>
                        <div className="font-mono-num font-black text-base text-[#2457E6] pt-1">
                          Winning Hammer Bid: {formatLKR(item.price)}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 self-end sm:self-center">
                      <Link
                        href="/search"
                        className="block px-5 py-2.5 bg-[#2457E6] hover:bg-[#1d46be] text-white font-bold text-xs rounded-xl shadow-sm text-center"
                      >
                        Settle via PayHere Escrow
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* SUB-VIEW: PLATFORM-MANAGED LOGISTICS & ESCROW */}
          {mode === "buying" && activeTab === "escrow" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Trust Banner */}
              <EscrowTrustBanner />

              {/* Escrow Orders Card */}
              <div className="bg-white border border-[#E5EAF2] rounded-3xl p-6 sm:p-8 space-y-6 shadow-[0_4px_24px_rgb(0,0,0,0.03)]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5EAF2] pb-4">
                  <div>
                    <h3 className="text-lg font-black text-[#172033]">
                      Platform Escrow & Protected Deliveries
                    </h3>
                    <p className="text-xs text-[#64748B]">
                      Funds are locked in the BIDME Trust Vault until you inspect and accept the delivered item
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-[#16B8A6] bg-[#E8FAF7] border border-[#16B8A6]/30 px-3 py-1 rounded-full flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      100% Custodial Escrow Protected
                    </span>
                  </div>
                </div>

                {/* Orders List */}
                <div className="space-y-5">
                  {escrowOrders.map((ord) => {
                    const isDeliveredInspecting = ord.escrowStatus === "DELIVERED_INSPECTING";
                    const isDispatched = ord.escrowStatus === "COURIER_DISPATCHED";
                    const isHeld = ord.escrowStatus === "PAYMENT_HELD_ESCROW";
                    const isReleased = ord.escrowStatus === "FUNDS_RELEASED_TO_SELLER";
                    const isDisputed = ord.escrowStatus === "DISPUTED_ESCROW_FROZEN";

                    return (
                      <div
                        key={ord.id}
                        className={`rounded-2xl border transition-all p-5 sm:p-6 space-y-5 ${
                          isDeliveredInspecting
                            ? "bg-gradient-to-br from-[#E8FAF7]/50 via-white to-white border-[#16B8A6]/40 shadow-sm"
                            : isDisputed
                            ? "bg-rose-50/40 border-rose-200"
                            : isReleased
                            ? "bg-emerald-50/30 border-emerald-200"
                            : "bg-[#F5F7FB] border-[#E5EAF2]"
                        }`}
                      >
                        {/* Header Details */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E5EAF2]/80 pb-4">
                          <div className="flex items-center gap-3">
                            <span className="font-mono text-xs font-bold text-[#64748B] bg-white border border-[#E5EAF2] px-2.5 py-1 rounded-lg">
                              {ord.id}
                            </span>
                            <span className="text-xs text-[#64748B]">
                              Consignor: <strong className="text-[#172033]">{ord.sellerName}</strong>
                            </span>
                          </div>

                          {/* Escrow Status Pill */}
                          <div>
                            {isDeliveredInspecting && (
                              <span className="inline-flex items-center gap-1.5 text-xs font-black text-amber-800 bg-amber-100 border border-amber-300 px-3 py-1 rounded-full animate-pulse">
                                <Clock className="w-3.5 h-3.5" />
                                <span>48h Inspection Window Active</span>
                              </span>
                            )}
                            {isDispatched && (
                              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2457E6] bg-[#EEF3FF] border border-[#2457E6]/30 px-3 py-1 rounded-full">
                                <Truck className="w-3.5 h-3.5" />
                                <span>In Transit ({ord.courierPartner})</span>
                              </span>
                            )}
                            {isHeld && (
                              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-slate-200 px-3 py-1 rounded-full">
                                <Lock className="w-3.5 h-3.5" />
                                <span>Held in Vault (Awaiting Dispatch)</span>
                              </span>
                            )}
                            {isReleased && (
                              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-3 py-1 rounded-full">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Inspection Approved & Settled</span>
                              </span>
                            )}
                            {isDisputed && (
                              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-800 bg-rose-100 border border-rose-300 px-3 py-1 rounded-full">
                                <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                                <span>Dispute Open — Escrow Frozen</span>
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Item Info & Financials */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex items-center gap-4">
                            <img
                              src={ord.itemImage}
                              alt={ord.itemTitle}
                              className="w-20 h-20 rounded-2xl object-cover shrink-0 border border-[#E5EAF2]"
                            />
                            <div className="space-y-1">
                              <span className="text-[10px] font-bold text-[#2457E6] bg-[#EEF3FF] px-2 py-0.5 rounded-full">
                                {ord.category}
                              </span>
                              <h4 className="font-extrabold text-sm sm:text-base text-[#172033]">
                                {ord.itemTitle}
                              </h4>
                              <p className="text-xs text-[#64748B]">
                                Waybill: <strong className="text-[#172033] font-mono">{ord.waybillNumber}</strong> • Delivered to: {ord.buyerDistrict}
                              </p>
                            </div>
                          </div>

                          <div className="bg-white border border-[#E5EAF2] rounded-2xl p-3.5 sm:text-right shrink-0 space-y-1">
                            <span className="text-[10px] text-[#64748B] block font-semibold uppercase">Total Held in Vault</span>
                            <div className="text-lg font-black text-[#2457E6] font-mono-num">
                              {formatLKR(ord.totalPaid)}
                            </div>
                            <span className="text-[10px] text-[#16B8A6] font-bold block">
                              Seller Payout (95%): {formatLKR(ord.sellerPayout)}
                            </span>
                          </div>
                        </div>

                        {/* Interactive Inspection & Escrow Controls */}
                        {isDeliveredInspecting && (
                          <div className="bg-white border border-[#16B8A6]/30 rounded-2xl p-4 sm:p-5 space-y-4">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                              <div className="space-y-0.5">
                                <span className="font-bold text-[#172033] block">
                                  භාණ්ඩය ඔබට ලැබී ඇත. කරුණාකර පරීක්ෂා කර බලා අනුමත කරන්න.
                                </span>
                                <span className="text-[#64748B] text-[11px]">
                                  ඔබ අනුමත කරන තුරු (හෝ පැය 48ක් අවසන් වන තුරු) විකුණුම්කරුට මුදල් නිදහස් නොකෙරේ.
                                </span>
                              </div>
                              <span className="font-mono text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl shrink-0">
                                ⏱️ 36h 15m remaining
                              </span>
                            </div>

                            <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedEscrowOrder(ord);
                                  setInspectionModalOpen(true);
                                }}
                                className="w-full sm:flex-1 py-3 bg-[#16B8A6] hover:bg-[#139a8b] text-white font-black text-xs rounded-xl shadow-sm transition flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01] active:scale-95"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                                <span>Confirm Inspection & Release {formatLKR(ord.sellerPayout)} to Seller</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedEscrowOrder(ord);
                                  setDisputeModalOpen(true);
                                }}
                                className="w-full sm:w-auto px-5 py-3 bg-white hover:bg-rose-50 border border-rose-200 text-rose-600 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                              >
                                <AlertTriangle className="w-3.5 h-3.5" />
                                <span>Raise Dispute / Freeze Escrow</span>
                              </button>
                            </div>
                          </div>
                        )}

                        {isDispatched && (
                          <div className="bg-white border border-[#E5EAF2] rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                            <div className="space-y-0.5">
                              <span className="font-bold text-[#172033] block">
                                🚚 Package Dispatched with Platform Insured Logistics
                              </span>
                              <span className="text-[#64748B] text-[11px]">
                                Courier: {ord.courierPartner} • Tracking Waybill: <strong className="font-mono">{ord.waybillNumber}</strong>
                              </span>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleSimulateDelivery(ord.id)}
                              className="px-4 py-2 bg-[#2457E6] hover:bg-[#1d46be] text-white font-bold text-xs rounded-xl shadow-sm transition shrink-0 cursor-pointer"
                            >
                              Simulate Package Arrival (Mark Delivered)
                            </button>
                          </div>
                        )}

                        {isReleased && (
                          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 text-xs text-emerald-900 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                              <span>
                                <strong>Inspection Complete:</strong> {formatLKR(ord.sellerPayout)} has been wired to {ord.sellerName}&apos;s verified bank account ({ord.sellerBank}).
                              </span>
                            </div>
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full shrink-0">
                              Settled
                            </span>
                          </div>
                        )}

                        {isDisputed && (
                          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-xs text-rose-900 space-y-1">
                            <div className="flex items-center gap-2 font-bold text-rose-800">
                              <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                              <span>Dispute Active — Funds 100% Frozen in Escrow Vault</span>
                            </div>
                            <p className="text-[11px] text-rose-800/90 leading-relaxed">
                              Reason: {ord.disputeReason}
                            </p>
                            <span className="text-[10px] text-rose-700 font-semibold block pt-1">
                              BIDME Legal Arbitration team is reviewing photo evidence.
                            </span>
                          </div>
                        )}

                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* SUB-VIEW: PURCHASES (Section 3.D) */}
          {mode === "buying" && activeTab === "purchases" && (
            <div className="bg-white border border-[#E5EAF2] rounded-3xl p-6 sm:p-8 space-y-6 shadow-[0_4px_24px_rgb(0,0,0,0.03)] animate-in fade-in duration-200">
              <div className="flex items-center justify-between border-b border-[#E5EAF2] pb-4">
                <div>
                  <h3 className="text-lg font-black text-[#172033]">Purchase History & Receipts</h3>
                  <p className="text-xs text-[#64748B]">Past delivered orders and PayHere custodial escrow receipts</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#F5F7FB] border border-[#E5EAF2] flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-[#16B8A6] bg-[#E8FAF7] px-2 py-0.5 rounded-full">
                    Delivered & Verified
                  </span>
                  <h4 className="font-bold text-xs text-[#172033] mt-1">Vintage Omega Seamaster Automatic</h4>
                  <p className="text-[11px] text-[#64748B]">Order Ref: BTME-ORD-88129 • Delivered on Sep 2, 2026</p>
                </div>
                <div className="text-right">
                  <span className="font-mono-num font-black text-xs text-[#172033] block">Rs. 320,000</span>
                  <span className="text-[10px] text-[#64748B]">PayHere Verified</span>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* SUB-VIEW 2: SELLER DASHBOARD OVERVIEW & SECTIONS                          */}
          {/* ========================================================================= */}
          {mode === "selling" && activeTab === "overview" && (
            <div className="space-y-8 animate-in fade-in duration-300">
              {/* 6 Seller Overview Cards (Section 4) */}
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
                <div className="bg-white border border-[#E5EAF2] rounded-2xl p-4 space-y-1 shadow-sm">
                  <span className="text-[10px] font-bold text-[#64748B] uppercase">Active Lots</span>
                  <div className="text-xl font-black text-[#172033]">4</div>
                  <span className="text-[10px] text-[#16B8A6] font-semibold">Receiving Bids</span>
                </div>

                <div className="bg-white border border-[#E5EAF2] rounded-2xl p-4 space-y-1 shadow-sm">
                  <span className="text-[10px] font-bold text-[#64748B] uppercase">Live Auctions</span>
                  <div className="text-xl font-black text-[#2457E6]">4</div>
                  <span className="text-[10px] text-[#2457E6] font-semibold">Active Book</span>
                </div>

                <div className="bg-white border border-[#E5EAF2] rounded-2xl p-4 space-y-1 shadow-sm">
                  <span className="text-[10px] font-bold text-[#64748B] uppercase">Gross GMV</span>
                  <div className="text-lg font-black text-[#172033]">Rs. 6.85M</div>
                  <span className="text-[10px] text-[#16B8A6] font-semibold">+18% this month</span>
                </div>

                <div className="bg-white border border-[#E5EAF2] rounded-2xl p-4 space-y-1 shadow-sm">
                  <span className="text-[10px] font-bold text-[#64748B] uppercase">To Fulfil</span>
                  <div className="text-xl font-black text-rose-600">
                    {ordersToFulfil.filter((o) => o.status === "AWAITING_DISPATCH").length}
                  </div>
                  <span className="text-[10px] text-rose-600 font-semibold">Dispatch needed</span>
                </div>

                <div className="bg-white border border-[#E5EAF2] rounded-2xl p-4 space-y-1 shadow-sm">
                  <span className="text-[10px] font-bold text-[#64748B] uppercase">Completed</span>
                  <div className="text-xl font-black text-[#172033]">12</div>
                  <span className="text-[10px] text-[#16B8A6] font-semibold">100% Payout</span>
                </div>

                <div className="bg-white border border-[#E5EAF2] rounded-2xl p-4 space-y-1 shadow-sm">
                  <span className="text-[10px] font-bold text-[#64748B] uppercase">Rating</span>
                  <div className="text-xl font-black text-amber-500">4.95 ★</div>
                  <span className="text-[10px] text-[#64748B]">98% Positive</span>
                </div>
              </div>

              {/* Payout & Settlement Banner (Section 4.G) */}
              <div className="bg-gradient-to-r from-[#172033] to-[#2457E6] rounded-3xl p-6 sm:p-8 text-white space-y-5 shadow-lg">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-xs font-bold text-teal-300 uppercase tracking-wider">
                      Sri Lanka Bank Wire Settlement
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-black tracking-tight mt-1">
                      {formatLKR(netEarnings)}
                    </h3>
                    <p className="text-xs text-white/80 mt-1">
                      Eligible 95% net payout (after transparent 5% platform fee). Settles directly to Commercial Bank of Ceylon ({currentUser.bankAccount}).
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleRequestWirePayout}
                    className="px-6 py-3 bg-[#16B8A6] hover:bg-[#139c8c] text-white font-black text-xs rounded-xl shadow-lg hover:scale-105 active:scale-95 transition shrink-0"
                  >
                    Request Direct Bank Wire
                  </button>
                </div>

                {wireSuccessMsg && (
                  <div className="p-3 bg-white/10 border border-white/20 rounded-xl text-xs text-teal-200 animate-in fade-in">
                    {wireSuccessMsg}
                  </div>
                )}
              </div>

              {/* Orders to Fulfil Notification if any */}
              {ordersToFulfil.some((o) => o.status === "AWAITING_DISPATCH") && (
                <div className="p-5 rounded-3xl bg-amber-50 border border-amber-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                      <Truck className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-amber-900">
                        1 Order Won by Bidder Awaiting Dispatch
                      </h4>
                      <p className="text-xs text-amber-700">
                        Buyer has deposited funds into PayHere Escrow. Handover parcel to courier partner.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedOrderToFulfil(ordersToFulfil[0]);
                      setFulfilModalOpen(true);
                    }}
                    className="px-4 py-2 bg-amber-800 hover:bg-amber-900 text-white font-bold text-xs rounded-xl transition shrink-0"
                  >
                    Confirm Courier Dispatch
                  </button>
                </div>
              )}

              {/* Consignor Live Auctions */}
              <div className="bg-white border border-[#E5EAF2] rounded-3xl p-6 sm:p-8 space-y-5 shadow-[0_4px_24px_rgb(0,0,0,0.03)]">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-black text-base text-[#172033]">My Active Consignment Lots</h3>
                    <p className="text-xs text-[#64748B]">Auctions currently live on the BIDME marketplace</p>
                  </div>
                  <Link
                    href="/seller/new"
                    className="text-xs font-bold text-[#2457E6] hover:underline"
                  >
                    + Consign Another Lot
                  </Link>
                </div>

                <div className="space-y-3">
                  {mySellingItems.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 rounded-2xl bg-[#F5F7FB] border border-[#E5EAF2] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3.5">
                        <img
                          src={item.product?.images?.[0]?.url || "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=300"}
                          alt=""
                          className="w-16 h-16 rounded-xl object-cover shrink-0 border border-[#E5EAF2]"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-extrabold text-xs sm:text-sm text-[#172033] line-clamp-1">
                              {item.title}
                            </h4>
                            <span className="text-[10px] font-bold bg-[#EEF3FF] text-[#2457E6] px-2 py-0.5 rounded-full">
                              LIVE AUCTION
                            </span>
                          </div>
                          <div className="text-xs text-[#64748B] flex items-center gap-3 mt-1">
                            <span>High Bid: <strong>{formatLKR(item.currentPrice)}</strong></span>
                            <span>•</span>
                            <span className="text-[#16B8A6] font-bold">95% Net: {formatLKR(item.netPayout)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <Link
                          href={`/auction/${item.id}`}
                          className="px-4 py-2 bg-white border border-[#E5EAF2] hover:bg-slate-100 text-[#172033] text-xs font-bold rounded-xl transition"
                        >
                          View Bidders
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* SUB-VIEW: MY LISTINGS (Section 4.A) */}
          {mode === "selling" && activeTab === "listings" && (
            <div className="bg-white border border-[#E5EAF2] rounded-3xl p-6 sm:p-8 space-y-6 shadow-[0_4px_24px_rgb(0,0,0,0.03)] animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5EAF2] pb-4">
                <div>
                  <h3 className="text-lg font-black text-[#172033]">My Store Listings</h3>
                  <p className="text-xs text-[#64748B]">All active, pending moderation, and completed lots</p>
                </div>
                <Link
                  href="/seller/new"
                  className="px-4 py-2 bg-[#2457E6] text-white text-xs font-bold rounded-xl shadow-sm self-start sm:self-center"
                >
                  + Add New Listing
                </Link>
              </div>

              <div className="space-y-4">
                {mySellingItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-5 rounded-2xl bg-[#F5F7FB] border border-[#E5EAF2] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-4">
                      <img
                        src={item.product?.images?.[0]?.url || "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=300"}
                        alt=""
                        className="w-18 h-18 rounded-2xl object-cover shrink-0 border border-[#E5EAF2]"
                      />
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-[#16B8A6] bg-[#E8FAF7] px-2 py-0.5 rounded-full">
                          ACTIVE AUCTION
                        </span>
                        <h4 className="font-extrabold text-sm text-[#172033]">{item.title}</h4>
                        <p className="text-xs text-[#64748B]">{item.totalBids} bids placed • Anti-sniping active</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-[#64748B] block">Current Bid</span>
                      <span className="font-mono-num font-black text-base text-[#172033]">
                        {formatLKR(item.currentPrice)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SUB-VIEW: ORDERS TO FULFIL (Section 4.D) */}
          {mode === "selling" && activeTab === "orders-fulfil" && (
            <div className="bg-white border border-[#E5EAF2] rounded-3xl p-6 sm:p-8 space-y-6 shadow-[0_4px_24px_rgb(0,0,0,0.03)] animate-in fade-in duration-200">
              <div className="flex items-center justify-between border-b border-[#E5EAF2] pb-4">
                <div>
                  <h3 className="text-lg font-black text-[#172033]">Orders to Fulfil & Dispatch</h3>
                  <p className="text-xs text-[#64748B]">Winning lots with confirmed PayHere escrow ready for shipping</p>
                </div>
              </div>

              {ordersToFulfil.map((ord) => (
                <div
                  key={ord.id}
                  className="p-5 rounded-2xl bg-[#F5F7FB] border border-[#E5EAF2] space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <img
                        src={ord.image}
                        alt=""
                        className="w-18 h-18 rounded-2xl object-cover shrink-0 border border-[#E5EAF2]"
                      />
                      <div className="space-y-1">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          ord.status === "DISPATCHED"
                            ? "bg-[#E8FAF7] text-[#16B8A6]"
                            : "bg-amber-100 text-amber-800"
                        }`}>
                          {ord.status === "DISPATCHED" ? "PACKAGE DISPATCHED" : "AWAITING DISPATCH"}
                        </span>
                        <h4 className="font-extrabold text-sm text-[#172033]">{ord.title}</h4>
                        <p className="text-xs text-[#64748B]">Buyer: {ord.buyerName} • {ord.buyerLocation}</p>
                        <div className="font-mono-num font-black text-sm text-[#2457E6] pt-0.5">
                          Amount: {formatLKR(ord.finalBid)}
                        </div>
                      </div>
                    </div>

                    <div>
                      {ord.status === "DISPATCHED" ? (
                        <div className="text-right text-xs">
                          <span className="font-bold text-[#16B8A6] block">✓ Courier Waybill Assigned</span>
                          <span className="text-[#64748B] font-mono">{ord.trackingNumber}</span>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedOrderToFulfil(ord);
                            setFulfilModalOpen(true);
                          }}
                          className="px-5 py-2.5 bg-[#2457E6] hover:bg-[#1d46be] text-white font-bold text-xs rounded-xl shadow-sm transition"
                        >
                          Confirm Dispatch
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* SUB-VIEW: SALES ANALYTICS (Section 4.E) */}
          {mode === "selling" && activeTab === "analytics" && (
            <div className="bg-white border border-[#E5EAF2] rounded-3xl p-6 sm:p-8 space-y-6 shadow-[0_4px_24px_rgb(0,0,0,0.03)] animate-in fade-in duration-200">
              <div className="border-b border-[#E5EAF2] pb-4">
                <h3 className="text-lg font-black text-[#172033]">Consignor Sales Analytics</h3>
                <p className="text-xs text-[#64748B]">Real-time reporting on auction volumes, views, and conversion rates</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-5 rounded-2xl bg-[#F5F7FB] border border-[#E5EAF2] space-y-1">
                  <span className="text-xs font-bold text-[#64748B]">Total Volume (GMV)</span>
                  <div className="text-2xl font-black text-[#172033]">Rs. 6,850,000</div>
                  <span className="text-xs text-[#16B8A6] font-semibold">12 Completed Auctions</span>
                </div>

                <div className="p-5 rounded-2xl bg-[#F5F7FB] border border-[#E5EAF2] space-y-1">
                  <span className="text-xs font-bold text-[#64748B]">Platform Commission (5%)</span>
                  <div className="text-2xl font-black text-[#64748B]">Rs. 342,500</div>
                  <span className="text-xs text-[#64748B]">Lowest in Sri Lanka</span>
                </div>

                <div className="p-5 rounded-2xl bg-[#F5F7FB] border border-[#E5EAF2] space-y-1">
                  <span className="text-xs font-bold text-[#64748B]">Net Consignor Earnings (95%)</span>
                  <div className="text-2xl font-black text-[#16B8A6]">Rs. 6,507,500</div>
                  <span className="text-xs text-[#16B8A6] font-semibold">Direct Bank Settled</span>
                </div>
              </div>
            </div>
          )}

          {/* SUB-VIEW: BANK PAYOUTS (Section 4.G) */}
          {mode === "selling" && activeTab === "payouts" && (
            <div className="bg-white border border-[#E5EAF2] rounded-3xl p-6 sm:p-8 space-y-6 shadow-[0_4px_24px_rgb(0,0,0,0.03)] animate-in fade-in duration-200">
              <div className="border-b border-[#E5EAF2] pb-4">
                <h3 className="text-lg font-black text-[#172033]">Bank Payout Management</h3>
                <p className="text-xs text-[#64748B]">Licensed Central Bank of Sri Lanka compliant bank wire settlements</p>
              </div>

              <div className="p-6 rounded-2xl bg-[#F5F7FB] border border-[#E5EAF2] space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-xs text-[#64748B] block">Approved Bank Account</span>
                    <strong className="text-base text-[#172033] block">
                      {currentUser.bankName}
                    </strong>
                    <span className="text-xs text-[#64748B] font-mono">
                      Account: {currentUser.bankAccount} • {currentUser.bankBranch}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleRequestWirePayout}
                    className="px-5 py-2.5 bg-[#2457E6] hover:bg-[#1d46be] text-white text-xs font-bold rounded-xl shadow-sm transition"
                  >
                    Request Payout
                  </button>
                </div>
              </div>

              {wireSuccessMsg && (
                <div className="p-4 bg-[#E8FAF7] border border-[#16B8A6]/30 text-[#16B8A6] rounded-2xl text-xs font-semibold">
                  {wireSuccessMsg}
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* SUB-VIEW 3: SHARED UNIFIED PROFILE & SECURITY (Section 5)                 */}
          {/* ========================================================================= */}
          {activeTab === "profile" && (
            <form onSubmit={handleSaveProfile} className="bg-white border border-[#E5EAF2] rounded-3xl p-6 sm:p-8 space-y-6 shadow-[0_4px_24px_rgb(0,0,0,0.03)] animate-in fade-in duration-200">
              <div className="border-b border-[#E5EAF2] pb-4">
                <h3 className="text-lg font-black text-[#172033]">Unified User Profile & Security</h3>
                <p className="text-xs text-[#64748B]">
                  Shared identity for both Buyer and Seller activities under ONE account.
                </p>
              </div>

              {profileSavedMsg && (
                <div className="p-3 bg-[#E8FAF7] border border-[#16B8A6]/30 text-[#16B8A6] rounded-xl text-xs font-semibold flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>{profileSavedMsg}</span>
                </div>
              )}

              {/* Personal Information */}
              <div className="space-y-4">
                <h4 className="font-black text-sm text-[#172033] flex items-center gap-2">
                  <User className="w-4 h-4 text-[#2457E6]" />
                  <span>Personal Account Information</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-[#172033] block mb-1">Full Name</label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full px-4 py-2.5 bg-[#F5F7FB] border border-[#E5EAF2] rounded-xl text-xs text-[#172033]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[#172033] block mb-1">Mobile (+94 Verified)</label>
                    <input
                      type="text"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      className="w-full px-4 py-2.5 bg-[#F5F7FB] border border-[#E5EAF2] rounded-xl text-xs text-[#172033]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[#172033] block mb-1">District</label>
                    <input
                      type="text"
                      value={editDistrict}
                      onChange={(e) => setEditDistrict(e.target.value)}
                      className="w-full px-4 py-2.5 bg-[#F5F7FB] border border-[#E5EAF2] rounded-xl text-xs text-[#172033]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[#172033] block mb-1">Default Delivery Address</label>
                    <input
                      type="text"
                      value={editAddress}
                      onChange={(e) => setEditAddress(e.target.value)}
                      className="w-full px-4 py-2.5 bg-[#F5F7FB] border border-[#E5EAF2] rounded-xl text-xs text-[#172033]"
                    />
                  </div>
                </div>
              </div>

              {/* Seller Storefront Details */}
              <div className="space-y-4 pt-4 border-t border-[#E5EAF2]">
                <h4 className="font-black text-sm text-[#172033] flex items-center gap-2">
                  <Store className="w-4 h-4 text-[#16B8A6]" />
                  <span>Seller Storefront Information</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-[#172033] block mb-1">Store / Consignor Name</label>
                    <input
                      type="text"
                      value={editStoreName}
                      onChange={(e) => setEditStoreName(e.target.value)}
                      className="w-full px-4 py-2.5 bg-[#F5F7FB] border border-[#E5EAF2] rounded-xl text-xs text-[#172033]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[#172033] block mb-1">Store Bio</label>
                    <input
                      type="text"
                      value={editStoreDesc}
                      onChange={(e) => setEditStoreDesc(e.target.value)}
                      className="w-full px-4 py-2.5 bg-[#F5F7FB] border border-[#E5EAF2] rounded-xl text-xs text-[#172033]"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-[#E5EAF2] flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#2457E6] hover:bg-[#1d46be] text-white font-black text-xs rounded-xl shadow-sm transition"
                >
                  Save Profile Changes
                </button>
              </div>
            </form>
          )}
        </main>
      </div>

      {/* ========================================================================= */}
      {/* 4. MODALS: SELLER ONBOARDING & DISPATCH FULFILMENT                        */}
      {/* ========================================================================= */}
      <SellerOnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        onSuccess={() => {
          setMode("selling");
          setActiveTab("overview");
          setPreferredDashboard("SELLER");
        }}
      />

      {/* Courier Dispatch Waybill Modal */}
      {fulfilModalOpen && selectedOrderToFulfil && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-[#E5EAF2] rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-[#E5EAF2] pb-3">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-[#2457E6]" />
                <h3 className="font-extrabold text-sm text-[#172033]">Dispatch Courier Parcel</h3>
              </div>
              <button
                type="button"
                onClick={() => setFulfilModalOpen(false)}
                className="p-1 rounded-full text-[#64748B] hover:text-[#172033]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-[#64748B]">
                Enter the Courier Waybill / Consignment Tracking Number for <strong>{selectedOrderToFulfil.title}</strong>:
              </p>

              <div>
                <label className="font-bold text-[#172033] block mb-1">Waybill Tracking Number</label>
                <input
                  type="text"
                  value={waybillInput}
                  onChange={(e) => setWaybillInput(e.target.value)}
                  placeholder="e.g. PRM-CMB-88914"
                  className="w-full px-4 py-2.5 bg-[#F5F7FB] border border-[#E5EAF2] rounded-xl text-xs font-mono font-bold text-[#172033] focus:outline-none focus:border-[#2457E6]"
                />
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/50 text-[11px] text-amber-800">
                <strong>PayHere Escrow Notice:</strong> Once marked as dispatched, the buyer is notified with this tracking code. 48h after delivery confirmation, funds are cleared for wire.
              </div>

              <button
                type="button"
                onClick={handleConfirmDispatch}
                disabled={isDispatching || !waybillInput.trim()}
                className="w-full py-3 bg-[#2457E6] hover:bg-[#1d46be] disabled:bg-slate-300 text-white font-black text-xs rounded-xl shadow-sm transition"
              >
                {isDispatching ? "Confirming Dispatch..." : "Confirm & Notify Buyer"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Escrow Inspection & Acceptance Modal */}
      <EscrowInspectionModal
        isOpen={inspectionModalOpen}
        onClose={() => setInspectionModalOpen(false)}
        order={selectedEscrowOrder}
        onConfirmRelease={handleConfirmInspectionRelease}
        onOpenDispute={(order) => {
          setSelectedEscrowOrder(order);
          setDisputeModalOpen(true);
        }}
      />

      {/* Escrow Freeze & Dispute Modal */}
      <EscrowDisputeModal
        isOpen={disputeModalOpen}
        onClose={() => setDisputeModalOpen(false)}
        order={selectedEscrowOrder}
        onSubmitDispute={handleRaiseEscrowDispute}
      />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-xs text-[#64748B]">Loading unified dashboard...</div>}>
      <DashboardContent />
    </Suspense>
  );
}
