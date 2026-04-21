require('dotenv').config({ path: __dirname + '/.env' });
const { Pool, types } = require('pg');

// PostgreSQL retorna NUMERIC como string por padrão.
// OID 1700 = NUMERIC — converter para float em toda a aplicação.
types.setTypeParser(1700, (val) => parseFloat(val));

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
  max: 2,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

module.exports = pool;
