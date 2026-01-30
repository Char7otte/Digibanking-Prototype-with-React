const express = require("express");

// Middleware to extract mode from query parameters
function extractMode(req, res, next) {
  req.mode = req.query.mode || "live";
  next();
}

function validateMode(req, res, next) {
  const validModes = ["demo", "live"];
  if (!validModes.includes(req.mode)) {
    return res.status(400).json({ error: "Invalid mode. Use 'demo' or 'live'." });
  }
  next();
}

// Middleware to enforce demo mode only
function enforceDemoMode(req, res, next) {
  if (req.mode !== "demo") {
    return res.status(403).json({ error: "This action is only allowed in demo mode." });
  }
  next();
}

module.exports = { 
    extractMode,
    validateMode,
    enforceDemoMode
};