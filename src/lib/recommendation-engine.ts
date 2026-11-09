"use client";

/**
 * ============================================================================
 * BIDME Business-Driven Algorithmic Retention & Personalization Engine
 * ============================================================================
 * Engineered for maximum user session duration, deep engagement, and purchase desire:
 * 1. Implicit Behavioral Profiling:
 *    - Captures search terms, category navigation, view dwell times, quick peeks, bids.
 * 2. Desire & Aspiration Scoring (The "Hook & Craving" Index):
 *    - Automatically interweaves high-desire luxury lots (Watches, Supercars, Fine Gems,
 *      Cinema Cameras, Rare Collectibles) so users are captivated by aspirational items
 *      even when they initially searched for everyday gadgets.
 * 3. Deal Momentum & FOMO Urgency:
 *    - Boosts active auctions nearing their countdown deadline with high bid velocity.
 * 4. Micro-Serendipity Feed Refresh:
 *    - Subtle dynamic variance so every visit feels fresh, exciting, and discovery-packed.
 * 5. High-Converting Engagement Badges:
 *    - "🔥 98% Match", "💎 High Demand Pick", "⚡ Rare Opportunity", "✨ Curated Deal".
 */

export type UserSignalType =
  | "SEARCH"
  | "CATEGORY_CLICK"
  | "VIEW_DETAIL"
  | "QUICK_PEEK"
  | "DWELL"
  | "FAVORITE"
  | "REMINDER"
  | "BID"
  | "BUY_NOW_INTENT";

// Behavioral signal weights (implicit + explicit)
export const SIGNAL_WEIGHTS: Record<UserSignalType, number> = {
  SEARCH: 8,
  CATEGORY_CLICK: 4,
  VIEW_DETAIL: 5,
  QUICK_PEEK: 7,
  DWELL: 8,
  FAVORITE: 10,
  REMINDER: 12,
  BID: 20,
  BUY_NOW_INTENT: 15,
};

// High-Desire / Aspirational Categories that naturally captivate users and drive dwell time
const ASPIRATIONAL_CATEGORIES: Record<string, number> = {
  watches: 18,      // Luxury horology (Rolex, Patek, Omega)
  vehicles: 16,     // Supercars, classic vintage, GT3
  gems: 15,         // Royal blue sapphires, rubies
  cameras: 14,      // High-end cinema gear & lenses
  antiques: 12,     // Rare historical heirlooms & art
  fashion: 12,      // Hermès, Chanel, designer luxury
  collectibles: 14, // Rare coins, bullion, signed memorabilia
  computers: 10,    // High-end gaming rigs & MacBooks
};

export interface TasteProfile {
  version: number;
  categoryAffinities: Record<string, number>;
  keywordAffinities: Record<string, number>;
  priceHistory: number[];
  districtAffinities: Record<string, number>;
  viewedAuctionIds: string[];
  recentSearches: string[];
  totalInteractions: number;
  lastUpdated: number;
}

export interface RecommendationMatch {
  auctionId: string;
  score: number;
  matchPercentage: number;
  matchReason: string;
  badgeLabel: string;
  isAspirationalHook: boolean;
}

const STORAGE_KEY = "bidme_engine_taste_vector_v2";

const DEFAULT_PROFILE: TasteProfile = {
  version: 2,
  categoryAffinities: {},
  keywordAffinities: {},
  priceHistory: [],
  districtAffinities: {},
  viewedAuctionIds: [],
  recentSearches: [],
  totalInteractions: 0,
  lastUpdated: Date.now(),
};

const STOP_WORDS = new Set([
  "and", "the", "for", "with", "all", "new", "original", "genuine",
  "approved", "sri", "lanka", "box", "papers", "kit", "date", "edition",
  "rare", "top", "best", "mint", "condition", "year", "brand", "model"
]);

class RecommendationEngine {
  private profile: TasteProfile | null = null;
  private listeners: Array<(profile: TasteProfile) => void> = [];

  constructor() {
    if (typeof window !== "undefined") {
      this.loadProfile();
    }
  }

  public loadProfile(): TasteProfile {
    if (typeof window === "undefined") {
      this.profile = {
        version: 2,
        categoryAffinities: {},
        keywordAffinities: {},
        priceHistory: [],
        districtAffinities: {},
        viewedAuctionIds: [],
        recentSearches: [],
        totalInteractions: 0,
        lastUpdated: Date.now(),
      };
      return this.profile;
    }

    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        this.profile = JSON.parse(raw);
        if (!this.profile!.recentSearches) this.profile!.recentSearches = [];
        if (!this.profile!.categoryAffinities) this.profile!.categoryAffinities = {};
        if (!this.profile!.keywordAffinities) this.profile!.keywordAffinities = {};
        if (!this.profile!.priceHistory) this.profile!.priceHistory = [];
        if (!this.profile!.districtAffinities) this.profile!.districtAffinities = {};
        if (!this.profile!.viewedAuctionIds) this.profile!.viewedAuctionIds = [];
        return this.profile!;
      }
    } catch (e) {
      console.warn("Algorithm profile initialization", e);
    }

    this.profile = { ...DEFAULT_PROFILE, lastUpdated: Date.now() };
    this.saveProfile();
    return this.profile;
  }

  private saveProfile(): void {
    if (typeof window === "undefined" || !this.profile) return;
    try {
      this.profile.lastUpdated = Date.now();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.profile));
      window.dispatchEvent(new CustomEvent("bidme:taste-profile-updated", { detail: this.profile }));
      this.listeners.forEach((fn) => fn(this.profile!));
    } catch (e) {
      console.error("Failed to persist engine profile", e);
    }
  }

  public subscribe(listener: (profile: TasteProfile) => void): () => void {
    this.listeners.push(listener);
    if (this.profile) listener(this.profile);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  public trackInteraction(
    type: UserSignalType,
    metadata: {
      auctionId?: string;
      title?: string;
      categorySlug?: string;
      price?: number;
      district?: string;
      query?: string;
    }
  ): void {
    if (!this.profile) this.loadProfile();
    const p = this.profile!;
    const weight = SIGNAL_WEIGHTS[type] || 4;

    if (metadata.query && metadata.query.trim().length >= 2) {
      const q = metadata.query.toLowerCase().trim();
      if (!p.recentSearches.includes(q)) {
        p.recentSearches = [q, ...p.recentSearches].slice(0, 15);
      }
      this.extractKeywords(q).forEach((kw) => {
        p.keywordAffinities[kw] = (p.keywordAffinities[kw] || 0) + weight;
      });
    }

    if (metadata.categorySlug) {
      const slug = metadata.categorySlug.toLowerCase().trim();
      p.categoryAffinities[slug] = (p.categoryAffinities[slug] || 0) + weight;
    }

    if (metadata.title) {
      this.extractKeywords(metadata.title).forEach((kw) => {
        p.keywordAffinities[kw] = (p.keywordAffinities[kw] || 0) + Math.round(weight * 0.8);
      });
    }

    if (metadata.price && metadata.price > 0) {
      p.priceHistory = [metadata.price, ...p.priceHistory].slice(0, 30);
    }

    if (metadata.district) {
      p.districtAffinities[metadata.district] = (p.districtAffinities[metadata.district] || 0) + 1;
    }

    if (metadata.auctionId) {
      p.viewedAuctionIds = Array.from(new Set([metadata.auctionId, ...p.viewedAuctionIds])).slice(0, 100);
    }

    p.totalInteractions += 1;
    this.saveProfile();
  }

  private extractKeywords(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length >= 3 && !STOP_WORDS.has(w));
  }

  public getAveragePriceComfort(): number {
    if (!this.profile || this.profile.priceHistory.length === 0) return 350000;
    const sum = this.profile.priceHistory.reduce((a, b) => a + b, 0);
    return Math.round(sum / this.profile.priceHistory.length);
  }

  /**
   * High-Engagement Commercial Ranking Engine
   * Mixes: Direct Intent (50%) + Aspirational Desire (30%) + FOMO / Urgency (20%)
   */
  public rankAuctions(auctions: any[]): { ranked: any[]; matches: Record<string, RecommendationMatch> } {
    if (!this.profile) this.loadProfile();
    const p = this.profile!;
    const avgComfortPrice = this.getAveragePriceComfort();
    const matches: Record<string, RecommendationMatch> = {};
    const hasHistory = p.totalInteractions > 0;

    const scored = auctions.map((auction, index) => {
      let score = 0;
      let isAspirationalHook = false;
      let badgeLabel = "🔥 Popular";
      let matchReason = "Top Live Auction in Sri Lanka";

      const catSlug = auction.category?.slug?.toLowerCase() || "";
      const catWeight = p.categoryAffinities[catSlug] || 0;

      // 1. Direct Intent: Category Match
      if (catWeight > 0) {
        score += catWeight * 16;
        matchReason = `Curated for your interest in ${auction.category?.name || "this category"}`;
        badgeLabel = "✨ Matched";
      }

      // 2. Direct Intent: Keywords & Search Match
      const titleWords = this.extractKeywords(auction.title || "");
      let bestKeywordScore = 0;
      let matchedKeyword = "";
      titleWords.forEach((word) => {
        const kwScore = p.keywordAffinities[word] || 0;
        if (kwScore > bestKeywordScore) {
          bestKeywordScore = kwScore;
          matchedKeyword = word;
        }
      });

      if (bestKeywordScore > 0) {
        score += bestKeywordScore * 12;
        matchReason = `Trending in your searches for "${matchedKeyword.toUpperCase()}"`;
        badgeLabel = "🎯 High Intent";
      }

      p.recentSearches.forEach((query) => {
        if (auction.title?.toLowerCase().includes(query)) {
          score += 45;
          matchReason = `Highly relevant to your search for "${query}"`;
          badgeLabel = "💎 Search Match";
        }
      });

      // 3. Aspirational Craving Injection (Commercial Desirability)
      // Boost highly-coveted luxury items (Watches, Supercars, Gems, Leica Cameras)
      const aspirationalBonus = ASPIRATIONAL_CATEGORIES[catSlug] || 0;
      if (aspirationalBonus > 0) {
        score += aspirationalBonus * 2.2;
        isAspirationalHook = true;
        if (score > 30 && !matchedKeyword) {
          matchReason = `Highly Coveted • Collector Demand`;
          badgeLabel = "👑 Aspirational";
        }
      }

      // 4. Perceived Value & Deal Momentum
      // If an auction has high total bids or is underpriced relative to buyNow
      const totalBids = auction.totalBids || 0;
      score += Math.min(30, totalBids * 3.5);

      if (totalBids >= 15) {
        badgeLabel = "🔥 In Demand";
        matchReason = `Heated Bidding • ${totalBids} bids placed`;
      }

      // 5. Urgency & Countdown FOMO (< 24h or < 6h)
      const msRemaining = new Date(auction.endsAt).getTime() - Date.now();
      if (msRemaining > 0 && msRemaining < 8 * 3600 * 1000) {
        score += 25; // Massive urgency boost to prompt immediate action
        badgeLabel = "⚡ Ending Soon";
      }

      // 6. Serendipity / Discovery Jitter
      // Ensures the feed dynamically reorganizes and feels alive like TikTok/Instagram
      const jitter = (Math.sin((auction.id.charCodeAt(0) || 1) + Date.now() / 3600000) + 1) * 8;
      score += jitter;

      // Match percentage (high-converting range: 88% - 99%)
      const matchPercentage = hasHistory
        ? Math.min(99, Math.max(82, Math.round(80 + Math.min(19, score * 0.35))))
        : Math.min(98, Math.max(85, Math.round(85 + (totalBids > 5 ? 10 : 0) + (isAspirationalHook ? 3 : 0))));

      matches[auction.id] = {
        auctionId: auction.id,
        score,
        matchPercentage,
        matchReason,
        badgeLabel,
        isAspirationalHook,
      };

      return { auction, score };
    });

    // Sort descending by commercial score
    scored.sort((a, b) => b.score - a.score);

    return {
      ranked: scored.map((s) => s.auction),
      matches,
    };
  }
}

export const recommendationEngine = new RecommendationEngine();
