import { NextResponse } from "next/server";
import { setAutoBid } from "@/lib/auction-engine";
import { prisma } from "@/lib/prisma";
import { invalidateAuctionCache } from "@/lib/auction-cache";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "userId query parameter is required." },
        { status: 400 }
      );
    }

    const rule = await prisma.autoBidRule.findUnique({
      where: {
        auctionId_userId: { auctionId: id, userId },
      },
    });

    return NextResponse.json({
      success: true,
      rule,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch auto-bid status." },
      { status: 400 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { userId, maxAmount } = body;

    if (!userId || !maxAmount) {
      return NextResponse.json(
        { success: false, error: "User ID and max amount ceiling are required." },
        { status: 400 }
      );
    }

    const result = await setAutoBid({
      auctionId: id,
      userId,
      maxAmount: parseFloat(maxAmount),
    });

    invalidateAuctionCache(id);

    return NextResponse.json({
      success: true,
      rule: result.rule,
      auction: result.auction,
      bid: result.bid,
      message: `Auto-bid proxy configured up to Rs. ${parseFloat(maxAmount).toLocaleString("en-LK")}. BIDME will automatically place counter-bids on your behalf.`,
    });
  } catch (error: any) {
    console.error("Auto-bid error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to set auto-bid rule." },
      { status: 400 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "User ID is required." },
        { status: 400 }
      );
    }

    await prisma.autoBidRule.updateMany({
      where: {
        auctionId: id,
        userId,
      },
      data: {
        isActive: false,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Auto-bid ceiling deactivated.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to cancel auto-bid." },
      { status: 400 }
    );
  }
}
