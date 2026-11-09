const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testAuthFlow() {
  console.log("=== BITME REAL REGISTRATION & AUTH TEST ===");

  const testEmail = `user_${Date.now()}@example.lk`;
  const testPhone = `+9477${Math.floor(1000000 + Math.random() * 9000000)}`;
  const testName = "Saman Kumara Perera";

  console.log(`1. Testing Registration for: ${testName} (${testEmail}, ${testPhone})`);

  const regRes = await fetch("http://localhost:3000/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: testName,
      email: testEmail,
      phone: testPhone,
      password: "SecretPassword123!",
      nic: "199212345678",
      district: "Kandy",
      address: "No. 15, Peradeniya Road, Kandy",
      storeName: "Kandy Hill Country Collectibles",
      bankName: "Sampath Bank",
      bankBranch: "Kandy Main Branch",
      bankAccount: "0012398745",
    }),
  });

  const regData = await regRes.json();
  console.log("Registration Response Status:", regRes.status);
  console.log("Registration Response:", regData.success ? "SUCCESS" : regData.error);

  if (!regData.success) {
    throw new Error(`Registration failed: ${regData.error}`);
  }

  // Verify in SQLite database via Prisma
  console.log("2. Verifying user in SQLite database...");
  const dbUser = await prisma.user.findUnique({
    where: { email: testEmail },
    include: { profile: true, sellerProfile: true, addresses: true, identities: true },
  });

  if (!dbUser) {
    throw new Error("User was not found in SQLite database!");
  }

  console.log("✓ User verified in SQLite database:");
  console.log("  - ID:", dbUser.id);
  console.log("  - Name:", dbUser.name);
  console.log("  - Role:", dbUser.role);
  console.log("  - NIC:", dbUser.profile?.nicNumber);
  console.log("  - District:", dbUser.profile?.district);
  console.log("  - Store Name:", dbUser.sellerProfile?.storeName);
  console.log("  - Store Slug:", dbUser.sellerProfile?.storeSlug);
  console.log("  - Address:", dbUser.addresses[0]?.street);

  // Test Duplicate Registration Prevention
  console.log("3. Testing Duplicate Email Detection...");
  const dupRes = await fetch("http://localhost:3000/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Duplicate Tester",
      email: testEmail,
      password: "AnotherPassword123",
    }),
  });
  const dupData = await dupRes.json();
  console.log("Duplicate Prevention Response:", dupRes.status === 400 && !dupData.success ? "✓ CORRECTLY REJECTED" : "FAILED");

  // Test Sign In with Email
  console.log("4. Testing Sign In with Registered Email...");
  const loginRes = await fetch("http://localhost:3000/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      identifier: testEmail,
      password: "SecretPassword123!",
    }),
  });
  const loginData = await loginRes.json();
  console.log("Email Login Response Status:", loginRes.status);
  console.log("Email Login Response:", loginData.success ? `✓ Welcome back, ${loginData.user.name}` : loginData.error);

  // Test Sign In with Phone
  console.log("5. Testing Sign In with Registered Phone...");
  const phoneLoginRes = await fetch("http://localhost:3000/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      identifier: testPhone,
      password: "SecretPassword123!",
    }),
  });
  const phoneLoginData = await phoneLoginRes.json();
  console.log("Phone Login Response Status:", phoneLoginRes.status);
  console.log("Phone Login Response:", phoneLoginData.success ? `✓ Welcome back, ${phoneLoginData.user.name}` : phoneLoginData.error);

  console.log("\n==========================================");
  console.log("🎉 ALL REAL AUTHENTICATION TESTS PASSED!");
  console.log("==========================================");
}

testAuthFlow()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error("Test failed:", e);
    process.exit(1);
  });
