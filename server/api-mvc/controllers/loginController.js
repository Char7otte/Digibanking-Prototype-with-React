const { getPool } = require("../../db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

async function login(req, res) {
    const { username, password } = req.body;

    try {
        if (!username || !password) {
            return res
                .status(400)
                .render("login", {
                    error: "Please enter username and PIN number.",
                });
        }

        const pool = await getPool();
        const result = await pool
            .request()
            .input("username", username)
            .query("SELECT * FROM UsersAccounts WHERE username = @username");

        const user = result.recordset[0];

        if (!user) {
            return res.render("login", {
                error: "Invalid username or password.",
            });
        }

        const isMatch = bcrypt.compareSync(password, user.password_hash);
        if (!isMatch) {
            return res.render("login", {
                error: "Invalid username or password.",
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            {
                id: user.id,
                username: user.username,
                name: user.first_name,
                account_number: user.account_number,
                balance: user.balance,
                account_type: user.account_type,
                currency: user.currency,
            },
            process.env.JWT_SECRET,
            { expiresIn: "24h" },
        );

        return res.json({ success: true, token });
    } catch (err) {
        console.error("Login error:", err);
        return res
            .status(500)
            .render("login", { error: "Server error. Please try again." });
    }
}

module.exports = {
    login,
};
