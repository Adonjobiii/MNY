const getDbConnection = require('./db');

async function migrate() {
  const db = await getDbConnection();
  try {
    await db.run('ALTER TABLE transactions ADD COLUMN toWhom TEXT;');
    console.log('Successfully added toWhom column');
  } catch (err) {
    console.error('Migration error:', err.message);
  }
}

migrate();
