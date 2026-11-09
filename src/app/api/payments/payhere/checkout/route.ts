import { NextResponse } from "next/server";
import { generatePayHereHash } from "@/lib/payhere";
import { calculateCommission } from "@/lib/commission";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { auctionId, buyerId } = body;

    const auction = await prisma.auction.findUnique({
      where: { id: auctionId },
      include: {
        product: true,
        seller: { include: { user: true } },
      },
    });

    if (!auction) {
      return NextResponse.json({ success: false, error: "Auction not found." }, { status: 404 });
    }

    const merchantId = process.env.PAYHERE_MERCHANT_ID || "1234567";
    const merchantSecret = process.env.PAYHERE_SECRET || "testsecret123";
    const orderId = `ORD-${auction.id.slice(-6).toUpperCase()}-${Date.now().toString().slice(-4)}`;
    const amount = auction.currentPrice;
    const currency = "LKR";

    // Automated 5% Platform Commission Calculation
    const commission = calculateCommission(amount, 0.05);

    const hash = generatePayHereHash({
      merchantId,
      orderId,
      amount,
      currency,
      merchantSecret,
    });

    // Create or update order with commission ledger details
    const order = await prisma.order.upsert({
      where: { auctionId: auction.id },
      update: {
        totalAmount: amount,
        grossAmount: amount,
        commissionRate: commission.commissionRate,
        commissionAmount: commission.commissionAmount,
        netSellerAmount: commission.netSellerAmount,
        status: "PENDING_PAYMENT",
      },
      create: {
        id: orderId,
        auctionId: auction.id,
        buyerId,
        totalAmount: amount,
        grossAmount: amount,
        commissionRate: commission.commissionRate,
        commissionAmount: commission.commissionAmount,
        netSellerAmount: commission.netSellerAmount,
        status: "PENDING_PAYMENT",
      },
    });

    return NextResponse.json({
      success: true,
      commission,
      checkout: {
        sandbox: true,
        merchant_id: merchantId,
        return_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/orders/${order.id}/success`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/auction/${auction.id}`,
        notify_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/payments/payhere/notify`,
        order_id: order.id,
        items: auction.title,
        currency: "LKR",
        amount: amount.toFixed(2),
        hash,
        first_name: "Kasun",
        last_name: "Jayasuriya",
        email: "kasun.buyer@example.com",
        phone: "+94771234567",
        address: "42/A, Galle Road",
        city: "Colombo",
        country: "Sri Lanka",
      },
    });
  } catch (error: any) {
    console.error("PayHere checkout error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
