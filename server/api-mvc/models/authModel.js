const { getPool, sql } = require('../../db');
const bcrypt = require('bcryptjs');

async function findUserByUsername(username) {
  const pool = await getPool();
  const result = await pool.request()
    .input('username', sql.NVarChar(100), username)
    .query('SELECT id, username, password_hash, first_name FROM dbo.UsersAccounts WHERE username = @username');
  return result.recordset[0];
}

async function createUser({ username, password, first_name, account_number, balance = 0.00, account_type = 'savings', currency = 'SGD' }) {
  const pool = await getPool();
  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(password, salt);

  const result = await pool.request()
    .input('username', sql.NVarChar(100), username)
    .input('password_hash', sql.NVarChar(200), hash)
    .input('first_name', sql.NVarChar(100), first_name)
    .input('account_number', sql.VarChar(34), account_number)
    .input('balance', sql.Decimal(18,2), balance)
    .input('account_type', sql.NVarChar(50), account_type)
    .input('currency', sql.Char(3), currency)
    .query(`INSERT INTO dbo.UsersAccounts (username, password_hash, first_name, account_number, balance, account_type, currency)
            OUTPUT INSERTED.id, INSERTED.username, INSERTED.first_name
            VALUES (@username, @password_hash, @first_name, @account_number, @balance, @account_type, @currency)`);

  return result.recordset[0];
}

async function verifyPassword(storedHash, password) {
  // storedHash is expected to be a string (NVARCHAR) from DB
  if (!storedHash) return false;
  return bcrypt.compareSync(password, storedHash.toString());
}

async function getUserById(id) {
  const pool = await getPool();
  const result = await pool.request()
    .input('id', sql.Int, id)
    .query('SELECT id, username, first_name, account_number, balance, account_type, currency FROM dbo.UsersAccounts WHERE id = @id');
  return result.recordset[0];
}

module.exports = { findUserByUsername, createUser, verifyPassword, getUserById };
