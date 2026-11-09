import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      include: {
        profile: true,
        sellerProfile: true,
        bids: { take: 5, orderBy: { createdAt: "desc" } },
        orders: { take: 5, orderBy: { createdAt: "desc" } },
      },
      orderBy: { createdAt: "desc" },
    });

    const formattedUsers = users.map((u) => {
      const hasSeller = !!u.sellerProfile;
      const roleDisplay = hasSeller ? "BUYER_AND_SELLER" : u.role || "BUYER";
      return {
        id: u.id,
        name: u.name,
        email: u.email,
        phone: u.phone,
        avatarUrl: u.avatarUrl,
        role: roleDisplay,
        status: "ACTIVE",
        isEmailVerified: u.isEmailVerified,
        isPhoneVerified: u.isPhoneVerified,
        buyerScore: u.buyerScore,
        district: u.profile?.district || "Colombo",
        storeName: u.sellerProfile?.storeName || null,
        sellerRating: u.sellerProfile?.reputationScore || null,
        createdAt: u.createdAt,
      };
    });

    return NextResponse.json({ success: true, users: formattedUsers });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, action, reason } = body; // action: "SUSPEND", "RESTRICT", "RESTORE"

    if (!userId || !action) {
      return NextResponse.json({ success: false, error: "User ID and action required." }, { status: 400 });
    }

    const updatedUser = await prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({ where: { id: userId } });
      if (!user) throw new Error("User not found.");

      const newRole = action === "SUSPEND" ? "SUSPENDED" : action === "RESTORE" ? "BUYER" : "RESTRICTED";

      const updated = await tx.user.update({
        where: { id: userId },
        data: { role: newRole },
      });

      await tx.auditLog.create({
        data: {
          action: `USER_${action}`,
          entity: "User",
          entityId: userId,
          details: JSON.stringify({ action, reason: reason || "Administrative action", previousRole: user.role }),
        },
      });

      return updated;
    });

    return NextResponse.json({ success: true, user: updatedUser, message: `User status updated to ${action}.` });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
