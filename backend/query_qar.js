const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('database.sqlite');
db.all("SELECT * FROM transactions WHERE dueCurrency='QAR' OR mode LIKE '%Qatar%'", (err, rows) => {
  console.log(JSON.stringify(rows, null, 2));
  db.close();
});
