exports.dashboard = (req, res) => {
  if (!req.session.user) return res.redirect('/login');

  res.render('dashboard', {
    title: 'Dashboard - OCBC Digital',
    user: req.session.user
  });
};
