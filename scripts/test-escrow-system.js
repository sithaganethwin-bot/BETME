const http = require("http");

function request(url, options = {}) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const reqOptions = {
      hostname: parsed.hostname,
      port: parsed.port || 3000,
      path: parsed.pathname + parsed.search,
      method: options.method || "GET",
      headers: options.headers || {},
    };

    const req = http.request(reqOptions, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          resolve({ status: res.statusCode, body: data ? JSON.parse(data) : null, raw: data });
        } catch (e) {
          resolve({ status: res.statusCode, body: null, raw: data });
        }
      });
    });

    req.on("error", reject);
    if (options.body) {
      req.write(typeof options.body === "string" ? options.body : JSON.stringify(options.body));
    }
    req.end();
  });
}

async function runEscrowTestSuite() {
  console.log("==================================================");
  console.log("   BITME PLATFORM-MANAGED LOGISTICS & ESCROW TEST ");
  console.log("==================================================");

  let passed = 0;
  let total = 5;

  try {
    // 1. Fetch Escrow Orders and Vault Metrics
    const res1 = await request("http://localhost:3000/api/escrow/orders");
    if (res1.status === 200 && res1.body.success && res1.body.orders.length >= 3) {
      console.log(`[PASS] 1. Escrow Orders & Vault Metrics API ✅`);
      console.log(`       Vault Balance: Rs. ${res1.body.metrics.totalVaultBalance.toLocaleString()}`);
      console.log(`       Active Orders: ${res1.body.orders.length} lots protected in custodial custody.`);
      passed++;
    } else {
      console.log(`[FAIL] 1. Escrow Orders API ❌ (Status: ${res1.status})`);
    }

    // 2. Mark Courier Delivered (Commencing 48h Inspection Window)
    const res2 = await request("http://localhost:3000/api/escrow/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: { orderId: "escrow_ord_102", action: "MARK_DELIVERED" },
    });
    if (res2.status === 200 && res2.body.order.escrowStatus === "DELIVERED_INSPECTING" && res2.body.order.inspectionEndsAt) {
      console.log(`[PASS] 2. Courier Delivery & 48-Hour Inspection Clock Initiation ✅`);
      console.log(`       Status: ${res2.body.order.escrowStatus} | Inspection Ends: ${res2.body.order.inspectionEndsAt}`);
      passed++;
    } else {
      console.log(`[FAIL] 2. Courier Delivery Initiation ❌`);
    }

    // 3. Buyer Confirms Inspection & Releases Funds to Seller
    const res3 = await request("http://localhost:3000/api/escrow/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: { orderId: "escrow_ord_101", action: "CONFIRM_INSPECTION_RELEASE" },
    });
    if (res3.status === 200 && res3.body.order.escrowStatus === "FUNDS_RELEASED_TO_SELLER" && res3.body.order.releasedAt) {
      console.log(`[PASS] 3. Buyer Inspection Acceptance & Seller Bank Wire Release ✅`);
      console.log(`       Seller Payout: Rs. ${res3.body.order.sellerPayout.toLocaleString()} (95% net to ${res3.body.order.sellerBank})`);
      passed++;
    } else {
      console.log(`[FAIL] 3. Inspection Acceptance ❌`);
    }

    // 4. Buyer Raises Dispute & Freezes Escrow
    const res4 = await request("http://localhost:3000/api/escrow/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: {
        orderId: "escrow_ord_103",
        action: "RAISE_DISPUTE",
        reason: "[Category: MISMATCH] Color tone differs from certificate photos under daylight.",
      },
    });
    if (res4.status === 200 && res4.body.order.escrowStatus === "DISPUTED_ESCROW_FROZEN") {
      console.log(`[PASS] 4. Buyer Dispute & Immediate Escrow Vault Freeze ✅`);
      console.log(`       Escrow Frozen: "${res4.body.order.disputeReason}"`);
      passed++;
    } else {
      console.log(`[FAIL] 4. Escrow Freeze Dispute ❌`);
    }

    // 5. Admin Dispute Resolution (Arbitrate Release or Refund)
    const res5 = await request("http://localhost:3000/api/escrow/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: { orderId: "escrow_ord_103", action: "ADMIN_FORCE_RELEASE" },
    });
    if (res5.status === 200 && res5.body.order.escrowStatus === "FUNDS_RELEASED_TO_SELLER") {
      console.log(`[PASS] 5. Admin Arbitration & Settlement Override ✅`);
      passed++;
    } else {
      console.log(`[FAIL] 5. Admin Arbitration Override ❌`);
    }

  } catch (err) {
    console.error("Test Suite execution error:", err.message);
  }

  console.log("==================================================");
  console.log(`  RESULTS: ${passed}/${total} ESCROW TESTS PASSED (${Math.round((passed / total) * 100)}%)`);
  console.log("==================================================");

  if (passed === total) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runEscrowTestSuite();
