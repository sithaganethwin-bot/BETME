import React from "react";
import Link from "next/link";
import { ShieldCheck, CreditCard, Truck, Gavel } from "lucide-react";
import { BidmeLogo } from "./BitmeLogo";

export function Footer() {
  return (
    <footer className="bg-white text-[#64748B] text-xs border-t border-[#E5EAF2] mt-20">
      {/* 3 Core Trust Badges */}
      <div className="border-b border-[#E5EAF2] py-8 px-4 sm:px-8 bg-[#F5F7FB]/50">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#EEF3FF] border border-[#2457E6]/20 flex items-center justify-center text-[#2457E6] shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-[#172033] font-bold text-xs">Anti-Sniping Fair Bidding</h4>
              <p className="text-[11px] text-[#64748B]">Automatic +2 min soft close extension on last-second bids.</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#E8FAF7] border border-[#16B8A6]/20 flex items-center justify-center text-[#16B8A6] shrink-0">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-[#172033] font-bold text-xs">PayHere Escrow Safety</h4>
              <p className="text-[11px] text-[#64748B]">Winning funds held securely in custodial escrow until delivery.</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#EEF3FF] border border-[#2457E6]/20 flex items-center justify-center text-[#2457E6] shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-[#172033] font-bold text-xs">Islandwide 25 Districts</h4>
              <p className="text-[11px] text-[#64748B]">Tracked insured courier dispatch & verified personal handovers.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <BidmeLogo size="md" showTagline={true} />
        </div>

        <div className="flex flex-wrap items-center gap-6 text-xs text-[#64748B]">
          <Link href="/search" className="hover:text-[#2457E6] transition">Explore Auctions</Link>
          <Link href="/seller/new" className="hover:text-[#2457E6] transition">Sell on BIDME</Link>
          <Link href="/dashboard?mode=buying" className="hover:text-[#2457E6] transition">Bidding Arena</Link>
          <Link href="/dashboard?mode=selling" className="hover:text-[#2457E6] transition">Consignor Studio</Link>
          <Link href="/messages" className="hover:text-[#2457E6] transition">Concierge & Disputes</Link>
          <Link href="/auth" className="hover:text-[#2457E6] transition">Member Sign In</Link>
        </div>
      </div>

      {/* Bottom Copyright & Disclaimer */}
      <div className="border-t border-[#E5EAF2] py-5 px-4 sm:px-8 text-center text-[11px] text-[#64748B] flex flex-col sm:flex-row items-center justify-between max-w-7xl mx-auto gap-2">
        <span>&copy; {new Date().getFullYear()} BIDME. All rights reserved. Sri Lanka&apos;s Modern Online Auction Marketplace.</span>
        <span className="text-[#64748B]">Bid Smart. Own More.</span>
      </div>
    </footer>
  );
}
