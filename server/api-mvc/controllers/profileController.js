const { getPool, sql } = require('../../db');

// Show profile page
exports.profile = (req, res) => {
  if (!req.session.user) return res.redirect("/login");

  res.render("profile", {
    title: "My Profile",
    user: {
      name: req.session.user.name,
      username: req.session.user.username,
      email: req.session.user.email || "",
      accountNumber: req.session.user.account_number
    }
  });
};

// Handle profile update
exports.updateProfile = async (req, res) => {
  if (!req.session.user) return res.redirect("/login");

  const { name, username, email } = req.body;
  const userId = req.session.user.id;

  try {
    const pool = await getPool();

    await pool.request()
      .input("id", sql.Int, userId)
      .input("name", sql.NVarChar(100), name)
      .input("username", sql.NVarChar(100), username)
      .input("email", sql.NVarChar(200), email)
      .query(`
        UPDATE UsersAccounts
        SET first_name = @name,
            username = @username,
            email = @email
        WHERE id = @id
      `);

    // Update session
    req.session.user.name = name;
    req.session.user.username = username;
    req.session.user.email = email;

    // Redirect back with success message
    res.redirect("/profile?updated=1");

  } catch (err) {
    console.error("Profile update error:", err);
    return res.status(500).send("Server error updating profile");
  }
};
