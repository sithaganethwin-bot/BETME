import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name,
      email,
      phone,
      password,
      nic,
      district,
      address,
      storeName,
      bankName,
      bankBranch,
      bankAccount,
    } = body;

    // 1. Validation
    if (!name || name.trim().length < 2) {
      return NextResponse.json(
        { success: false, error: "Please provide a valid full legal name (at least 2 characters)." },
        { status: 400 }
      );
    }

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { success: false, error: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    if (!password || password.length < 8) {
      return NextResponse.json(
        { success: false, error: "Password must be at least 8 characters long." },
        { status: 400 }
      );
    }

    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

    if (!hasUpper || !hasLower || !hasNumber) {
      return NextResponse.json(
        {
          success: false,
          error: "Password must contain at least one uppercase letter (A-Z), one lowercase letter (a-z), and one number (0-9).",
        },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone ? phone.trim() : null;

    // 2. Check duplicate email or phone
    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          { email: cleanEmail },
          ...(cleanPhone ? [{ phone: cleanPhone }] : []),
        ],
      },
    });

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          error: "An account with this email or phone already exists. Please sign in instead.",
        },
        { status: 400 }
      );
    }

    // 3. Generate unique user ID and clean store slug
    const userId = "usr_" + Math.random().toString(36).substring(2, 9);
    const storeDisplayName = storeName?.trim() || `${name.trim()}'s Store`;
    const storeSlug =
      storeDisplayName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "") +
      "-" +
      Math.random().toString(36).substring(2, 6);

    const initialLetter = name.trim().charAt(0).toUpperCase();
    const avatarUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
      name.trim()
    )}&backgroundColor=2457e6&textColor=ffffff`;

    // 4. Create User, UserProfile, Address, SellerProfile, and AuditLog in SQLite
    const createdUser = await prisma.user.create({
      data: {
        id: userId,
        name: name.trim(),
        email: cleanEmail,
        phone: cleanPhone,
        role: "BUYER_AND_SELLER", // Unified All-in-One Model
        isEmailVerified: true,
        isPhoneVerified: !!cleanPhone,
        buyerScore: 100,
        avatarUrl,
        identities: {
          create: [
            {
              provider: "EMAIL",
              providerId: cleanEmail,
            },
          ],
        },
        profile: {
          create: {
            nicNumber: nic?.trim() || null,
            district: district || "Colombo",
            province: "Western",
            preferredLanguage: "EN",
            bio: `Verified BIDME member based in ${district || "Colombo"}, Sri Lanka.`,
          },
        },
        sellerProfile: {
          create: {
            storeName: storeDisplayName,
            storeSlug,
            description: `Official verified store of ${name.trim()} on BIDME Sri Lanka. Ready to consign and buy.`,
            verificationLevel: "VERIFIED_SELLER",
            isVerified: true,
            reputationScore: 5.0,
          },
        },
        ...(address?.trim()
          ? {
              addresses: {
                create: {
                  title: "Primary Residence & Delivery",
                  street: address.trim(),
                  city: district || "Colombo",
                  district: district || "Colombo",
                  province: "Western",
                  postalCode: "00100",
                  isDefault: true,
                },
              },
            }
          : {}),
        auditLogs: {
          create: {
            action: "USER_REGISTERED",
            entity: "User",
            entityId: userId,
            ipAddress: "127.0.0.1",
            details: JSON.stringify({
              email: cleanEmail,
              name: name.trim(),
              district: district || "Colombo",
              role: "BUYER_AND_SELLER",
            }),
          },
        },
      },
      include: {
        profile: true,
        sellerProfile: true,
        addresses: true,
      },
    });

    // 5. Construct unified UserProfile response for AppContext and localStorage
    const formattedProfile = {
      id: createdUser.id,
      name: createdUser.name,
      email: createdUser.email || cleanEmail,
      phone: createdUser.phone || "",
      nic: createdUser.profile?.nicNumber || nic?.trim() || "",
      district: createdUser.profile?.district || district || "Colombo",
      address: address?.trim() || createdUser.addresses?.[0]?.street || "",
      bankName: bankName || "Commercial Bank of Ceylon",
      bankBranch: bankBranch || "Colombo Main Branch",
      bankAccount: bankAccount || "",
      role: createdUser.role as "BUYER_AND_SELLER",
      sellerStatus: "APPROVED" as const,
      preferredDashboard: "BUYER" as const,
      buyerScore: createdUser.buyerScore,
      reputationScore: createdUser.sellerProfile?.reputationScore || 5.0,
      storeName: createdUser.sellerProfile?.storeName || storeDisplayName,
      storeDescription: createdUser.sellerProfile?.description || "",
      avatarUrl: createdUser.avatarUrl || avatarUrl,
      createdAt: createdUser.createdAt.toISOString(),
    };

    return NextResponse.json({
      success: true,
      message: `Account created successfully for ${createdUser.name}!`,
      user: formattedProfile,
    });
  } catch (error: any) {
    console.error("[REGISTER_ERROR]", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to register user. Please check your inputs.",
      },
      { status: 500 }
    );
  }
}
