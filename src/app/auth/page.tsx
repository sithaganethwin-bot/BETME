"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Lock, 
  Mail, 
  Phone, 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle, 
  Gavel, 
  User, 
  CreditCard,
  Building,
  MapPin,
  Layers,
  FileText,
  Store,
  Check,
  AlertCircle,
  HelpCircle,
  KeyRound,
  Eye,
  EyeOff,
  X,
  Plus,
  ArrowLeft,
  Sun,
  Moon
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { SRI_LANKAN_DISTRICTS } from "@/lib/constants";
import { BidmeLogo } from "@/components/BitmeLogo";

function GoogleIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}

export default function AuthPage() {
  const router = useRouter();
  const { registerUser, setCurrentUser, addNotification, theme, toggleTheme } = useApp();

  const [mode, setMode] = useState<"register" | "login">("register");
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form State - Clean by default so user can enter their own real information
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Password Strength & Rule Evaluators
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

  const passwordScore = [hasMinLength, hasUppercase, hasLowercase, hasNumber, hasSpecial].filter(Boolean).length;
  const isConfirmMatch = confirmPassword.length > 0 && password === confirmPassword;
  const isConfirmMismatch = confirmPassword.length > 0 && password !== confirmPassword;

  // Step 2: Verification & Address
  const [nic, setNic] = useState("");
  const [district, setDistrict] = useState("Colombo");
  const [address, setAddress] = useState("");

  // Step 3: Payout Account & Store (Optional)
  const [storeName, setStoreName] = useState("");
  const [bankName, setBankName] = useState("Commercial Bank of Ceylon");
  const [bankBranch, setBankBranch] = useState("");
  const [bankAccount, setBankAccount] = useState("");

  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Google SSO Modal & Custom Account state
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
  const [googleCustomEmail, setGoogleCustomEmail] = useState("");
  const [googleCustomName, setGoogleCustomName] = useState("");
  const [isGoogleCustomActive, setIsGoogleCustomActive] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Check URL parameters for OAuth redirect callback
  useEffect(() => {
    if (typeof window === "undefined") return;
    const urlParams = new URLSearchParams(window.location.search);
    const googleLogin = urlParams.get("google_login");
    const payloadStr = urlParams.get("payload");
    const errorParam = urlParams.get("error");

    if (errorParam) {
      setErrorMessage(decodeURIComponent(errorParam));
    } else if (googleLogin === "success" && payloadStr) {
      try {
        const userObj = JSON.parse(decodeURIComponent(payloadStr));
        setCurrentUser(userObj);
        localStorage.setItem("bidme_user", JSON.stringify(userObj));
        localStorage.setItem("bitme_user", JSON.stringify(userObj));
        addNotification(`🎉 Signed in with Google! Welcome ${userObj.name}.`);
        router.push("/dashboard");
      } catch (e) {
        console.error("Failed to parse Google login payload", e);
      }
    }
  }, [router, setCurrentUser, addNotification]);

  const handleInitiateGoogle = async () => {
    setIsGoogleLoading(true);
    setErrorMessage(null);
    try {
      const res = await fetch("/api/auth/google?action=status");
      const data = await res.json();
      if (data.configured) {
        window.location.href = "/api/auth/google";
      } else {
        setIsGoogleLoading(false);
        setIsGoogleModalOpen(true);
      }
    } catch (e) {
      setIsGoogleLoading(false);
      setIsGoogleModalOpen(true);
    }
  };

  const handleGoogleAuth = async (authDetails: {
    email: string;
    name?: string;
    avatarUrl?: string;
    googleId?: string;
  }) => {
    setIsGoogleLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(authDetails),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Google authentication failed.");
      }

      // Update AppContext and localStorage
      setCurrentUser(data.user);
      localStorage.setItem("bidme_user", JSON.stringify(data.user));
      localStorage.setItem("bitme_user", JSON.stringify(data.user));

      setSuccessMessage(data.message);
      addNotification(
        data.isNewUser
          ? `🎉 Welcome to BIDME, ${data.user.name}! Your account was registered via Google.`
          : `🎉 Welcome back, ${data.user.name}! Signed in via Google.`
      );

      setIsGoogleModalOpen(false);

      setTimeout(() => {
        setIsGoogleLoading(false);
        router.push("/dashboard");
      }, 700);
    } catch (err: any) {
      setIsGoogleLoading(false);
      setErrorMessage(err.message || "Google sign-in encountered an issue.");
    }
  };

  // Quick fill helper for demo/testing convenience
  const fillDemoData = () => {
    setName("Kasun Jayasuriya");
    setEmail(`test.${Math.random().toString(36).substring(2, 7)}@bidme.lk`);
    setPhone("+94 77 " + Math.floor(1000000 + Math.random() * 9000000));
    setPassword("BidmeSecure@2026");
    setConfirmPassword("BidmeSecure@2026");
    setNic("1995" + Math.floor(10000000 + Math.random() * 90000000));
    setDistrict("Colombo");
    setAddress("No. 42/B, Ward Place, Colombo 07");
    setStoreName("Colombo Curated Auctions");
    setBankBranch("Colombo Main Branch");
    setBankAccount("8009124810");
    setErrorMessage(null);
  };

  const handleStep1Validation = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (!name.trim() || name.trim().length < 2) {
      setErrorMessage("Please enter your full legal name (at least 2 characters).");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }
    if (!hasMinLength) {
      setErrorMessage("Password must be at least 8 characters long.");
      return;
    }
    if (!hasUppercase) {
      setErrorMessage("Password must include at least one uppercase letter (A-Z).");
      return;
    }
    if (!hasLowercase) {
      setErrorMessage("Password must include at least one lowercase letter (a-z).");
      return;
    }
    if (!hasNumber) {
      setErrorMessage("Password must include at least one number (0-9).");
      return;
    }
    if (!confirmPassword) {
      setErrorMessage("Please retype and confirm your password.");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match. Please verify both password fields.");
      return;
    }
    setStep(2);
  };

  const handleStep2Validation = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (!nic.trim() || nic.trim().length < 9) {
      setErrorMessage("Please enter a valid Sri Lankan NIC number (e.g. 199428102941 or 942810294V).");
      return;
    }
    setStep(3);
  };

  const handleCompleteRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const payload = {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || null,
        password: password.trim(),
        nic: nic.trim(),
        district,
        address: address.trim(),
        storeName: storeName.trim(),
        bankName,
        bankBranch: bankBranch.trim(),
        bankAccount: bankAccount.trim(),
      };

      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to register account.");
      }

      // Update AppContext and persist user state
      registerUser(data.user);
      localStorage.setItem("bidme_user", JSON.stringify(data.user));
      localStorage.setItem("bitme_user", JSON.stringify(data.user));

      setSuccessMessage(`🎉 Welcome to BIDME, ${data.user.name}! Your verified account is ready.`);
      addNotification(`🎉 Account created! Welcome ${data.user.name}. You can now Buy and Sell with this single account!`);

      setTimeout(() => {
        setIsLoading(false);
        router.push("/dashboard");
      }, 1000);
    } catch (err: any) {
      setIsLoading(false);
      setErrorMessage(err.message || "An unexpected error occurred during registration.");
    }
  };

  const handleQuickLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: loginIdentifier.trim(),
          password: loginPassword.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Invalid login credentials.");
      }

      setCurrentUser(data.user);
      localStorage.setItem("bidme_user", JSON.stringify(data.user));
      localStorage.setItem("bitme_user", JSON.stringify(data.user));

      setSuccessMessage(`Welcome back, ${data.user.name}!`);
      addNotification(`Welcome back, ${data.user.name}!`);

      setTimeout(() => {
        setIsLoading(false);
        router.push("/dashboard");
      }, 800);
    } catch (err: any) {
      setIsLoading(false);
      setErrorMessage(err.message || "Sign in failed.");
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Top Quick Bar: Return to Marketplace & Theme Toggle */}
      <div className="flex items-center justify-between pb-1">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#64748B] hover:text-[#2457E6] transition group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Marketplace</span>
        </Link>

        <button
          type="button"
          onClick={toggleTheme}
          className="p-2 rounded-full text-[#64748B] hover:text-[#2457E6] hover:bg-slate-100 dark:hover:bg-slate-800 border border-[#E5EAF2] dark:border-slate-800 transition"
          title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
          aria-label="Toggle theme"
        >
          {theme === "dark" ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-[#64748B]" />
          )}
        </button>
      </div>

      {/* Brand Header */}
      <div className="text-center space-y-3">
        <BidmeLogo size="lg" showTagline={true} className="justify-center" />
        <h1 className="text-2xl sm:text-3xl font-black text-[#172033] tracking-tight">
          {mode === "register" ? "Create Your BIDME Account" : "Sign In to Your Account"}
        </h1>
        <p className="text-xs sm:text-sm text-[#64748B] max-w-md mx-auto leading-relaxed">
          {mode === "register"
            ? "One unified verified account for both bidding, buying and selling with direct Sri Lankan bank payouts."
            : "Sign in with your email or registered mobile number to access your bids, won lots and consignments."}
        </p>
      </div>

      {/* Primary Social SSO: Continue with Google */}
      <div className="space-y-4">
        <button
          type="button"
          onClick={handleInitiateGoogle}
          disabled={isLoading || isGoogleLoading}
          className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white hover:bg-slate-50 border border-[#E5EAF2] hover:border-slate-300 rounded-2xl text-xs font-bold text-[#172033] shadow-sm hover:shadow transition group disabled:opacity-50"
        >
          <GoogleIcon className="w-4 h-4 shrink-0" />
          <span>{isGoogleLoading ? "Connecting with Google..." : "Continue with Google"}</span>
        </button>

        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-[#E5EAF2]"></div>
          <span className="text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider">
            or continue with email
          </span>
          <div className="h-px flex-1 bg-[#E5EAF2]"></div>
        </div>
      </div>

      {/* Mode Switcher */}
      <div className="flex bg-white p-1 rounded-2xl border border-[#E5EAF2] text-xs font-bold shadow-sm">
        <button
          type="button"
          onClick={() => {
            setMode("register");
            setErrorMessage(null);
            setSuccessMessage(null);
          }}
          className={`flex-1 py-2.5 rounded-xl transition ${
            mode === "register" ? "bg-[#2457E6] text-white shadow-sm" : "text-[#64748B] hover:text-[#172033]"
          }`}
        >
          New Member Registration
        </button>
        <button
          type="button"
          onClick={() => {
            setMode("login");
            setErrorMessage(null);
            setSuccessMessage(null);
          }}
          className={`flex-1 py-2.5 rounded-xl transition ${
            mode === "login" ? "bg-[#2457E6] text-white shadow-sm" : "text-[#64748B] hover:text-[#172033]"
          }`}
        >
          Existing Member Sign In
        </button>
      </div>

      {/* Feedback Alerts */}
      {errorMessage && (
        <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2.5 animate-in fade-in duration-200">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2.5 animate-in fade-in duration-200">
          <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* REGISTRATION FORM */}
      {mode === "register" ? (
        <div className="bg-white border border-[#E5EAF2] rounded-3xl p-6 sm:p-8 space-y-6 shadow-[0_4px_24px_rgb(0,0,0,0.03)]">
          {/* Header with Demo Fill shortcut */}
          <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9]">
            <span className="text-xs font-bold text-[#172033]">
              Step {step} of 3: {step === 1 ? "Identity & Contact" : step === 2 ? "NIC & Delivery Address" : "Bank Payout Details"}
            </span>
            <button
              type="button"
              onClick={fillDemoData}
              className="text-[11px] font-semibold text-[#2457E6] hover:text-[#1d46be] bg-[#EEF3FF] px-2.5 py-1 rounded-lg transition flex items-center gap-1"
              title="Auto-fill form with sample test data"
            >
              <FileText className="w-3 h-3" />
              <span>Fill Sample Data</span>
            </button>
          </div>

          {/* 3 Steps Indicator */}
          <div className="grid grid-cols-3 gap-2 pb-2 text-center text-xs">
            <button
              type="button"
              onClick={() => setStep(1)}
              className={`pb-2 border-b-2 font-bold transition ${
                step === 1 ? "border-[#2457E6] text-[#2457E6]" : "border-slate-100 text-[#64748B]"
              }`}
            >
              1. Personal
            </button>
            <button
              type="button"
              onClick={() => {
                if (name && email && password) setStep(2);
                else setErrorMessage("Please complete Step 1 first.");
              }}
              className={`pb-2 border-b-2 font-bold transition ${
                step === 2 ? "border-[#2457E6] text-[#2457E6]" : "border-slate-100 text-[#64748B]"
              }`}
            >
              2. Verification
            </button>
            <button
              type="button"
              onClick={() => {
                if (name && email && password && nic) setStep(3);
                else setErrorMessage("Please complete Step 1 and 2 first.");
              }}
              className={`pb-2 border-b-2 font-bold transition ${
                step === 3 ? "border-[#2457E6] text-[#2457E6]" : "border-slate-100 text-[#64748B]"
              }`}
            >
              3. Payout
            </button>
          </div>

          {/* STEP 1: Personal & Mobile */}
          {step === 1 && (
            <form onSubmit={handleStep1Validation} className="space-y-4 animate-in fade-in duration-200">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#172033] flex items-center justify-between">
                  <span>Full Legal Name *</span>
                  <span className="text-[10px] text-[#64748B] font-normal">As appears on your NIC</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#64748B] absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Kasun Jayasuriya or your name"
                    className="w-full bg-[#F8FAFC] border border-[#E5EAF2] rounded-xl py-2.5 pl-10 pr-3 text-xs text-[#172033] focus:border-[#2457E6] focus:bg-white outline-none transition"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#172033]">Email Address *</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#64748B] absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. yourname@example.com"
                    className="w-full bg-[#F8FAFC] border border-[#E5EAF2] rounded-xl py-2.5 pl-10 pr-3 text-xs text-[#172033] focus:border-[#2457E6] focus:bg-white outline-none transition"
                  />
                </div>
                <span className="text-[11px] text-[#64748B]">Used for auction bid receipts and buyer protection guarantees.</span>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#172033] flex items-center justify-between">
                  <span>Sri Lanka Mobile Number</span>
                  <span className="text-[10px] text-[#64748B] font-normal">Optional but recommended</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-[#64748B] absolute left-3.5 top-3.5" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+94 77 123 4567"
                    className="w-full bg-[#F8FAFC] border border-[#E5EAF2] rounded-xl py-2.5 pl-10 pr-3 text-xs text-[#172033] focus:border-[#2457E6] focus:bg-white outline-none font-mono transition"
                  />
                </div>
                <span className="text-[11px] text-[#64748B]">Instant SMS outbid notifications & courier dispatch alerts.</span>
              </div>

              {/* Password Field */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#172033] flex items-center justify-between">
                  <span>Create Password *</span>
                  {password.length > 0 && (
                    <span className={`text-[10px] font-bold ${
                      passwordScore <= 2 ? "text-amber-600" : passwordScore <= 3 ? "text-blue-600" : "text-emerald-600"
                    }`}>
                      {passwordScore <= 2 ? "Weak" : passwordScore <= 3 ? "Medium" : passwordScore === 4 ? "Strong" : "Very Strong"}
                    </span>
                  )}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#64748B] absolute left-3.5 top-3.5" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter secure password"
                    className="w-full bg-[#F8FAFC] border border-[#E5EAF2] rounded-xl py-2.5 pl-10 pr-10 text-xs text-[#172033] focus:border-[#2457E6] focus:bg-white outline-none transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-[#94A3B8] hover:text-[#172033] transition"
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Password Strength Meter Bar */}
                {password.length > 0 && (
                  <div className="grid grid-cols-4 gap-1.5 pt-1">
                    <div className={`h-1.5 rounded-full transition-all duration-300 ${
                      passwordScore >= 1 ? (passwordScore <= 2 ? "bg-amber-500" : "bg-emerald-500") : "bg-slate-200"
                    }`} />
                    <div className={`h-1.5 rounded-full transition-all duration-300 ${
                      passwordScore >= 2 ? (passwordScore <= 2 ? "bg-amber-500" : "bg-emerald-500") : "bg-slate-200"
                    }`} />
                    <div className={`h-1.5 rounded-full transition-all duration-300 ${
                      passwordScore >= 3 ? (passwordScore === 3 ? "bg-blue-500" : "bg-emerald-500") : "bg-slate-200"
                    }`} />
                    <div className={`h-1.5 rounded-full transition-all duration-300 ${
                      passwordScore >= 4 ? "bg-emerald-500" : "bg-slate-200"
                    }`} />
                  </div>
                )}

                {/* Password Rules Visual Checklist */}
                <div className="p-3 bg-[#F8FAFC] border border-[#E5EAF2] rounded-xl space-y-1.5 mt-2">
                  <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block">
                    Password Security Requirements
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-2 gap-y-1.5 text-[11px]">
                    <div className={`flex items-center gap-1.5 ${hasMinLength ? "text-emerald-700 font-semibold" : "text-[#64748B]"}`}>
                      {hasMinLength ? <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> : <span className="w-1.5 h-1.5 rounded-full bg-slate-300 ml-1 mr-1" />}
                      <span>At least 8 characters</span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${hasUppercase ? "text-emerald-700 font-semibold" : "text-[#64748B]"}`}>
                      {hasUppercase ? <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> : <span className="w-1.5 h-1.5 rounded-full bg-slate-300 ml-1 mr-1" />}
                      <span>At least 1 uppercase letter (A-Z)</span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${hasLowercase ? "text-emerald-700 font-semibold" : "text-[#64748B]"}`}>
                      {hasLowercase ? <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> : <span className="w-1.5 h-1.5 rounded-full bg-slate-300 ml-1 mr-1" />}
                      <span>At least 1 lowercase letter (a-z)</span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${hasNumber ? "text-emerald-700 font-semibold" : "text-[#64748B]"}`}>
                      {hasNumber ? <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> : <span className="w-1.5 h-1.5 rounded-full bg-slate-300 ml-1 mr-1" />}
                      <span>At least 1 number (0-9)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Confirm / Retype Password Field */}
              <div className="space-y-1.5 pt-1">
                <label className="text-xs font-bold text-[#172033] flex items-center justify-between">
                  <span>Confirm Password (Retype) *</span>
                  {confirmPassword.length > 0 && (
                    <span className={`text-[10px] font-bold flex items-center gap-1 ${
                      isConfirmMatch ? "text-emerald-600" : "text-rose-600"
                    }`}>
                      {isConfirmMatch ? (
                        <>
                          <Check className="w-3 h-3" />
                          <span>Passwords match</span>
                        </>
                      ) : (
                        <>
                          <X className="w-3 h-3" />
                          <span>Passwords do not match</span>
                        </>
                      )}
                    </span>
                  )}
                </label>
                <div className="relative">
                  <Lock className={`w-4 h-4 absolute left-3.5 top-3.5 transition ${
                    isConfirmMatch ? "text-emerald-600" : isConfirmMismatch ? "text-rose-500" : "text-[#64748B]"
                  }`} />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Retype password to confirm"
                    className={`w-full bg-[#F8FAFC] border rounded-xl py-2.5 pl-10 pr-10 text-xs text-[#172033] focus:bg-white outline-none transition ${
                      isConfirmMatch
                        ? "border-emerald-400 focus:border-emerald-500"
                        : isConfirmMismatch
                        ? "border-rose-400 focus:border-rose-500 bg-rose-50/20"
                        : "border-[#E5EAF2] focus:border-[#2457E6]"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3 text-[#94A3B8] hover:text-[#172033] transition"
                    title={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-2 py-3 bg-[#2457E6] hover:bg-[#1d46be] text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center justify-center gap-1.5"
              >
                <span>Continue to Step 2: Verification & Address</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* STEP 2: NIC & Delivery Address */}
          {step === 2 && (
            <form onSubmit={handleStep2Validation} className="space-y-4 animate-in fade-in duration-200">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#172033] flex items-center justify-between">
                  <span>National Identity Card (NIC) / Passport *</span>
                  <span className="text-[10px] text-[#16B8A6] font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    Verified Trust Status
                  </span>
                </label>
                <input
                  type="text"
                  required
                  value={nic}
                  onChange={(e) => setNic(e.target.value)}
                  placeholder="e.g. 199428102941 or 942810294V"
                  className="w-full bg-[#F8FAFC] border border-[#E5EAF2] rounded-xl p-2.5 text-xs text-[#172033] focus:border-[#2457E6] focus:bg-white outline-none font-mono transition"
                />
                <span className="text-[11px] text-[#64748B]">Required under Sri Lankan e-commerce & auction marketplace regulations.</span>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#172033]">Primary District *</label>
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full bg-[#F8FAFC] border border-[#E5EAF2] rounded-xl p-2.5 text-xs text-[#172033] focus:border-[#2457E6] focus:bg-white outline-none transition"
                >
                  {SRI_LANKAN_DISTRICTS.map((d) => (
                    <option key={d} value={d}>
                      {d} District
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#172033]">Delivery & Dispatch Address</label>
                <textarea
                  rows={3}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. No. 42/B, Ward Place, Colombo 07"
                  className="w-full bg-[#F8FAFC] border border-[#E5EAF2] rounded-xl p-2.5 text-xs text-[#172033] focus:border-[#2457E6] focus:bg-white outline-none leading-relaxed transition"
                ></textarea>
                <span className="text-[11px] text-[#64748B]">Used by courier partners to deliver won items or pick up consigned lots.</span>
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2.5 bg-[#F8FAFC] hover:bg-slate-200 text-[#172033] text-xs font-bold rounded-xl transition"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#2457E6] hover:bg-[#1d46be] text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center justify-center gap-1.5"
                >
                  <span>Continue to Step 3: Payout Details</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: Seller Payout Bank Details */}
          {step === 3 && (
            <form onSubmit={handleCompleteRegistration} className="space-y-4 animate-in fade-in duration-200">
              <div className="p-3 bg-[#EEF3FF] border border-[#2457E6]/20 rounded-2xl text-xs text-[#172033] space-y-1">
                <strong className="text-[#2457E6] flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5" />
                  All-in-One Dual Buyer & Seller Power
                </strong>
                <p className="text-[11px] text-[#64748B] leading-relaxed">
                  Every BIDME account can immediately list items for auction and receive 95% net bank payouts directly into their Sri Lankan bank account upon 48-hour buyer inspection approval.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#172033] flex items-center justify-between">
                  <span>Store or Consignor Display Name</span>
                  <span className="text-[10px] text-[#64748B] font-normal">Optional (defaults to your name)</span>
                </label>
                <div className="relative">
                  <Store className="w-4 h-4 text-[#64748B] absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    placeholder={`e.g. ${name ? `${name}'s Curated Vault` : "Heritage Watches & Gems"}`}
                    className="w-full bg-[#F8FAFC] border border-[#E5EAF2] rounded-xl py-2.5 pl-10 pr-3 text-xs text-[#172033] focus:border-[#2457E6] focus:bg-white outline-none transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#172033]">Bank Name</label>
                  <select
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    className="w-full bg-[#F8FAFC] border border-[#E5EAF2] rounded-xl p-2.5 text-xs text-[#172033] focus:border-[#2457E6] focus:bg-white outline-none transition"
                  >
                    <option value="Commercial Bank of Ceylon">Commercial Bank of Ceylon</option>
                    <option value="Sampath Bank">Sampath Bank</option>
                    <option value="Bank of Ceylon">Bank of Ceylon (BOC)</option>
                    <option value="Hatton National Bank">Hatton National Bank (HNB)</option>
                    <option value="Nations Trust Bank">Nations Trust Bank (NTB)</option>
                    <option value="Seylan Bank">Seylan Bank</option>
                    <option value="DFCC Bank">DFCC Bank</option>
                    <option value="National Development Bank">NDB Bank</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#172033]">Branch Name</label>
                  <input
                    type="text"
                    value={bankBranch}
                    onChange={(e) => setBankBranch(e.target.value)}
                    placeholder="e.g. Colombo Main / Kandy"
                    className="w-full bg-[#F8FAFC] border border-[#E5EAF2] rounded-xl p-2.5 text-xs text-[#172033] focus:border-[#2457E6] focus:bg-white outline-none transition"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#172033]">Bank Account Number</label>
                <div className="relative">
                  <CreditCard className="w-4 h-4 text-[#64748B] absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    value={bankAccount}
                    onChange={(e) => setBankAccount(e.target.value)}
                    placeholder="e.g. 8009124810"
                    className="w-full bg-[#F8FAFC] border border-[#E5EAF2] rounded-xl py-2.5 pl-10 pr-3 text-xs text-[#172033] focus:border-[#2457E6] focus:bg-white outline-none font-mono transition"
                  />
                </div>
                <span className="text-[11px] text-[#64748B]">Can also be added or edited later in Account Settings.</span>
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-4 py-3 bg-[#F8FAFC] hover:bg-slate-200 text-[#172033] text-xs font-bold rounded-xl transition"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 py-3 bg-[#2457E6] hover:bg-[#1d46be] text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>{isLoading ? "Registering & Activating Account..." : "Complete & Activate All-in-One Account"}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      ) : (
        /* EXISTING MEMBER SIGN IN FORM */
        <div className="bg-white border border-[#E5EAF2] rounded-3xl p-6 sm:p-8 space-y-5 shadow-[0_4px_24px_rgb(0,0,0,0.03)]">
          <form onSubmit={handleQuickLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#172033]">Email Address or Mobile Number</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#64748B] absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  value={loginIdentifier}
                  onChange={(e) => setLoginIdentifier(e.target.value)}
                  placeholder="e.g. you@example.com or +94 77 123 4567"
                  className="w-full bg-[#F8FAFC] border border-[#E5EAF2] rounded-xl py-2.5 pl-10 pr-3 text-xs text-[#172033] focus:border-[#2457E6] focus:bg-white outline-none transition"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#172033]">Password</label>
                <a href="#" className="text-[11px] text-[#2457E6] hover:underline font-semibold">Forgot password?</a>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#64748B] absolute left-3.5 top-3.5" />
                <input
                  type={showLoginPassword ? "text" : "password"}
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full bg-[#F8FAFC] border border-[#E5EAF2] rounded-xl py-2.5 pl-10 pr-10 text-xs text-[#172033] focus:border-[#2457E6] focus:bg-white outline-none transition"
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  className="absolute right-3 top-3 text-[#94A3B8] hover:text-[#172033] transition"
                  title={showLoginPassword ? "Hide password" : "Show password"}
                >
                  {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs py-1">
              <label className="flex items-center gap-2 cursor-pointer text-[#64748B]">
                <input type="checkbox" defaultChecked className="rounded text-[#2457E6]" />
                <span>Keep me signed in</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-[#2457E6] hover:bg-[#1d46be] text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <KeyRound className="w-4 h-4" />
              <span>{isLoading ? "Signing In..." : "Sign In to BIDME Hub"}</span>
            </button>
          </form>

          {/* Quick Demo Logins */}
          <div className="pt-4 border-t border-[#F1F5F9] space-y-2">
            <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block">Quick Switch Demo Accounts</span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => {
                  setLoginIdentifier("kasun.buyer@example.com");
                  setLoginPassword("Pass@1234");
                }}
                className="p-2 rounded-xl bg-[#F8FAFC] hover:bg-slate-100 text-[#172033] font-semibold text-left transition truncate"
              >
                Kasun (Seller/Buyer)
              </button>
              <button
                type="button"
                onClick={() => {
                  setLoginIdentifier("dilshan.seller@example.com");
                  setLoginPassword("Pass@1234");
                }}
                className="p-2 rounded-xl bg-[#F8FAFC] hover:bg-slate-100 text-[#172033] font-semibold text-left transition truncate"
              >
                Dilshan Tech Hub
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Trust & Guarantee Badges */}
      <div className="grid grid-cols-3 gap-3 text-center pt-2">
        <div className="p-2.5 rounded-2xl bg-white border border-[#E5EAF2]">
          <ShieldCheck className="w-4 h-4 text-[#16B8A6] mx-auto mb-1" />
          <span className="text-[10px] font-bold text-[#172033] block">NIC Verified</span>
          <span className="text-[9px] text-[#64748B]">Sri Lankan Identity</span>
        </div>
        <div className="p-2.5 rounded-2xl bg-white border border-[#E5EAF2]">
          <Layers className="w-4 h-4 text-[#2457E6] mx-auto mb-1" />
          <span className="text-[10px] font-bold text-[#172033] block">All-in-One</span>
          <span className="text-[9px] text-[#64748B]">Bid & Sell Unified</span>
        </div>
        <div className="p-2.5 rounded-2xl bg-white border border-[#E5EAF2]">
          <CreditCard className="w-4 h-4 text-amber-500 mx-auto mb-1" />
          <span className="text-[10px] font-bold text-[#172033] block">Direct Payouts</span>
          <span className="text-[9px] text-[#64748B]">95% to your Bank</span>
        </div>
      </div>

      {/* GOOGLE ACCOUNT CHOOSER MODAL */}
      {isGoogleModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="max-w-md w-full bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-[#E5EAF2] space-y-5 animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-white border border-[#E5EAF2] shadow-sm mx-auto flex items-center justify-center">
                <GoogleIcon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-[#172033]">Sign in with Google</h3>
              <p className="text-xs text-[#64748B]">
                Choose an account to continue to <span className="font-bold text-[#2457E6]">BIDME Auctions</span>
              </p>
            </div>

            {/* Account List */}
            <div className="space-y-2">
              {/* Quick Option 1: Kasun Demo Google Account */}
              <button
                type="button"
                onClick={() =>
                  handleGoogleAuth({
                    email: "kasun.jayasuriya@gmail.com",
                    name: "Kasun Jayasuriya",
                    googleId: "goog_10829148201",
                    avatarUrl:
                      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
                  })
                }
                disabled={isGoogleLoading}
                className="w-full flex items-center gap-3 p-3 rounded-2xl border border-[#E5EAF2] hover:border-[#2457E6]/40 hover:bg-[#F8FAFC] transition text-left group"
              >
                <div className="w-10 h-10 rounded-full bg-[#2457E6] text-white flex items-center justify-center font-bold text-sm shrink-0">
                  K
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-xs text-[#172033] group-hover:text-[#2457E6] truncate">
                    Kasun Jayasuriya
                  </div>
                  <div className="text-[11px] text-[#64748B] truncate">
                    kasun.jayasuriya@gmail.com
                  </div>
                </div>
                <span className="text-[10px] font-semibold text-[#16B8A6] bg-[#E8FAF7] px-2 py-0.5 rounded-full shrink-0">
                  1-Click
                </span>
              </button>

              {/* Quick Option 2: Enter Any Google Email */}
              {!isGoogleCustomActive ? (
                <button
                  type="button"
                  onClick={() => setIsGoogleCustomActive(true)}
                  className="w-full flex items-center gap-3 p-3 rounded-2xl border border-[#E5EAF2] hover:border-slate-300 hover:bg-[#F8FAFC] transition text-left"
                >
                  <div className="w-10 h-10 rounded-full bg-slate-100 text-[#64748B] flex items-center justify-center shrink-0">
                    <Plus className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-xs text-[#172033]">Use another Google account</div>
                    <div className="text-[11px] text-[#64748B]">Enter your own Gmail address</div>
                  </div>
                </button>
              ) : (
                <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E5EAF2] space-y-3 animate-in fade-in duration-150">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-[#172033]">Your Gmail Address *</label>
                    <input
                      type="email"
                      required
                      value={googleCustomEmail}
                      onChange={(e) => setGoogleCustomEmail(e.target.value)}
                      placeholder="e.g. yourname@gmail.com"
                      className="w-full bg-white border border-[#E5EAF2] rounded-xl p-2.5 text-xs text-[#172033] focus:border-[#2457E6] outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-[#172033]">Your Display Name</label>
                    <input
                      type="text"
                      value={googleCustomName}
                      onChange={(e) => setGoogleCustomName(e.target.value)}
                      placeholder="e.g. Ruwan Perera"
                      className="w-full bg-white border border-[#E5EAF2] rounded-xl p-2.5 text-xs text-[#172033] focus:border-[#2457E6] outline-none"
                    />
                  </div>

                  <button
                    type="button"
                    disabled={isGoogleLoading || !googleCustomEmail.includes("@")}
                    onClick={() =>
                      handleGoogleAuth({
                        email: googleCustomEmail.trim(),
                        name: googleCustomName.trim() || undefined,
                        googleId: `goog_${Date.now()}`,
                      })
                    }
                    className="w-full py-2.5 bg-[#2457E6] hover:bg-[#1d46be] text-white font-bold text-xs rounded-xl shadow-sm transition disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <span>{isGoogleLoading ? "Connecting..." : "Continue to BIDME"}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* Security note & Close */}
            <div className="pt-2 text-center space-y-3">
              <p className="text-[10px] text-[#94A3B8] leading-tight">
                To continue, Google will share your name, email address, language preference, and profile picture with BIDME.
              </p>
              <button
                type="button"
                onClick={() => {
                  setIsGoogleModalOpen(false);
                  setIsGoogleCustomActive(false);
                }}
                className="w-full py-2 text-xs font-semibold text-[#64748B] hover:text-[#172033] transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
