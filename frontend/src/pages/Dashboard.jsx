import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import FinancialInsights from '../components/FinancialInsights';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Wallet, Building2, Landmark, AlertCircle, RefreshCw } from 'lucide-react';
import { usePullToRefresh } from '../hooks/usePullToRefresh';
import QuickTransactionSheet from '../components/mobile/QuickTransactionSheet';
import FAB from '../components/mobile/FAB';

const socket = io(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}`);

const COLORS = ['#3b82f6', '#8b5cf6', '#f43f5e', '#10b981'];

const accounts = [
  { id: 'all', name: 'All Accounts', icon: <Wallet size={16} /> },
  { id: 'icici', name: 'ICICI Bank', icon: <Building2 size={16} /> },
  { id: 'sib', name: 'South Indian Bank', icon: <Landmark size={16} /> },
  { id: 'qatar_bank', name: 'Qatar Bank', icon: <Building2 size={16} /> },
  { id: 'cash_inr', name: 'Cash (Rupees)', icon: <DollarSign size={16} /> },
  { id: 'cash_qar', name: 'Cash (Qatar Riyal)', icon: <DollarSign size={16} /> },
  { id: 'dues_inr', name: 'Dues (Rupees)', icon: <AlertCircle size={16} className="text-orange-500" /> },
  { id: 'dues_qar', name: 'Dues (Qatar Riyal)', icon: <AlertCircle size={16} className="text-orange-500" /> }
];

export default function Dashboard() {
  const [isQuickEntryOpen, setIsQuickEntryOpen] = useState(false);
  const [quickEntryType, setQuickEntryType] = useState('Expense');
  
  const handleRefresh = async () => {
    await new Promise(r => setTimeout(r, 1000));
  };

  const { isRefreshing, pullProgress } = usePullToRefresh(handleRefresh);

  const handleFabAction = (actionLabel) => {
    setQuickEntryType(actionLabel);
    setIsQuickEntryOpen(true);
  };
  const [selectedAccount, setSelectedAccount] = useState('all');
  const [transactions, setTransactions] = useState([]);
  const [displayCurrency, setDisplayCurrency] = useState('INR');

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/transactions`)
      .then(res => res.json())
      .then(data => setTransactions(Array.isArray(data) ? data : []))
      .catch(err => console.error('Failed to load transactions', err));

    socket.on('transaction_added', (newTx) => {
      setTransactions(prev => {
        if (prev.find(t => t.id === newTx.id)) return prev;
        return [newTx, ...prev];
      });
    });

    socket.on('transaction_deleted', (id) => {
      setTransactions(prev => prev.filter(tx => tx.id !== parseInt(id)));
    });

    socket.on('transaction_updated', (updatedTx) => {
      setTransactions(prev => prev.map(tx => tx.id === updatedTx.id ? updatedTx : tx));
    });

    return () => {
      socket.off('transaction_added');
      socket.off('transaction_deleted');
      socket.off('transaction_updated');
    };
  }, []);

  const filteredTransactions = transactions.filter(tx => {
    if (selectedAccount === 'all') return true;
    if (selectedAccount === 'total_dues') return tx.type === 'Dues';
    if (selectedAccount === 'total_debt') return tx.type === 'Debt';
    if (selectedAccount === 'total_cash') return tx.mode === 'Cash (Rupees)' || tx.mode === 'Cash (Qatar Riyal)';
    const accDef = accounts.find(a => a.id === selectedAccount);
    return accDef ? (tx.mode === accDef.name || tx.mode === `UPI (${accDef.name})`) : false;
  });

  const getBalance = (accountName) => {
    return transactions
      .filter(tx => tx.mode === accountName || tx.mode === `UPI (${accountName})`)
      .reduce((acc, tx) => {
        if (tx.type === 'Income') return acc + tx.amount;
        if (tx.type === 'Expense') return acc - tx.amount;
        if (tx.type === 'Dues' && tx.includeInBalance) {
          if (tx.dueAction === 'add') return acc + tx.amount;
          if (tx.dueAction === 'settle') return acc - tx.amount;
        }
        return acc;
      }, 0);
  };

  const getDuesBalance = (currency) => {
    return transactions
      .filter(tx => tx.type === 'Dues' && tx.dueCurrency === currency)
      .reduce((acc, tx) => {
        if (tx.dueAction === 'add') return acc + tx.amount;
        if (tx.dueAction === 'settle') return acc - tx.amount;
        return acc;
      }, 0);
  };

  const getDebtBalance = (currency) => {
    return transactions
      .filter(tx => tx.type === 'Debt' && (currency === 'QAR' ? isQAR(tx) : !isQAR(tx)))
      .reduce((acc, tx) => acc + tx.amount, 0);
  };

  const isQAR = (tx) => tx.mode?.includes('Qatar') || tx.dueCurrency === 'QAR';

  const totalIncomeINR = filteredTransactions.filter(t => t.type === 'Income' && !isQAR(t)).reduce((s, t) => s + t.amount, 0);
  const totalExpensesINR = filteredTransactions.filter(t => t.type === 'Expense' && !isQAR(t)).reduce((s, t) => s + t.amount, 0);
  const totalBalanceINR = filteredTransactions.filter(t => !isQAR(t)).reduce((acc, tx) => {
    if (tx.type === 'Income') return acc + tx.amount;
    if (tx.type === 'Expense' || tx.type === 'Debt') return acc - tx.amount;
    if (tx.type === 'Dues' && tx.includeInBalance) {
      if (tx.dueAction === 'add') return acc + tx.amount;
      if (tx.dueAction === 'settle') return acc - tx.amount;
    }
    return acc;
  }, 0);

  const totalIncomeQAR = filteredTransactions.filter(t => t.type === 'Income' && isQAR(t)).reduce((s, t) => s + t.amount, 0);
  const totalExpensesQAR = filteredTransactions.filter(t => t.type === 'Expense' && isQAR(t)).reduce((s, t) => s + t.amount, 0);
  const totalBalanceQAR = filteredTransactions.filter(t => isQAR(t)).reduce((acc, tx) => {
    if (tx.type === 'Income') return acc + tx.amount;
    if (tx.type === 'Expense' || tx.type === 'Debt') return acc - tx.amount;
    if (tx.type === 'Dues' && tx.includeInBalance) {
      if (tx.dueAction === 'add') return acc + tx.amount;
      if (tx.dueAction === 'settle') return acc - tx.amount;
    }
    return acc;
  }, 0);

  const healthScore = totalIncomeINR === 0 && totalExpensesINR === 0 ? 100 : 
                      totalIncomeINR === 0 ? 0 : 
                      Math.max(0, Math.round(((totalIncomeINR - totalExpensesINR) / totalIncomeINR) * 100));

  const activeDisplayCurrency = ['icici', 'sib', 'cash_inr'].includes(selectedAccount) ? 'INR' 
    : ['cash_qar', 'qatar_bank'].includes(selectedAccount) ? 'QAR' 
    : displayCurrency;

  const showINR = ['all', 'icici', 'sib', 'cash_inr', 'total_dues', 'total_debt', 'total_cash'].includes(selectedAccount);
  const showQAR = ['all', 'cash_qar', 'qatar_bank', 'total_dues', 'total_debt', 'total_cash'].includes(selectedAccount);

  const displayTransactions = filteredTransactions.filter(t => 
    activeDisplayCurrency === 'QAR' ? isQAR(t) : !isQAR(t)
  );

  const renderCurrencyAmount = (amountINR, amountQAR) => (
    <div className="flex gap-2 items-baseline select-none">
      {showINR && (
        <span 
          onClick={() => showQAR && setDisplayCurrency('INR')} 
          className={`transition-all ${!showQAR || activeDisplayCurrency === 'INR' ? 'text-2xl lg:text-3xl font-bold' : 'text-base opacity-50 hover:opacity-80 cursor-pointer'}`}
        >
          ₹{amountINR.toLocaleString()}
        </span>
      )}
      {showINR && showQAR && <span className="text-base opacity-50">|</span>}
      {showQAR && (
        <span 
          onClick={() => showINR && setDisplayCurrency('QAR')} 
          className={`transition-all ${!showINR || activeDisplayCurrency === 'QAR' ? 'text-2xl lg:text-3xl font-bold' : 'text-base opacity-50 hover:opacity-80 cursor-pointer'}`}
        >
          QAR {amountQAR.toLocaleString()}
        </span>
      )}
    </div>
  );

  const expensesByCategory = displayTransactions
    .filter(t => t.type === 'Expense')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {});
  
  const categoryData = Object.keys(expensesByCategory).map((key, index) => ({
    name: key,
    value: expensesByCategory[key],
    color: COLORS[index % COLORS.length]
  }));

  const flowByDate = displayTransactions.reduce((acc, t) => {
    if (!acc[t.date]) acc[t.date] = { date: t.date, Income: 0, Expense: 0 };
    if (t.type === 'Income') acc[t.date].Income += t.amount;
    if (t.type === 'Expense') acc[t.date].Expense += t.amount;
    return acc;
  }, {});
  const flowData = Object.values(flowByDate).sort((a, b) => new Date(a.date) - new Date(b.date)).slice(-7);

  return (
    <div className="flex-1 overflow-y-auto min-h-screen bg-[var(--bg)] custom-scrollbar pb-24 relative">
      <div className="absolute top-0 w-full flex justify-center z-50 pointer-events-none" style={{ transform: `translateY(${Math.max(0, pullProgress * 50 - 50)}px)`}}>
        <div className={`bg-[var(--card)] p-2 rounded-full shadow-lg transition-transform ${isRefreshing ? 'animate-spin' : ''}`} style={{ opacity: pullProgress }}>
          <RefreshCw size={20} className="text-blue-500" />
        </div>
      </div>

      <div className="p-4 md:p-6 lg:p-8 xl:p-10 max-w-[1600px] mx-auto transition-transform" style={{ transform: `translateY(${isRefreshing ? 50 : pullProgress * 50}px)` }}>
        <div className="flex justify-between items-center mb-6 md:mb-8 mt-2 md:mt-0">
          <div>
            <h1 className="text-sm font-bold opacity-60 uppercase tracking-widest mb-1">Good Morning</h1>
            <h2 className="text-2xl md:text-4xl font-black tracking-tight">Adon</h2>
          </div>
          <div className="md:hidden w-12 h-12 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 p-[2px] shadow-lg shadow-blue-500/20">
            <div className="w-full h-full rounded-full bg-[var(--background)] overflow-hidden">
               <img src="https://ui-avatars.com/api/?name=Adon&background=random" alt="Profile" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
        
        <div className="flex gap-3 overflow-x-auto pb-6 xl:pb-8 w-full custom-scrollbar-x min-w-0 snap-x">
          {accounts.filter(a => !a.id.startsWith('dues_') && !a.id.startsWith('cash_')).map(acc => (
            <React.Fragment key={acc.id}>
              <button
                onClick={() => setSelectedAccount(acc.id)}
                className={`snap-start shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all whitespace-nowrap text-sm font-semibold border ${
                  selectedAccount === acc.id 
                    ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/30' 
                    : 'glass border-[var(--border)] hover:bg-[var(--card)] opacity-80 hover:opacity-100'
                }`}
              >
                {acc.icon}
                {acc.name}
              </button>
              {acc.id === 'all' && (
                <>
                  <button 
                    onClick={() => setSelectedAccount('total_dues')}
                    className={`snap-start shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all whitespace-nowrap text-sm font-bold border ${selectedAccount === 'total_dues' ? 'bg-red-500 border-red-500 text-white shadow-lg shadow-red-500/30' : 'border-red-500/30 bg-red-500/5 text-red-500 shadow-lg shadow-red-500/10'}`}
                  >
                    <AlertCircle size={16} />
                    Total Dues: ₹{getDuesBalance('INR').toLocaleString()} | QAR {getDuesBalance('QAR').toLocaleString()}
                  </button>
                  <button 
                    onClick={() => setSelectedAccount('total_debt')}
                    className={`snap-start shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all whitespace-nowrap text-sm font-bold border ${selectedAccount === 'total_debt' ? 'bg-indigo-500 border-indigo-500 text-white shadow-lg shadow-indigo-500/30' : 'border-indigo-500/30 bg-indigo-500/5 text-indigo-500 shadow-lg shadow-indigo-500/10'}`}
                  >
                    <AlertCircle size={16} />
                    Total Debt: ₹{getDebtBalance('INR').toLocaleString()} | QAR {getDebtBalance('QAR').toLocaleString()}
                  </button>
                  <button 
                    onClick={() => setSelectedAccount('total_cash')}
                    className={`snap-start shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all whitespace-nowrap text-sm font-bold border ${selectedAccount === 'total_cash' ? 'bg-green-500 border-green-500 text-white shadow-lg shadow-green-500/30' : 'border-green-500/30 bg-green-500/5 text-green-500 shadow-lg shadow-green-500/10'}`}
                  >
                    <DollarSign size={16} />
                    Total Cash: ₹{getBalance('Cash (Rupees)').toLocaleString()} | QAR {getBalance('Cash (Qatar Riyal)').toLocaleString()}
                  </button>
                </>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Swipeable Summary Cards */}
        <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-4 -mx-4 px-4 md:mx-0 md:px-0 md:grid md:grid-cols-4 md:gap-6 custom-scrollbar mb-8">
          <div className="snap-center w-[85vw] md:w-auto shrink-0">
            <SummaryCard 
              title="Total Balance" 
              amount={renderCurrencyAmount(totalBalanceINR, totalBalanceQAR)} 
              trend={totalBalanceINR >= 0 ? "Healthy" : "Low"} 
              isPositive={totalBalanceINR >= 0} 
              icon={<DollarSign />} 
            />
          </div>
          <div className="snap-center w-[85vw] md:w-auto shrink-0">
            <SummaryCard 
              title="Total Income" 
              amount={renderCurrencyAmount(totalIncomeINR, totalIncomeQAR)} 
              trend="Recent" 
              isPositive={true} 
              icon={<TrendingUp />} 
            />
          </div>
          <div className="snap-center w-[85vw] md:w-auto shrink-0">
            <SummaryCard 
              title="Total Expenses" 
              amount={renderCurrencyAmount(totalExpensesINR, totalExpensesQAR)} 
              trend="Recent" 
              isPositive={false} 
              icon={<TrendingDown />} 
            />
          </div>
          <div className="snap-center w-[85vw] md:w-auto shrink-0">
            <SummaryCard title="Health Score" amount={`${healthScore}/100`} trend={healthScore > 50 ? "Good" : "Needs Work"} isPositive={healthScore > 50} icon={<DollarSign />} />
          </div>
        </div>

        <FinancialInsights transactions={transactions} activeCurrency={activeDisplayCurrency} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          <div className="lg:col-span-2 glass-panel rounded-3xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Cash Flow (This Week)</h2>
              <div className="text-sm font-bold opacity-50">{activeDisplayCurrency === 'INR' ? '₹ Rupees' : 'QAR Riyal'}</div>
            </div>
            {flowData.length > 0 ? (
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={flowData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
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
                    <XAxis dataKey="date" stroke="rgba(255,255,255,0.5)" tick={{fill: 'rgba(255,255,255,0.5)'}} axisLine={false} tickLine={false} />
                    <YAxis stroke="rgba(255,255,255,0.5)" tick={{fill: 'rgba(255,255,255,0.5)'}} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} />
                    <Area type="monotone" dataKey="Income" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorIncome)" />
                    <Area type="monotone" dataKey="Expense" stroke="#f43f5e" strokeWidth={3} fillOpacity={1} fill="url(#colorExpense)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-80 w-full flex items-center justify-center text-sm opacity-50">
                No transaction data available for chart.
              </div>
            )}
          </div>

          <div className="glass-panel rounded-3xl p-6 flex flex-col items-center">
            <div className="flex justify-between items-center mb-6 w-full">
              <h2 className="text-xl font-semibold">Expenses by Category</h2>
              <div className="text-sm font-bold opacity-50">{activeDisplayCurrency === 'INR' ? '₹ Rupees' : 'QAR Riyal'}</div>
            </div>
            {categoryData.length > 0 ? (
              <div className="h-64 w-full relative flex flex-col items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-2xl font-bold">{activeDisplayCurrency === 'INR' ? '₹' : 'QAR '}{(activeDisplayCurrency === 'INR' ? totalExpensesINR : totalExpensesQAR).toLocaleString()}</span>
                  <span className="text-xs opacity-50">Total</span>
                </div>
              </div>
            ) : (
              <div className="h-64 w-full relative flex items-center justify-center text-sm opacity-50">
                No category data available yet.
              </div>
            )}
          </div>
        </div>
      </div>
      
    </div>
  );
}

function SummaryCard({ title, amount, trend, isPositive, icon }) {
  return (
    <div className="glass-panel rounded-3xl p-6 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 relative overflow-hidden group">
      <div className="absolute -right-6 -top-6 opacity-10 group-hover:scale-110 transition-transform duration-500">
        {React.cloneElement(icon, { size: 100 })}
      </div>
      <div className="flex items-center gap-3 mb-4">
        <div className={`p-2 rounded-xl ${isPositive ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
          {icon}
        </div>
        <h3 className="text-sm opacity-70 font-medium">{title}</h3>
      </div>
      <div className="font-bold tracking-tight mb-2">{amount}</div>
      <div className={`text-sm font-semibold flex items-center gap-1 ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
        {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
        {trend}
      </div>
    </div>
  );
}
