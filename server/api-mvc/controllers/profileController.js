exports.profile = (req, res) => {
  if (!req.session.user) return res.redirect("/login");

  res.render("profile", {
    title: "My Profile",
    user: {
      name: req.session.user.name,
      username: req.session.user.username,
      email: "", // ← leave empty as requested
      accountNumber: req.session.user.account_number
    }
  });
};
