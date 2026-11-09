import { NextResponse } from "next/server";
import { askBidMate } from "@/lib/ai-assistant";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { auctionId, question } = body;

    if (!auctionId || !question) {
      return NextResponse.json(
        { success: false, error: "Auction ID and question are required." },
        { status: 400 }
      );
    }

    const response = await askBidMate({
      auctionId,
      userQuestion: question,
    });

    return NextResponse.json({
      success: true,
      answer: response.answer,
    });
  } catch (error: any) {
    console.error("BidMate AI error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to query BidMate AI." },
      { status: 500 }
    );
  }
}
