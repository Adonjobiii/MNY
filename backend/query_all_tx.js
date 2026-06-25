const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('database.sqlite');
db.all('SELECT * FROM transactions', (err, rows) => {
  console.log(JSON.stringify(rows, null, 2));
});
