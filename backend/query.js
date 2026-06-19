const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('database.sqlite');
db.all('SELECT * FROM transactions WHERE date LIKE "2026-06%"', (err, rows) => {
  console.log(rows);
  db.close();
});
