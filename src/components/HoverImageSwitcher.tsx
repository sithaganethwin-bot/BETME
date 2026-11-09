"use client";

import React, { useState, useRef, useEffect } from "react";

export interface HoverImageSwitcherProps {
  images: string[];
  alt: string;
  aspectRatio?: string;
  className?: string;
  children?: React.ReactNode;
  showIndicators?: boolean;
}

export function HoverImageSwitcher({
  images,
  alt,
  aspectRatio = "aspect-[4/3]",
  className = "",
  children,
  showIndicators = true,
}: HoverImageSwitcherProps) {
  const safeImages = images && images.length > 0
    ? images
    : ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80"];

  const [activeIdx, setActiveIdx] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-cycle through images while hovered
  const handleMouseEnter = () => {
    setIsHovered(true);
    if (safeImages.length > 1) {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setActiveIdx((prev) => (prev + 1) % safeImages.length);
      }, 1200);
    }
  };

  // Allow horizontal scrubbing across photos with mouse movement
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (safeImages.length <= 1) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, e.clientX - rect.left);
    const segmentWidth = rect.width / safeImages.length;
    const target = Math.min(Math.floor(x / segmentWidth), safeImages.length - 1);

    if (target !== activeIdx) {
      setActiveIdx(target);
    }

    // Refresh interval so it doesn't jump immediately after moving
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setActiveIdx((prev) => (prev + 1) % safeImages.length);
      }, 1400);
    }
  };

  // Reset back to primary photo when mouse leaves
  const handleMouseLeave = () => {
    setIsHovered(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setActiveIdx(0);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  return (
    <div
      className={`relative ${aspectRatio} w-full overflow-hidden bg-slate-100 dark:bg-slate-800 select-none cursor-pointer ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Stacked Images with crossfade animation */}
      {safeImages.map((src, i) => (
        <img
          key={src + i}
          src={src}
          alt={`${alt} - view ${i + 1}`}
          loading={i === 0 ? "eager" : "lazy"}
          decoding="async"
          className={`absolute inset-0 w-full h-full object-cover transition-all duration-500 ${
            i === activeIdx
              ? "opacity-100 scale-105 z-0"
              : "opacity-0 scale-100 pointer-events-none -z-10"
          }`}
        />
      ))}

      {/* Multi-Photo Indicator Bars/Dots */}
      {showIndicators && safeImages.length > 1 && (
        <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20 pointer-events-none px-2 py-0.5 rounded-full bg-slate-900/40 backdrop-blur-sm transition-opacity duration-200">
          {safeImages.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === activeIdx
                  ? "w-4 bg-white shadow-xs"
                  : "w-1.5 bg-white/40"
              }`}
            />
          ))}
        </div>
      )}

      {/* Photo Counter Pill (e.g. 1/4) on Hover */}
      {safeImages.length > 1 && isHovered && (
        <span className="absolute bottom-2.5 right-2.5 z-20 bg-slate-900/75 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-md pointer-events-none animate-in fade-in duration-150">
          {activeIdx + 1}/{safeImages.length}
        </span>
      )}

      {/* Overlays / Children (Badges, Buttons) */}
      {children}
    </div>
  );
}
