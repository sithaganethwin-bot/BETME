import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: Check configuration or generate Google OAuth URL
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/auth/google/callback`;

  if (searchParams.get("action") === "status") {
    return NextResponse.json({
      configured: !!clientId,
      clientId: clientId ? `${clientId.substring(0, 10)}...` : null,
    });
  }

  if (clientId) {
    const scope = encodeURIComponent("openid email profile");
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&response_type=code&scope=${scope}&access_type=offline&prompt=consent`;

    return NextResponse.redirect(googleAuthUrl);
  }

  return NextResponse.json({
    configured: false,
    message: "GOOGLE_CLIENT_ID not configured in .env. Interactive Google Sign-In is active.",
  });
}

// POST: Google Authentication (Sign In & Register)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, name, avatarUrl, googleId } = body;

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { success: false, error: "A valid Google account email is required." },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const gId = googleId || `goog_${Math.random().toString(36).substring(2, 12)}`;
    const displayName = name?.trim() || cleanEmail.split("@")[0];
    const userAvatar =
      avatarUrl ||
      `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(displayName)}&backgroundColor=2457e6&textColor=ffffff`;

    // 1. Check if user already exists by Google identity or by email
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: cleanEmail },
          {
            identities: {
              some: {
                provider: "GOOGLE",
                providerId: gId,
              },
            },
          },
        ],
      },
      include: {
        profile: true,
        sellerProfile: true,
        addresses: true,
        identities: true,
      },
    });

    let isNewUser = false;

    if (user) {
      // Existing user: Link Google identity if not already linked
      const hasGoogleIdentity = user.identities?.some(
        (id) => id.provider === "GOOGLE"
      );

      if (!hasGoogleIdentity) {
        await prisma.userIdentity.create({
          data: {
            userId: user.id,
            provider: "GOOGLE",
            providerId: gId,
          },
        });
      }

      // Update avatar if currently missing
      if (!user.avatarUrl && avatarUrl) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { avatarUrl },
          include: {
            profile: true,
            sellerProfile: true,
            addresses: true,
            identities: true,
          },
        });
      }

      // Record audit log
      await prisma.auditLog.create({
        data: {
          action: "USER_LOGIN_GOOGLE",
          entity: "User",
          entityId: user.id,
          userId: user.id,
          ipAddress: "127.0.0.1",
          details: JSON.stringify({ email: cleanEmail, provider: "GOOGLE" }),
        },
      });
    } else {
      // New user registering with Google: Create User, Profile, SellerProfile & Identity
      isNewUser = true;
      const userId = "usr_" + Math.random().toString(36).substring(2, 9);
      const storeSlug =
        displayName
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "") +
        "-" +
        Math.random().toString(36).substring(2, 6);

      user = await prisma.user.create({
        data: {
          id: userId,
          name: displayName,
          email: cleanEmail,
          role: "BUYER_AND_SELLER", // Unified Account Model
          isEmailVerified: true, // Google verifies emails
          isPhoneVerified: false,
          buyerScore: 100,
          avatarUrl: userAvatar,
          identities: {
            create: [
              {
                provider: "GOOGLE",
                providerId: gId,
              },
            ],
          },
          profile: {
            create: {
              district: "Colombo",
              province: "Western",
              preferredLanguage: "EN",
              bio: `Verified Google member on BIDME Sri Lanka.`,
            },
          },
          sellerProfile: {
            create: {
              storeName: `${displayName}'s Store`,
              storeSlug,
              description: `Official verified storefront of ${displayName} on BIDME. Ready for bidding and selling.`,
              verificationLevel: "VERIFIED_SELLER",
              isVerified: true,
              reputationScore: 5.0,
            },
          },
          auditLogs: {
            create: {
              action: "USER_REGISTERED_GOOGLE",
              entity: "User",
              entityId: userId,
              ipAddress: "127.0.0.1",
              details: JSON.stringify({
                email: cleanEmail,
                name: displayName,
                provider: "GOOGLE",
              }),
            },
          },
        },
        include: {
          profile: true,
          sellerProfile: true,
          addresses: true,
          identities: true,
        },
      });
    }

    // Format UserProfile for AppContext and localStorage
    const formattedProfile = {
      id: user.id,
      name: user.name,
      email: user.email || cleanEmail,
      phone: user.phone || "",
      nic: user.profile?.nicNumber || "",
      district: user.profile?.district || "Colombo",
      address: user.addresses?.[0]?.street || "",
      bankName: "Commercial Bank of Ceylon",
      bankBranch: "Colombo Main",
      bankAccount: "",
      role: user.role as "BUYER_AND_SELLER",
      sellerStatus: "APPROVED" as const,
      preferredDashboard: "BUYER" as const,
      buyerScore: user.buyerScore,
      reputationScore: user.sellerProfile?.reputationScore || 5.0,
      storeName: user.sellerProfile?.storeName || `${user.name}'s Store`,
      storeDescription: user.sellerProfile?.description || "",
      avatarUrl: user.avatarUrl || userAvatar,
      createdAt: user.createdAt.toISOString(),
      provider: "GOOGLE",
    };

    return NextResponse.json({
      success: true,
      isNewUser,
      message: isNewUser
        ? `Account successfully created with Google for ${user.name}!`
        : `Welcome back, ${user.name}!`,
      user: formattedProfile,
    });
  } catch (error: any) {
    console.error("[GOOGLE_AUTH_ERROR]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Google authentication failed." },
      { status: 500 }
    );
  }
}
