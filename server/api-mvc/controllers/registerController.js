const MockUser = require('../models/mockUser');

exports.register = (req, res) => {
  const { name, email, password, confirmPassword } = req.body;

  if (!name || !email || !password || !confirmPassword) {
    return res.status(400).render('register', {
      title: 'Register - OCBC Digital',
      error: 'Please fill in all fields.'
    });
  }

  if (password !== confirmPassword) {
    return res.status(400).render('register', {
      title: 'Register - OCBC Digital',
      error: 'Passwords do not match.'
    });
  }

  const newUser = {
    name,
    email,
    password,
    accountNumber: "5200 " + Math.floor(Math.random() * 90000000 + 10000000),
    balance: 0.00,
    accounts: []
  };

  MockUser.createUser(newUser);

  req.session.user = newUser;
  res.redirect('/dashboard');
};
