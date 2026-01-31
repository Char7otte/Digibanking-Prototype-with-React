// server/testGemini.js
require("dotenv").config();
const axios = require("axios");

async function checkModels() {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    console.error("❌ ERROR: No GEMINI_API_KEY found in .env file.");
    return;
  }

  console.log(`🔑 Testing API Key: ${apiKey.substring(0, 5)}...`);

  try {
    // Attempt to list all available models for this key
    const response = await axios.get(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
    );

    console.log("✅ SUCCESS: Connection established!");
    console.log("📋 Available Models for your key:");
    
    // Print the names of the models
    const models = response.data.models;
    models.forEach(m => {
      if (m.name.includes("gemini")) {
        console.log(`   - ${m.name.replace("models/", "")}`);
      }
    });

  } catch (error) {
    console.error("❌ CONNECTION FAILED");
    if (error.response) {
      console.error(`   Status: ${error.response.status} ${error.response.statusText}`);
      console.error(`   Message:`, JSON.stringify(error.response.data, null, 2));
    } else {
      console.error(`   Error: ${error.message}`);
    }
  }
}

checkModels();