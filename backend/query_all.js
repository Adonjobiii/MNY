const getDbConnection = require('./db');
(async () => {
  const db = await getDbConnection();
  const rows = await db.all("SELECT * FROM transactions");
  console.log(JSON.stringify(rows, null, 2));
})();
