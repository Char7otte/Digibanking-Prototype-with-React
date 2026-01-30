const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// --- 🧠 ECHO'S EXPANDED KNOWLEDGE BASE (BILINGUAL + OFFLINE) ---
function getLocalResponse(command) {
  const cmd = command.toLowerCase();

  // ==========================================
  // 🇨🇳 CHINESE KNOWLEDGE BASE (中文资料库)
  // ==========================================
  
  // --- 1. Greetings (问候) ---
  if (cmd.includes("你好") || cmd.includes("早安") || cmd.includes("嗨")) {
    return { action: "chat", reply: "你好！我是华侨银行的智能助手 Echo。我可以为您介绍各类账户、信用卡，或协助您转账。" };
  }
  if (cmd.includes("再见") || cmd.includes("谢谢")) {
    return { action: "close", reply: "不客气。感谢您使用华侨银行服务。再见！" };
  }

  // --- 2. Bank Accounts (银行账户) ---
  if (cmd.includes("frank")) {
    return { action: "chat", reply: "Frank 账户是专为年轻人和职场新人设计的。它没有最低存款要求，设计时尚，非常适合千禧一代管理储蓄。" };
  }
  if (cmd.includes("360") || cmd.includes("360 账户")) {
    return { action: "chat", reply: "OCBC 360 账户是我们的旗舰红利账户。通过存入薪水、储蓄、消费和投资，您可以获得更高的红利利息，年利率高达 4.65% (需符合条件)。" };
  }
  if (cmd.includes("月蓄") || cmd.includes("msa")) {
    return { action: "chat", reply: "月蓄账户 (MSA) 是一种零存整取的储蓄计划。只要您每月按时存入固定金额且不提款，即可获得额外利息奖励。" };
  }
  if (cmd.includes("结单") || cmd.includes("statement savings")) {
    return { action: "chat", reply: "结单储蓄账户是我们的基础储蓄账户，提供简单的存取款功能和电子结单，适合日常资金周转。" };
  }
  if (cmd.includes("儿童") || cmd.includes("cda")) {
    return { action: "chat", reply: "儿童培育账户 (CDA) 是为孩子教育和医疗开支设立的特殊储蓄账户，享有政府的一对一匹配津贴。" };
  }

  // --- 3. Credit Cards (信用卡) ---
  if (cmd.includes("365") || cmd.includes("信用卡")) {
    return { action: "chat", reply: "OCBC 365 信用卡提供日常消费现金回扣。无论是餐饮、网购还是加油，您都可以享受全年无休的回扣优惠。" };
  }
  if (cmd.includes("90n") || cmd.includes("里程")) {
    return { action: "chat", reply: "OCBC 90°N 信用卡专为旅行者设计。您的消费可以快速累积里程，且里程永不过期，兑换灵活。" };
  }
  if (cmd.includes("titanium") || cmd.includes("钛金")) {
    return { action: "chat", reply: "Titanium Rewards 卡是购物者的首选。在百货公司或特定零售商消费可赚取 10 倍积分 (OCBC$)" };
  }
  if (cmd.includes("infinity") || cmd.includes("无限")) {
    return { action: "chat", reply: "Infinity Cashback 卡提供无上限的现金回扣，没有最低消费要求，适合大额消费或不确定的消费模式。" };
  }

  // --- 4. Services & Info (服务与信息) ---
  if (cmd.includes("paynow")) {
    return { action: "navigate", route: "/transaction", reply: "PayNow 让您只需使用手机号码或身份证号码即可即时转账。正在为您打开转账页面。" };
  }
  if (cmd.includes("atm") || cmd.includes("提款机")) {
    return { action: "chat", reply: "您可以使用 OCBC 应用程序中的'寻找 ATM'功能来定位最近的提款机。全岛共有超过 500 台 ATM 为您服务。" };
  }
  if (cmd.includes("token") || cmd.includes("令牌")) {
    return { action: "chat", reply: "OneToken 是您的数字安全令牌，内置于手机应用中。它比传统硬件令牌更安全，交易认证更方便。" };
  }
  if (cmd.includes("热线") || cmd.includes("电话")) {
    return { action: "chat", reply: "我们的 24 小时客户服务热线是 1800 363 3333。如遇紧急情况，请按 9 字键。" };
  }
  
  // --- CHINESE NAVIGATION FIX (Added more keywords) ---
  if (cmd.includes("余额") || cmd.includes("钱") || cmd.includes("主页")) {
    return { action: "navigate", route: "/dashboard", reply: "好的，正在为您打开账户概览页面。" };
  }
  // Added "交易" (transaction) to keywords
  if (cmd.includes("转账") || cmd.includes("支付") || cmd.includes("交易")) {
    return { action: "navigate", route: "/transaction", reply: "好的，正在为您打开转账页面。" };
  }


  // ==========================================
  // 🇺🇸 ENGLISH KNOWLEDGE BASE
  // ==========================================

  // --- 1. Greetings ---
  if (cmd.includes("hello") || cmd === "hi") {
    return { action: "chat", reply: "Hello! I am Echo, your OCBC assistant. I can tell you about our accounts, cards, or help you with transactions." };
  }
  if (cmd.includes("bye") || cmd.includes("thank") || cmd.includes("close")) {
    return { action: "close", reply: "You're welcome. Thank you for banking with OCBC. Goodbye!" };
  }

  // --- 2. Bank Accounts ---
  if (cmd.includes("frank")) {
    return { action: "chat", reply: "The FRANK Account is designed for youths and young adults. It has no initial deposit requirement and features stylish card designs." };
  }
  if (cmd.includes("360")) {
    return { action: "chat", reply: "The OCBC 360 Account is our flagship bonus interest account. You earn higher interest by crediting salary, saving, spending, and insuring." };
  }
  if (cmd.includes("monthly savings") || cmd.includes("msa")) {
    return { action: "chat", reply: "The Monthly Savings Account (MSA) rewards you for saving regularly. Deposit a fixed sum monthly without withdrawing to earn bonus interest." };
  }
  if (cmd.includes("statement savings")) {
    return { action: "chat", reply: "The Statement Savings Account is our basic account for daily needs, offering easy access to funds and monthly electronic statements." };
  }
  if (cmd.includes("cda") || cmd.includes("child")) {
    return { action: "chat", reply: "The Child Development Account (CDA) is a special savings account for your child's education and healthcare, with dollar-for-dollar government matching." };
  }

  // --- 3. Credit Cards ---
  if (cmd.includes("365") || cmd.includes("credit card")) {
    return { action: "chat", reply: "The OCBC 365 Credit Card gives you cashback on daily dining, groceries, petrol, and online travel all year round." };
  }
  if (cmd.includes("90n") || cmd.includes("miles")) {
    return { action: "chat", reply: "The OCBC 90°N Card is built for travelers. You earn miles quickly on daily spend, and your miles never expire." };
  }
  if (cmd.includes("titanium")) {
    return { action: "chat", reply: "The Titanium Rewards Card is perfect for shoppers. You earn 10x OCBC$ (points) on fashion, electronics, and department store purchases." };
  }
  if (cmd.includes("infinity")) {
    return { action: "chat", reply: "The Infinity Cashback Card offers limitless cashback with no minimum spend and no cap, perfect for big-ticket purchases." };
  }

  // --- 4. Services & Info ---
  if (cmd.includes("paynow")) {
    return { action: "navigate", route: "/transaction", reply: "PayNow lets you send money instantly using just a mobile number or NRIC. Opening the transfer page now." };
  }
  if (cmd.includes("atm")) {
    return { action: "chat", reply: "You can locate the nearest ATM using the 'Locator' feature in our app. We have over 500 ATMs islandwide." };
  }
  if (cmd.includes("onetoken") || cmd.includes("token")) {
    return { action: "chat", reply: "OneToken is your digital security key embedded in the OCBC app. It replaces the physical hardware token for secure and easy authentication." };
  }
  if (cmd.includes("hotline") || cmd.includes("number")) {
    return { action: "chat", reply: "Our 24-hour customer hotline is 1800 363 3333. For urgent card suspensions, please press 9." };
  }
  if (cmd.includes("founded") || cmd.includes("history")) {
    return { action: "chat", reply: "OCBC was founded in 1932 through the merger of three local banks. We are Singapore's longest-established bank." };
  }

  // --- 5. Navigation (Fixed for plural 'transactions') ---
  if (cmd.includes("transfer") || cmd.includes("pay") || cmd.includes("transaction") || cmd.includes("send money")) {
    return { action: "navigate", route: "/transaction", reply: "Opening the transaction page." };
  }
  if (cmd.includes("balance") || cmd.includes("dashboard") || cmd.includes("home")) {
    return { action: "navigate", route: "/dashboard", reply: "Opening your dashboard now." };
  }

  return { action: "chat", reply: "I'm in offline mode. Ask me about 'Frank Account', '360 Account', or 'Hotline'." };
}

async function generateGeminiVoiceResponse(command) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
    
    // --- UPDATED SYSTEM PROMPT WITH STRICT ROUTES ---
    const systemPrompt = `
    You are Echo, the OCBC Bank Assistant. You are BILINGUAL.
    User said: "${command}"
    
    1. If user speaks Chinese -> Reply in Chinese.
    2. If user speaks English -> Reply in English.
    3. OCBC Info: Founded 1932, Hotline 1800 363 3333.
    
    4. **NAVIGATION RULES (STRICT):**
       - If user asks for "transactions", "transfer", "pay" -> route: "/transaction" (Singular)
       - If user asks for "dashboard", "balance", "home" -> route: "/dashboard"
       - If user asks for "logout" -> route: "/"

    RETURN JSON ONLY: { "action": "...", "reply": "...", "route": "...", "lang": "..." }
    `;

    const result = await model.generateContent(systemPrompt);
    const response = await result.response;
    let text = response.text().replace(/```json/g, "").replace(/```/g, "").trim();
    return text;

  } catch (error) {
    console.error("Gemini Error:", error.message);
    // If API fails, use the Local Brain
    return JSON.stringify(getLocalResponse(command));
  }
}

module.exports = { generateGeminiVoiceResponse };