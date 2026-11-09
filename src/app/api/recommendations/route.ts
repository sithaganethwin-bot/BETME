import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { categoryAffinities = {}, recentSearches = [], priceHistory = [] } = body;

    // Fetch live auctions from database
    const auctions = await prisma.auction.findMany({
      where: { status: "LIVE" },
      include: {
        product: {
          include: { images: true },
        },
        seller: true,
        category: true,
      },
    });

    // Calculate algorithmic score for each auction on server
    const scored = auctions.map((auction) => {
      let score = 0;
      const catSlug = auction.category?.slug?.toLowerCase() || "";
      const catWeight = categoryAffinities[catSlug] || 0;

      // Category affinity
      score += catWeight * 14;

      // Search match
      for (const q of recentSearches) {
        if (auction.title.toLowerCase().includes(q.toLowerCase())) {
          score += 30;
        }
      }

      // Popularity & urgency
      score += (auction.totalBids || 0) * 2;
      const msLeft = new Date(auction.endsAt).getTime() - Date.now();
      if (msLeft > 0 && msLeft < 12 * 3600 * 1000) {
        score += 15;
      }

      return { auction, score };
    });

    scored.sort((a, b) => b.score - a.score);

    return NextResponse.json({
      success: true,
      recommendations: scored.map((s) => s.auction),
      total: scored.length,
    });
  } catch (error: any) {
    console.error("Failed to generate recommendations:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
