import { NextResponse } from "next/server";
import { placeBid } from "@/lib/auction-engine";
import { invalidateAuctionCache } from "@/lib/auction-cache";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { bidderId, amount } = body;

    if (!bidderId || !amount) {
      return NextResponse.json(
        { success: false, error: "Bidder ID and amount are required." },
        { status: 400 }
      );
    }

    const ipAddress =
      request.headers.get("x-forwarded-for")?.split(",")[0] ||
      request.headers.get("x-real-ip") ||
      "127.0.0.1";

    const result = await placeBid({
      auctionId: id,
      bidderId,
      amount: parseFloat(amount),
      ipAddress,
    });

    invalidateAuctionCache(id);

    return NextResponse.json({
      success: true,
      bid: result.bid,
      auction: result.auction,
      extensionTriggered: result.extensionTriggered,
      message: result.extensionTriggered
        ? "Soft close anti-sniping activated! Auction timer extended by 2 minutes."
        : "Bid successfully placed!",
    });
  } catch (error: any) {
    console.error("Bid placement error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to place bid." },
      { status: 400 }
    );
  }
}
