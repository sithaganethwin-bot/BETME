import React from "react";
import Link from "next/link";

interface BidmeLogoProps {
  showTagline?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function BidmeLogo({ showTagline = false, className = "", size = "md" }: BidmeLogoProps) {
  const iconSize = size === "sm" ? "w-7 h-7" : size === "lg" ? "w-10 h-10" : "w-8 h-8";
  const textSize = size === "sm" ? "text-base" : size === "lg" ? "text-2xl" : "text-lg";

  return (
    <Link href="/" className={`inline-flex items-center gap-2.5 group shrink-0 ${className}`}>
      {/* Geometric B Symbol with Bidding / Upward Forward-Motion Angle */}
      <div className={`${iconSize} rounded-xl bg-gradient-to-br from-[#2457E6] via-[#1d46be] to-[#16B8A6] p-[2px] shadow-sm group-hover:shadow-md group-hover:scale-105 transition-all duration-200 shrink-0`}>
        <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center p-1 relative overflow-hidden">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full"
          >
            {/* Geometric B Stem */}
            <path
              d="M6 4.5C6 3.67 6.67 3 7.5 3H12.5C14.71 3 16.5 4.57 16.5 6.5C16.5 7.82 15.68 8.97 14.5 9.5C16.16 10.08 17.5 11.52 17.5 13.5C17.5 15.71 15.49 17.5 13 17.5H7.5C6.67 17.5 6 16.83 6 16V4.5Z"
              fill="#2457E6"
            />
            {/* Forward-Motion Upward Bidding Accent Wedge */}
            <path
              d="M10 6.5H12C12.83 6.5 13.5 7.17 13.5 8C13.5 8.83 12.83 9.5 12 9.5H10V6.5Z"
              fill="#FFFFFF"
            />
            <path
              d="M10 11.5H12.5C13.6 11.5 14.5 12.4 14.5 13.5C14.5 14.6 13.6 15.5 12.5 15.5H10V11.5Z"
              fill="#FFFFFF"
            />
            {/* Subtle Forward Angle Gavel/Velocity facet */}
            <path
              d="M14 20L19.5 14.5L21 16L15.5 21.5L14 20Z"
              fill="#16B8A6"
            />
          </svg>
        </div>
      </div>

      {/* Wordmark and Tagline */}
      <div className="flex flex-col">
        <div className="flex items-baseline gap-1">
          <span className={`${textSize} font-black tracking-tight text-[#172033] dark:text-white`}>
            BID<span className="text-[#2457E6]">ME</span>
          </span>
          <span className="text-[10px] font-black tracking-widest text-[#16B8A6] uppercase">
            LK
          </span>
        </div>
        {showTagline && (
          <span className="text-[10px] font-medium text-[#64748B] -mt-0.5 tracking-tight">
            Bid Smart. Own More.
          </span>
        )}
      </div>
    </Link>
  );
}

export const BitmeLogo = BidmeLogo;
