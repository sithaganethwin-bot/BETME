const fs = require("fs");
const path = require("path");

const envContent = fs.readFileSync(".env", "utf-8");
const key = envContent
  .split("\n")
  .find((l) => l.startsWith("GEMINI_API_KEY"))
  .split("=")[1]
  .replace(/"/g, "")
  .trim();

async function listModels() {
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;
  const res = await fetch(url);
  const data = await res.json();
  if (data.models) {
    console.log("Found", data.models.length, "models:");
    const names = data.models.filter(m => m.supportedGenerationMethods?.includes("generateContent")).map(m => m.name);
    console.log(names);
  } else {
    console.log("List models response:", data);
  }
}

listModels().catch(console.error);
