require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const cron = require('node-cron');
const getDbConnection = require('./db');

const app = express();
const server = http.createServer(app);

// Setup Socket.io for real-time syncing
const io = new Server(server, {
  cors: {
    origin: '*', // Allow all origins since it's a shared link app
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());

// ==========================================
// AUTHENTICATION MIDDLEWARE
// ==========================================
app.use((req, res, next) => {
  console.log(`[REQ] ${req.method} ${req.path} from ${req.ip} | Capacitor: ${req.headers['x-is-capacitor']}`);
  const masterPassword = process.env.APP_PASSWORD;
  // If no password is set in .env, allow all access (for local dev)
  if (!masterPassword) return next();

  // Exclude OPTIONS requests for CORS
  if (req.method === 'OPTIONS') return next();

  // Exclude the /api/auth check endpoint so frontend can verify password
  if (req.path === '/api/auth') return next();

  // Bypass for the Android (Capacitor) app
  if (req.headers['x-is-capacitor'] === 'true') return next();

  const clientPassword = req.headers['x-app-password'];
  if (clientPassword !== masterPassword) {
    return res.status(401).json({ error: 'Unauthorized. Invalid Master Password.' });
  }
  next();
});

// Auth check endpoint
app.post('/api/auth', (req, res) => {
  const { password } = req.body;
  if (!process.env.APP_PASSWORD) {
    return res.json({ success: true, message: 'No password required' });
  }
  if (password === process.env.APP_PASSWORD) {
    return res.json({ success: true });
  }
  return res.status(401).json({ success: false, message: 'Invalid password' });
});

let db;

// Socket.io Connection
io.on('connection', (socket) => {
  console.log(`🔌 New client connected: ${socket.id}`);
  socket.on('disconnect', () => {
    console.log(`❌ Client disconnected: ${socket.id}`);
  });
});

// ==========================================
// TRANSACTIONS API
// ==========================================

// GET all transactions
app.get('/api/transactions', async (req, res) => {
  try {
    const rows = await db.all('SELECT * FROM transactions ORDER BY date DESC, id DESC');
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

// POST new transaction
app.post('/api/transactions', async (req, res) => {
  const { date, type, dueAction, dueCurrency, includeInBalance, category, description, toWhom, mode, amount, status } = req.body;
  try {
    const result = await db.run(
      'INSERT INTO transactions (date, type, "dueAction", "dueCurrency", "includeInBalance", category, description, "toWhom", mode, amount, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING id',
      [date, type, dueAction || null, dueCurrency || null, includeInBalance ? true : false, category, description, toWhom || null, mode, amount, status || 'Completed']
    );
    
    const newTx = {
      id: result.lastID,
      date, type, dueAction, dueCurrency, includeInBalance: includeInBalance ? true : false, category, description, toWhom, mode, amount, status: status || 'Completed'
    };

    // Broadcast to ALL connected clients instantly
    io.emit('transaction_added', newTx);
    
    res.status(201).json(newTx);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to add transaction' });
  }
});

// PUT update transaction
app.put('/api/transactions/:id', async (req, res) => {
  const { id } = req.params;
  const { date, type, dueAction, dueCurrency, includeInBalance, category, description, toWhom, mode, amount, status } = req.body;
  try {
    await db.run(
      'UPDATE transactions SET date=$1, type=$2, "dueAction"=$3, "dueCurrency"=$4, "includeInBalance"=$5, category=$6, description=$7, "toWhom"=$8, mode=$9, amount=$10, status=$11 WHERE id=$12',
      [date, type, dueAction || null, dueCurrency || null, includeInBalance ? true : false, category, description, toWhom || null, mode, amount, status || 'Completed', id]
    );
    
    const updatedTx = {
      id: parseInt(id),
      date, type, dueAction, dueCurrency, includeInBalance: includeInBalance ? true : false, category, description, toWhom, mode, amount, status: status || 'Completed'
    };

    // Broadcast update
    io.emit('transaction_updated', updatedTx);
    
    res.json(updatedTx);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update transaction' });
  }
});

// DELETE transaction
app.delete('/api/transactions/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db.run('DELETE FROM transactions WHERE id = $1', [id]);
    
    // Broadcast deletion
    io.emit('transaction_deleted', id);
    
    res.json({ message: 'Transaction deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete transaction' });
  }
});

// ==========================================
// INVESTMENTS API
// ==========================================

// GET all investments
app.get('/api/investments', async (req, res) => {
  try {
    const rows = await db.all('SELECT * FROM investments ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch investments' });
  }
});

// POST new investment
app.post('/api/investments', async (req, res) => {
  const { amount, completion_date, type, currency } = req.body;
  try {
    const result = await db.run(
      'INSERT INTO investments (amount, completion_date, type, currency) VALUES ($1, $2, $3, $4) RETURNING id',
      [amount, completion_date, type, currency || 'INR']
    );
    
    const newInv = {
      id: result.lastID,
      amount, completion_date, type, currency: currency || 'INR', created_at: new Date().toISOString()
    };

    io.emit('investment_added', newInv);
    res.status(201).json(newInv);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to add investment' });
  }
});

// DELETE investment
app.delete('/api/investments/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db.run('DELETE FROM investments WHERE id = $1', [id]);
    io.emit('investment_deleted', id);
    res.json({ message: 'Investment deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete investment' });
  }
});

// ==========================================
// BUDGETS API
// ==========================================
app.get('/api/budgets', async (req, res) => {
  try {
    const rows = await db.all('SELECT * FROM budgets');
    // Calculate spent dynamically based on current month transactions
    const tx = await db.all('SELECT * FROM transactions WHERE type="Expense"');
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const enrichedBudgets = rows.map(b => {
      const spent = tx
        .filter(t => t.category === b.category && new Date(t.date).getMonth() === currentMonth && new Date(t.date).getFullYear() === currentYear)
        .reduce((sum, t) => sum + t.amount, 0);
      return { ...b, spent };
    });
    res.json(enrichedBudgets);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch budgets' });
  }
});

app.post('/api/budgets', async (req, res) => {
  const { category, limit_amount } = req.body;
  try {
    const result = await db.run(
      'INSERT INTO budgets (category, limit_amount) VALUES ($1, $2) ON CONFLICT(category) DO UPDATE SET limit_amount=$2 RETURNING id',
      [category, limit_amount]
    );
    res.status(201).json({ id: result.lastID, category, limit_amount, spent: 0 });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to save budget' });
  }
});

// ==========================================
// GOALS API
// ==========================================
app.get('/api/goals', async (req, res) => {
  try {
    const rows = await db.all('SELECT * FROM goals ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch goals' });
  }
});

app.post('/api/goals', async (req, res) => {
  const { title, target_amount, saved_amount, currency, deadline, color } = req.body;
  try {
    const result = await db.run(
      'INSERT INTO goals (title, target_amount, saved_amount, currency, deadline, color) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
      [title, target_amount, saved_amount || 0, currency || 'INR', deadline || null, color || 'blue']
    );
    res.status(201).json({ id: result.lastID, title, target_amount, saved_amount: saved_amount || 0, currency: currency || 'INR', deadline, color: color || 'blue' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to add goal' });
  }
});

// ==========================================
// AI INSIGHTS API
// ==========================================
app.get('/api/insights', async (req, res) => {
  try {
    const tx = await db.all('SELECT * FROM transactions ORDER BY date DESC');
    const budgets = await db.all('SELECT * FROM budgets');
    const insights = [];
    
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const thisMonthTx = tx.filter(t => new Date(t.date).getMonth() === currentMonth && new Date(t.date).getFullYear() === currentYear);
    
    // Analyze Budgets
    budgets.forEach(b => {
      const spent = thisMonthTx.filter(t => t.type === 'Expense' && t.category === b.category).reduce((s, t) => s + t.amount, 0);
      if (spent >= b.limit_amount * 0.9 && spent < b.limit_amount) {
        insights.push({ id: `budget_warn_${b.id}`, title: 'Budget Warning', description: `You are at ${(spent/b.limit_amount*100).toFixed(0)}% of your ${b.category} budget limit.`, action: 'View Budget', icon: 'AlertCircle', color: 'border-orange-500/50' });
      } else if (spent >= b.limit_amount) {
        insights.push({ id: `budget_exceed_${b.id}`, title: 'Budget Exceeded', description: `You have exceeded your ${b.category} budget by ${spent - b.limit_amount}!`, action: 'Adjust Budget', icon: 'TrendingDown', color: 'border-red-500/50' });
      }
    });

    res.json(insights);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to generate insights' });
  }
});

const PORT = process.env.PORT || 5000;

// Initialize Database then start server
getDbConnection().then(database => {
  db = database;
  
  // ==========================================
  // CRON JOBS FOR AUTOMATED TRANSACTIONS
  // ==========================================
  async function processAutomatedTransaction(txDetails) {
      const { date, type, dueAction, dueCurrency, includeInBalance, category, description, toWhom, mode, amount, status } = txDetails;
      
      try {
        // Idempotency Check: Don't add if already exists for this exact date and description
        const existing = await db.get(
          'SELECT id FROM transactions WHERE date = $1 AND description = $2',
          [date, description]
        );
  
        if (existing) {
          return; // Silently skip if already added
        }
  
        const result = await db.run(
          'INSERT INTO transactions (date, type, "dueAction", "dueCurrency", "includeInBalance", category, description, "toWhom", mode, amount, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING id',
          [date, type, dueAction || null, dueCurrency || null, includeInBalance ? true : false, category, description, toWhom || null, mode, amount, status || 'Completed']
        );
  
        const newTx = {
          id: result.lastID,
          date, type, dueAction, dueCurrency, includeInBalance: includeInBalance ? true : false, category, description, toWhom, mode, amount, status: status || 'Completed'
        };
  
        io.emit('transaction_added', newTx);
        console.log(`[AUTOMATED] Successfully processed: ${description} on ${date}`);
      } catch (error) {
        console.error(`[AUTOMATED] Failed to process ${description}:`, error);
      }
    }
  
    const runAutomatedChecks = async () => {
      const today = new Date();
      const currentYear = today.getFullYear();
      const currentMonth = today.getMonth();
      const currentDay = today.getDate();
      
      console.log(`[AUTOMATED] Running checks up to day: ${currentDay}`);
  
      const checkAndRunRule = async (targetDay, txDetailsFn) => {
        if (currentDay < targetDay) return; // Haven't reached this day yet in the current month
        
        // Skip automated deductions before the 15th for June 2026 (month 5)
        if (currentYear === 2026 && currentMonth === 5 && targetDay < 15) {
          console.log(`[AUTOMATED] Skipping transaction for day ${targetDay} in June 2026 as requested.`);
          return;
        }

        const targetDate = new Date(currentYear, currentMonth, targetDay);
        targetDate.setMinutes(targetDate.getMinutes() - targetDate.getTimezoneOffset());
        const dateStr = targetDate.toISOString().split('T')[0];
        const monthName = targetDate.toLocaleString('default', { month: 'long' });
  
        await processAutomatedTransaction(txDetailsFn(dateStr, monthName, targetDay));
      };
  
      // Rule 1: ICICI Bank 1000 rupees SIP on 5th, 15th, 25th
      await checkAndRunRule(5, (dateStr, monthName, day) => ({
        date: dateStr, type: 'Expense', category: 'SIP', description: `Automated SIP Deduction - ${monthName} ${day}`, mode: 'ICICI Bank', amount: 1000, status: 'Completed'
      }));
      await checkAndRunRule(15, (dateStr, monthName, day) => ({
        date: dateStr, type: 'Expense', category: 'SIP', description: `Automated SIP Deduction - ${monthName} ${day}`, mode: 'ICICI Bank', amount: 1000, status: 'Completed'
      }));
      await checkAndRunRule(25, (dateStr, monthName, day) => ({
        date: dateStr, type: 'Expense', category: 'SIP', description: `Automated SIP Deduction - ${monthName} ${day}`, mode: 'ICICI Bank', amount: 1000, status: 'Completed'
      }));
  
      // Rule 2: South Indian Bank 228 rupees Pension on 1st
      await checkAndRunRule(1, (dateStr, monthName, day) => ({
        date: dateStr, type: 'Expense', category: 'Pension', description: `Automated Pension Deduction - ${monthName} ${day}`, mode: 'South Indian Bank', amount: 228, status: 'Completed'
      }));
  
      // Rule 3: ICICI Bank 299 rupees YouTube Premium on 26th
      await checkAndRunRule(26, (dateStr, monthName, day) => ({
        date: dateStr, type: 'Expense', category: 'Subscriptions', description: `Automated YouTube Premium - ${monthName} ${day}`, mode: 'ICICI Bank', amount: 299, status: 'Completed'
      }));
    };
  
    // Run automatically when the server wakes up / starts
    setTimeout(runAutomatedChecks, 2000);
  
    // Keep the daily cron in case the server stays awake 24/7
    cron.schedule('0 1 * * *', runAutomatedChecks);

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
  });
}).catch(err => {
  console.error('Failed to start server due to database error:', err);
});
