const express = require("express");
const router = express.Router();

const loginController = require("./api-mvc/controllers/loginController.js");
const dashboardController = require("./api-mvc/controllers/dashboardController");
const profileController = require("./api-mvc/controllers/profileController");
const transferController = require("./api-mvc/controllers/transferController");

router.get("/", (req, res) => {
  res.send("Hello from Vercel");
});

router.get("/api/data", (req, res) => {
  res.json({ message: "API is working" });
});

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

module.exports = router;
