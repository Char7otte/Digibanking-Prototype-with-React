const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// --- 🧠 ECHO'S OFFLINE BRAIN (Local Knowledge Base) ---
function getLocalResponse(command) {
  const cmd = command.toLowerCase();

  // 1. 👋 GREETINGS & CLOSING
  if (cmd.includes("hello") || cmd.includes("hi ") || cmd === "hi") {
    return { action: "chat", reply: "Hello! I am Echo. How can I help you with your banking today?" };
  }
  if (cmd.includes("bye") || cmd.includes("thank") || cmd.includes("close") || cmd.includes("shut down")) {
    return { action: "close", reply: "You're welcome. Echo signing off. Goodbye!" };
  }
  if (cmd.includes("who are you") || cmd.includes("your name")) {
    return { action: "chat", reply: "I am Echo, the intelligent voice assistant for OCBC. I'm currently running in offline mode." };
  }

  // 2. 🏦 GENERAL OCBC INFO
  if (cmd.includes("founded") || cmd.includes("history") || cmd.includes("when was ocbc")) {
    return { action: "chat", reply: "OCBC was founded in 1932 from the merger of three local banks. We are Singapore's longest-established bank." };
  }
  if (cmd.includes("ceo") || cmd.includes("boss")) {
    return { action: "chat", reply: "The current Group CEO of OCBC is Ms. Helen Wong." };
  }
  if (cmd.includes("headquarter") || cmd.includes("location") || cmd.includes("address")) {
    return { action: "chat", reply: "OCBC Centre is located at 65 Chulia Street, Singapore 049513." };
  }
  if (cmd.includes("what is ocbc")) {
    return { action: "chat", reply: "OCBC stands for Oversea-Chinese Banking Corporation. We are the second-largest financial services group in Southeast Asia by assets." };
  }

  // 3. 📞 CONTACT & SUPPORT
  if (cmd.includes("hotline") || cmd.includes("number") || cmd.includes("call") || cmd.includes("contact")) {
    return { action: "chat", reply: "You can call our 24-hour hotline at 1800 363 3333. For overseas, call +65 6363 3333." };
  }
  if (cmd.includes("fraud") || cmd.includes("scam") || cmd.includes("lost card")) {
    return { action: "chat", reply: "If you suspect fraud or lost your card, please call us immediately at 1800 363 3333 and press 9 for emergency assistance." };
  }
  if (cmd.includes("email")) {
    return { action: "chat", reply: "For security reasons, we don't handle account instructions via email. Please use the secure mailbox in the app." };
  }

  // 4. 💳 ACCOUNTS & CARDS
  if (cmd.includes("360") || cmd.includes("three sixty")) {
    return { action: "chat", reply: "The OCBC 360 Account allows you to earn bonus interest by crediting your salary, saving, and spending with us." };
  }
  if (cmd.includes("frank")) {
    return { action: "chat", reply: "FRANK by OCBC is designed for youths and young working adults, offering stylish debit cards and savings growth." };
  }
  if (cmd.includes("credit card") || cmd.includes("365") || cmd.includes("90n") || cmd.includes("titanium")) {
    return { action: "chat", reply: "We offer great cards like the OCBC 365 for cashback, 90°N for miles, and Titanium Rewards for shopping." };
  }
  if (cmd.includes("interest rate")) {
    return { action: "chat", reply: "Interest rates vary by account. The 360 Account offers up to 4.65% p.a. effective interest. Check our website for the latest rates." };
  }

  // 5. 📱 DIGITAL FEATURES
  if (cmd.includes("paynow")) {
    return { action: "navigate", route: "/transaction", reply: "PayNow lets you send money instantly using just a mobile number or NRIC. Opening transfer page now." };
  }
  if (cmd.includes("onetoken") || cmd.includes("token")) {
    return { action: "chat", reply: "OneToken is your digital security token built into the OCBC app. You no longer need a physical hardware token." };
  }
  if (cmd.includes("atm") || cmd.includes("branch")) {
    return { action: "chat", reply: "You can find the nearest ATM or branch using the locator feature on our login page or website." };
  }

  // 6. 🚀 NAVIGATION & ACTIONS
  if (cmd.includes("transfer") || cmd.includes("pay") || cmd.includes("send money")) {
    return { action: "navigate", route: "/transaction", reply: "Opening the transaction page." };
  }
  if (cmd.includes("balance") || cmd.includes("dashboard") || cmd.includes("home") || cmd.includes("how much money")) {
    return { action: "navigate", route: "/dashboard", reply: "Taking you to your dashboard." };
  }
  if (cmd.includes("profile") || cmd.includes("setting") || cmd.includes("change detail")) {
    return { action: "navigate", route: "/profile", reply: "Opening your profile settings." };
  }
  if (cmd.includes("logout") || cmd.includes("log out") || cmd.includes("sign out")) {
    return { action: "navigate", route: "/", reply: "Logging you out securely." };
  }
  if (cmd.includes("login") || cmd.includes("sign in")) {
    return { action: "navigate", route: "/", reply: "Here is the login page." };
  }
  if (cmd.includes("dark mode") || cmd.includes("light mode") || cmd.includes("theme")) {
    return { action: "theme", reply: "Toggling display theme." };
  }

  // 7. 🤷 FALLBACK (If nothing matches)
  return { action: "chat", reply: "I'm in offline mode and didn't catch that. Try asking about 'Hotline', '360 Account', or say 'Transfer money'." };
}

async function generateGeminiVoiceResponse(command) {
  try {
    // Attempt to use the AI
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
    
    const systemPrompt = `
    You are Echo for OCBC. User: "${command}". 
    Return JSON with "action", "reply", and "route". 
    Logic: Navigation, Theme, Chat, or Close (for thanks/bye). 
    JSON ONLY.
    `;

    const result = await model.generateContent(systemPrompt);
    const response = await result.response;
    let text = response.text();
    return text.replace(/```json/g, "").replace(/```/g, "").trim();

  } catch (error) {
    console.error("Gemini Voice Error:", error.message);
    
    // --- INTELLIGENT LOCAL FALLBACK ---
    // Triggered if Quota Exceeded (429) OR any other network error
    console.log("⚠️ Using Local Echo Brain.");
    const fallback = getLocalResponse(command);
    
    // Optional: Add a prefix to know it's local (Remove "[Local]" if you want it seamless)
    // fallback.reply = "[Offline] " + fallback.reply; 
    
    return JSON.stringify(fallback);
  }
}

module.exports = { generateGeminiVoiceResponse };