import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { auctionId, action, reason } = body; // action: "PAUSE", "RESUME", "CANCEL"

    if (!auctionId || !action) {
      return NextResponse.json({ success: false, error: "Auction ID and action are required." }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      const auction = await tx.auction.findUnique({ where: { id: auctionId } });
      if (!auction) throw new Error("Auction not found.");

      const newStatus = action === "PAUSE" ? "SUSPENDED" : action === "RESUME" ? "LIVE" : "CANCELLED";

      const updated = await tx.auction.update({
        where: { id: auctionId },
        data: { status: newStatus },
      });

      await tx.auditLog.create({
        data: {
          action: `AUCTION_${action}`,
          entity: "Auction",
          entityId: auctionId,
          details: JSON.stringify({ action, reason: reason || "Administrative intervention", previousStatus: auction.status }),
        },
      });

      return updated;
    });

    return NextResponse.json({ success: true, auction: result, message: `Auction status set to ${result.status}.` });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
