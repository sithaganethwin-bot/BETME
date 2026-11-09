async function measure(url, label) {
  const start = performance.now();
  const res = await fetch(url);
  const end = performance.now();
  const duration = Math.round(end - start);
  console.log(`[${res.status}] ${label.padEnd(35)} : ${duration}ms (Cache: ${res.headers.get("X-Cache") || "N/A"})`);
  return duration;
}

async function runBenchmark() {
  console.log("=== BITME RESPONSE TIME & PERFORMANCE BENCHMARK ===");

  console.log("\n--- 1. Cold Compilation / First Load ---");
  await measure("http://localhost:3000/", "Homepage (/)");
  await measure("http://localhost:3000/api/auctions", "Auctions API (/api/auctions)");
  await measure("http://localhost:3000/api/auctions/auc_porsche_gt3", "Single Lot API (auc_porsche_gt3)");
  await measure("http://localhost:3000/auth", "Auth / Login Page (/auth)");
  await measure("http://localhost:3000/search", "Search Page (/search)");
  await measure("http://localhost:3000/auction/auc_porsche_gt3", "Lot Detail Page (/auction/auc_porsche_gt3)");

  console.log("\n--- 2. Warm / In-Memory Cached Requests (Real User Experience) ---");
  const t1 = await measure("http://localhost:3000/api/auctions", "Auctions API (Cached)");
  const t2 = await measure("http://localhost:3000/api/auctions/auc_porsche_gt3", "Single Lot API (Cached)");
  const t3 = await measure("http://localhost:3000/", "Homepage (Warm)");
  const t4 = await measure("http://localhost:3000/auth", "Auth Page (Warm)");
  const t5 = await measure("http://localhost:3000/auction/auc_porsche_gt3", "Lot Detail Page (Warm)");

  console.log("\n==================================================");
  console.log(`Average Cached API Latency: ${Math.round((t1 + t2) / 2)}ms`);
  console.log(`Average Page Navigation Latency: ${Math.round((t3 + t4 + t5) / 3)}ms`);
  console.log("==================================================");
}

runBenchmark().catch(console.error);
