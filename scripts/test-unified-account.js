const http = require("http");

function testGet(path) {
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

async function run() {
  console.log("==================================================");
  console.log("  BITME UNIFIED BUYER & SELLER ARCHITECTURE TEST  ");
  console.log("==================================================");

  // 1. Dashboard Buyer Route
  const buyerRes = await testGet("/dashboard?mode=buying");
  if (buyerRes.status === 200 && buyerRes.body.includes("BUYER MODE")) {
    console.log("[PASS] 1. Buyer Mode Accessible on Unified Dashboard ✅");
  } else {
    console.error("[FAIL] 1. Buyer Mode", buyerRes.status);
    process.exit(1);
  }

  // 2. Dashboard Seller Route
  const sellerRes = await testGet("/dashboard?mode=selling");
  if (sellerRes.status === 200 && sellerRes.body.includes("SELLER MODE")) {
    console.log("[PASS] 2. Seller Mode Accessible on Same Account ✅");
  } else {
    console.error("[FAIL] 2. Seller Mode", sellerRes.status);
    process.exit(1);
  }

  // 3. Seller Route Redirect
  const sellerAlias = await testGet("/seller");
  if (sellerAlias.status === 200 || sellerAlias.status === 307 || sellerAlias.status === 308) {
    console.log("[PASS] 3. /seller alias points seamlessly to unified experience ✅");
  } else {
    console.error("[FAIL] 3. /seller alias", sellerAlias.status);
    process.exit(1);
  }

  // 4. Buyer Route Redirect
  const buyerAlias = await testGet("/buyer");
  if (buyerAlias.status === 200) {
    console.log("[PASS] 4. /buyer alias points seamlessly to unified experience ✅");
  } else {
    console.error("[FAIL] 4. /buyer alias", buyerAlias.status);
    process.exit(1);
  }

  console.log("\n==================================================");
  console.log("  ALL UNIFIED ACCOUNT SYSTEM CHECKS PASSED (4/4)  ");
  console.log("==================================================");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
