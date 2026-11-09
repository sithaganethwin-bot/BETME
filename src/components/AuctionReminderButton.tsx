"use client";

import React, { useState, useEffect, useRef } from "react";
import { Bell, BellRing, Check, Clock, Volume2, VolumeX } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { playSoftChime, isSoundMuted, setSoundMuted } from "@/lib/sound-alerts";

interface AuctionReminderButtonProps {
  auctionId: string;
  auctionTitle: string;
  endsAt: Date | string;
  className?: string;
  variant?: "icon" | "full";
}

export function AuctionReminderButton({
  auctionId,
  auctionTitle,
  endsAt,
  className = "",
  variant = "icon",
}: AuctionReminderButtonProps) {
  const { currentUser, addNotification } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [activeReminders, setActiveReminders] = useState<number[]>([]);
  const [soundMuted, setSoundMutedState] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSoundMutedState(isSoundMuted());
  }, []);

  // Load user's active reminders for this auction
  useEffect(() => {
    if (!currentUser?.id || !auctionId) return;

    fetch(`/api/auctions/${auctionId}/reminders?userId=${currentUser.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.reminders) {
          setActiveReminders(data.reminders.map((r: any) => r.minutesBefore));
        }
      })
      .catch(() => {});
  }, [auctionId, currentUser?.id]);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggleReminder = async (minutes: number) => {
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "default") {
        await Notification.requestPermission();
      }
    }

    try {
      const res = await fetch(`/api/auctions/${auctionId}/reminders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser?.id || "usr_buyer_101",
          minutesBefore: minutes,
        }),
      });

      const data = await res.json();
      if (data.success) {
        if (data.action === "created") {
          setActiveReminders((prev) => [...prev, minutes]);
          playSoftChime();
          addNotification(`🔔 Reminder set: We'll alert you ${minutes}m before "${auctionTitle}" ends.`);
        } else {
          setActiveReminders((prev) => prev.filter((m) => m !== minutes));
          addNotification(`Reminder disabled for "${auctionTitle}".`);
        }
      }
    } catch (e) {
      console.error("Failed to toggle reminder:", e);
    }
  };

  const handleToggleSound = () => {
    const next = !soundMuted;
    setSoundMutedState(next);
    setSoundMuted(next);
    if (!next) {
      playSoftChime();
    }
  };

  const hasAnyReminder = activeReminders.length > 0;

  return (
    <div ref={dropdownRef} className={`relative inline-block ${className}`}>
      {variant === "icon" ? (
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`p-2 rounded-full backdrop-blur-md transition shadow-xs ${
            hasAnyReminder
              ? "bg-[#2457E6] text-white"
              : "bg-white/90 dark:bg-slate-800/90 text-[#64748B] hover:text-[#2457E6] hover:bg-white"
          }`}
          title={hasAnyReminder ? "Auction Alerts Active" : "Set Auction Reminder"}
          aria-label="Set Auction Alert"
        >
          {hasAnyReminder ? (
            <BellRing className="w-4 h-4 animate-bounce-subtle" />
          ) : (
            <Bell className="w-4 h-4" />
          )}
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border ${
            hasAnyReminder
              ? "bg-[#2457E6] text-white border-[#2457E6] shadow-sm"
              : "bg-white dark:bg-slate-800 text-[#172033] dark:text-slate-200 border-[#E5EAF2] dark:border-slate-700 hover:border-[#2457E6]/40"
          }`}
        >
          {hasAnyReminder ? <BellRing className="w-3.5 h-3.5" /> : <Bell className="w-3.5 h-3.5 text-[#64748B]" />}
          <span>{hasAnyReminder ? "Alert Set" : "Notify Me"}</span>
        </button>
      )}

      {/* Popover Menu */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-[#131B2B] border border-[#E5EAF2] dark:border-slate-800 rounded-2xl shadow-xl p-3 z-50 text-xs animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="flex items-center justify-between pb-2 border-b border-[#E5EAF2] dark:border-slate-800">
            <span className="font-bold text-[#172033] dark:text-[#F8FAFC]">Auction Reminders</span>
            <button
              type="button"
              onClick={handleToggleSound}
              className="p-1 rounded text-[#64748B] hover:text-[#2457E6]"
              title={soundMuted ? "Unmute Chimes" : "Mute Chimes"}
            >
              {soundMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-[#16B8A6]" />}
            </button>
          </div>

          <div className="space-y-1.5 py-2">
            <button
              type="button"
              onClick={() => handleToggleReminder(5)}
              className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition ${
                activeReminders.includes(5)
                  ? "bg-[#EEF3FF] dark:bg-blue-950/40 text-[#2457E6] font-bold"
                  : "hover:bg-[#F5F7FB] dark:hover:bg-slate-800 text-[#172033] dark:text-slate-200"
              }`}
            >
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 shrink-0" />
                <span>5 minutes before close</span>
              </div>
              {activeReminders.includes(5) && <Check className="w-4 h-4 text-[#2457E6]" />}
            </button>

            <button
              type="button"
              onClick={() => handleToggleReminder(2)}
              className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition ${
                activeReminders.includes(2)
                  ? "bg-[#EEF3FF] dark:bg-blue-950/40 text-[#2457E6] font-bold"
                  : "hover:bg-[#F5F7FB] dark:hover:bg-slate-800 text-[#172033] dark:text-slate-200"
              }`}
            >
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 shrink-0 text-rose-500" />
                <span>2 minutes before close (Final)</span>
              </div>
              {activeReminders.includes(2) && <Check className="w-4 h-4 text-[#2457E6]" />}
            </button>
          </div>

          <p className="text-[10px] text-[#64748B] dark:text-slate-400 border-t border-[#E5EAF2] dark:border-slate-800 pt-2 leading-tight">
            Browser & in-app alerts ensure you never miss out on last-minute anti-sniping opportunities.
          </p>
        </div>
      )}
    </div>
  );
}
