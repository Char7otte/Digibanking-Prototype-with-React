const MockUser = require('../models/mockUser');

exports.login = (req, res) => {
  const { email, password } = req.body;

  const user = MockUser.findByEmail(email);

  if (!user) {
    return res.status(400).render('login', {
      title: 'Login - OCBC Digital',
      error: 'Invalid email or password.'
    });
  }

  // TEMP: No hashing
  if (password !== user.password) {
    return res.status(400).render('login', {
      title: 'Login - OCBC Digital',
      error: 'Incorrect password.'
    });
  }

  req.session.user = user;
  res.redirect('/dashboard');
};
