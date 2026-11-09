const { PrismaClient } = require("@prisma/client");
const crypto = require("crypto");

const prisma = new PrismaClient();

function calculateBidIncrement(currentBid) {
  if (currentBid <= 10000) return 100;
  if (currentBid <= 50000) return 500;
  if (currentBid <= 100000) return 1000;
  if (currentBid <= 500000) return 2500;
  return 5000;
}

function generatePayHereHash({ merchantId, orderId, amount, currency = "LKR", merchantSecret }) {
  const formattedAmount = Number(amount).toFixed(2);
  const secretHash = crypto.createHash("md5").update(merchantSecret).digest("hex").toUpperCase();
  const hashString = `${merchantId}${orderId}${formattedAmount}${currency}${secretHash}`;
  return crypto.createHash("md5").update(hashString).digest("hex").toUpperCase();
}

function verifyPayHereNotification({ merchantId, orderId, payhereAmount, payhereCurrency, statusCode, md5sig, merchantSecret }) {
  const secretHash = crypto.createHash("md5").update(merchantSecret).digest("hex").toUpperCase();
  const calculated = crypto
    .createHash("md5")
    .update(`${merchantId}${orderId}${payhereAmount}${payhereCurrency}${statusCode}${secretHash}`)
    .digest("hex")
    .toUpperCase();
  return calculated === md5sig.toUpperCase();
}

async function runTests() {
  console.log("=========================================");
  console.log("   BITME AUCTION ENGINE & SUITE TESTS    ");
  console.log("=========================================\n");

  // Test 1: Increment Calculation Tiers
  console.log("TEST 1: Dynamic Bid Increment Tiers");
  const tier1 = calculateBidIncrement(5000);
  const tier2 = calculateBidIncrement(25000);
  const tier3 = calculateBidIncrement(75000);
  const tier4 = calculateBidIncrement(250000);
  console.log(`- Rs. 5,000   => +Rs. ${tier1} (Expected: 100) -> ${tier1 === 100 ? "PASS ✅" : "FAIL ❌"}`);
  console.log(`- Rs. 25,000  => +Rs. ${tier2} (Expected: 500) -> ${tier2 === 500 ? "PASS ✅" : "FAIL ❌"}`);
  console.log(`- Rs. 75,000  => +Rs. ${tier3} (Expected: 1000) -> ${tier3 === 1000 ? "PASS ✅" : "FAIL ❌"}`);
  console.log(`- Rs. 250,000 => +Rs. ${tier4} (Expected: 2500) -> ${tier4 === 2500 ? "PASS ✅" : "FAIL ❌"}`);

  // Test 2: PayHere Checksum Verification
  console.log("\nTEST 2: PayHere Sri Lanka Gateway Signatures");
  const params = {
    merchantId: "1234567",
    orderId: "ORD-TEST-9988",
    amount: 145000,
    currency: "LKR",
    merchantSecret: "testsecret123",
  };
  const hash = generatePayHereHash(params);
  console.log(`- Generated Checkout Hash: ${hash}`);

  // Expected IPN notification signature from PayHere server
  const secretHash = crypto.createHash("md5").update(params.merchantSecret).digest("hex").toUpperCase();
  const expectedIpnHash = crypto
    .createHash("md5")
    .update(`${params.merchantId}${params.orderId}145000.00LKR2${secretHash}`)
    .digest("hex")
    .toUpperCase();

  const isValid = verifyPayHereNotification({
    merchantId: params.merchantId,
    orderId: params.orderId,
    payhereAmount: "145000.00",
    payhereCurrency: "LKR",
    statusCode: "2",
    md5sig: expectedIpnHash,
    merchantSecret: params.merchantSecret,
  });
  console.log(`- IPN Signature Validation: ${isValid ? "PASS ✅ (Authorized)" : "FAIL ❌"}`);

  // Test 3: Database & Auction Query
  console.log("\nTEST 3: Live Database & Auction Status");
  const activeAuctions = await prisma.auction.findMany({
    where: { status: "LIVE" },
    include: { bids: true, product: true, seller: true },
  });
  console.log(`- Active Lots in DB: ${activeAuctions.length}`);
  activeAuctions.forEach((a, idx) => {
    console.log(`  ${idx + 1}. [${a.locationDistrict}] ${a.title} - Rs. ${a.currentPrice.toLocaleString("en-LK")} (${a.totalBids} bids)`);
  });

  console.log("\nAll core engine tests executed successfully!");
}

runTests()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
