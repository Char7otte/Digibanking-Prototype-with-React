require('dotenv').config();
const sql = require('mssql');

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  server: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '1433', 10),
  database: process.env.DB_NAME,
  options: {
    encrypt: true,
    trustServerCertificate: true
  },
  pool: { max: 10, min: 0, idleTimeoutMillis: 30000 }
};

let poolPromise;

function getPool() {
  if (!poolPromise) {
    poolPromise = new sql.ConnectionPool(config)
      .connect()
      .then(pool => {
        console.log('Connected to SQL Server at', process.env.DB_HOST || '127.0.0.1');
        return pool;
      })
      .catch(err => {
        console.error('DB Connection Failed:', err);
        // keep the rejection so callers can handle it; don't throw synchronously here
        throw err;
      });
  }
  return poolPromise;
}

module.exports = { sql, getPool };
