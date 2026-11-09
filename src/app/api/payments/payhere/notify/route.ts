import { NextResponse } from "next/server";
import { verifyPayHereNotification } from "@/lib/payhere";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const merchantId = formData.get("merchant_id") as string;
    const orderId = formData.get("order_id") as string;
    const payhereAmount = formData.get("payhere_amount") as string;
    const payhereCurrency = formData.get("payhere_currency") as string;
    const statusCode = formData.get("status_code") as string;
    const md5sig = formData.get("md5sig") as string;
    const paymentId = formData.get("payment_id") as string;

    const merchantSecret = process.env.PAYHERE_SECRET || "testsecret123";

    // 1. Verify Hash Checksum
    const isValid = verifyPayHereNotification({
      merchantId,
      orderId,
      payhereAmount,
      payhereCurrency,
      statusCode,
      md5sig,
      merchantSecret,
    });

    if (!isValid) {
      console.error("PayHere Signature Verification Failed!");
      return new NextResponse("Checksum Verification Failed", { status: 400 });
    }

    // 2. Status code 2 is Success in PayHere
    if (statusCode === "2") {
      await prisma.$transaction(async (tx) => {
        const order = await tx.order.findUnique({
          where: { id: orderId },
          include: { auction: { include: { seller: true } } },
        });

        if (!order) return;

        // Update Order
        await tx.order.update({
          where: { id: orderId },
          data: { status: "PAID" },
        });

        // Update Seller's Net Earnings & Commission Paid
        await tx.sellerProfile.update({
          where: { id: order.auction.sellerId },
          data: {
            totalSales: { increment: 1 },
            totalCommissionPaid: { increment: order.commissionAmount },
            totalNetEarnings: { increment: order.netSellerAmount },
          },
        });

        // Record Payment
        await tx.payment.create({
          data: {
            orderId,
            amount: parseFloat(payhereAmount),
            currency: payhereCurrency,
            gateway: "PAYHERE",
            gatewayPaymentId: paymentId,
            status: "SUCCESS",
            signature: md5sig,
          },
        });

        // Update Auction Status to PAID
        await tx.auction.update({
          where: { id: order.auctionId },
          data: { status: "PAID" },
        });

        // Audit Log for Owner Commission
        await tx.auditLog.create({
          data: {
            action: "COMMISSION_COLLECTED",
            entity: "Order",
            entityId: orderId,
            details: JSON.stringify({
              grossAmount: order.grossAmount,
              commissionRate: order.commissionRate,
              commissionEarned: order.commissionAmount,
              netSellerPayout: order.netSellerAmount,
              gatewayPaymentId: paymentId,
            }),
          },
        });
      });
    }

    return new NextResponse("OK", { status: 200 });
  } catch (error: any) {
    console.error("PayHere Notify error:", error);
    return new NextResponse("Error processing IPN", { status: 500 });
  }
}
