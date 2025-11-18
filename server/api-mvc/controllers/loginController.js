const { getPool } = require('../../db');
const bcrypt = require('bcryptjs');

exports.login = async (req, res) => {
  const { username, password } = req.body;

  try {
    if (!username || !password) {
      return res
        .status(400)
        .render('login', { error: 'Please enter username and password.' });
    }

    const pool = await getPool();
    const result = await pool
      .request()
      .input('username', username)
      .query('SELECT * FROM UsersAccounts WHERE username = @username');

    const user = result.recordset[0];

    if (!user) {
      return res.render('login', { error: 'Invalid username or password.' });
    }

    const isMatch = bcrypt.compareSync(password, user.password_hash);
    if (!isMatch) {
      return res.render('login', { error: 'Invalid username or password.' });
    }

    // Save authenticated user into session (from DB)
    req.session.user = {
      id: user.id,
      username: user.username,
      name: user.first_name,
      account_number: user.account_number,
      balance: user.balance,
      account_type: user.account_type,
      currency: user.currency
    };

    return res.redirect('/dashboard');
  } catch (err) {
    console.error('Login error:', err);
    return res
      .status(500)
      .render('login', { error: 'Server error. Please try again.' });
  }
};
