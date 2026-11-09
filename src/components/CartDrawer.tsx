"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Trophy, 
  X, 
  Trash2, 
  Heart, 
  ArrowRight, 
  ShieldCheck, 
  CreditCard,
  Truck,
  CheckCircle,
  AlertCircle,
  Clock,
  Gavel
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { formatLKR } from "@/lib/utils";

export function CartDrawer() {
  const { 
    cart, 
    isCartOpen, 
    setIsCartOpen, 
    removeFromCart, 
    clearCart,
    currentUser
  } = useApp();

  const [confirmClear, setConfirmClear] = useState(false);
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);

  if (!isCartOpen) return null;

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const deliveryFee = subtotal > 0 ? (subtotal > 200000 ? 0 : 1500) : 0;
  const grandTotal = subtotal + deliveryFee;

  const handleSimulateCheckout = () => {
    setCheckoutSuccess(true);
    setTimeout(() => {
      clearCart();
      setCheckoutModalOpen(false);
      setCheckoutSuccess(false);
      setIsCartOpen(false);
    }, 2200);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden font-sans">
      {/* Darkened Backdrop Overlay */}
      <div 
        onClick={() => setIsCartOpen(false)}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
      />

      {/* Sliding Right Drawer */}
      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
        <aside className="w-screen max-w-md sm:max-w-lg bg-white border-l border-[#E5EAF2] shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300">
          {/* Drawer Header */}
          <div className="p-5 sm:p-6 border-b border-[#E5EAF2] flex items-center justify-between bg-white sticky top-0 z-10">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 border border-amber-200/60 flex items-center justify-center font-bold">
                <Trophy className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-[#172033] flex items-center gap-2">
                  <span>Won Auctions (ජයග්‍රහණය කළ භාණ්ඩ)</span>
                  <span className="text-[11px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                    {cart.length} {cart.length === 1 ? "won lot" : "won lots"}
                  </span>
                </h3>
                <p className="text-[11px] text-[#64748B]">Orders won via highest bid • 48h settlement</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {cart.length > 0 && !confirmClear && (
                <button
                  type="button"
                  onClick={() => setConfirmClear(true)}
                  className="text-[11px] font-semibold text-[#64748B] hover:text-rose-600 px-2.5 py-1 rounded-lg hover:bg-slate-100 transition"
                >
                  Forfeit All
                </button>
              )}

              <button
                type="button"
                onClick={() => setIsCartOpen(false)}
                className="p-2 rounded-full text-[#64748B] hover:text-[#172033] hover:bg-slate-100 transition"
                aria-label="Close drawer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Confirm Clear / Forfeit Banner */}
          {confirmClear && (
            <div className="p-3 bg-rose-50 border-b border-rose-200 flex items-center justify-between text-xs text-rose-700 animate-in fade-in">
              <span className="font-medium">Forfeit your winning bids? This may affect buyer score.</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setConfirmClear(false)}
                  className="px-2.5 py-1 rounded-lg bg-white border border-rose-200 text-rose-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    clearCart();
                    setConfirmClear(false);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-rose-600 text-white font-bold"
                >
                  Confirm
                </button>
              </div>
            </div>
          )}

          {/* Won Items List / Empty State */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
            {cart.length > 0 ? (
              cart.map((item) => (
                <div 
                  key={item.id}
                  className="p-4 rounded-2xl bg-[#F5F7FB] border border-[#E5EAF2] space-y-3 relative group transition hover:border-[#2457E6]/40 hover:bg-white"
                >
                  <div className="flex items-start gap-3.5">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-20 h-20 rounded-xl object-cover shrink-0 border border-[#E5EAF2]"
                    />
                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-100 border border-amber-300/40 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Trophy className="w-3 h-3 text-amber-600" />
                          <span>Auction Won</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.id)}
                          className="text-[#64748B] hover:text-rose-600 p-1 rounded-lg hover:bg-slate-200/60 transition"
                          title="Forfeit item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <h4 className="font-extrabold text-xs sm:text-sm text-[#172033] line-clamp-1">
                        {item.title}
                      </h4>
                      <p className="text-[11px] text-[#64748B]">Consignor: {item.sellerName}</p>

                      <div className="flex items-baseline justify-between pt-1">
                        <div>
                          <span className="text-[10px] text-[#64748B] block">Winning Hammer Bid</span>
                          <span className="font-mono-num font-black text-sm text-[#2457E6]">
                            {formatLKR(item.price)}
                          </span>
                        </div>
                        <span className="text-[10px] font-semibold text-[#16B8A6] bg-[#E8FAF7] px-2 py-0.5 rounded-full">
                          Authenticity Guaranteed
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Payment Window Notice */}
                  <div className="p-2.5 rounded-xl bg-amber-50/80 border border-amber-200/50 flex items-center justify-between text-xs text-amber-800">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                      <span>Settlement Window:</span>
                    </span>
                    <span className="font-bold text-[11px] font-mono-num">
                      47h 15m remaining
                    </span>
                  </div>
                </div>
              ))
            ) : (
              /* Auction Won Empty State */
              <div className="py-20 text-center space-y-4">
                <div className="w-20 h-20 rounded-full bg-amber-50 text-amber-500 border border-amber-200/60 flex items-center justify-center mx-auto shadow-inner">
                  <Trophy className="w-10 h-10 stroke-[1.5]" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-lg font-black text-[#172033]">No Won Auctions Awaiting Payment</h4>
                  <p className="text-xs text-[#64748B] max-w-xs mx-auto leading-relaxed">
                    In BIDME, products cannot be bought directly from a cart. You must participate in live auctions and hold the highest bid when the auction closes.
                  </p>
                </div>
                <Link
                  href="/search"
                  onClick={() => setIsCartOpen(false)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#2457E6] hover:bg-[#1d46be] text-white font-bold text-xs rounded-xl shadow-sm transition"
                >
                  <Gavel className="w-3.5 h-3.5" />
                  <span>Explore Live Auctions & Place Bids</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>

          {/* Drawer Footer / Settlement Summary */}
          {cart.length > 0 && (
            <div className="p-5 sm:p-6 border-t border-[#E5EAF2] bg-[#F5F7FB]/70 space-y-4 sticky bottom-0">
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-[#64748B]">
                  <span>Total Winning Bids</span>
                  <span className="font-bold text-[#172033] font-mono-num">{formatLKR(subtotal)}</span>
                </div>
                <div className="flex justify-between text-[#64748B]">
                  <span className="flex items-center gap-1">
                    <Truck className="w-3.5 h-3.5 text-[#2457E6]" />
                    <span>Islandwide Insured Courier Delivery</span>
                  </span>
                  <span className="font-bold text-[#172033] font-mono-num">
                    {deliveryFee === 0 ? "FREE" : formatLKR(deliveryFee)}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-black text-[#172033] pt-2 border-t border-[#E5EAF2]">
                  <span>PayHere Escrow Settlement (LKR)</span>
                  <span className="text-base text-[#2457E6] font-mono-num">{formatLKR(grandTotal)}</span>
                </div>
              </div>

              {/* Escrow Guarantee Pill */}
              <div className="p-2.5 rounded-xl bg-white border border-[#E5EAF2] flex items-center gap-2 text-[11px] text-[#64748B]">
                <ShieldCheck className="w-4 h-4 text-[#16B8A6] shrink-0" />
                <span>PayHere Custodial Escrow locks payment until 48h after safe delivery.</span>
              </div>

              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => setCheckoutModalOpen(true)}
                  className="w-full py-3.5 bg-[#2457E6] hover:bg-[#1d46be] text-white font-black text-xs sm:text-sm rounded-xl shadow-sm hover:scale-[1.01] active:scale-95 transition flex items-center justify-center gap-2"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Proceed to PayHere Settlement</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => setIsCartOpen(false)}
                  className="w-full py-2 bg-transparent hover:bg-slate-100 text-[#64748B] text-xs font-semibold rounded-xl transition"
                >
                  Continue Browsing Auctions
                </button>
              </div>
            </div>
          )}
        </aside>
      </div>

      {/* PayHere Escrow Settlement Modal */}
      {checkoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-[#E5EAF2] rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-[#E5EAF2] pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#EEF3FF] text-[#2457E6] flex items-center justify-center">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-[#172033]">PayHere Custodial Escrow</h3>
                  <p className="text-[10px] text-[#64748B]">Central Bank of Sri Lanka compliant payment</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCheckoutModalOpen(false)}
                className="p-1 rounded-full text-[#64748B] hover:text-[#172033]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {checkoutSuccess ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-[#E8FAF7] text-[#16B8A6] flex items-center justify-center mx-auto">
                  <CheckCircle className="w-8 h-8 animate-bounce" />
                </div>
                <h4 className="font-black text-base text-[#172033]">Winning Bid Settled!</h4>
                <p className="text-xs text-[#64748B] max-w-xs mx-auto leading-relaxed">
                  Your payment is locked in PayHere Custodial Escrow. Consignor has been notified to dispatch the package to your Colombo address.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-3.5 bg-[#F5F7FB] border border-[#E5EAF2] rounded-2xl space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-[#64748B]">Recipient Bidder:</span>
                    <span className="font-bold text-[#172033]">{currentUser?.name || "Kasun Jayasuriya"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#64748B]">Delivery Address:</span>
                    <span className="font-bold text-[#172033]">{currentUser?.address || "Ward Place, Colombo 07"}</span>
                  </div>
                  <div className="flex justify-between border-t border-[#E5EAF2] pt-2 font-bold">
                    <span className="text-[#172033]">Total Due (LKR):</span>
                    <span className="text-[#2457E6] font-mono-num">{formatLKR(grandTotal)}</span>
                  </div>
                </div>

                <div className="p-3 bg-amber-50 border border-amber-200/60 rounded-xl text-[11px] text-amber-800 space-y-1">
                  <strong>48-Hour Inspection Escrow:</strong>
                  <p>Funds will not be released to the consignor until 48 hours after you confirm delivery and authenticity.</p>
                </div>

                <button
                  type="button"
                  onClick={handleSimulateCheckout}
                  className="w-full py-3 bg-[#2457E6] hover:bg-[#1d46be] text-white font-black text-xs rounded-xl shadow-md hover:scale-[1.01] active:scale-95 transition"
                >
                  Pay {formatLKR(grandTotal)} via PayHere / Card / Frimi
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
