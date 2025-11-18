const express = require('express');
const router = express.Router();

const loginController = require('../api-mvc/controllers/loginController');
const dashboardController = require('../api-mvc/controllers/dashboardController');
const profileController = require('../api-mvc/controllers/profileController');
const transferController = require('../api-mvc/controllers/transferController');

// Home
router.get('/', (req, res) => {
  res.render('index', { user: req.session.user });
});

// Login page
router.get('/login', (req, res) => {
  res.render('login', { error: null });
});

// Login action
router.post('/login', loginController.login);

// Dashboard
router.get('/dashboard', dashboardController.dashboard);

// Profile
router.get('/profile', profileController.profile);

// ✅ ADD TRANSFER PAGE (FIX 404)
router.get('/transfer', (req, res) => {
  if (!req.session.user) return res.redirect('/login');

  res.render('transfer', {
    user: req.session.user,
    error: null,
    success: null    // <-- THIS WAS MISSING
  });
});


// ✅ ADD TRANSFER ACTION
router.post('/transfer', transferController.transfer);

router.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/");
  });
});


module.exports = router;
