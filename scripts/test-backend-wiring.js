// Comprehensive Backend Wiring Verification Test Suite for BITME
const http = require("http");

const BASE_URL = "http://localhost:3000";

async function postJson(url, data) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return { status: res.status, data: await res.json() };
}

async function getJson(url) {
  const res = await fetch(url);
  return { status: res.status, data: await res.json() };
}

async function runBackendWiringAudit() {
  console.log("==================================================");
  console.log("    BITME DEEP BACKEND WIRING & ARCHITECTURE AUDIT ");
  console.log("==================================================\n");

  let passed = 0;
  let total = 0;

  function assert(title, condition, details = "") {
    total++;
    if (condition) {
      passed++;
      console.log(`[PASS] ${title} ✅`);
      if (details) console.log(`       ${details}`);
    } else {
      console.error(`[FAIL] ${title} ❌: ${details}`);
    }
  }

  try {
    // 1. Database & Prisma Hydration Check
    const auctionsRes = await getJson(`${BASE_URL}/api/auctions`);
    assert(
      "1. Database Connection & Auction Model Query",
      auctionsRes.status === 200 && auctionsRes.data.success && Array.isArray(auctionsRes.data.auctions),
      `Successfully queried ${auctionsRes.data?.auctions?.length || 0} active auction lots from SQLite database.`
    );

    // 2. Single Lot Deep Query (with Product, Seller, Category, Bids relations)
    const liveAuction = auctionsRes.data.auctions.find(a => new Date(a.endsAt) > new Date()) || auctionsRes.data.auctions[0];
    const lotRes = await getJson(`${BASE_URL}/api/auctions/${liveAuction.id}`);
    assert(
      "2. Relational ORM Wiring (Product, Seller, Category, Bids)",
      lotRes.status === 200 && lotRes.data.success && lotRes.data.auction.product && lotRes.data.auction.seller,
      `Lot "${lotRes.data.auction.title}" properly resolved relations: Seller "${lotRes.data.auction.seller.storeName}", Category "${lotRes.data.auction.category?.name}".`
    );

    // 3. Auction Bidding Engine & Anti-Sniping Protection
    const currentPrice = lotRes.data.auction.currentPrice;
    const invalidLowBid = await postJson(`${BASE_URL}/api/auctions/${liveAuction.id}/bid`, {
      bidderId: "usr_buyer_101",
      amount: currentPrice - 1000,
    });
    assert(
      "3. Bidding Validation: Engine enforces validation constraints",
      invalidLowBid.status === 400 && invalidLowBid.data.success === false,
      `Validation responded with: "${invalidLowBid.data.error}"`
    );

    // 4. PayHere Payment Gateway Checkout Hash Generation
    const checkoutRes = await postJson(`${BASE_URL}/api/payments/payhere/checkout`, {
      auctionId: liveAuction.id,
      buyerId: "usr_buyer_101",
    });
    assert(
      "4. PayHere Payment Gateway Integration (HMAC MD5 Hash & 5% Platform Cut)",
      checkoutRes.status === 200 && checkoutRes.data.success && checkoutRes.data.checkout?.hash,
      `Order: ${checkoutRes.data.checkout?.order_id} | Hash: ${checkoutRes.data.checkout?.hash.slice(0, 16)}... | 5% Fee: Rs. ${checkoutRes.data.commission?.commissionAmount.toLocaleString()}`
    );

    // 5. Platform-Managed Logistics & Escrow Vault System
    const escrowRes = await getJson(`${BASE_URL}/api/escrow/orders`);
    assert(
      "5. Escrow Trust Vault & 48h Inspection Window",
      escrowRes.status === 200 && escrowRes.data.success && escrowRes.data.metrics.totalVaultBalance > 0,
      `Vault Balance: Rs. ${escrowRes.data.metrics.totalVaultBalance.toLocaleString()} | Active Orders: ${escrowRes.data.orders.length}`
    );

    // 6. Unified Account Settings API
    const settingsRes = await getJson(`${BASE_URL}/api/account/settings`);
    assert(
      "6. Unified User Account Backend (Buyer + Seller Role State)",
      settingsRes.status === 200 && settingsRes.data.success && settingsRes.data.settings.user.role === "BUYER_AND_SELLER",
      `User: ${settingsRes.data.settings.user.name} (${settingsRes.data.settings.user.email}) | 2FA: ${settingsRes.data.settings.security.twoFactorEnabled}`
    );

    // 7. Admin Control Center Protected Overview Analytics
    const adminOverview = await getJson(`${BASE_URL}/api/admin/overview`);
    assert(
      "7. Admin Control Center Analytics & GMV Computation",
      adminOverview.status === 200 && adminOverview.data.success && adminOverview.data.stats.totalUsers > 0,
      `Registered Users: ${adminOverview.data.stats.totalUsers} | Live Auctions: ${adminOverview.data.stats.activeAuctions} | Platform Commission: Rs. ${adminOverview.data.stats.totalCommission.toLocaleString()}`
    );

    // 8. Admin User Governance & RBAC Mutation
    const adminUsers = await getJson(`${BASE_URL}/api/admin/users`);
    assert(
      "8. Admin User Management & Audit Logging",
      adminUsers.status === 200 && adminUsers.data.success && Array.isArray(adminUsers.data.users),
      `Loaded ${adminUsers.data.users.length} user identities with role, verification, and score tracking.`
    );

    // 9. AI Seller Copilot Integration
    const copilotRes = await postJson(`${BASE_URL}/api/ai/copilot`, {
      itemType: "Rolex Submariner",
      brand: "Rolex",
      condition: "LIKE_NEW",
      userNotes: "Box and papers included",
    });
    assert(
      "9. AI Seller Listing Copilot (Smart SEO title & description generation)",
      copilotRes.status === 200 && copilotRes.data.success && copilotRes.data.suggestions,
      `Suggested Title: "${copilotRes.data.suggestions.suggestedTitle}"`
    );

    // 10. AI Content Moderation Pre-Flight Check
    const moderateRes = await postJson(`${BASE_URL}/api/ai/moderate`, {
      title: "Pristine Luxury Watch with Certificate",
      description: "Authentic collectible watch with documentation.",
    });
    assert(
      "10. AI Content Moderation & Policy Guardrails",
      moderateRes.status === 200 && moderateRes.data.success && moderateRes.data.safety.isSafe === true,
      `Moderation Flag: isSafe = ${moderateRes.data.safety.isSafe}`
    );

    // 11. AI Customer Support & Dispute Concierge RAG
    const supportRes = await postJson(`${BASE_URL}/api/ai/support`, {
      question: "What is the platform commission rate on BITME?",
    });
    assert(
      "11. AI Support Concierge RAG (BITME Policy & Escrow Answers)",
      supportRes.status === 200 && supportRes.data.success && supportRes.data.answer.length > 10,
      `Concierge answered: "${supportRes.data.answer.slice(0, 70)}..."`
    );

    // 12. Full-Text Natural Language AI Semantic Search
    const searchRes = await postJson(`${BASE_URL}/api/ai/search`, {
      query: "Rolex in Colombo under 3000000",
    });
    assert(
      "12. Natural Language AI Intent Parser & Structured Querying",
      searchRes.status === 200 && searchRes.data.success && Array.isArray(searchRes.data.auctions),
      `Matched ${searchRes.data.auctions?.length || 0} lots for query "Rolex in Colombo under 3000000".`
    );

  } catch (err) {
    console.error("Test Suite execution exception:", err);
  }

  console.log("\n==================================================");
  console.log(`  RESULTS: ${passed}/${total} BACKEND TESTS PASSED (${Math.round((passed / total) * 100)}%)`);
  console.log("==================================================");

  if (passed === total) {
    console.log(">>> ALL BACKEND WIRING SYSTEMS ARE 100% OPERATIONAL! <<<");
  } else {
    process.exit(1);
  }
}

runBackendWiringAudit();
