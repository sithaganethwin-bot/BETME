import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { CATEGORIES_CONFIG } from "@/lib/constants";

let cachedCounts: { data: Record<string, number>; expiry: number } | null = null;
const CACHE_TTL_MS = 15000; // 15 seconds TTL

export async function GET() {
  try {
    const now = Date.now();
    if (cachedCounts && cachedCounts.expiry > now) {
      return NextResponse.json({
        success: true,
        counts: cachedCounts.data,
      });
    }

    // Query active LIVE auctions with their category slugs
    const activeAuctions = await prisma.auction.findMany({
      where: {
        status: "LIVE",
        endsAt: { gt: new Date() },
      },
      select: {
        category: {
          select: { slug: true },
        },
      },
    });

    const countMap: Record<string, number> = {};
    // Initialize all known categories with 0
    CATEGORIES_CONFIG.forEach((cat) => {
      countMap[cat.slug] = 0;
    });

    activeAuctions.forEach((a) => {
      const slug = a.category?.slug;
      if (slug) {
        countMap[slug] = (countMap[slug] || 0) + 1;
      }
    });

    cachedCounts = { data: countMap, expiry: now + CACHE_TTL_MS };

    return NextResponse.json({
      success: true,
      counts: countMap,
      totalLiveAuctions: activeAuctions.length,
    });
  } catch (error: any) {
    console.error("Category counts error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load category counts." },
      { status: 500 }
    );
  }
}
