CREATE TABLE IF NOT EXISTS transactions (
  id SERIAL PRIMARY KEY,
  date TEXT NOT NULL,
  type TEXT NOT NULL,
  "dueAction" TEXT,
  "dueCurrency" TEXT,
  "includeInBalance" BOOLEAN DEFAULT false,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  "toWhom" TEXT,
  mode TEXT NOT NULL,
  amount REAL NOT NULL,
  status TEXT DEFAULT 'Completed',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS investments (
  id SERIAL PRIMARY KEY,
  amount REAL NOT NULL,
  completion_date TEXT NOT NULL,
  type TEXT NOT NULL,
  currency TEXT DEFAULT 'INR',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS budgets (
  id SERIAL PRIMARY KEY,
  category TEXT NOT NULL UNIQUE,
  limit_amount REAL NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS goals (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  target_amount REAL NOT NULL,
  saved_amount REAL DEFAULT 0,
  currency TEXT DEFAULT 'INR',
  deadline TEXT,
  color TEXT DEFAULT 'blue',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
