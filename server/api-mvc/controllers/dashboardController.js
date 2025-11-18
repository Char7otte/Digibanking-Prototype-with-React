const { getPool } = require('../../db');

exports.dashboard = async (req, res) => {
  if (!req.session.user) return res.redirect('/login');

  try {
    const pool = await getPool();

    const result = await pool.request()
      .input('id', req.session.user.id)
      .query(`
        SELECT first_name, account_number, balance, account_type, currency
        FROM UsersAccounts
        WHERE id = @id
      `);

    const row = result.recordset[0] || {};

    // Refresh session from DB (fallback to existing session fields if null)
    req.session.user = {
      ...req.session.user,
      name: row.first_name || req.session.user.name,
      account_number: row.account_number || req.session.user.account_number,
      balance: row.balance ?? req.session.user.balance,
      account_type: row.account_type || req.session.user.account_type || 'Savings',
      currency: row.currency || req.session.user.currency || 'SGD'
    };

    res.render("dashboard", {
      title: "Dashboard",
      user: req.session.user,
      name: req.session.user.name,
      account_type: req.session.user.account_type,
      accountNumber: req.session.user.account_number,
      currency: req.session.user.currency,
      balance: req.session.user.balance
  });

  } catch (err) {
    console.error('Dashboard error:', err);
    return res.status(500).send('Server error');
  }
};
