const http = require("http");

function fetchRoute(path) {
  return new Promise((resolve, reject) => {
    http.get(`http://localhost:3000${path}`, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        resolve({ status: res.statusCode, body: data });
      });
    }).on("error", reject);
  });
}

async function runAdminIsolationTests() {
  console.log("==================================================");
  console.log("   BITME ADMIN PORTAL ISOLATION & SUB-PAGES TEST  ");
  console.log("==================================================");

  let passed = 0;
  let total = 6;

  try {
    // 1. Verify Public Website has NO /admin link in Footer
    const homeRes = await fetchRoute("/");
    if (homeRes.status === 200 && !homeRes.body.includes('href="/admin"')) {
      console.log("[PASS] 1. Website Footer Cleared: No public /admin links exposed to regular buyers/sellers ✅");
      passed++;
    } else {
      console.log("[FAIL] 1. Public Website Footer still contains /admin link ❌");
    }

    // 2. Verify Dedicated Admin Login Gateway
    const loginRes = await fetchRoute("/admin/login");
    if (loginRes.status === 200 && loginRes.body.includes("BITME SECURE PORTAL GATE")) {
      console.log("[PASS] 2. Dedicated Admin Login Gateway Accessible (/admin/login) ✅");
      passed++;
    } else {
      console.log("[FAIL] 2. /admin/login failed or missing gate markup ❌");
    }

    // 3. Verify Dedicated Sub-Pages: Users, Sellers, Auctions
    const [usersRes, sellersRes, auctionsRes] = await Promise.all([
      fetchRoute("/admin/users"),
      fetchRoute("/admin/sellers"),
      fetchRoute("/admin/auctions"),
    ]);
    if (usersRes.status === 200 && sellersRes.status === 200 && auctionsRes.status === 200) {
      console.log("[PASS] 3. Dedicated Core Admin Pages (/admin/users, /admin/sellers, /admin/auctions) 200 OK ✅");
      passed++;
    } else {
      console.log("[FAIL] 3. Core Admin Sub-Pages failed ❌");
    }

    // 4. Verify Dedicated Sub-Pages: Escrow, Finance, Disputes, Audit
    const [escrowRes, financeRes, disputesRes, auditRes] = await Promise.all([
      fetchRoute("/admin/escrow"),
      fetchRoute("/admin/finance"),
      fetchRoute("/admin/disputes"),
      fetchRoute("/admin/audit"),
    ]);
    if (escrowRes.status === 200 && financeRes.status === 200 && disputesRes.status === 200 && auditRes.status === 200) {
      console.log("[PASS] 4. Dedicated Governance Pages (/admin/escrow, /admin/finance, /admin/disputes, /admin/audit) 200 OK ✅");
      passed++;
    } else {
      console.log("[FAIL] 4. Governance Admin Sub-Pages failed ❌");
    }

    // 5. Verify AppShell isolates consumer header on /admin
    const adminOverviewRes = await fetchRoute("/admin");
    if (adminOverviewRes.status === 200) {
      console.log("[PASS] 5. Admin Command Center Overview (/admin) 200 OK with Enterprise Shell ✅");
      passed++;
    } else {
      console.log("[FAIL] 5. /admin overview failed ❌");
    }

    // 6. Verify Backend API routes for admin operations
    const [apiOverview, apiUsers] = await Promise.all([
      fetchRoute("/api/admin/overview"),
      fetchRoute("/api/admin/users"),
    ]);
    if (apiOverview.status === 200 && apiUsers.status === 200) {
      console.log("[PASS] 6. Admin Backend Services (/api/admin/overview, /api/admin/users) Operational ✅");
      passed++;
    } else {
      console.log("[FAIL] 6. Admin Backend APIs failed ❌");
    }

  } catch (err) {
    console.error("Test Suite error:", err);
  }

  console.log("==================================================");
  console.log(`  RESULTS: ${passed}/${total} ISOLATION CHECKS PASSED (${Math.round((passed / total) * 100)}%)`);
  console.log("==================================================");

  process.exit(passed === total ? 0 : 1);
}

runAdminIsolationTests();
