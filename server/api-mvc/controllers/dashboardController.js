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
      balance: req.session.user.balance,

      // Optional but recommended:
      transactions: [
          { title: "Giant Supermarket", date: "2025-11-10", amount: -52.90 },
          { title: "Salary", date: "2025-11-08", amount: 3200 },
          { title: "GrabPay", date: "2025-11-06", amount: -14.50 }
      ],

      otherAccounts: [
          { account_type: "Savings", account_number: "520012345678", balance: 2500 },
          { account_type: "E-Wallet", account_number: "888899991111", balance: 80.25 }
      ]
  });


  } catch (err) {
    console.error('Dashboard error:', err);
    return res.status(500).send('Server error');
  }
};
