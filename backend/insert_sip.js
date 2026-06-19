const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('database.sqlite');

const tx = {
  date: '2026-06-15',
  type: 'Expense',
  category: 'SIP',
  description: 'Automated SIP Deduction - June 15',
  mode: 'ICICI Bank',
  amount: 1000,
  status: 'Completed'
};

db.run(
  'INSERT INTO transactions (date, type, category, description, mode, amount, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
  [tx.date, tx.type, tx.category, tx.description, tx.mode, tx.amount, tx.status],
  function(err) {
    if (err) console.error(err);
    else console.log('Inserted SIP transaction for June 15th with ID:', this.lastID);
    db.close();
  }
);
