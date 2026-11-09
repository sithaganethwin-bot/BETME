"use client";

import React, { useState, useEffect } from "react";
import { Clock, AlertTriangle } from "lucide-react";
import { globalTimer, TimerBreakdown } from "@/lib/timer-engine";

interface AuctionCountdownProps {
  auctionId: string;
  endsAt: Date | string | number;
  startsAt?: Date | string | number;
  className?: string;
  variant?: "pill" | "banner" | "plain" | "digits";
  showMilliseconds?: boolean;
}

export function AuctionCountdown({
  auctionId,
  endsAt,
  startsAt,
  className = "",
  variant = "pill",
  showMilliseconds = true,
}: AuctionCountdownProps) {
  const [state, setState] = useState<TimerBreakdown>(() => {
    return globalTimer.calculate(
      Date.now(),
      new Date(endsAt).getTime(),
      startsAt ? new Date(startsAt).getTime() : 0
    );
  });

  useEffect(() => {
    const unsubscribe = globalTimer.subscribe(auctionId, endsAt, setState, startsAt);
    return () => unsubscribe();
  }, [auctionId, endsAt, startsAt]);

  const pad = (n: number) => n.toString().padStart(2, "0");
  const padMs = (n: number) => n.toString().padStart(3, "0");

  if (state.hasEnded) {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-[#64748B] dark:bg-slate-800 dark:text-slate-400 ${className}`}>
        <Clock className="w-3.5 h-3.5" />
        <span>Auction Ended</span>
      </span>
    );
  }

  if (state.isScheduled) {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-[#2457E6] dark:bg-blue-950/50 dark:text-blue-400 border border-blue-200 dark:border-blue-900 ${className}`}>
        <Clock className="w-3.5 h-3.5" />
        <span>Starts Soon</span>
      </span>
    );
  }

  // 1. Digits Variant (Large high-precision display for quick peek drawer or detail)
  if (variant === "digits") {
    return (
      <div className={`font-mono-num inline-flex items-center gap-1 sm:gap-2 text-xs sm:text-sm font-black ${
        state.isUrgent
          ? "text-rose-600 animate-pulse"
          : state.isEndingSoon
          ? "text-amber-600"
          : "text-[#172033] dark:text-[#F8FAFC]"
      } ${className}`}>
        {state.days > 0 && (
          <span className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
            {state.days}d
          </span>
        )}
        <span className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
          {pad(state.hours)}h
        </span>
        <span className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
          {pad(state.minutes)}m
        </span>
        <span className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
          {pad(state.seconds)}s
        </span>
        {state.isEndingSoon && showMilliseconds && (
          <span className="bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 px-1.5 py-0.5 rounded text-[10px]">
            {padMs(state.milliseconds)}ms
          </span>
        )}
      </div>
    );
  }

  // 2. Banner Variant
  if (variant === "banner") {
    return (
      <div className={`p-2.5 rounded-2xl flex items-center justify-between text-xs font-bold border transition ${
        state.isUrgent
          ? "bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-950/40 dark:border-rose-900 dark:text-rose-300"
          : state.isEndingSoon
          ? "bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-950/40 dark:border-amber-900 dark:text-amber-300"
          : "bg-[#F5F7FB] border-[#E5EAF2] text-[#172033] dark:bg-slate-800/80 dark:border-slate-700 dark:text-slate-200"
      } ${className}`}>
        <div className="flex items-center gap-1.5">
          {state.isUrgent ? (
            <AlertTriangle className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
          ) : (
            <Clock className="w-3.5 h-3.5 text-[#2457E6]" />
          )}
          <span>{state.isUrgent ? "Ending Dangerously Soon!" : state.isEndingSoon ? "Ending Soon" : "Time Remaining"}</span>
        </div>
        <span className="font-mono-num font-black tracking-tight">
          {state.formatted}
        </span>
      </div>
    );
  }

  // 3. Plain Variant (plain text)
  if (variant === "plain") {
    return (
      <span className={`font-mono-num font-bold ${
        state.isUrgent ? "text-rose-600 animate-pulse" : state.isEndingSoon ? "text-amber-600" : "text-[#172033] dark:text-[#F8FAFC]"
      } ${className}`}>
        {state.formatted}
      </span>
    );
  }

  // 4. Default Pill Variant (Used on auction cards)
  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border backdrop-blur-md shadow-xs transition ${
        state.isUrgent
          ? "bg-rose-50/95 border-rose-300 text-rose-700 dark:bg-rose-950/80 dark:border-rose-800 dark:text-rose-300"
          : state.isEndingSoon
          ? "bg-amber-50/95 border-amber-300 text-amber-800 dark:bg-amber-950/80 dark:border-amber-800 dark:text-amber-300"
          : "bg-white/95 border-[#E5EAF2] text-[#172033] dark:bg-slate-900/90 dark:border-slate-700 dark:text-slate-200"
      } ${className}`}
    >
      <Clock className={`w-3.5 h-3.5 shrink-0 ${state.isUrgent ? "text-rose-600 animate-pulse" : "text-[#2457E6]"}`} />
      <span className="font-mono-num tracking-tight font-black">
        {state.formatted}
      </span>
    </div>
  );
}
