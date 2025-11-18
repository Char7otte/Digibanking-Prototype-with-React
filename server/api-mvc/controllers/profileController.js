// api-mvc/controllers/profileController.js

exports.profile = (req, res) => {
  const user = req.session?.user || {
    name: 'OCBC Demo Customer',
    email: 'demo@ocbc.com',
    accountNumber: '5200 1234 5678'
  };

  res.render('profile', {
    title: 'Profile - OCBC Digital',
    user
  });
};
