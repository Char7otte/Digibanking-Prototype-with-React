const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema({
  type: String,
  number: String,
  balance: Number
});

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String, 
  accountNumber: String,
  balance: Number,
  accounts: [accountSchema]
});

module.exports = mongoose.model('User', userSchema);
