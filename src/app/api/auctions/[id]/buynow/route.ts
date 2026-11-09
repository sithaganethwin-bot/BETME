import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { invalidateAuctionCache } from "@/lib/auction-cache";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    let { buyerId, shippingAddress } = body;

    if (!buyerId) {
      return NextResponse.json(
        { success: false, error: "Buyer ID is required." },
        { status: 400 }
      );
    }

    const ipAddress =
      request.headers.get("x-forwarded-for")?.split(",")[0] ||
      request.headers.get("x-real-ip") ||
      "127.0.0.1";

    const result = await prisma.$transaction(async (tx) => {
      // 0. Ensure buyer exists
      let buyer = await tx.user.findUnique({ where: { id: buyerId } });
      if (!buyer) {
        buyer = await tx.user.findFirst();
        if (!buyer) throw new Error("Buyer profile not found.");
        buyerId = buyer.id;
      }

      // 1. Fetch auction
      const auction = await tx.auction.findUnique({
        where: { id },
        include: {
          seller: true,
          product: { include: { images: true } },
          category: true,
        },
      });

      if (!auction) {
        throw new Error("Auction not found.");
      }

      if (auction.status !== "LIVE") {
        throw new Error(`This auction is no longer open (Current status: ${auction.status}).`);
      }

      if (new Date(auction.endsAt).getTime() <= Date.now()) {
        await tx.auction.update({
          where: { id },
          data: { status: "ENDED" },
        });
        throw new Error("This auction has already ended.");
      }

      if (!auction.buyNowPrice || auction.buyNowPrice <= 0) {
        throw new Error("Instant Buy (Buy It Now) is not available for this lot.");
      }

      if (auction.seller.userId === buyerId) {
        throw new Error("Sellers cannot purchase their own auctions.");
      }

      const buyNowPrice = auction.buyNowPrice;

      // 2. Create closing Buy Now bid record
      const buyNowBid = await tx.bid.create({
        data: {
          auctionId: auction.id,
          bidderId: buyer.id,
          amount: buyNowPrice,
          isAutoBid: false,
          ipAddress,
        },
      });

      // 3. Mark auction as ended and won via Buy Now
      const updatedAuction = await tx.auction.update({
        where: { id: auction.id },
        data: {
          currentPrice: buyNowPrice,
          totalBids: { increment: 1 },
          status: "ENDED",
          endsAt: new Date(),
        },
      });

      // 4. Deactivate all rival auto-bid rules
      await tx.autoBidRule.updateMany({
        where: { auctionId: auction.id },
        data: { isActive: false },
      });

      // 5. Calculate platform commission (5%) and create Order
      const commissionRate = 0.05;
      const commissionAmount = Math.round(buyNowPrice * commissionRate);
      const netSellerAmount = buyNowPrice - commissionAmount;

      const order = await tx.order.create({
        data: {
          auctionId: auction.id,
          buyerId: buyer.id,
          totalAmount: buyNowPrice,
          grossAmount: buyNowPrice,
          commissionRate,
          commissionAmount,
          netSellerAmount,
          status: "PAID",
          shippingAddress: shippingAddress || "Colombo, Sri Lanka",
        },
      });

      return {
        auction: updatedAuction,
        bid: buyNowBid,
        order,
        buyer,
      };
    });

    invalidateAuctionCache(id);

    return NextResponse.json({
      success: true,
      message: "Congratulations! You have successfully purchased this lot via Instant Buy.",
      auction: result.auction,
      order: result.order,
    });
  } catch (error: any) {
    console.error("Instant Buy error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process Instant Buy." },
      { status: 400 }
    );
  }
}
