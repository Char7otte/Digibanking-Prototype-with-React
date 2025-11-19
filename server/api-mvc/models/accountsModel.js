const { getPool, sql } = require('../../db');

async function getAllAccounts() {
  const pool = await getPool();
  const result = await pool.request()
    .query('SELECT id, username, first_name, email, account_number, balance, account_type, currency, country FROM dbo.UsersAccounts');
  return result.recordset;
}

module.exports = { getAllAccounts };
