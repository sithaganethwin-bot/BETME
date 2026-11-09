import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const verifications = await prisma.sellerVerification.findMany({
      include: {
        sellerProfile: {
          include: {
            user: {
              select: { id: true, name: true, email: true, phone: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, verifications });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { verificationId, status, adminNotes } = body; // APPROVED, REJECTED

    const updated = await prisma.$transaction(async (tx) => {
      const verification = await tx.sellerVerification.update({
        where: { id: verificationId },
        data: {
          status,
          adminNotes,
          reviewedAt: new Date(),
        },
        include: { sellerProfile: true },
      });

      if (status === "APPROVED") {
        await tx.sellerProfile.update({
          where: { id: verification.sellerProfileId },
          data: {
            isVerified: true,
            verificationLevel: "VERIFIED_SELLER",
          },
        });
      }

      await tx.auditLog.create({
        data: {
          action: "SELLER_VERIFIED",
          entity: "SellerProfile",
          entityId: verification.sellerProfileId,
          details: JSON.stringify({ status, adminNotes }),
        },
      });

      return verification;
    });

    return NextResponse.json({ success: true, verification: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
