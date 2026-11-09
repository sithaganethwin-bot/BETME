import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
        { success: false, error: "userId parameter is required." },
        { status: 400 }
      );
    }

    const reminders = await prisma.auctionReminder.findMany({
      where: {
        auctionId: id,
        userId,
      },
    });

    return NextResponse.json({
      success: true,
      reminders: reminders.map((r) => ({
        id: r.id,
        minutesBefore: r.minutesBefore,
        isTriggered: r.isTriggered,
        createdAt: r.createdAt,
      })),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to load reminders." },
      { status: 500 }
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
    const { userId, minutesBefore = 5 } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "userId is required." },
        { status: 400 }
      );
    }

    // Verify auction exists and is LIVE
    const auction = await prisma.auction.findUnique({
      where: { id },
      select: { id: true, title: true, endsAt: true, status: true },
    });

    if (!auction || auction.status !== "LIVE") {
      return NextResponse.json(
        { success: false, error: "Auction is not open for alerts." },
        { status: 400 }
      );
    }

    const minutes = Number(minutesBefore) === 2 ? 2 : 5;

    // Toggle: if already exists, remove it; if not, create it
    const existing = await prisma.auctionReminder.findUnique({
      where: {
        userId_auctionId_minutesBefore: {
          userId,
          auctionId: id,
          minutesBefore: minutes,
        },
      },
    });

    if (existing) {
      await prisma.auctionReminder.delete({
        where: { id: existing.id },
      });
      return NextResponse.json({
        success: true,
        action: "removed",
        minutesBefore: minutes,
        message: `Alert (${minutes}m before close) disabled for "${auction.title}".`,
      });
    }

    const reminder = await prisma.auctionReminder.create({
      data: {
        userId,
        auctionId: id,
        minutesBefore: minutes,
      },
    });

    return NextResponse.json({
      success: true,
      action: "created",
      reminder,
      minutesBefore: minutes,
      message: `Alert set! You will be reminded ${minutes} minutes before "${auction.title}" ends.`,
    });
  } catch (error: any) {
    console.error("Reminder error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to toggle reminder." },
      { status: 500 }
    );
  }
}
