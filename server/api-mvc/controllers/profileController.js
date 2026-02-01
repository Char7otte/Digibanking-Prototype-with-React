const { getPool, sql } = require("../../db");

// Show profile page
exports.profile = (req, res) => {
    res.render("profile", {
        title: "My Profile",
        user: {
            name: req.user.name,
            username: req.user.username,
            email: req.user.email || "",
            accountNumber: req.user.account_number,
        },
    });
};

// Handle profile update
exports.updateProfile = async (req, res) => {
    const { name, username, email } = req.body;
    const userId = req.user.id;

    try {
        const pool = await getPool();

        await pool
            .request()
            .input("id", sql.Int, userId)
            .input("name", sql.NVarChar(100), name)
            .input("username", sql.NVarChar(100), username)
            .input("email", sql.NVarChar(200), email).query(`
        UPDATE UsersAccounts
        SET first_name = @name,
            username = @username,
            email = @email
        WHERE id = @id
      `);

        // Update user object (though it's stateless, for consistency)
        req.user.name = name;
        req.user.username = username;
        req.user.email = email;

        // Redirect back with success message
        res.redirect("/profile?updated=1");
    } catch (err) {
        console.error("Profile update error:", err);
        return res.status(500).send("Server error updating profile");
    }
};
