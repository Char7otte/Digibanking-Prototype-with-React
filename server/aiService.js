// server/aiService.js
const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// --- 🧠 WALL-E'S BILINGUAL LOCAL KNOWLEDGE BASE (OFFLINE FALLBACK) ---
function getLocalResponse(command, lang = 'en') {
  const cmd = command.toLowerCase();
  const isZh = lang === 'zh';

  // --- 1. Greetings ---
  if (cmd.includes("hello") || cmd === "hi" || cmd.includes("你好") || cmd.includes("早安")) {
    return { 
      action: "chat", 
      reply: isZh ? "你好！我是 Wall-E，您的华侨银行助手。我可以为您介绍账户、信用卡或协助您导航。(离线模式)" : "Hello! I am Wall-E, your OCBC assistant. I can tell you about our accounts, cards, or help you navigate. (Offline Mode)" 
    };
  }
  if (cmd.includes("bye") || cmd.includes("thank") || cmd.includes("谢谢") || cmd.includes("再见")) {
    return { 
      action: "chat", 
      reply: isZh ? "不客气！感谢您选择华侨银行。再见！" : "You're welcome! Thank you for banking with OCBC. Goodbye!" 
    };
  }

  // --- 2. Bank Information ---
  if (cmd.includes("what is ocbc") || cmd.includes("whats ocbc") || cmd.includes("about ocbc") || cmd.includes("华侨银行")) {
    return { 
      action: "chat", 
      reply: isZh ? "华侨银行（OCBC）创立于1932年，是新加坡历史最悠久的银行。我们是东南亚资产规模第二大的金融服务集团。" : "OCBC Bank, founded in 1932, is the longest established Singapore bank and the second largest financial services group in Southeast Asia by assets." 
    };
  }

  // --- 3. Bank Accounts ---
  if (cmd.includes("frank")) {
    return { 
      action: "chat", 
      reply: isZh ? "FRANK 账户专为年轻人设计。没有最低存款要求，26岁以下客户免收低余额费。" : "The FRANK Account is designed for youths and young adults. It has no initial deposit requirement and no fall-below fee for those under 26." 
    };
  }
  if (cmd.includes("360")) {
    return { 
      action: "chat", 
      reply: isZh ? "OCBC 360 账户是一款红利储蓄账户。通过发薪、储蓄和消费，您可以赚取高达 7.65% 的年利率。" : "The OCBC 360 Account is a bonus interest account. You earn more by crediting salary, saving, and spending." 
    };
  }

  // --- 4. Credit Cards ---
  if (cmd.includes("365")) {
    return { 
      action: "chat", 
      reply: isZh ? "OCBC 365 信用卡在餐饮（5%）、超市（3%）和燃油（6%）消费上提供现金回扣。" : "The OCBC 365 Credit Card gives you cashback on dining (5%), groceries (3%), and fuel (6%)." 
    };
  }
  if (cmd.includes("90n") || cmd.includes("miles")) {
    return { 
      action: "chat", 
      reply: isZh ? "OCBC 90°N 信用卡专为旅行者设计。您的里程永不过期。" : "The OCBC 90°N Card is built for travelers. Your miles never expire." 
    };
  }

  // --- 5. Services ---
  if (cmd.includes("hotline") || cmd.includes("number") || cmd.includes("热线")) {
    return { 
      action: "chat", 
      reply: isZh ? "我们的24小时客户服务热线是 1800 363 3333。" : "Our 24-hour customer hotline is 1800 363 3333." 
    };
  }

  // --- 6. Navigation (HEAVILY IMPROVED) ---
  
  // Transfer Logic: Catch "transfer", "pay", "转钱", "付钱", etc.
  if (cmd.includes("transfer") || cmd.includes("pay") || cmd.includes("transaction") || 
      cmd.includes("转账") || cmd.includes("转钱") || cmd.includes("支付") || cmd.includes("付钱")) {
    return { 
      action: "navigate", 
      route: "/transaction", 
      reply: isZh ? "好的，正在为您打开转账页面。" : "Sure, taking you to the transfer page now." 
    };
  }

  // Dashboard Logic: Catch "balance", "money", "account", "多少钱", "看钱", etc.
  if (cmd.includes("balance") || cmd.includes("dashboard") || cmd.includes("home") || cmd.includes("account") || cmd.includes("money") ||
      cmd.includes("余额") || cmd.includes("主页") || cmd.includes("查钱") || cmd.includes("账户") || cmd.includes("户口") || cmd.includes("多少钱") || cmd.includes("看钱") || cmd.includes("我的钱")) {
    return { 
      action: "navigate", 
      route: "/dashboard", 
      reply: isZh ? "好的，正在为您打开主面板。" : "Opening your dashboard now." 
    };
  }

  // Default fallback
  return { 
    action: "chat", 
    reply: isZh ? "我目前处于离线模式。您可以询问‘华侨银行’、‘FRANK 账户’，或说‘我要转账’、‘查看余额’。" : "I am currently in offline mode. I can help with 'What is OCBC', 'Frank Account', 'Transfer', or 'Check Balance'." 
  };
}

async function generateAIResponse(message, lang = 'en') {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

    const systemPrompt = `
      You are Wall-E, the intelligent banking assistant for OCBC.
      STRICT LANGUAGE RULE: The user has set the language to ${lang === 'zh' ? 'CHINESE' : 'ENGLISH'}. 
      You MUST respond ONLY in ${lang === 'zh' ? 'Chinese (Simplified)' : 'English'}.
      
      === KNOWLEDGE ===
      1. OCBC 360 Account: Up to 7.65% interest.
      2. FRANK Account: No fall-below fee for under 26.
      3. Hotline: 1800 363 3333.

      === ROUTING ===
      - Transfer/Pay -> route: "/transaction"
      - Balance/Home -> route: "/dashboard"

      RETURN JSON ONLY: { "action": "navigate"|"chat", "reply": "...", "route": "..." }
      User Message: "${message}"
    `;

    const result = await model.generateContent(systemPrompt);
    const response = result.response.text();
    return response.replace(/```json/g, "").replace(/```/g, "").trim();
    
  } catch (err) {
    console.error("Gemini Error, using Local Fallback:", err.message);
    return JSON.stringify(getLocalResponse(message, lang));
  }
}

module.exports = { generateAIResponse };