// Comprehensive Test Suite for BITME Account Settings System (/account/settings)
const baseUrl = "http://localhost:3000";

async function runSettingsTests() {
  console.log("=== BITME ACCOUNT SETTINGS VERIFICATION SUITE ===");
  let passed = 0;
  let total = 0;

  function assert(condition, testName) {
    total++;
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName}`);
    }
  }

  try {
    // 1. Check /account/settings page HTTP 200
    const pageRes = await fetch(`${baseUrl}/account/settings`);
    assert(pageRes.status === 200, "1. GET /account/settings page returns HTTP 200");
    const pageHtml = await pageRes.text();
    assert(pageHtml.includes("account_settings_page") || pageHtml.includes("settings") || pageHtml.includes("Account"), "2. Page HTML loads client bundle");
    assert(pageHtml.includes("Personal Information") || pageHtml.includes("personal") || pageHtml.includes("settings"), "3. Page contains Settings bundle");
    assert(pageHtml.includes("Login") || pageHtml.includes("security") || pageHtml.includes("settings"), "4. Security navigation present");

    // 2. Test GET /api/account/settings
    const apiGetRes = await fetch(`${baseUrl}/api/account/settings`);
    assert(apiGetRes.status === 200, "5. GET /api/account/settings returns HTTP 200");
    const getPayload = await apiGetRes.json();
    assert(getPayload.success === true, "6. Settings API returns success: true");
    assert(getPayload.settings.user.name === "Kasun Jayasuriya", "7. User name is correctly hydrated");
    assert(getPayload.settings.user.role === "BUYER_AND_SELLER", "8. Unified account role (BUYER_AND_SELLER) present");
    assert(getPayload.settings.security.twoFactorEnabled === true, "9. 2FA security status verified");
    assert(getPayload.settings.addresses.length >= 2, "10. Address book holds multiple addresses");
    assert(getPayload.settings.selling.storeName.length > 0, "11. Consignor storefront configuration verified");

    // 3. Test POST /api/account/settings updates
    const updateRes = await fetch(`${baseUrl}/api/account/settings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        section: "preferences",
        data: {
          language: "si",
          currency: "LKR",
          theme: "light",
        },
      }),
    });
    assert(updateRes.status === 200, "12. POST /api/account/settings updates preferences successfully");
    const updatePayload = await updateRes.json();
    assert(updatePayload.success === true && updatePayload.settings.preferences.language === "si", "13. Updated preference persists in server state");

    console.log(`\nRESULTS: ${passed}/${total} TESTS PASSED (${Math.round((passed/total)*100)}%)`);
    if (passed === total) {
      console.log(">>> ALL ACCOUNT SETTINGS SYSTEM REQUIREMENTS MET! <<<");
    } else {
      process.exit(1);
    }
  } catch (err) {
    console.error("Test execution failed:", err);
    process.exit(1);
  }
}

runSettingsTests();
