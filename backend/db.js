const { Pool } = require('pg');
const fs = require('fs');

async function getDbConnection() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  // Read the schema file and execute it to ensure the table exists
  try {
    const schema = fs.readFileSync('./init.sql', 'utf8');
    await pool.query(schema);
    console.log('✅ Connected to Postgres database and verified schema');
  } catch (error) {
    console.error('❌ Error executing init.sql schema:', error.message);
  }

  // Create a wrapper object to match some sqlite method signatures if needed
  const dbWrapper = {
    all: async (sql, params = []) => {
      const res = await pool.query(sql, params);
      return res.rows;
    },
    get: async (sql, params = []) => {
      const res = await pool.query(sql, params);
      return res.rows[0];
    },
    run: async (sql, params = []) => {
      const res = await pool.query(sql, params);
      return { lastID: res.rows[0]?.id }; // Assumes RETURNING id is added to INSERT queries
    },
    query: async (sql, params = []) => pool.query(sql, params)
  };

  return dbWrapper;
}

module.exports = getDbConnection;
