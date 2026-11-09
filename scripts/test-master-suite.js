// Comprehensive verification of all master features
const BASE_URL = "http://localhost:3000";

async function runMasterSuite() {
  console.log("==================================================");
  console.log("    BITME MASTER PROJECT SPECIFICATION TESTS      ");
  console.log("==================================================\n");

  let passed = 0;
  let total = 0;

  async function check(name, fn) {
    total++;
    try {
      await fn();
      console.log(`[PASS] ${name} ✅`);
      passed++;
    } catch (err) {
      console.error(`[FAIL] ${name} ❌:`, err.message);
    }
  }

  // TEST 1: Auctions API
  await check("1. Authoritative Auctions Database Endpoint", async () => {
    const res = await fetch(`${BASE_URL}/api/auctions`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data.success || data.auctions.length < 5) {
      throw new Error("Expected at least 5 active lots");
    }
    console.log(`   Fetched ${data.auctions.length} lots.`);
  });

  // TEST 2: Natural Language AI Search
  await check("2. Natural Language AI Search with Google Gemini", async () => {
    const res = await fetch(`${BASE_URL}/api/ai/search`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: "gaming laptop with RTX under 300k" }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data.success) throw new Error("Search failed: " + data.error);
    console.log(`   Interpreted Intent: "${data.parsedQuery?.interpretedIntent}"`);
    console.log(`   Matched Lots: ${data.auctions.length}`);
  });

  // TEST 3: AI Customer Support & RAG Concierge
  await check("3. AI Customer Support & Compliance Concierge (Gemini RAG)", async () => {
    const res = await fetch(`${BASE_URL}/api/ai/support`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question: "Explain the Bitme 5% platform fee and the +120s anti-sniping soft-close rule.",
      }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data.success || !data.answer) throw new Error("No answer generated.");
    console.log(`   Gemini Concierge Answer Preview:\n   ${data.answer.substring(0, 150)}...`);
  });

  // TEST 4: Frontend Route Health Checks
  const routes = ["/", "/search", "/buyer", "/dashboard", "/seller", "/seller/new", "/admin", "/messages", "/auth"];
  for (const r of routes) {
    await check(`4. Route Health Check: ${r}`, async () => {
      const res = await fetch(`${BASE_URL}${r}`);
      if (!res.ok) throw new Error(`HTTP ${res.status} on ${r}`);
    });
  }

  console.log("\n==================================================");
  console.log(`  RESULTS: ${passed}/${total} TESTS PASSED (${Math.round((passed / total) * 100)}%)`);
  console.log("==================================================");

  if (passed === total) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runMasterSuite();
