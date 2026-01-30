const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

async function checkModels() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return console.log("❌ No API Key found in .env");

  const genAI = new GoogleGenerativeAI(key);
  console.log(`🔑 Testing Key: ${key.substring(0, 5)}...`);

  const modelsToCheck = [
    "gemini-1.5-flash", 
    "gemini-1.5-flash-001",
    "gemini-1.5-pro",
    "gemini-pro", 
    "gemini-1.0-pro"
  ];

  for (const model of modelsToCheck) {
    try {
      process.stdout.write(`Testing "${model}"... `);
      const m = genAI.getGenerativeModel({ model });
      await m.generateContent("Hi");
      console.log("✅ WORKS!");
      console.log(`\n>>> PLEASE UPDATE geminiService.js TO USE: "${model}" <<<\n`);
      return;
    } catch (e) {
      console.log("❌ Failed (404 or Error)");
    }
  }
  console.log("⚠️ Could not find a standard model. Check your Chatbot code!");
}
checkModels();