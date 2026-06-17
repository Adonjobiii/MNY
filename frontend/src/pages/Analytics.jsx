import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { Download, Calendar } from 'lucide-react';

const COLORS = ['#3b82f6', '#8b5cf6', '#f43f5e', '#10b981', '#f59e0b'];

export default function Analytics() {
  const [timeframe, setTimeframe] = useState('1M');
  const [transactions, setTransactions] = useState([]);
  const [displayCurrency, setDisplayCurrency] = useState('INR');

  React.useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/transactions`)
      .then(res => res.json())
      .then(data => setTransactions(Array.isArray(data) ? data : []))
      .catch(err => console.error('Failed to load transactions', err));
  }, []);

  const isQAR = (tx) => tx.mode?.includes('Qatar') || tx.dueCurrency === 'QAR';

  const displayTransactions = transactions.filter(t => 
    displayCurrency === 'QAR' ? isQAR(t) : !isQAR(t)
  );

  const processTimeData = (txs, tf) => {
    const grouped = {};
    txs.forEach(t => {
      let key = t.date; // YYYY-MM-DD
      if (tf === '6M' || tf === '1Y') {
        key = t.date.substring(0, 7); // YYYY-MM
      }
      if (!grouped[key]) grouped[key] = { name: key, income: 0, expenses: 0 };
      if (t.type === 'Income') grouped[key].income += t.amount;
      if (t.type === 'Expense') grouped[key].expenses += t.amount;
    });

    const sorted = Object.values(grouped).sort((a, b) => a.name.localeCompare(b.name));
    
    if (tf === '1W') return sorted.slice(-7);
    if (tf === '1M') return sorted.slice(-30);
    if (tf === '6M') return sorted.slice(-6);
    if (tf === '1Y') return sorted.slice(-12);
    return sorted;
  };

  const getCategoryData = (txs) => {
    const catMap = {};
    txs.filter(t => t.type === 'Expense').forEach(t => {
      catMap[t.category] = (catMap[t.category] || 0) + t.amount;
    });
    return Object.keys(catMap).map(k => ({ name: k, value: catMap[k] })).sort((a,b) => b.value - a.value);
  };

  const data = processTimeData(displayTransactions, timeframe);
  const categoryData = getCategoryData(displayTransactions);
  const currencySymbol = displayCurrency === 'INR' ? '₹' : 'QAR ';

  const formatYAxis = (val) => {
    if (val >= 1000) return `${currencySymbol}${(val/1000).toFixed(1).replace(/\.0$/, '')}k`;
    return `${currencySymbol}${val}`;
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const incomeObj = payload.find(p => p.dataKey === 'income');
      const expensesObj = payload.find(p => p.dataKey === 'expenses');
      
      const income = incomeObj ? incomeObj.value : 0;
      const expenses = expensesObj ? expensesObj.value : 0;
      
      let spendingPercentage = 0;
      if (income > 0) {
        spendingPercentage = Math.round((expenses / income) * 100);
      } else if (expenses > 0) {
        spendingPercentage = 100; // Infinity effectively, but cap for display
      }
      
      let colorClass = "text-green-500";
      if (spendingPercentage > 60) {
        colorClass = "text-red-500";
      } else if (spendingPercentage > 30) {
        colorClass = "text-orange-500";
      }

      return (
        <div className="bg-[var(--card)] border border-[var(--border)] p-4 rounded-2xl shadow-[0_10px_25px_-5px_rgba(0,0,0,0.1)]">
          <p className="font-bold mb-2 text-[var(--foreground)]">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }} className="text-sm font-medium">
              {entry.name}: {currencySymbol}{entry.value.toLocaleString()}
            </p>
          ))}
          {(income > 0 || expenses > 0) && (
            <p className={`text-sm font-bold mt-2 pt-2 border-t border-[var(--border)] ${colorClass}`}>
              Spending: {income === 0 && expenses > 0 ? '> 100' : spendingPercentage}%
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  const PieCustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const total = categoryData.reduce((sum, item) => sum + item.value, 0);
      const percentage = total > 0 ? Math.round((data.value / total) * 100) : 0;
      
      return (
        <div className="bg-[var(--card)] border border-[var(--border)] p-3 rounded-xl shadow-lg">
          <p className="font-bold text-[var(--foreground)] flex items-center gap-2">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: data.payload.fill }}></span>
            {data.name}
          </p>
          <p className="text-sm mt-1">
            {currencySymbol}{data.value.toLocaleString()}
          </p>
          <p className="text-sm font-bold text-slate-500 mt-1">
            {percentage}% of Total Expenses
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-1">Analytics Overview</h1>
          <p className="opacity-60">Deep dive into your financial patterns.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <div className="flex gap-2 p-1 glass rounded-xl">
            {['INR', 'QAR'].map(cur => (
              <button
                key={cur}
                onClick={() => setDisplayCurrency(cur)}
                className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${displayCurrency === cur ? 'bg-indigo-600 text-white shadow-md' : 'hover:bg-black/5 dark:hover:bg-white/5 opacity-70 hover:opacity-100'}`}
              >
                {cur}
              </button>
            ))}
          </div>

          <div className="flex gap-2 p-1 glass rounded-xl">
            {['1W', '1M', '6M', '1Y'].map(tf => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${timeframe === tf ? 'bg-blue-600 text-white shadow-md' : 'hover:bg-black/5 dark:hover:bg-white/5 opacity-70 hover:opacity-100'}`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 glass-panel rounded-3xl p-6 hover:shadow-2xl transition-all duration-300">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Income vs Expenses</h2>
            <button className="p-2 glass hover:bg-[var(--card)] rounded-xl transition-colors opacity-70 hover:opacity-100">
              <Download size={18} />
            </button>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'var(--foreground)', opacity: 0.5}} dy={10} />
                <YAxis width={80} axisLine={false} tickLine={false} tick={{fill: 'var(--foreground)', opacity: 0.5}} dx={-10} tickFormatter={formatYAxis} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="income" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorIncome)" />
                <Area type="monotone" dataKey="expenses" stroke="#f43f5e" strokeWidth={3} fillOpacity={1} fill="url(#colorExpense)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-panel rounded-3xl p-6 hover:shadow-2xl transition-all duration-300 flex flex-col">
          <h2 className="text-xl font-bold mb-6">Spending by Category</h2>
          <div className="flex-1 min-h-[300px] flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  innerRadius={80}
                  outerRadius={110}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<PieCustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-bold">{currencySymbol}{categoryData.reduce((a,b)=>a+b.value,0).toLocaleString()}</span>
              <span className="text-sm opacity-50">Total</span>
            </div>
          </div>
          
          <div className="mt-6 space-y-3">
            {categoryData.map((cat, i) => (
              <div key={cat.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{backgroundColor: COLORS[i % COLORS.length]}}></div>
                  <span className="opacity-80">{cat.name}</span>
                </div>
                <span className="font-semibold">{currencySymbol}{cat.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="glass-panel rounded-3xl p-6 hover:shadow-2xl transition-all duration-300">
        <h2 className="text-xl font-bold mb-6">Monthly Cash Flow Comparison</h2>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.slice(0, 7)}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'var(--foreground)', opacity: 0.5}} dy={10} />
              <YAxis width={80} axisLine={false} tickLine={false} tick={{fill: 'var(--foreground)', opacity: 0.5}} dx={-10} tickFormatter={formatYAxis} />
              <Tooltip 
                cursor={{fill: 'rgba(255,255,255,0.05)'}}
                content={<CustomTooltip />}
              />
              <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expenses" fill="#f43f5e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
