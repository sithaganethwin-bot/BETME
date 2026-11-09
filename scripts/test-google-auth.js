const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testGoogleAuth() {
  console.log("=== BITME GOOGLE AUTHENTICATION (SIGN IN & REGISTER) TEST ===");

  // Test 1: Check Google endpoint status
  console.log("1. Testing GET /api/auth/google?action=status...");
  const statusRes = await fetch("http://localhost:3000/api/auth/google?action=status");
  const statusData = await statusRes.json();
  console.log("Google Status Response:", statusData);

  // Test 2: Register New User via Google
  const googleEmail = `google_user_${Date.now()}@gmail.com`;
  const googleId = `g_sub_${Date.now()}`;
  const googleName = "Nimal Siripala";
  const googleAvatar = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80";

  console.log(`2. Testing Google Registration for: ${googleName} (${googleEmail})...`);
  const regRes = await fetch("http://localhost:3000/api/auth/google", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: googleEmail,
      name: googleName,
      googleId,
      avatarUrl: googleAvatar,
    }),
  });

  const regData = await regRes.json();
  console.log("Google Reg Status:", regRes.status, "| Success:", regData.success, "| IsNewUser:", regData.isNewUser);

  if (!regData.success || !regData.isNewUser) {
    throw new Error(`Google registration failed: ${regData.error || "Expected isNewUser=true"}`);
  }

  // Verify in SQLite database
  console.log("3. Verifying Google User in SQLite Database...");
  const dbUser = await prisma.user.findUnique({
    where: { email: googleEmail },
    include: { identities: true, profile: true, sellerProfile: true },
  });

  if (!dbUser) {
    throw new Error("User was not found in SQLite DB!");
  }

  console.log("✓ User verified in SQLite database:");
  console.log("  - ID:", dbUser.id);
  console.log("  - Name:", dbUser.name);
  console.log("  - Role:", dbUser.role);
  console.log("  - Email Verified:", dbUser.isEmailVerified);
  console.log("  - Store Name:", dbUser.sellerProfile?.storeName);
  console.log("  - Identity Provider:", dbUser.identities[0]?.provider);
  console.log("  - Identity ProviderId:", dbUser.identities[0]?.providerId);

  if (dbUser.identities[0]?.provider !== "GOOGLE") {
    throw new Error("Identity provider is not GOOGLE!");
  }

  // Test 4: Existing User Login via Google
  console.log("4. Testing Google Sign In with Existing Account...");
  const loginRes = await fetch("http://localhost:3000/api/auth/google", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: googleEmail,
      name: googleName,
      googleId,
    }),
  });

  const loginData = await loginRes.json();
  console.log("Google Login Status:", loginRes.status, "| Success:", loginData.success, "| IsNewUser:", loginData.isNewUser);

  if (!loginData.success || loginData.isNewUser !== false) {
    throw new Error("Expected existing user to be recognized (isNewUser=false)!");
  }
  console.log(`✓ Welcome back message: "${loginData.message}"`);

  // Test 5: Invalid payload rejection
  console.log("5. Testing Invalid Email Rejection...");
  const badRes = await fetch("http://localhost:3000/api/auth/google", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "invalid-email-format",
      name: "Bad User",
    }),
  });
  const badData = await badRes.json();
  console.log("Bad Email Status:", badRes.status, "| Error:", badData.error);
  if (badRes.status !== 400) {
    throw new Error("Invalid email was not rejected with status 400!");
  }
  console.log("✓ Correctly rejected invalid email.");

  console.log("\n==============================================");
  console.log("🎉 ALL GOOGLE AUTHENTICATION TESTS PASSED!");
  console.log("==============================================");
}

testGoogleAuth()
  .then(async () => {
    await prisma.$disconnect();
    process.exit(0);
  })
  .catch(async (e) => {
    await prisma.$disconnect();
    console.error("Test failed:", e);
    process.exit(1);
  });
