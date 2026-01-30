const express = require("express");
const router = express.Router();

const loginController = require("./api-mvc/controllers/loginController.js");
const dashboardController = require("./api-mvc/controllers/dashboardController");
const profileController = require("./api-mvc/controllers/profileController");
const transferController = require("./api-mvc/controllers/transferController");
const accountsController = require("./api-mvc/controllers/accountsController.js");

router.get("/api", (req, res) => {
    res.send("API is working");
});

const { generateAIResponse } = require("./aiService"); //AI chatbot
const { generateGeminiVoiceResponse } = require("./geminiService");

// Login action
router.post("/login", loginController.login);

// Dashboard
router.get("/dashboard", dashboardController.dashboard);

// Profile
router.get("/profile", profileController.profile);
router.post("/profile/update", profileController.updateProfile);

// Transfer page
router.get("/transfer", (req, res) => {
    if (!req.session.user) return res.redirect("/login");

    res.render("transfer", {
        error: null,
        success: null,
        user: req.session.user,
    });
});

// Transfer action
router.post("/transfer", transferController.transfer);

// Logout
router.get("/logout", (req, res) => {
    req.session.destroy(() => {
        res.redirect("/");
    });
});

router.get("/login/token", accountsController.getViaUserID);

// --- AI Chat Route ---
router.post("/api/ai/chat", async (req, res) => {
    // 1. Destructure BOTH message and lang from the request body
    const { message, lang } = req.body;

    // 2. Pass BOTH to the AI service
    const aiResult = await generateAIResponse(message || "", lang || "en");

    // 3. Parse the JSON result safely
    let parsedResult;
    try {
        const cleanText = aiResult.replace(/```json/g, "").replace(/```/g, "").trim();
        parsedResult = JSON.parse(cleanText);
    } catch (e) {
        parsedResult = { action: "chat", reply: aiResult };
    }

    res.json(parsedResult);
});

// voice assistant route
router.post('/api/voice/process', async (req, res) => {
  try {
    const { command } = req.body;
    
    if (!command) {
      return res.status(400).json({ error: "No command provided" });
    }

    const aiResponseRaw = await generateGeminiVoiceResponse(command);
    
    // Gemini with JSON mode usually returns a stringified JSON
    let result;
    try {
      result = JSON.parse(aiResponseRaw);
    } catch (e) {
      // Fallback if parsing fails
      result = { action: "chat", reply: aiResponseRaw };
    }

    res.json(result);
  } catch (error) {
    console.error("Route Error:", error);
    res.status(500).json({ error: "Failed to process voice command" });
  }
});

module.exports = router;
