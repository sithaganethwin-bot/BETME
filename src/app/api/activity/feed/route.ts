import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Fast in-memory cache for live activity feed (<2ms)
let cachedActivity: { data: any; expiry: number } | null = null;
const CACHE_TTL_MS = 3000; // 3 seconds TTL

export async function GET() {
  try {
    const now = Date.now();
    if (cachedActivity && cachedActivity.expiry > now) {
      return NextResponse.json(cachedActivity.data, {
        headers: {
          "X-Cache": "HIT",
          "Cache-Control": "public, max-age=2, stale-while-revalidate=5",
        },
      });
    }

    const nowDate = new Date();

    // 1. Fetch real latest verified bids across all auctions
    const recentBids = await prisma.bid.findMany({
      take: 12,
      orderBy: { createdAt: "desc" },
      include: {
        auction: {
          select: {
            id: true,
            title: true,
            currentPrice: true,
            endsAt: true,
            status: true,
          },
        },
        bidder: {
          select: {
            id: true,
            name: true,
            buyerScore: true,
          },
        },
      },
    });

    // 2. Fetch auctions ending in the next 15 minutes
    const endingSoonAuctions = await prisma.auction.findMany({
      where: {
        status: "LIVE",
        endsAt: {
          gt: nowDate,
          lte: new Date(nowDate.getTime() + 15 * 60 * 1000),
        },
      },
      take: 5,
      orderBy: { endsAt: "asc" },
      select: {
        id: true,
        title: true,
        currentPrice: true,
        endsAt: true,
        totalBids: true,
      },
    });

    // Privacy-safe bidder name formatting: e.g. "Kasun J."
    const formatPrivacyName = (fullName?: string | null) => {
      if (!fullName) return "Verified Bidder";
      const parts = fullName.trim().split(" ");
      if (parts.length === 1) return parts[0];
      return `${parts[0]} ${parts[parts.length - 1].charAt(0).toUpperCase()}.`;
    };

    const feed = recentBids.map((b) => ({
      id: b.id,
      type: "bid" as const,
      bidderName: formatPrivacyName(b.bidder?.name),
      amount: b.amount,
      isAutoBid: b.isAutoBid,
      auctionId: b.auction.id,
      auctionTitle: b.auction.title,
      timestamp: b.createdAt.toISOString(),
      endsAt: b.auction.endsAt.toISOString(),
    }));

    const alerts = endingSoonAuctions.map((a) => ({
      id: `alert_${a.id}`,
      type: "ending_soon" as const,
      auctionId: a.id,
      auctionTitle: a.title,
      currentPrice: a.currentPrice,
      totalBids: a.totalBids,
      endsAt: a.endsAt.toISOString(),
      timestamp: new Date().toISOString(),
    }));

    const responseData = {
      success: true,
      feed,
      alerts,
      serverTime: new Date().toISOString(),
    };

    cachedActivity = { data: responseData, expiry: now + CACHE_TTL_MS };

    return NextResponse.json(responseData, {
      headers: {
        "X-Cache": "MISS",
        "Cache-Control": "public, max-age=2, stale-while-revalidate=5",
      },
    });
  } catch (error: any) {
    console.error("Activity feed error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch activity feed." },
      { status: 500 }
    );
  }
}
