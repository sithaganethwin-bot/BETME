const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testPasswordValidation() {
  console.log("=== BITME PASSWORD ENFORCEMENT & RETYPE VALIDATION TEST ===");

  const testEmailBase = `pwdtest_${Date.now()}`;

  // Test 1: Short password rejection
  console.log("1. Testing Short Password (< 8 chars) Rejection...");
  const resShort = await fetch("http://localhost:3000/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Short Pass Tester",
      email: `${testEmailBase}_1@example.lk`,
      password: "Short1!",
    }),
  });
  const dataShort = await resShort.json();
  console.log("Short Password Status:", resShort.status, "| Error:", dataShort.error);
  if (resShort.status !== 400 || !dataShort.error.includes("at least 8 characters")) {
    throw new Error("Short password was not rejected properly!");
  }
  console.log("✓ Correctly rejected short password.");

  // Test 2: Missing Uppercase rejection
  console.log("2. Testing Missing Uppercase Rejection...");
  const resNoUpper = await fetch("http://localhost:3000/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "No Upper Tester",
      email: `${testEmailBase}_2@example.lk`,
      password: "password123!",
    }),
  });
  const dataNoUpper = await resNoUpper.json();
  console.log("No Upper Status:", resNoUpper.status, "| Error:", dataNoUpper.error);
  if (resNoUpper.status !== 400 || !dataNoUpper.error.includes("uppercase letter")) {
    throw new Error("Password without uppercase was not rejected properly!");
  }
  console.log("✓ Correctly rejected password missing uppercase letter.");

  // Test 3: Missing Number rejection
  console.log("3. Testing Missing Number Rejection...");
  const resNoNum = await fetch("http://localhost:3000/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "No Number Tester",
      email: `${testEmailBase}_3@example.lk`,
      password: "PasswordWithoutNumber!",
    }),
  });
  const dataNoNum = await resNoNum.json();
  console.log("No Number Status:", resNoNum.status, "| Error:", dataNoNum.error);
  if (resNoNum.status !== 400 || !dataNoNum.error.includes("number")) {
    throw new Error("Password without number was not rejected properly!");
  }
  console.log("✓ Correctly rejected password missing number.");

  // Test 4: Valid Strong Password with Uppercase, Lowercase, Number & Special Char
  console.log("4. Testing Valid Strong Password Registration...");
  const validEmail = `${testEmailBase}_valid@example.lk`;
  const resValid = await fetch("http://localhost:3000/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Secure User",
      email: validEmail,
      phone: "+9477" + Math.floor(1000000 + Math.random() * 9000000),
      password: "BitmeSecure@2026",
      nic: "199324567891",
      district: "Gampaha",
      address: "Negombo Road, Gampaha",
      storeName: "Gampaha Gem & Horology",
      bankName: "Commercial Bank of Ceylon",
      bankAccount: "1002345678",
    }),
  });
  const dataValid = await resValid.json();
  console.log("Valid Strong Password Status:", resValid.status, "| Success:", dataValid.success);
  if (resValid.status !== 200 || !dataValid.success) {
    throw new Error(`Valid registration failed: ${dataValid.error}`);
  }
  console.log("✓ Successfully registered with strong password!");

  console.log("\n==================================================");
  console.log("🎉 ALL PASSWORD VALIDATION & STRENGTH TESTS PASSED!");
  console.log("==================================================");
}

testPasswordValidation()
  .then(async () => {
    await prisma.$disconnect();
    process.exit(0);
  })
  .catch(async (e) => {
    await prisma.$disconnect();
    console.error("Test failed:", e);
    process.exit(1);
  });
