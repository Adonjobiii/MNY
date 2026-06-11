require('dotenv').config();
const sqlite3 = require('sqlite3').verbose();
const { Pool } = require('pg');

const sqliteDb = new sqlite3.Database('./database.sqlite');
const pgPool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function migrateData() {
  console.log('Starting migration from SQLite to PostgreSQL...');
  
  // 1. Fetch transactions
  sqliteDb.all('SELECT * FROM transactions', async (err, transactions) => {
    if (err) {
      if (err.message.includes('no such table')) {
         console.log('No transactions table found in SQLite.');
      } else {
         console.error('Error reading sqlite transactions:', err);
      }
    } else {
      console.log(`Found ${transactions.length} transactions to migrate.`);
      for (const tx of transactions) {
        // Insert into pg
        try {
          await pgPool.query(
            `INSERT INTO transactions (date, type, "dueAction", "dueCurrency", "includeInBalance", category, description, "toWhom", mode, amount, status, created_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
            [
              tx.date, tx.type, tx.dueAction, tx.dueCurrency, 
              tx.includeInBalance == 1, tx.category, tx.description, 
              tx.toWhom, tx.mode, tx.amount, tx.status, tx.created_at || new Date().toISOString()
            ]
          );
        } catch (pgErr) {
          console.error(`Error migrating transaction ${tx.id}:`, pgErr.message);
        }
      }
      console.log('Finished migrating transactions.');
    }

    // 2. Fetch investments
    sqliteDb.all('SELECT * FROM investments', async (err, investments) => {
      if (err) {
        if (err.message.includes('no such table')) {
           console.log('No investments table found in SQLite.');
        } else {
           console.error('Error reading sqlite investments:', err);
        }
      } else {
        console.log(`Found ${investments.length} investments to migrate.`);
        for (const inv of investments) {
          try {
            await pgPool.query(
              `INSERT INTO investments (amount, completion_date, type, currency, created_at)
               VALUES ($1, $2, $3, $4, $5)`,
              [inv.amount, inv.completion_date, inv.type, inv.currency, inv.created_at || new Date().toISOString()]
            );
          } catch (pgErr) {
            console.error(`Error migrating investment ${inv.id}:`, pgErr.message);
          }
        }
        console.log('Finished migrating investments.');
      }
      
      console.log('Migration complete!');
      sqliteDb.close();
      pgPool.end();
    });
  });
}

migrateData();
