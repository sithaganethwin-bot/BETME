import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatLKR(amount: number): string {
  const formatted = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
  return `Rs. ${formatted}`;
}

export function calculateBidIncrement(currentBid: number): number {
  if (currentBid <= 10000) return 100;
  if (currentBid <= 50000) return 500;
  if (currentBid <= 100000) return 1000;
  if (currentBid <= 500000) return 2500;
  return 5000;
}

export function formatTimeRemaining(endsAt: Date | string): {
  totalSeconds: number;
  hours: number;
  minutes: number;
  seconds: number;
  formatted: string;
  isEndingSoon: boolean;
  hasEnded: boolean;
} {
  const target = new Date(endsAt).getTime();
  const now = Date.now();
  const diff = target - now;

  if (diff <= 0) {
    return {
      totalSeconds: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      formatted: "Ended",
      isEndingSoon: false,
      hasEnded: true,
    };
  }

  const totalSeconds = Math.floor(diff / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (n: number) => n.toString().padStart(2, "0");
  const formatted = `${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s`;

  return {
    totalSeconds,
    hours,
    minutes,
    seconds,
    formatted,
    isEndingSoon: totalSeconds < 300, // less than 5 minutes
    hasEnded: false,
  };
}
