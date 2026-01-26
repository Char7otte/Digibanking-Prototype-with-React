const express = require("express");
const router = express.Router();

const loginController = require("./api-mvc/controllers/loginController.js");
const dashboardController = require("./api-mvc/controllers/dashboardController");
const profileController = require("./api-mvc/controllers/profileController");
const transferController = require("./api-mvc/controllers/transferController");
const { generateAIResponse } = require("./aiService");
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

// --- AI Chat Route ---
router.post("/api/ai/chat", async (req, res) => {
    const { message } = req.body;

    // 1. Ask the AI Service
    const aiResult = await generateAIResponse(message || "");

    // 2. Parse the JSON result safely
    let parsedResult;
    try {
        // Clean up any potential markdown formatting from Gemini
        const cleanText = aiResult.replace(/```json/g, "").replace(/```/g, "").trim();
        parsedResult = JSON.parse(cleanText);
    } catch (e) {
        // Fallback if AI didn't return perfect JSON
        parsedResult = { action: "chat", reply: aiResult };
    }

    // 3. Send back to Frontend
    res.json(parsedResult);
});

module.exports = router;
