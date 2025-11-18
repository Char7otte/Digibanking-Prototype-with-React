const MockUser = require('../models/mockUser');

exports.transfer = (req, res) => {
  const { recipient, amount } = req.body;

  if (!recipient || !amount) {
    return res.status(400).send("Missing fields");
  }

  const user = MockUser.getUser();

  // TEMP — subtract from user's balance in memory only
  user.balance -= parseFloat(amount);

  console.log("Transfer request:", recipient, amount);

  return res.redirect("/dashboard");
};
