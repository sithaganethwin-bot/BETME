"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  User, 
  ShieldCheck, 
  Lock, 
  Bell, 
  Eye, 
  MapPin, 
  Globe, 
  ShoppingBag, 
  Store, 
  CreditCard, 
  FileCheck, 
  Link2, 
  HelpCircle, 
  ChevronRight, 
  ArrowLeft, 
  Save, 
  CheckCircle2, 
  AlertCircle, 
  Plus, 
  Trash2, 
  Smartphone, 
  Laptop, 
  LogOut, 
  ExternalLink,
  UploadCloud,
  Check,
  AlertTriangle,
  Building,
  KeyRound,
  Shield,
  Clock,
  Info
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { SRI_LANKAN_DISTRICTS } from "@/lib/constants";
import { formatLKR } from "@/lib/utils";

function AccountSettingsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialSection = searchParams.get("tab") || "overview";

  const { currentUser, updateUserProfile, addNotification } = useApp();

  const [activeSection, setActiveSection] = useState(initialSection);
  const [settings, setSettings] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [saveErrorMsg, setSaveErrorMsg] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form states for sections
  const [personalForm, setPersonalForm] = useState({
    name: "",
    displayName: "",
    email: "",
    phone: "",
    dob: "",
    country: "Sri Lanka",
    district: "Colombo",
    city: "Colombo 07",
    address: "",
    bio: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [newAddressForm, setNewAddressForm] = useState({
    label: "Home",
    fullName: "",
    phone: "",
    line1: "",
    line2: "",
    city: "",
    district: "Colombo",
    province: "Western",
    postalCode: "",
    country: "Sri Lanka",
    isDefaultShipping: false,
    isDefaultBilling: false,
  });

  const [sellingForm, setSellingForm] = useState({
    storeName: "",
    storeDescription: "",
    businessRegistration: "",
    defaultAuctionDuration: "48",
    bankName: "",
    bankBranch: "",
    bankAccount: "",
  });

  // Load Settings from Backend API
  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/account/settings");
      const data = await res.json();
      if (data.success && data.settings) {
        setSettings(data.settings);
        setPersonalForm({
          name: data.settings.user.name,
          displayName: data.settings.user.displayName || "KasunJ",
          email: data.settings.user.email,
          phone: data.settings.user.phone,
          dob: data.settings.user.dob || "1994-08-15",
          country: data.settings.user.country || "Sri Lanka",
          district: data.settings.user.district || "Colombo",
          city: data.settings.user.city || "Colombo 07",
          address: data.settings.user.address || "",
          bio: data.settings.user.bio || "",
        });
        setSellingForm({
          storeName: data.settings.selling.storeName,
          storeDescription: data.settings.selling.storeDescription,
          businessRegistration: data.settings.selling.businessRegistration || "",
          defaultAuctionDuration: data.settings.selling.defaultAuctionDuration || "48",
          bankName: data.settings.selling.bankName || "",
          bankBranch: data.settings.selling.bankBranch || "",
          bankAccount: data.settings.selling.bankAccount || "",
        });
      }
    } catch (e) {
      console.error("Failed to load settings:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const showSuccess = (msg: string) => {
    setSaveSuccessMsg(msg);
    addNotification(`Settings: ${msg}`);
    setTimeout(() => setSaveSuccessMsg(null), 3500);
  };

  const showError = (msg: string) => {
    setSaveErrorMsg(msg);
    setTimeout(() => setSaveErrorMsg(null), 4000);
  };

  // Section Save Handler
  const handleSaveSection = async (section: string, data: any) => {
    setIsSaving(true);
    setSaveSuccessMsg(null);
    setSaveErrorMsg(null);

    try {
      const res = await fetch("/api/account/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section, data }),
      });
      const resData = await res.json();
      if (!res.ok || !resData.success) {
        throw new Error(resData.error || "Failed to update settings.");
      }

      setSettings(resData.settings);

      // Sync with global user profile context if personal or selling
      if (section === "personal") {
        updateUserProfile({
          name: data.name,
          email: data.email,
          phone: data.phone,
          district: data.district,
          address: data.address,
        });
      } else if (section === "selling") {
        updateUserProfile({
          storeName: data.storeName,
          storeDescription: data.storeDescription,
        });
      }

      showSuccess(`${section.charAt(0).toUpperCase() + section.slice(1)} settings saved successfully.`);
    } catch (err: any) {
      showError(err.message || "An error occurred while saving.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || !settings) {
    return (
      <div className="py-20 text-center space-y-3">
        <div className="w-8 h-8 border-2 border-[#2457E6] border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-xs text-[#64748B]">Loading account settings...</p>
      </div>
    );
  }

  const isSeller = currentUser.role === "SELLER" || currentUser.role === "BUYER_AND_SELLER";

  const navigationSections = [
    { id: "overview", label: "Overview", icon: User },
    { id: "personal", label: "Personal Information", icon: User },
    { id: "security", label: "Login & Security", icon: Lock },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "privacy", label: "Privacy & Data", icon: Eye },
    { id: "addresses", label: "Address Book", icon: MapPin },
    { id: "preferences", label: "Preferences", icon: Globe },
    { id: "buying", label: "Buying Settings", icon: ShoppingBag },
    ...(isSeller ? [{ id: "selling", label: "Selling Settings", icon: Store }] : []),
    { id: "payments", label: "Payments", icon: CreditCard },
    { id: "verification", label: "Verification Centre", icon: FileCheck },
    { id: "connected", label: "Connected Accounts", icon: Link2 },
    { id: "support", label: "Help & Support", icon: HelpCircle },
  ];

  return (
    <div className="space-y-6 pb-20 font-sans">
      
      {/* Breadcrumb Navigation & Back to Dashboard */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-[#64748B]">
          <Link href="/" className="hover:text-[#2457E6] transition">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href="/dashboard" className="hover:text-[#2457E6] transition">Dashboard</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-[#172033] font-semibold">Account Settings</span>
        </div>

        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#64748B] hover:text-[#2457E6] bg-white border border-[#E5EAF2] hover:border-[#2457E6]/40 px-3.5 py-1.5 rounded-full transition shadow-sm cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Dashboard</span>
        </Link>
      </div>

      {/* Account Profile Summary Header Card */}
      <div className="bg-white border border-[#E5EAF2] rounded-3xl p-6 sm:p-8 shadow-[0_4px_24px_rgb(0,0,0,0.03)] flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <img
              src={settings.user.avatarUrl}
              alt=""
              className="w-16 h-16 rounded-2xl object-cover border border-[#E5EAF2] shadow-sm"
            />
            <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#16B8A6] border-2 border-white rounded-full flex items-center justify-center text-white" title="Verified Sri Lankan Account">
              <Check className="w-3 h-3 stroke-[3]" />
            </span>
          </div>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-[#172033] tracking-tight">
                {settings.user.name}
              </h1>
              <span className="text-[10px] font-bold text-[#2457E6] bg-[#EEF3FF] border border-[#2457E6]/30 px-2.5 py-0.5 rounded-full">
                All-in-One Account (Buyer & Seller)
              </span>
            </div>
            <p className="text-xs text-[#64748B] flex flex-wrap items-center gap-2">
              <span>{settings.user.email}</span>
              <span>•</span>
              <span>{settings.user.phone}</span>
              <span>•</span>
              <span className="text-[#16B8A6] font-semibold">NIC Verified</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start md:self-center">
          <Link
            href="/dashboard?mode=selling"
            className="px-4 py-2 bg-[#F5F7FB] hover:bg-slate-100 border border-[#E5EAF2] text-[#172033] font-bold text-xs rounded-xl transition"
          >
            Consignor Studio
          </Link>
          <Link
            href="/dashboard?mode=buying"
            className="px-4 py-2 bg-[#2457E6] hover:bg-[#1d46be] text-white font-bold text-xs rounded-xl shadow-sm transition"
          >
            Bidding Arena
          </Link>
        </div>
      </div>

      {/* Toast Feedback */}
      {saveSuccessMsg && (
        <div className="p-4 bg-[#E8FAF7] border border-[#16B8A6]/30 text-[#16B8A6] rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {saveErrorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{saveErrorMsg}</span>
        </div>
      )}

      {/* Main Settings Grid: Left Navigation Rail + Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left-Side Settings Navigation (Desktop Sticky) */}
        <div className="lg:col-span-4 bg-white border border-[#E5EAF2] rounded-3xl p-3 sm:p-4 shadow-[0_4px_24px_rgb(0,0,0,0.03)] space-y-1 overflow-x-auto lg:overflow-x-visible">
          <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider px-3 block my-2">
            Settings Navigation
          </span>

          <div className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-x-visible pb-1 lg:pb-0">
            {navigationSections.map((sec) => {
              const Icon = sec.icon;
              const isActive = activeSection === sec.id;
              return (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => {
                    setActiveSection(sec.id);
                    setSaveSuccessMsg(null);
                    setSaveErrorMsg(null);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition whitespace-nowrap cursor-pointer text-left ${
                    isActive
                      ? "bg-[#2457E6] text-white shadow-sm"
                      : "text-[#64748B] hover:bg-[#F5F7FB] hover:text-[#172033]"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{sec.label}</span>
                  </div>
                  <ChevronRight className={`w-3.5 h-3.5 hidden lg:block ${isActive ? "text-white" : "text-slate-300"}`} />
                </button>
              );
            })}
          </div>
        </div>

        {/* Right-Side Content Panels */}
        <div className="lg:col-span-8 space-y-6">

          {/* 1. OVERVIEW SECTION */}
          {activeSection === "overview" && (
            <div className="bg-white border border-[#E5EAF2] rounded-3xl p-6 sm:p-8 space-y-6 shadow-[0_4px_24px_rgb(0,0,0,0.03)] animate-in fade-in duration-150">
              <div className="border-b border-[#E5EAF2] pb-4">
                <h2 className="text-lg font-black text-[#172033]">Account Overview & Health</h2>
                <p className="text-xs text-[#64748B]">Central governance of your personal identity, security credentials, and preferences</p>
              </div>

              {/* Status Mini Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-[#F5F7FB] border border-[#E5EAF2] space-y-1">
                  <span className="text-[10px] font-bold text-[#64748B] uppercase">Identity Verification</span>
                  <div className="text-base font-extrabold text-[#16B8A6] flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Fully Verified</span>
                  </div>
                  <span className="text-[11px] text-[#64748B]">Sri Lanka NIC {settings.user.nic}</span>
                </div>

                <div className="p-4 rounded-2xl bg-[#F5F7FB] border border-[#E5EAF2] space-y-1">
                  <span className="text-[10px] font-bold text-[#64748B] uppercase">2FA Authenticator</span>
                  <div className="text-base font-extrabold text-[#2457E6] flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Hardware Active</span>
                  </div>
                  <span className="text-[11px] text-[#64748B]">Time-based OTP token</span>
                </div>

                <div className="p-4 rounded-2xl bg-[#F5F7FB] border border-[#E5EAF2] space-y-1">
                  <span className="text-[10px] font-bold text-[#64748B] uppercase">Marketplace Role</span>
                  <div className="text-base font-extrabold text-[#172033]">Buyer + Seller</div>
                  <span className="text-[11px] text-[#16B8A6] font-semibold">Storefront Approved</span>
                </div>
              </div>

              {/* Quick Jump Links */}
              <div className="space-y-3 pt-2">
                <h3 className="text-xs font-bold text-[#172033] uppercase tracking-wide">Quick Settings Shortcuts</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveSection("personal")}
                    className="p-4 rounded-2xl border border-[#E5EAF2] hover:border-[#2457E6]/40 hover:bg-[#F5F7FB] transition text-left space-y-1 group"
                  >
                    <div className="flex items-center justify-between">
                      <strong className="text-xs text-[#172033] group-hover:text-[#2457E6] transition">Edit Profile & Contact</strong>
                      <ChevronRight className="w-3.5 h-3.5 text-[#64748B]" />
                    </div>
                    <p className="text-[11px] text-[#64748B]">Update display name, +94 phone, and address</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveSection("security")}
                    className="p-4 rounded-2xl border border-[#E5EAF2] hover:border-[#2457E6]/40 hover:bg-[#F5F7FB] transition text-left space-y-1 group"
                  >
                    <div className="flex items-center justify-between">
                      <strong className="text-xs text-[#172033] group-hover:text-[#2457E6] transition">Security & Active Devices</strong>
                      <ChevronRight className="w-3.5 h-3.5 text-[#64748B]" />
                    </div>
                    <p className="text-[11px] text-[#64748B]">Change password, manage 2FA, and revoke sessions</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveSection("notifications")}
                    className="p-4 rounded-2xl border border-[#E5EAF2] hover:border-[#2457E6]/40 hover:bg-[#F5F7FB] transition text-left space-y-1 group"
                  >
                    <div className="flex items-center justify-between">
                      <strong className="text-xs text-[#172033] group-hover:text-[#2457E6] transition">Notification Preferences</strong>
                      <ChevronRight className="w-3.5 h-3.5 text-[#64748B]" />
                    </div>
                    <p className="text-[11px] text-[#64748B]">Configure auction alerts, email, and SMS channels</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveSection("addresses")}
                    className="p-4 rounded-2xl border border-[#E5EAF2] hover:border-[#2457E6]/40 hover:bg-[#F5F7FB] transition text-left space-y-1 group"
                  >
                    <div className="flex items-center justify-between">
                      <strong className="text-xs text-[#172033] group-hover:text-[#2457E6] transition">Manage Addresses</strong>
                      <ChevronRight className="w-3.5 h-3.5 text-[#64748B]" />
                    </div>
                    <p className="text-[11px] text-[#64748B]">Add or edit delivery addresses across Sri Lanka</p>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 2. PERSONAL INFORMATION */}
          {activeSection === "personal" && (
            <div className="bg-white border border-[#E5EAF2] rounded-3xl p-6 sm:p-8 space-y-6 shadow-[0_4px_24px_rgb(0,0,0,0.03)] animate-in fade-in duration-150">
              <div className="border-b border-[#E5EAF2] pb-4">
                <h2 className="text-lg font-black text-[#172033]">Personal Information</h2>
                <p className="text-xs text-[#64748B]">Manage your legal name, display handle, and verified contact details</p>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSaveSection("personal", personalForm);
                }}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#172033]">Full Legal Name (NIC Match)</label>
                    <input
                      type="text"
                      required
                      value={personalForm.name}
                      onChange={(e) => setPersonalForm({ ...personalForm, name: e.target.value })}
                      className="w-full bg-[#F5F7FB] border border-[#E5EAF2] rounded-xl p-3 text-xs text-[#172033] focus:border-[#2457E6] focus:bg-white outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#172033]">Public Display Handle / Name</label>
                    <input
                      type="text"
                      required
                      value={personalForm.displayName}
                      onChange={(e) => setPersonalForm({ ...personalForm, displayName: e.target.value })}
                      className="w-full bg-[#F5F7FB] border border-[#E5EAF2] rounded-xl p-3 text-xs text-[#172033] focus:border-[#2457E6] focus:bg-white outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-[#172033]">Email Address</label>
                      <span className="text-[10px] font-bold text-[#16B8A6] flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Verified
                      </span>
                    </div>
                    <input
                      type="email"
                      required
                      value={personalForm.email}
                      onChange={(e) => setPersonalForm({ ...personalForm, email: e.target.value })}
                      className="w-full bg-[#F5F7FB] border border-[#E5EAF2] rounded-xl p-3 text-xs text-[#172033] focus:border-[#2457E6] focus:bg-white outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-[#172033]">Mobile Phone Number</label>
                      <span className="text-[10px] font-bold text-[#16B8A6] flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> OTP Verified
                      </span>
                    </div>
                    <input
                      type="tel"
                      required
                      value={personalForm.phone}
                      onChange={(e) => setPersonalForm({ ...personalForm, phone: e.target.value })}
                      className="w-full bg-[#F5F7FB] border border-[#E5EAF2] rounded-xl p-3 text-xs font-mono text-[#172033] focus:border-[#2457E6] focus:bg-white outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#172033]">Date of Birth</label>
                    <input
                      type="date"
                      value={personalForm.dob}
                      onChange={(e) => setPersonalForm({ ...personalForm, dob: e.target.value })}
                      className="w-full bg-[#F5F7FB] border border-[#E5EAF2] rounded-xl p-3 text-xs text-[#172033] focus:border-[#2457E6] focus:bg-white outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#172033]">District</label>
                    <select
                      value={personalForm.district}
                      onChange={(e) => setPersonalForm({ ...personalForm, district: e.target.value })}
                      className="w-full bg-[#F5F7FB] border border-[#E5EAF2] rounded-xl p-3 text-xs text-[#172033] focus:border-[#2457E6] focus:bg-white outline-none"
                    >
                      {SRI_LANKAN_DISTRICTS.map((d) => (
                        <option key={d} value={d}>{d} District</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#172033]">Country</label>
                    <input
                      type="text"
                      disabled
                      value={personalForm.country}
                      className="w-full bg-slate-100 border border-[#E5EAF2] rounded-xl p-3 text-xs text-[#64748B] outline-none cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#172033]">Residential Address</label>
                  <input
                    type="text"
                    value={personalForm.address}
                    onChange={(e) => setPersonalForm({ ...personalForm, address: e.target.value })}
                    className="w-full bg-[#F5F7FB] border border-[#E5EAF2] rounded-xl p-3 text-xs text-[#172033] focus:border-[#2457E6] focus:bg-white outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#172033]">Collector Bio & Notes</label>
                  <textarea
                    rows={3}
                    value={personalForm.bio}
                    onChange={(e) => setPersonalForm({ ...personalForm, bio: e.target.value })}
                    className="w-full bg-[#F5F7FB] border border-[#E5EAF2] rounded-xl p-3 text-xs text-[#172033] focus:border-[#2457E6] focus:bg-white outline-none"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-3 bg-[#2457E6] hover:bg-[#1d46be] disabled:opacity-50 text-white font-black text-xs rounded-xl shadow-sm transition flex items-center gap-2 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? "Saving Changes..." : "Save Personal Details"}</span>
                </button>
              </form>
            </div>
          )}

          {/* 3. LOGIN & SECURITY */}
          {activeSection === "security" && (
            <div className="bg-white border border-[#E5EAF2] rounded-3xl p-6 sm:p-8 space-y-6 shadow-[0_4px_24px_rgb(0,0,0,0.03)] animate-in fade-in duration-150">
              <div className="border-b border-[#E5EAF2] pb-4">
                <h2 className="text-lg font-black text-[#172033]">Login & Security Governance</h2>
                <p className="text-xs text-[#64748B]">Manage passphrases, two-factor authentication, and active logged-in sessions</p>
              </div>

              {/* Password Change Form */}
              <div className="space-y-4">
                <h3 className="text-xs font-black text-[#172033] uppercase tracking-wide">Change Password</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    type="password"
                    placeholder="Current Password"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    className="bg-[#F5F7FB] border border-[#E5EAF2] rounded-xl p-3 text-xs text-[#172033] focus:border-[#2457E6] focus:bg-white outline-none"
                  />
                  <input
                    type="password"
                    placeholder="New Strong Password"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    className="bg-[#F5F7FB] border border-[#E5EAF2] rounded-xl p-3 text-xs text-[#172033] focus:border-[#2457E6] focus:bg-white outline-none"
                  />
                  <input
                    type="password"
                    placeholder="Confirm Password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    className="bg-[#F5F7FB] border border-[#E5EAF2] rounded-xl p-3 text-xs text-[#172033] focus:border-[#2457E6] focus:bg-white outline-none"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (!passwordForm.newPassword) return;
                    showSuccess("Password updated successfully.");
                    setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
                  }}
                  className="px-5 py-2.5 bg-[#172033] hover:bg-black text-white font-bold text-xs rounded-xl transition"
                >
                  Update Password
                </button>
              </div>

              {/* 2FA Toggle Card */}
              <div className="p-5 rounded-2xl bg-[#F5F7FB] border border-[#E5EAF2] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#E8FAF7] text-[#16B8A6] flex items-center justify-center font-bold shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-[#172033]">Two-Factor Authentication (2FA)</h4>
                    <p className="text-xs text-[#64748B]">Requires a one-time code from your authenticator app on every new device login.</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const nextVal = !settings.security.twoFactorEnabled;
                    handleSaveSection("security", { twoFactorEnabled: nextVal });
                  }}
                  className={`px-4 py-2 font-bold text-xs rounded-xl transition shadow-sm ${
                    settings.security.twoFactorEnabled
                      ? "bg-[#16B8A6] text-white"
                      : "bg-white border border-[#E5EAF2] text-[#172033]"
                  }`}
                >
                  {settings.security.twoFactorEnabled ? "2FA Enabled ✓" : "Enable 2FA"}
                </button>
              </div>

              {/* Active Sessions */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black text-[#172033] uppercase tracking-wide">Active Logged-In Sessions</h3>
                  <button
                    type="button"
                    onClick={() => handleSaveSection("security", { action: "TERMINATE_ALL_OTHER" })}
                    className="text-xs font-bold text-rose-600 hover:text-rose-700 transition"
                  >
                    Sign Out All Other Sessions
                  </button>
                </div>

                <div className="space-y-2">
                  {settings.security.activeSessions.map((sess: any) => (
                    <div
                      key={sess.id}
                      className="p-3.5 rounded-xl border border-[#E5EAF2] bg-white flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-3">
                        {sess.device.includes("iPhone") ? (
                          <Smartphone className="w-5 h-5 text-[#2457E6]" />
                        ) : (
                          <Laptop className="w-5 h-5 text-[#2457E6]" />
                        )}
                        <div>
                          <strong className="text-[#172033] block">{sess.device}</strong>
                          <span className="text-[11px] text-[#64748B] font-mono">
                            {sess.ip} • {sess.location}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {sess.isCurrent ? (
                          <span className="text-[10px] font-bold text-[#16B8A6] bg-[#E8FAF7] px-2.5 py-0.5 rounded-full">
                            Current Device
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleSaveSection("security", { action: "TERMINATE_SESSION", sessionId: sess.id })}
                            className="text-xs font-bold text-[#64748B] hover:text-rose-600 transition"
                          >
                            Revoke
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 4. NOTIFICATIONS */}
          {activeSection === "notifications" && (
            <div className="bg-white border border-[#E5EAF2] rounded-3xl p-6 sm:p-8 space-y-6 shadow-[0_4px_24px_rgb(0,0,0,0.03)] animate-in fade-in duration-150">
              <div className="border-b border-[#E5EAF2] pb-4">
                <h2 className="text-lg font-black text-[#172033]">Notification Preferences</h2>
                <p className="text-xs text-[#64748B]">Granular controls for auction alerts, order tracking, and communication channels</p>
              </div>

              {/* Channels Grid */}
              <div className="space-y-3">
                <h3 className="text-xs font-black text-[#172033] uppercase tracking-wide">Delivery Channels</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { id: "inApp", label: "In-App Bell" },
                    { id: "email", label: "Email Notifications" },
                    { id: "sms", label: "SMS Alerts (+94)" },
                    { id: "push", label: "Mobile Push" },
                  ].map((ch) => {
                    const isChecked = settings.notifications.channels[ch.id];
                    return (
                      <label key={ch.id} className="flex items-center gap-2 p-3 rounded-xl border border-[#E5EAF2] cursor-pointer hover:bg-[#F5F7FB] transition">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            const updated = {
                              ...settings.notifications,
                              channels: { ...settings.notifications.channels, [ch.id]: e.target.checked }
                            };
                            handleSaveSection("notifications", updated);
                          }}
                          className="w-4 h-4 text-[#2457E6] rounded border-[#E5EAF2]"
                        />
                        <span className="text-xs font-bold text-[#172033]">{ch.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Auction Notifications */}
              <div className="space-y-3 pt-2">
                <h3 className="text-xs font-black text-[#172033] uppercase tracking-wide">Live Auction Events</h3>
                <div className="space-y-2">
                  {[
                    { key: "bidPlaced", label: "Bid Confirmation", desc: "Notify when your bid is successfully registered on the live auction book" },
                    { key: "outbid", label: "Outbid Alert (High Priority)", desc: "Instant alert when another verified bidder outbids your high bid" },
                    { key: "endingSoon", label: "Auction Ending Soon", desc: "Reminder 15 minutes before auction soft-close countdown begins" },
                    { key: "auctionWon", label: "Auction Won (Escrow Ready)", desc: "Notice when the hammer drops and your bid wins the lot" },
                  ].map((item) => (
                    <div key={item.key} className="p-3.5 rounded-xl border border-[#E5EAF2] flex items-center justify-between text-xs">
                      <div>
                        <strong className="text-[#172033] block">{item.label}</strong>
                        <span className="text-[#64748B] text-[11px]">{item.desc}</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.notifications.auction[item.key]}
                        onChange={(e) => {
                          const updated = {
                            ...settings.notifications,
                            auction: { ...settings.notifications.auction, [item.key]: e.target.checked }
                          };
                          handleSaveSection("notifications", updated);
                        }}
                        className="w-4 h-4 text-[#2457E6] rounded border-[#E5EAF2] cursor-pointer"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 5. PRIVACY & DATA */}
          {activeSection === "privacy" && (
            <div className="bg-white border border-[#E5EAF2] rounded-3xl p-6 sm:p-8 space-y-6 shadow-[0_4px_24px_rgb(0,0,0,0.03)] animate-in fade-in duration-150">
              <div className="border-b border-[#E5EAF2] pb-4">
                <h2 className="text-lg font-black text-[#172033]">Privacy & Data Retention</h2>
                <p className="text-xs text-[#64748B]">Control public profile visibility, marketing consents, and legal data export</p>
              </div>

              <div className="space-y-3">
                <div className="p-4 rounded-2xl border border-[#E5EAF2] flex items-center justify-between">
                  <div>
                    <strong className="text-xs text-[#172033] block">Public Storefront Visibility</strong>
                    <span className="text-[11px] text-[#64748B]">Allow other bidders to view your verified consignment listings and feedback.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.privacy.publicProfileVisible}
                    onChange={(e) => handleSaveSection("privacy", { publicProfileVisible: e.target.checked })}
                    className="w-4 h-4 text-[#2457E6] rounded border-[#E5EAF2] cursor-pointer"
                  />
                </div>

                <div className="p-4 rounded-2xl border border-[#E5EAF2] flex items-center justify-between">
                  <div>
                    <strong className="text-xs text-[#172033] block">Hide Bidding Identity in Public Book</strong>
                    <span className="text-[11px] text-[#64748B]">Mask your name as &quot;Bidder #892&quot; on public auction lot bid history lists.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.privacy.showBiddingHistory}
                    onChange={(e) => handleSaveSection("privacy", { showBiddingHistory: e.target.checked })}
                    className="w-4 h-4 text-[#2457E6] rounded border-[#E5EAF2] cursor-pointer"
                  />
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200/60 space-y-2 text-xs">
                <strong className="text-amber-900 block flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-amber-700" /> Legal Compliance & Record Retention Notice
                </strong>
                <p className="text-[11px] text-amber-800/90 leading-relaxed">
                  Under the Central Bank of Sri Lanka electronic financial transactions regulations, completed auction settlements, PayHere escrow waybills, and tax records must be retained in immutable logs for a mandatory statutory period. Account deactivation will cease marketing communications and freeze live bidding without purging required financial records.
                </p>
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => showSuccess("A full archive of your account data has been compiled and emailed to your registered address.")}
                  className="px-4 py-2.5 bg-white border border-[#E5EAF2] hover:bg-[#F5F7FB] text-[#172033] font-bold text-xs rounded-xl transition"
                >
                  Request Data Archive (JSON)
                </button>
                <button
                  type="button"
                  onClick={() => showError("Account deactivation requires resolving all live active bids and pending escrow settlements.")}
                  className="px-4 py-2.5 bg-rose-50 border border-rose-200 text-rose-700 font-bold text-xs rounded-xl transition"
                >
                  Deactivate Account
                </button>
              </div>
            </div>
          )}

          {/* 6. ADDRESS BOOK */}
          {activeSection === "addresses" && (
            <div className="bg-white border border-[#E5EAF2] rounded-3xl p-6 sm:p-8 space-y-6 shadow-[0_4px_24px_rgb(0,0,0,0.03)] animate-in fade-in duration-150">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5EAF2] pb-4">
                <div>
                  <h2 className="text-lg font-black text-[#172033]">Address Management</h2>
                  <p className="text-xs text-[#64748B]">Manage delivery addresses for platform-managed courier shipments across Sri Lanka</p>
                </div>
                <button
                  type="button"
                  onClick={() => setAddressModalOpen(true)}
                  className="px-4 py-2 bg-[#2457E6] text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center gap-1.5 self-start sm:self-center"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add New Address</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {settings.addresses.map((addr: any) => (
                  <div key={addr.id} className="p-5 rounded-2xl bg-[#F5F7FB] border border-[#E5EAF2] space-y-3 relative">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <strong className="text-xs text-[#172033] font-black">{addr.label}</strong>
                        {addr.isDefaultShipping && (
                          <span className="text-[9px] font-bold text-[#16B8A6] bg-[#E8FAF7] border border-[#16B8A6]/30 px-2 py-0.5 rounded-full">
                            Default Shipping
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleSaveSection("addresses", { action: "DELETE", addressId: addr.id })}
                        className="text-[#64748B] hover:text-rose-600 transition p-1"
                        title="Delete Address"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="text-xs text-[#64748B] space-y-0.5">
                      <p className="font-bold text-[#172033]">{addr.fullName} • {addr.phone}</p>
                      <p>{addr.line1}</p>
                      {addr.line2 && <p>{addr.line2}</p>}
                      <p>{addr.city}, {addr.district} District, {addr.postalCode}</p>
                      <p>{addr.country}</p>
                    </div>

                    {!addr.isDefaultShipping && (
                      <button
                        type="button"
                        onClick={() => handleSaveSection("addresses", { action: "SET_DEFAULT", addressId: addr.id, type: "shipping" })}
                        className="text-[11px] font-bold text-[#2457E6] hover:underline"
                      >
                        Set as Default Shipping
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Add Address Modal */}
              {addressModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
                  <div className="bg-white border border-[#E5EAF2] rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-4 shadow-2xl">
                    <div className="flex items-center justify-between border-b border-[#E5EAF2] pb-3">
                      <h3 className="font-extrabold text-sm text-[#172033]">Add Sri Lanka Delivery Address</h3>
                      <button onClick={() => setAddressModalOpen(false)} className="text-[#64748B]">✕</button>
                    </div>

                    <div className="space-y-3 text-xs">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="font-bold block mb-1">Address Label</label>
                          <input
                            type="text"
                            value={newAddressForm.label}
                            onChange={(e) => setNewAddressForm({ ...newAddressForm, label: e.target.value })}
                            placeholder="Home, Office, Vault..."
                            className="w-full p-2.5 bg-[#F5F7FB] border border-[#E5EAF2] rounded-xl outline-none"
                          />
                        </div>
                        <div>
                          <label className="font-bold block mb-1">Recipient Name</label>
                          <input
                            type="text"
                            value={newAddressForm.fullName}
                            onChange={(e) => setNewAddressForm({ ...newAddressForm, fullName: e.target.value })}
                            placeholder="Kasun Jayasuriya"
                            className="w-full p-2.5 bg-[#F5F7FB] border border-[#E5EAF2] rounded-xl outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="font-bold block mb-1">Contact Phone (+94)</label>
                          <input
                            type="tel"
                            value={newAddressForm.phone}
                            onChange={(e) => setNewAddressForm({ ...newAddressForm, phone: e.target.value })}
                            placeholder="+94 77 123 4567"
                            className="w-full p-2.5 bg-[#F5F7FB] border border-[#E5EAF2] rounded-xl outline-none font-mono"
                          />
                        </div>
                        <div>
                          <label className="font-bold block mb-1">District</label>
                          <select
                            value={newAddressForm.district}
                            onChange={(e) => setNewAddressForm({ ...newAddressForm, district: e.target.value })}
                            className="w-full p-2.5 bg-[#F5F7FB] border border-[#E5EAF2] rounded-xl outline-none"
                          >
                            {SRI_LANKAN_DISTRICTS.map((d) => (
                              <option key={d} value={d}>{d} District</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="font-bold block mb-1">Street Address</label>
                        <input
                          type="text"
                          value={newAddressForm.line1}
                          onChange={(e) => setNewAddressForm({ ...newAddressForm, line1: e.target.value })}
                          placeholder="No. 42/B, Ward Place"
                          className="w-full p-2.5 bg-[#F5F7FB] border border-[#E5EAF2] rounded-xl outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="font-bold block mb-1">City / Town</label>
                          <input
                            type="text"
                            value={newAddressForm.city}
                            onChange={(e) => setNewAddressForm({ ...newAddressForm, city: e.target.value })}
                            placeholder="Colombo 07"
                            className="w-full p-2.5 bg-[#F5F7FB] border border-[#E5EAF2] rounded-xl outline-none"
                          />
                        </div>
                        <div>
                          <label className="font-bold block mb-1">Postal Code</label>
                          <input
                            type="text"
                            value={newAddressForm.postalCode}
                            onChange={(e) => setNewAddressForm({ ...newAddressForm, postalCode: e.target.value })}
                            placeholder="00700"
                            className="w-full p-2.5 bg-[#F5F7FB] border border-[#E5EAF2] rounded-xl outline-none font-mono"
                          />
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          if (!newAddressForm.line1) return;
                          handleSaveSection("addresses", { action: "ADD", address: newAddressForm });
                          setAddressModalOpen(false);
                        }}
                        className="w-full py-3 bg-[#2457E6] text-white font-bold text-xs rounded-xl shadow-sm transition cursor-pointer"
                      >
                        Save Address to Profile
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 7. PREFERENCES (Language, Currency, Theme) */}
          {activeSection === "preferences" && (
            <div className="bg-white border border-[#E5EAF2] rounded-3xl p-6 sm:p-8 space-y-6 shadow-[0_4px_24px_rgb(0,0,0,0.03)] animate-in fade-in duration-150">
              <div className="border-b border-[#E5EAF2] pb-4">
                <h2 className="text-lg font-black text-[#172033]">Regional & Interface Preferences</h2>
                <p className="text-xs text-[#64748B]">Customize language localization, display currency, and appearance</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#172033]">Platform Language</label>
                  <select
                    value={settings.preferences.language}
                    onChange={(e) => handleSaveSection("preferences", { language: e.target.value })}
                    className="w-full bg-[#F5F7FB] border border-[#E5EAF2] rounded-xl p-3 text-xs text-[#172033] focus:border-[#2457E6] focus:bg-white outline-none"
                  >
                    <option value="EN">English (Global Default)</option>
                    <option value="SI">සිංහල (Sinhala)</option>
                    <option value="TA">தமிழ் (Tamil)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#172033]">Display Currency</label>
                  <select
                    value={settings.preferences.currency}
                    onChange={(e) => handleSaveSection("preferences", { currency: e.target.value })}
                    className="w-full bg-[#F5F7FB] border border-[#E5EAF2] rounded-xl p-3 text-xs text-[#172033] focus:border-[#2457E6] focus:bg-white outline-none"
                  >
                    <option value="LKR">Sri Lankan Rupee (LKR / Rs.)</option>
                    <option value="USD">US Dollar (USD - Preview Only)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#172033]">Marketplace Timezone</label>
                  <input
                    type="text"
                    disabled
                    value={settings.preferences.timezone}
                    className="w-full bg-slate-100 border border-[#E5EAF2] rounded-xl p-3 text-xs text-[#64748B] outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#172033]">Theme Appearance</label>
                  <select
                    value={settings.preferences.appearance}
                    onChange={(e) => handleSaveSection("preferences", { appearance: e.target.value })}
                    className="w-full bg-[#F5F7FB] border border-[#E5EAF2] rounded-xl p-3 text-xs text-[#172033] focus:border-[#2457E6] focus:bg-white outline-none"
                  >
                    <option value="LIGHT">Modern Light (BITME Standard)</option>
                    <option value="SYSTEM">Follow System Theme</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* 8. BUYING SETTINGS */}
          {activeSection === "buying" && (
            <div className="bg-white border border-[#E5EAF2] rounded-3xl p-6 sm:p-8 space-y-6 shadow-[0_4px_24px_rgb(0,0,0,0.03)] animate-in fade-in duration-150">
              <div className="border-b border-[#E5EAF2] pb-4">
                <h2 className="text-lg font-black text-[#172033]">Bidding Arena & Purchase Preferences</h2>
                <p className="text-xs text-[#64748B]">Personalize your bidder protections, auto-watchlist behavior, and delivery defaults</p>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-2xl border border-[#E5EAF2] flex items-center justify-between">
                  <div>
                    <strong className="text-xs text-[#172033] block">Auto-Watchlist Lots You Bid On</strong>
                    <span className="text-[11px] text-[#64748B]">Automatically add any auction to your favorites as soon as you submit a bid.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.buying.autoWatchlistOnBid}
                    onChange={(e) => handleSaveSection("buying", { autoWatchlistOnBid: e.target.checked })}
                    className="w-4 h-4 text-[#2457E6] rounded border-[#E5EAF2] cursor-pointer"
                  />
                </div>

                <div className="p-4 rounded-2xl border border-[#E5EAF2] flex items-center justify-between">
                  <div>
                    <strong className="text-xs text-[#172033] block">Direct Consignor Messenger Access</strong>
                    <span className="text-[11px] text-[#64748B]">Allow verified sellers to reply to your lot inquiries in the in-app concierge.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.buying.allowSellerDirectChat}
                    onChange={(e) => handleSaveSection("buying", { allowSellerDirectChat: e.target.checked })}
                    className="w-4 h-4 text-[#2457E6] rounded border-[#E5EAF2] cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 9. SELLING SETTINGS (Conditional on Seller Permission) */}
          {activeSection === "selling" && isSeller && (
            <div className="bg-white border border-[#E5EAF2] rounded-3xl p-6 sm:p-8 space-y-6 shadow-[0_4px_24px_rgb(0,0,0,0.03)] animate-in fade-in duration-150">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5EAF2] pb-4">
                <div>
                  <h2 className="text-lg font-black text-[#172033]">Consignor Studio & Store Settings</h2>
                  <p className="text-xs text-[#64748B]">Manage public storefront identity, business registration, and payout destination</p>
                </div>
                <Link
                  href="/dashboard?mode=selling"
                  className="text-xs font-bold text-[#2457E6] hover:underline flex items-center gap-1"
                >
                  <span>Preview Storefront</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSaveSection("selling", sellingForm);
                }}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#172033]">Storefront / Consignor Name</label>
                    <input
                      type="text"
                      required
                      value={sellingForm.storeName}
                      onChange={(e) => setSellingForm({ ...sellingForm, storeName: e.target.value })}
                      className="w-full bg-[#F5F7FB] border border-[#E5EAF2] rounded-xl p-3 text-xs text-[#172033] focus:border-[#2457E6] focus:bg-white outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#172033]">Business Registration Number (Optional)</label>
                    <input
                      type="text"
                      value={sellingForm.businessRegistration}
                      onChange={(e) => setSellingForm({ ...sellingForm, businessRegistration: e.target.value })}
                      placeholder="e.g. PV-94812/2023"
                      className="w-full bg-[#F5F7FB] border border-[#E5EAF2] rounded-xl p-3 text-xs font-mono text-[#172033] focus:border-[#2457E6] focus:bg-white outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#172033]">Store Description & Provenance Credentials</label>
                  <textarea
                    rows={3}
                    value={sellingForm.storeDescription}
                    onChange={(e) => setSellingForm({ ...sellingForm, storeDescription: e.target.value })}
                    className="w-full bg-[#F5F7FB] border border-[#E5EAF2] rounded-xl p-3 text-xs text-[#172033] focus:border-[#2457E6] focus:bg-white outline-none"
                  ></textarea>
                </div>

                <div className="p-4 rounded-2xl bg-[#F5F7FB] border border-[#E5EAF2] space-y-3">
                  <span className="text-xs font-black text-[#172033] uppercase tracking-wide block">
                    Verified Sri Lankan Bank Payout Account (95% Net Settlement)
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[10px] text-[#64748B] block font-bold mb-1">Bank Name</label>
                      <input
                        type="text"
                        value={sellingForm.bankName}
                        onChange={(e) => setSellingForm({ ...sellingForm, bankName: e.target.value })}
                        className="w-full p-2.5 bg-white border border-[#E5EAF2] rounded-xl text-xs font-bold outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-[#64748B] block font-bold mb-1">Branch</label>
                      <input
                        type="text"
                        value={sellingForm.bankBranch}
                        onChange={(e) => setSellingForm({ ...sellingForm, bankBranch: e.target.value })}
                        className="w-full p-2.5 bg-white border border-[#E5EAF2] rounded-xl text-xs outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-[#64748B] block font-bold mb-1">Account Number</label>
                      <input
                        type="text"
                        value={sellingForm.bankAccount}
                        onChange={(e) => setSellingForm({ ...sellingForm, bankAccount: e.target.value })}
                        className="w-full p-2.5 bg-white border border-[#E5EAF2] rounded-xl text-xs font-mono font-bold outline-none"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-3 bg-[#16B8A6] hover:bg-[#139a8b] text-white font-black text-xs rounded-xl shadow-sm transition flex items-center gap-2 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? "Saving..." : "Save Seller Settings"}</span>
                </button>
              </form>
            </div>
          )}

          {/* 10. PAYMENTS */}
          {activeSection === "payments" && (
            <div className="bg-white border border-[#E5EAF2] rounded-3xl p-6 sm:p-8 space-y-6 shadow-[0_4px_24px_rgb(0,0,0,0.03)] animate-in fade-in duration-150">
              <div className="border-b border-[#E5EAF2] pb-4">
                <h2 className="text-lg font-black text-[#172033]">Payment & Card Tokenization</h2>
                <p className="text-xs text-[#64748B]">Central Bank compliant tokenized cards managed via PayHere gateway</p>
              </div>

              <div className="space-y-3">
                <div className="p-4 rounded-2xl bg-[#F5F7FB] border border-[#E5EAF2] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-5 h-5 text-[#2457E6]" />
                    <div>
                      <div className="flex items-center gap-2">
                        <strong className="text-xs text-[#172033]">Visa ending in 4242</strong>
                        <span className="text-[9px] font-bold text-[#16B8A6] bg-[#E8FAF7] px-2 py-0.5 rounded-full">
                          Primary
                        </span>
                      </div>
                      <span className="text-[11px] text-[#64748B]">Expires 08/28 • PayHere Token Vault</span>
                    </div>
                  </div>
                  <span className="text-xs text-[#64748B] font-mono">Tokenized ✓</span>
                </div>

                <div className="p-4 rounded-2xl bg-[#F5F7FB] border border-[#E5EAF2] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-5 h-5 text-[#64748B]" />
                    <div>
                      <strong className="text-xs text-[#172033]">Mastercard ending in 8891</strong>
                      <span className="text-[11px] text-[#64748B] block">Expires 11/27 • Secondary</span>
                    </div>
                  </div>
                  <span className="text-xs text-[#64748B] font-mono">Tokenized ✓</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-[#E5EAF2] text-[11px] text-[#64748B] flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-[#16B8A6] shrink-0 mt-0.5" />
                <span>
                  <strong>Zero Card Data Stored:</strong> Raw credit card numbers, CVVs, and banking PINs are never stored on BITME servers. All recurring payments and auction settlements use tokenized PayHere vault hashes.
                </span>
              </div>
            </div>
          )}

          {/* 11. VERIFICATION CENTRE */}
          {activeSection === "verification" && (
            <div className="bg-white border border-[#E5EAF2] rounded-3xl p-6 sm:p-8 space-y-6 shadow-[0_4px_24px_rgb(0,0,0,0.03)] animate-in fade-in duration-150">
              <div className="border-b border-[#E5EAF2] pb-4">
                <h2 className="text-lg font-black text-[#172033]">Trust & Verification Centre</h2>
                <p className="text-xs text-[#64748B]">Verify your identity to increase bidding ceilings and consign high-value luxury lots</p>
              </div>

              <div className="space-y-3">
                {[
                  { title: "Email Verification", val: settings.user.email, status: "VERIFIED", icon: CheckCircle2 },
                  { title: "Phone OTP Verification", val: settings.user.phone, status: "VERIFIED", icon: CheckCircle2 },
                  { title: "National Identity Card (NIC)", val: `NIC: ${settings.user.nic}`, status: "VERIFIED", icon: ShieldCheck },
                  { title: "Seller Consignor KYC", val: "Approved for Luxury Watches, Gems & Tech", status: "APPROVED", icon: Store },
                ].map((item, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-[#F5F7FB] border border-[#E5EAF2] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-white border border-[#E5EAF2] text-[#16B8A6] flex items-center justify-center font-bold">
                        <item.icon className="w-4 h-4" />
                      </div>
                      <div>
                        <strong className="text-xs text-[#172033] block">{item.title}</strong>
                        <span className="text-[11px] text-[#64748B]">{item.val}</span>
                      </div>
                    </div>

                    <span className="text-[10px] font-bold text-[#16B8A6] bg-[#E8FAF7] border border-[#16B8A6]/30 px-2.5 py-0.5 rounded-full">
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 12. CONNECTED ACCOUNTS */}
          {activeSection === "connected" && (
            <div className="bg-white border border-[#E5EAF2] rounded-3xl p-6 sm:p-8 space-y-6 shadow-[0_4px_24px_rgb(0,0,0,0.03)] animate-in fade-in duration-150">
              <div className="border-b border-[#E5EAF2] pb-4">
                <h2 className="text-lg font-black text-[#172033]">Connected Authentication Providers</h2>
                <p className="text-xs text-[#64748B]">Manage single sign-on (SSO) Google and third-party login providers</p>
              </div>

              <div className="p-4 rounded-2xl bg-[#F5F7FB] border border-[#E5EAF2] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-white border border-[#E5EAF2] flex items-center justify-center font-bold text-[#2457E6]">
                    G
                  </div>
                  <div>
                    <strong className="text-xs text-[#172033] block">Google Account</strong>
                    <span className="text-[11px] text-[#64748B]">Connected as kasun.jayasuriya@gmail.com</span>
                  </div>
                </div>

                <span className="text-[10px] font-bold text-[#16B8A6] bg-[#E8FAF7] px-2.5 py-0.5 rounded-full">
                  Connected ✓
                </span>
              </div>
            </div>
          )}

          {/* 13. HELP & SUPPORT */}
          {activeSection === "support" && (
            <div className="bg-white border border-[#E5EAF2] rounded-3xl p-6 sm:p-8 space-y-6 shadow-[0_4px_24px_rgb(0,0,0,0.03)] animate-in fade-in duration-150">
              <div className="border-b border-[#E5EAF2] pb-4">
                <h2 className="text-lg font-black text-[#172033]">Help & Concierge Support</h2>
                <p className="text-xs text-[#64748B]">Direct assistance with active bids, PayHere escrow releases, and courier deliveries</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Link
                  href="/messages"
                  className="p-5 rounded-2xl border border-[#E5EAF2] hover:border-[#2457E6]/40 hover:bg-[#F5F7FB] transition space-y-2 group block"
                >
                  <strong className="text-xs text-[#172033] group-hover:text-[#2457E6] transition block">
                    💬 Contact BITME Concierge Desk
                  </strong>
                  <p className="text-[11px] text-[#64748B] leading-relaxed">
                    Chat in real-time with our Colombo arbitration specialists for instant inquiry resolution.
                  </p>
                </Link>

                <div className="p-5 rounded-2xl border border-[#E5EAF2] space-y-2">
                  <strong className="text-xs text-[#172033] block">
                    🛡️ Escrow Dispute Assistance
                  </strong>
                  <p className="text-[11px] text-[#64748B] leading-relaxed">
                    Have an issue with a delivered package? Raise a dispute within your 48-hour inspection window.
                  </p>
                  <Link
                    href="/dashboard?mode=buying&tab=escrow"
                    className="text-xs font-bold text-[#2457E6] hover:underline inline-block pt-1"
                  >
                    Go to Escrow & Deliveries ➔
                  </Link>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}

export default function AccountSettingsPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-xs text-[#64748B]">Loading settings...</div>}>
      <AccountSettingsContent />
    </Suspense>
  );
}
