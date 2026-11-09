import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { lotCache, CACHE_TTL_MS } from "@/lib/auction-cache";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const now = Date.now();
    const cached = lotCache.get(id);

    if (cached && cached.expiry > now) {
      return NextResponse.json(
        { success: true, auction: cached.data, cached: true },
        {
          headers: {
            "X-Cache": "HIT",
            "Cache-Control": "public, max-age=3, stale-while-revalidate=10",
          },
        }
      );
    }

    const auction = await prisma.auction.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
      include: {
        product: {
          include: { images: true, category: true },
        },
        seller: {
          include: {
            user: {
              select: { id: true, name: true, avatarUrl: true },
            },
          },
        },
        category: true,
        bids: {
          orderBy: { amount: "desc" },
          take: 20,
          include: {
            bidder: {
              select: { id: true, name: true, avatarUrl: true, buyerScore: true },
            },
          },
        },
      },
    });

    if (!auction) {
      return NextResponse.json({ success: false, error: "Auction not found" }, { status: 404 });
    }

    // Fire-and-forget non-blocking view count update (doesn't hold up response time)
    prisma.auction
      .update({
        where: { id: auction.id },
        data: { viewCount: { increment: 1 } },
      })
      .catch(() => {});

    // Save to memory cache
    lotCache.set(id, { data: auction, expiry: now + CACHE_TTL_MS });

    return NextResponse.json(
      { success: true, auction },
      {
        headers: {
          "X-Cache": "MISS",
          "Cache-Control": "public, max-age=3, stale-while-revalidate=10",
        },
      }
    );
  } catch (error: any) {
    console.error("Failed to fetch auction:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
