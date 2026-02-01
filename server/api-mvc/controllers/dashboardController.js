const { getPool } = require("../../db");

async function dashboard(req, res) {
    // JWT auth sets req.user

    try {
        const pool = await getPool();

        const result = await pool.request().input("id", req.user.id).query(`
        SELECT first_name, account_number, balance, account_type, currency
        FROM UsersAccounts
        WHERE id = @id
      `);

        const row = result.recordset[0] || {};

        // Refresh user from DB (fallback to existing user fields if null)
        req.user = {
            ...req.user,
            name: row.first_name || req.user.name,
            account_number: row.account_number || req.user.account_number,
            balance: row.balance ?? req.user.balance,
            account_type:
                row.account_type || req.user.account_type || "Savings",
            currency: row.currency || req.user.currency || "SGD",
        };

        const dashboard = {
            title: "Dashboard",
            user: req.user,
            name: req.user.name,
            account_type: req.user.account_type,
            accountNumber: req.user.account_number,
            currency: req.user.currency,
            balance: req.user.balance,
        };

        return res.json(dashboard);
    } catch (err) {
        console.error("Dashboard error:", err);
        return res.status(500).send("Server error");
    }
}

module.exports = {
    dashboard,
};
