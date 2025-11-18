const express = require('express');
const router = express.Router();

// Controllers live in api-mvc
const dashboardController = require('../api-mvc/controllers/dashboardController');
const loginController = require('../api-mvc/controllers/loginController');
const registerController = require('../api-mvc/controllers/registerController');
const profileController = require('../api-mvc/controllers/profileController');
const transferController = require('../api-mvc/controllers/transferController');

// Home (landing page)
router.get('/', (req, res) => {
  res.render('index', { title: 'OCBC Digital - Home' });
});

// Login
router.get('/login', (req, res) => {
  res.render('login', { title: 'Login - OCBC Digital' });
});
router.post('/login', loginController.login);

// Register
router.get('/register', (req, res) => {
  res.render('register', { title: 'Register - OCBC Digital' });
});
router.post('/register', registerController.register);

// Dashboard
router.get('/dashboard', dashboardController.dashboard);

// Transfer (form)
router.get('/transfer', (req, res) => {
  const user = req.session?.user || null;
  res.render('transfer', {
    title: 'Transfer - OCBC Digital',
    user
  });
});

// Transfer (action)
router.post('/transfer', transferController.transfer);

// Profile
router.get('/profile', profileController.profile);

module.exports = router;
