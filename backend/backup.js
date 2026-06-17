const fs = require('fs');
const path = require('path');

async function performBackup(db) {
  try {
    const today = new Date();
    // Use local timezone to get the correct date string
    today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
    const dateStr = today.toISOString().split('T')[0];
    
    const backupDir = path.join(__dirname, 'backups');
    const backupFile = path.join(backupDir, `backup_${dateStr}.json`);

    // Ensure backups directory exists
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    // Check if backup already exists for today
    if (fs.existsSync(backupFile)) {
      console.log(`[BACKUP] Backup for ${dateStr} already exists. Skipping.`);
      return;
    }

    console.log(`[BACKUP] Starting database backup for ${dateStr}...`);

    const backupData = {};

    // Fetch data from all tables
    backupData.transactions = await db.all('SELECT * FROM transactions');
    
    try {
        backupData.investments = await db.all('SELECT * FROM investments');
    } catch (e) {
        console.warn('[BACKUP] Warning: Could not fetch investments', e.message);
    }
    
    try {
        backupData.budgets = await db.all('SELECT * FROM budgets');
    } catch (e) {
        console.warn('[BACKUP] Warning: Could not fetch budgets', e.message);
    }
    
    try {
        backupData.goals = await db.all('SELECT * FROM goals');
    } catch (e) {
        console.warn('[BACKUP] Warning: Could not fetch goals', e.message);
    }

    fs.writeFileSync(backupFile, JSON.stringify(backupData, null, 2), 'utf8');
    
    console.log(`[BACKUP] Successfully created backup: ${backupFile}`);
  } catch (error) {
    console.error(`[BACKUP] Failed to create backup:`, error);
  }
}

module.exports = { performBackup };
