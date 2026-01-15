// const authModel = require('../models/authModel');
// const jwt = require('jsonwebtoken');

// async function register(req, res) {
//   try {
//     const { username, password, first_name, account_number, balance, account_type, currency } = req.body;
//     if (!username || !password || !first_name || !account_number) {
//       return res.status(400).json({ error: 'username, password, first_name and account_number are required' });
//     }

//     const existing = await authModel.findUserByUsername(username);
//     if (existing) return res.status(409).json({ error: 'username already exists' });

//     const created = await authModel.createUser({ username, password, first_name, account_number, balance, account_type, currency });
//     const secret = process.env.JWT_SECRET;
//     if (!secret) return res.status(500).json({ error: 'JWT_SECRET not configured on server' });
//     const token = jwt.sign({ id: created.id, username: created.username }, secret, { expiresIn: '2h' });
//     res.status(201).json({ user: created, token });
//   } catch (err) {
//     console.error('Register error', err);
//     res.status(500).json({ error: 'Server error' });
//   }
// }

// async function login(req, res) {
//   try {
//     const { username, password } = req.body;
//     if (!username || !password) return res.status(400).json({ error: 'username and password required' });

//     const user = await authModel.findUserByUsername(username);
//     if (!user) return res.status(401).json({ error: 'Invalid credentials' });

//     const ok = await authModel.verifyPassword(user.password_hash, password);
//     if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

//     const secret = process.env.JWT_SECRET;
//     if (!secret) return res.status(500).json({ error: 'JWT_SECRET not configured on server' });
//     const token = jwt.sign({ id: user.id, username: user.username }, secret, { expiresIn: '2h' });
//     res.json({ user: { id: user.id, username: user.username, first_name: user.first_name }, token });
//   } catch (err) {
//     console.error('Login error', err);
//     res.status(500).json({ error: 'Server error' });
//   }
// }

// module.exports = { register, login };
