import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { identifier, password } = body;

    const cleanInput = (identifier || "").trim().toLowerCase();

    if (!cleanInput) {
      return NextResponse.json(
        { success: false, error: "Please enter your email or Sri Lankan mobile number." },
        { status: 400 }
      );
    }

    // Find user by email or phone
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: cleanInput },
          { phone: cleanInput },
          { phone: cleanInput.replace(/\s+/g, "") },
        ],
      },
      include: {
        profile: true,
        sellerProfile: true,
        addresses: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "No account found matching this email or phone. Please check your spelling or register a new account.",
        },
        { status: 404 }
      );
    }

    // Construct unified UserProfile response
    const formattedProfile = {
      id: user.id,
      name: user.name,
      email: user.email || "",
      phone: user.phone || "",
      nic: user.profile?.nicNumber || "",
      district: user.profile?.district || "Colombo",
      address: user.addresses?.[0]?.street || "",
      bankName: "Commercial Bank of Ceylon",
      bankBranch: "Colombo Main",
      bankAccount: "",
      role: user.role as "BUYER_AND_SELLER" | "SUPER_ADMIN",
      sellerStatus: user.sellerProfile ? ("APPROVED" as const) : ("NOT_STARTED" as const),
      preferredDashboard: "BUYER" as const,
      buyerScore: user.buyerScore,
      reputationScore: user.sellerProfile?.reputationScore || 5.0,
      storeName: user.sellerProfile?.storeName || `${user.name}'s Store`,
      storeDescription: user.sellerProfile?.description || "",
      avatarUrl: user.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name)}&backgroundColor=2457e6&textColor=ffffff`,
      createdAt: user.createdAt.toISOString(),
    };

    return NextResponse.json({
      success: true,
      message: `Welcome back, ${user.name}!`,
      user: formattedProfile,
    });
  } catch (error: any) {
    console.error("[LOGIN_ERROR]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to sign in." },
      { status: 500 }
    );
  }
}
