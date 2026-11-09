"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { BIDMEAIWidget } from "@/components/BITMEAIWidget";
import { CartDrawer } from "@/components/CartDrawer";
import { FavoritesDrawer } from "@/components/FavoritesDrawer";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin");
  const isAuthRoute = pathname === "/auth" || pathname?.startsWith("/auth");

  if (isAdminRoute) {
    // Completely isolated Admin Command Center environment
    return (
      <div className="min-h-screen bg-[#0B0F17] text-[#E2E8F0] antialiased">
        {children}
      </div>
    );
  }

  if (isAuthRoute) {
    // Dedicated clean auth layout (Login & Registration) without marketplace top bar
    return (
      <div className="min-h-screen flex flex-col justify-between bg-[#F5F7FB] dark:bg-[#0B0F17] text-[#172033] dark:text-[#F8FAFC]">
        <main className="flex-1 w-full max-w-xl mx-auto px-4 py-8 sm:py-12 flex flex-col justify-center">
          {children}
        </main>
        <footer className="py-6 text-center text-xs text-[#64748B] dark:text-slate-500 border-t border-[#E5EAF2] dark:border-slate-800/80">
          <p>© {new Date().getFullYear()} BIDME Sri Lanka. Secure Escrow & Anti-Sniping Auction Platform.</p>
        </footer>
      </div>
    );
  }

  // Consumer Marketplace environment
  return (
    <>
      <Navbar />
      <CartDrawer />
      <FavoritesDrawer />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 pb-12">
        {children}
      </main>
      <Footer />
      <BIDMEAIWidget />
    </>
  );
}
