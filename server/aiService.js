// server/aiService.js
const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// --- 🧠 WALL-E'S LOCAL KNOWLEDGE BASE (OFFLINE FALLBACK) ---
function getLocalResponse(command) {
  const cmd = command.toLowerCase();

  // --- 1. Greetings (English & Chinese) ---
  if (cmd.includes("hello") || cmd === "hi" || cmd.includes("你好") || cmd.includes("早安")) {
    return { action: "chat", reply: "Hello! I am Wall-E, your OCBC assistant. I can tell you about our accounts, cards, or help you navigate. (Offline Mode)" };
  }
  if (cmd.includes("bye") || cmd.includes("thank") || cmd.includes("谢谢")) {
    return { action: "chat", reply: "You're welcome! Thank you for banking with OCBC. Goodbye!" };
  }

  // --- 2. Bank Information (OCBC Info) ---
  if (cmd.includes("what is ocbc") || cmd.includes("whats ocbc") || cmd.includes("about ocbc") || cmd.includes("华侨银行")) {
    return { 
      action: "chat", 
      reply: "OCBC Bank, founded in 1932, is the longest established Singapore bank and the second largest financial services group in Southeast Asia by assets. We are consistently ranked among the World's Top 50 Safest Banks." 
    };
  }

  // --- 3. Bank Accounts ---
  if (cmd.includes("frank")) {
    return { action: "chat", reply: "The FRANK Account is designed for youths and young adults. It has no initial deposit requirement and no fall-below fee for those under 26." };
  }
  if (cmd.includes("360")) {
    return { action: "chat", reply: "The OCBC 360 Account is a bonus interest account. You earn more by crediting salary, saving, spending, and investing." };
  }

  // --- 4. Credit Cards ---
  if (cmd.includes("365")) {
    return { action: "chat", reply: "The OCBC 365 Credit Card gives you cashback on daily dining (5%), groceries (3%), and fuel (6%)." };
  }
  if (cmd.includes("90n") || cmd.includes("miles")) {
    return { action: "chat", reply: "The OCBC 90°N Card is built for travelers. You earn Travel$ on spend that never expire." };
  }

  // --- 5. Services & Info ---
  if (cmd.includes("hotline") || cmd.includes("number") || cmd.includes("热线")) {
    return { action: "chat", reply: "Our 24-hour customer hotline is 1800 363 3333. For overseas, call +65 6363 3333." };
  }

  // --- 6. Navigation ---
  if (cmd.includes("transfer") || cmd.includes("pay") || cmd.includes("transaction") || cmd.includes("转账")) {
    return { action: "navigate", route: "/transaction", reply: "Sure, taking you to the transfer page now." };
  }
  if (cmd.includes("balance") || cmd.includes("dashboard") || cmd.includes("home") || cmd.includes("余额")) {
    return { action: "navigate", route: "/dashboard", reply: "Opening your dashboard now." };
  }

  // Default fallback if no keywords match
  return { action: "chat", reply: "I am currently in offline mode. I can help with 'What is OCBC', 'Frank Account', '360 Account', or taking you to 'Transactions'." };
}

async function generateAIResponse(message) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

    const systemPrompt = `
      You are Wall-E, the intelligent banking assistant for OCBC.
      User Message: "${message}"

      === KNOWLEDGE BASE ===
      1. OCBC Info: Founded 1932, longest established Singapore bank, 2nd largest in SE Asia.
      2. OCBC 360 Account: Up to 7.65% interest.
      3. FRANK Account: No fall-below fee for under 26.
      4. OCBC 365 Card: Cashback on dining/fuel.
      5. Hotline: 1800 363 3333.

      === ROUTING ===
      - Transfer/Pay -> route: "/transaction"
      - Balance/Home -> route: "/dashboard"
      - Login/Logout -> route: "/login"

      RETURN JSON ONLY: { "action": "navigate"|"chat", "reply": "...", "route": "..." }
    `;

    const result = await model.generateContent(systemPrompt);
    const response = result.response.text();
    
    // Clean JSON formatting if Gemini adds markdown
    return response.replace(/```json/g, "").replace(/```/g, "").trim();
    
  } catch (err) {
    console.error("Gemini AI Error (Switching to Local Brain):", err.message);
    
    // Use the Local Brain fallback
    return JSON.stringify(getLocalResponse(message));
  }
}

module.exports = { generateAIResponse };