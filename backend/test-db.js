require('dotenv').config();
const { Pool } = require('pg');

async function checkDb() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    const res = await pool.query('SELECT count(*) FROM transactions');
    console.log('Transactions count:', res.rows[0].count);
    
    const res2 = await pool.query('SELECT * FROM transactions LIMIT 5');
    console.log('Sample transactions:', res2.rows);
  } catch (err) {
    console.error('DB Error:', err.message);
  } finally {
    pool.end();
  }
}

checkDb();
