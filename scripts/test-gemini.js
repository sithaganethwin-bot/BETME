const fs = require("fs");
const path = require("path");

// Load .env
const envPath = path.resolve(process.cwd(), ".env");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  envContent.split("\n").forEach((line) => {
    const [k, ...v] = line.split("=");
    if (k && v.length) process.env[k.trim()] = v.join("=").replace(/(^"|"$)/g, "").trim();
  });
}

const key = process.env.GEMINI_API_KEY;
console.log("Testing Google Gemini API Key:", key ? `${key.slice(0, 8)}...${key.slice(-4)}` : "MISSING");

async function testGemini() {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${key}`;
  const payload = {
    contents: [
      {
        role: "user",
        parts: [{ text: "Say 'Google Gemini is active on Bitme server!' in one brief sentence." }],
      },
    ],
  };

  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  console.log("HTTP Status:", res.status);
  const data = await res.json();
  if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
    console.log("Gemini Response:", data.candidates[0].content.parts[0].text.trim());
    console.log("Gemini Integration Test: PASS ✅");
  } else {
    console.log("Error details:", JSON.stringify(data, null, 2));
  }
}

testGemini().catch(console.error);
