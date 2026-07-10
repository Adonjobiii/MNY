const { Pool } = require('pg');
const fs = require('fs');

const pool = new Pool({
  connectionString: "postgresql://neondb_owner:npg_kYZgXs7pu8Pv@ep-lucky-smoke-apznr9tl-pooler.c-7.us-east-1.aws.neon.tech/neondb?uselibpqcompat=true&sslmode=require",
  ssl: {
    rejectUnauthorized: false
  }
});

async function backup() {
  try {
    const tables = ['users', 'accounts', 'categories', 'transactions', 'budgets', 'goals', 'investments', 'split_transactions', 'dues', 'debt'];
    const backupData = {};
    for (const table of tables) {
      try {
        const res = await pool.query(`SELECT * FROM ${table}`);
        backupData[table] = res.rows;
        console.log(`Exported ${res.rows.length} rows from ${table}`);
      } catch (e) {
        console.log(`Skipped ${table}: ${e.message}`);
      }
    }
    fs.writeFileSync('../database_backup.json', JSON.stringify(backupData, null, 2));
    console.log('Database backup created successfully at database_backup.json');
  } catch (err) {
    console.error('Backup error', err);
  } finally {
    pool.end();
  }
}

backup();
