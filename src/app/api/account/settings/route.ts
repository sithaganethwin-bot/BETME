import { NextResponse } from "next/server";

// Comprehensive User Settings In-Memory Store
let userSettingsState = {
  user: {
    id: "usr_buyer_101",
    name: "Kasun Jayasuriya",
    displayName: "KasunJ",
    email: "kasun.jayasuriya@example.com",
    isEmailVerified: true,
    phone: "+94 77 123 4567",
    isPhoneVerified: true,
    dob: "1994-08-15",
    country: "Sri Lanka",
    district: "Colombo",
    city: "Colombo 07",
    address: "No. 42/B, Ward Place, Colombo 07",
    nic: "199428102941",
    role: "BUYER_AND_SELLER",
    sellerStatus: "APPROVED",
    storeName: "Kasun Vintage Collections",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    bio: "Passionate collector of horology and rare Ceylon gemstones. Active bidder and certified consignor on BIDME.",
    createdAt: "2024-01-15T09:30:00.000Z",
  },
  security: {
    twoFactorEnabled: true,
    twoFactorMethod: "AUTHENTICATOR_APP",
    lastPasswordChange: "3 months ago",
    loginAlertsEnabled: true,
    activeSessions: [
      {
        id: "sess_1",
        device: "MacBook Pro 16\" (Chrome 122)",
        ip: "112.134.192.44",
        location: "Colombo, Western Province",
        isCurrent: true,
        lastActive: "Active Now",
      },
      {
        id: "sess_2",
        device: "iPhone 15 Pro Max (Safari Mobile)",
        ip: "112.134.195.12",
        location: "Colombo, Western Province",
        isCurrent: false,
        lastActive: "2 hours ago",
      },
      {
        id: "sess_3",
        device: "Windows 11 PC (Edge 121)",
        ip: "124.43.91.80",
        location: "Kandy, Central Province",
        isCurrent: false,
        lastActive: "4 days ago",
      },
    ],
  },
  notifications: {
    auction: {
      bidPlaced: true,
      outbid: true,
      endingSoon: true,
      auctionWon: true,
      auctionLost: false,
      cancelled: true,
    },
    buying: {
      orderConfirmed: true,
      itemDispatched: true,
      deliveryUpdates: true,
      refundUpdates: true,
    },
    selling: {
      newBid: true,
      orderReceived: true,
      auctionCompleted: true,
      listingApproved: true,
      sellerVerification: true,
      buyerReview: true,
    },
    platform: {
      securityAlerts: true,
      announcements: true,
      recommendations: false,
      marketing: false,
    },
    channels: {
      inApp: true,
      email: true,
      sms: true,
      push: false,
    },
  },
  addresses: [
    {
      id: "addr_1",
      label: "Home (Primary)",
      fullName: "Kasun Jayasuriya",
      phone: "+94 77 123 4567",
      line1: "No. 42/B, Ward Place",
      line2: "Apt 4C, Rosmead Tower",
      city: "Colombo 07",
      district: "Colombo",
      province: "Western",
      postalCode: "00700",
      country: "Sri Lanka",
      isDefaultShipping: true,
      isDefaultBilling: true,
    },
    {
      id: "addr_2",
      label: "Office",
      fullName: "Kasun Jayasuriya",
      phone: "+94 77 123 4567",
      line1: "World Trade Center, West Tower",
      line2: "Level 28, Suite 4",
      city: "Colombo 01",
      district: "Colombo",
      province: "Western",
      postalCode: "00100",
      country: "Sri Lanka",
      isDefaultShipping: false,
      isDefaultBilling: false,
    },
  ],
  preferences: {
    language: "EN",
    currency: "LKR",
    timezone: "Asia/Colombo (UTC+5:30)",
    appearance: "LIGHT",
  },
  buying: {
    defaultShippingAddressId: "addr_1",
    autoWatchlistOnBid: true,
    biddingAlertMinutes: 15,
    maxAutoBidSafetyCeiling: 5000000,
    allowSellerDirectChat: true,
  },
  selling: {
    storeName: "Kasun Curated Emporium",
    storeLogo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    storeBanner: "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=1200&auto=format&fit=crop&q=80",
    storeDescription: "Verified Sri Lankan consignor specializing in luxury certified timepieces, rare Ceylon gemstones, and TRCSL-approved tech gadgets.",
    storeLocation: "Colombo, Sri Lanka",
    businessRegistration: "PV-94812/2023",
    defaultAuctionDuration: "48",
    autoRelistUnsold: false,
    bankName: "Commercial Bank of Ceylon",
    bankBranch: "Colombo Foreign Exchange Branch",
    bankAccount: "8009124810",
  },
  payments: {
    savedMethods: [
      {
        id: "pm_1",
        brand: "Visa",
        last4: "4242",
        expiry: "08/28",
        providerToken: "tok_payhere_v901",
        isDefault: true,
      },
      {
        id: "pm_2",
        brand: "Mastercard",
        last4: "8891",
        expiry: "11/27",
        providerToken: "tok_payhere_m441",
        isDefault: false,
      },
    ],
  },
  privacy: {
    publicProfileVisible: true,
    showBiddingHistory: false,
    showWonAuctions: true,
    marketingConsent: false,
    searchEngineIndexing: false,
  },
  connectedAccounts: [
    {
      provider: "Google",
      email: "kasun.jayasuriya@gmail.com",
      connectedAt: "Jan 15, 2024",
      isConnected: true,
    },
  ],
  verifications: {
    email: "VERIFIED",
    phone: "VERIFIED",
    identity: "VERIFIED",
    seller: "APPROVED",
    business: "VERIFIED",
  },
};

export async function GET() {
  return NextResponse.json({
    success: true,
    settings: userSettingsState,
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { section, data } = body;

    if (!section || !data) {
      return NextResponse.json({ success: false, error: "Section and data are required." }, { status: 400 });
    }

    switch (section) {
      case "personal":
        userSettingsState.user = {
          ...userSettingsState.user,
          name: data.name || userSettingsState.user.name,
          displayName: data.displayName || userSettingsState.user.displayName,
          email: data.email || userSettingsState.user.email,
          phone: data.phone || userSettingsState.user.phone,
          dob: data.dob || userSettingsState.user.dob,
          country: data.country || userSettingsState.user.country,
          district: data.district || userSettingsState.user.district,
          city: data.city || userSettingsState.user.city,
          address: data.address || userSettingsState.user.address,
          bio: data.bio !== undefined ? data.bio : userSettingsState.user.bio,
          avatarUrl: data.avatarUrl || userSettingsState.user.avatarUrl,
        };
        break;

      case "security":
        if (data.action === "TERMINATE_SESSION") {
          userSettingsState.security.activeSessions = userSettingsState.security.activeSessions.filter(
            (s) => s.id !== data.sessionId
          );
        } else if (data.action === "TERMINATE_ALL_OTHER") {
          userSettingsState.security.activeSessions = userSettingsState.security.activeSessions.filter(
            (s) => s.isCurrent
          );
        } else if (data.twoFactorEnabled !== undefined) {
          userSettingsState.security.twoFactorEnabled = data.twoFactorEnabled;
        }
        break;

      case "notifications":
        userSettingsState.notifications = {
          ...userSettingsState.notifications,
          ...data,
        };
        break;

      case "addresses":
        if (data.action === "ADD") {
          const newAddr = {
            id: `addr_${Date.now()}`,
            ...data.address,
          };
          if (newAddr.isDefaultShipping) {
            userSettingsState.addresses.forEach((a) => (a.isDefaultShipping = false));
          }
          userSettingsState.addresses.push(newAddr);
        } else if (data.action === "DELETE") {
          userSettingsState.addresses = userSettingsState.addresses.filter((a) => a.id !== data.addressId);
        } else if (data.action === "SET_DEFAULT") {
          userSettingsState.addresses.forEach((a) => {
            if (data.type === "shipping") {
              a.isDefaultShipping = a.id === data.addressId;
            } else if (data.type === "billing") {
              a.isDefaultBilling = a.id === data.addressId;
            }
          });
        }
        break;

      case "preferences":
        userSettingsState.preferences = {
          ...userSettingsState.preferences,
          ...data,
        };
        break;

      case "buying":
        userSettingsState.buying = {
          ...userSettingsState.buying,
          ...data,
        };
        break;

      case "selling":
        userSettingsState.selling = {
          ...userSettingsState.selling,
          ...data,
        };
        // Also sync store name with main user profile
        if (data.storeName) {
          userSettingsState.user.storeName = data.storeName;
        }
        break;

      case "privacy":
        userSettingsState.privacy = {
          ...userSettingsState.privacy,
          ...data,
        };
        break;

      default:
        return NextResponse.json({ success: false, error: `Invalid section: ${section}` }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: `${section.toUpperCase()} settings saved successfully.`,
      settings: userSettingsState,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
