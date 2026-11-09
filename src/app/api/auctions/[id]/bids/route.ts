import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const auction = await prisma.auction.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        currentPrice: true,
        startingPrice: true,
        reservePrice: true,
        buyNowPrice: true,
        totalBids: true,
        endsAt: true,
        status: true,
        bids: {
          orderBy: { amount: "desc" },
          take: 5,
          include: {
            bidder: {
              select: {
                id: true,
                name: true,
                buyerScore: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
    });

    if (!auction) {
      return NextResponse.json(
        { success: false, error: "Auction not found." },
        { status: 404 }
      );
    }

    const formatPrivacyName = (fullName?: string | null) => {
      if (!fullName) return "Verified Bidder";
      const parts = fullName.trim().split(" ");
      if (parts.length === 1) return parts[0];
      return `${parts[0]} ${parts[parts.length - 1].charAt(0).toUpperCase()}.`;
    };

    const bids = auction.bids.map((b) => ({
      id: b.id,
      amount: b.amount,
      isAutoBid: b.isAutoBid,
      createdAt: b.createdAt.toISOString(),
      bidderName: formatPrivacyName(b.bidder?.name),
      buyerScore: b.bidder?.buyerScore || 95,
    }));

    return NextResponse.json({
      success: true,
      auctionId: auction.id,
      currentPrice: auction.currentPrice,
      totalBids: auction.totalBids,
      bids,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to load bid history." },
      { status: 500 }
    );
  }
}
