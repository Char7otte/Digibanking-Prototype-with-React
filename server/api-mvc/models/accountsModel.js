const { getPool, sql } = require('../../db');

async function getAllAccounts() {
  const pool = await getPool();
  const result = await pool.request()
    .query('SELECT id, username, first_name, account_number, balance, account_type, currency FROM dbo.usersAccounts');
  return result.recordset;
}

module.exports = { getAllAccounts };