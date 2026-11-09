import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  if (error || !code) {
    return NextResponse.redirect(`${appUrl}/auth?error=${encodeURIComponent(error || "Google login was cancelled.")}`);
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = `${appUrl}/api/auth/google/callback`;

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(`${appUrl}/auth?error=${encodeURIComponent("Google OAuth credentials are not configured in .env.")}`);
  }

  try {
    // 1. Exchange authorization code for access token
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok || !tokenData.access_token) {
      throw new Error(tokenData.error_description || "Failed to exchange authorization code.");
    }

    // 2. Fetch Google User Profile
    const profileResponse = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    const googleUser = await profileResponse.json();

    if (!googleUser.email) {
      throw new Error("Google did not return an email address.");
    }

    // 3. Upsert into database
    const cleanEmail = googleUser.email.toLowerCase().trim();
    const gId = googleUser.sub;
    const name = googleUser.name || cleanEmail.split("@")[0];
    const avatarUrl = googleUser.picture || null;

    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: cleanEmail },
          { identities: { some: { provider: "GOOGLE", providerId: gId } } },
        ],
      },
      include: {
        profile: true,
        sellerProfile: true,
        addresses: true,
        identities: true,
      },
    });

    if (!user) {
      const userId = "usr_" + Math.random().toString(36).substring(2, 9);
      const storeSlug =
        name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") +
        "-" +
        Math.random().toString(36).substring(2, 6);

      user = await prisma.user.create({
        data: {
          id: userId,
          name,
          email: cleanEmail,
          role: "BUYER_AND_SELLER",
          isEmailVerified: true,
          buyerScore: 100,
          avatarUrl,
          identities: {
            create: [{ provider: "GOOGLE", providerId: gId }],
          },
          profile: {
            create: {
              district: "Colombo",
              province: "Western",
              preferredLanguage: "EN",
            },
          },
          sellerProfile: {
            create: {
              storeName: `${name}'s Store`,
              storeSlug,
              description: `Official verified storefront of ${name} on BIDME Sri Lanka.`,
              verificationLevel: "VERIFIED_SELLER",
              isVerified: true,
              reputationScore: 5.0,
            },
          },
          auditLogs: {
            create: {
              action: "USER_REGISTERED_GOOGLE_OAUTH",
              entity: "User",
              entityId: userId,
              ipAddress: "127.0.0.1",
              details: JSON.stringify({ email: cleanEmail }),
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
      role: user.role,
      sellerStatus: "APPROVED",
      preferredDashboard: "BUYER",
      buyerScore: user.buyerScore,
      reputationScore: user.sellerProfile?.reputationScore || 5.0,
      storeName: user.sellerProfile?.storeName || `${user.name}'s Store`,
      avatarUrl: user.avatarUrl || avatarUrl,
      createdAt: user.createdAt.toISOString(),
      provider: "GOOGLE",
    };

    // Redirect to auth page with serialized user in a short-lived query param or session
    const userPayload = encodeURIComponent(JSON.stringify(formattedProfile));
    return NextResponse.redirect(`${appUrl}/auth?google_login=success&payload=${userPayload}`);
  } catch (err: any) {
    console.error("[GOOGLE_CALLBACK_ERROR]", err);
    return NextResponse.redirect(`${appUrl}/auth?error=${encodeURIComponent(err.message || "Google OAuth failed.")}`);
  }
}
