import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { Plus, Search, Filter, ArrowUpRight, ArrowDownRight, Edit2, Trash2, X, Wallet, AlertCircle, DollarSign, Building2, CloudOff } from 'lucide-react';

const socket = io(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}`);

const getLocalDateString = () => {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().split('T')[0];
};

import { useLocation } from 'react-router-dom';

export default function Transactions() {
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const [filters, setFilters] = useState({ type: 'All', category: 'All', startDate: '', endDate: '' });
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState('icici');
  const [activeAccount, setActiveAccount] = useState('all');
  const [txType, setTxType] = useState('Expense');
  const [dueAction, setDueAction] = useState('add');
  const [dueCurrency, setDueCurrency] = useState('INR');
  const [includeInBalance, setIncludeInBalance] = useState(false);
  const [addToCash, setAddToCash] = useState(false);
  const [transferType, setTransferType] = useState('ATM');
  const [conversionRate, setConversionRate] = useState('');
  const [transferToAccount, setTransferToAccount] = useState('cash_inr');
  const [editId, setEditId] = useState(null);
  const [txDate, setTxDate] = useState(getLocalDateString());
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [toWhom, setToWhom] = useState('');
  const [category, setCategory] = useState('General');
  const [planIncome, setPlanIncome] = useState(false);
  const [upiAccount, setUpiAccount] = useState('icici');
  
  const [customCategories, setCustomCategories] = useState([]);
  const [isAddingNewCategory, setIsAddingNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  
  const defaultCategories = [
    'General', 'Food & Dining', 'Transportation', 'Housing & Rent', 
    'Entertainment', 'Utilities', 'Shopping', 'Healthcare', 'Salary/Income'
  ];
  const allCategories = [...defaultCategories, ...customCategories];
  
  const [transactions, setTransactions] = useState([]);
  const filterMenuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (filterMenuRef.current && !filterMenuRef.current.contains(event.target)) {
        setIsFilterMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [filterMenuRef]);

  useEffect(() => {
    if (location.state?.openAddModal) {
      setIsAddModalOpen(true);
      if (location.state.txType) {
        setTxType(location.state.txType);
      }
      // Clear state so it doesn't reopen on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Fetch initial data and setup live sync
  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/transactions`)
      .then(res => res.json())
      .then(data => setTransactions(Array.isArray(data) ? data : []))
      .catch(err => console.error('Failed to load transactions (is the backend running?)', err));

    socket.on('transaction_added', (newTx) => {
      setTransactions(prev => {
        // Prevent duplicates if we already added it locally
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

  const accounts = [
    { id: 'icici', name: 'ICICI Bank', logo: 'https://www.google.com/s2/favicons?domain=icicibank.com&sz=128' },
    { id: 'sib', name: 'South Indian Bank', logo: 'https://www.google.com/s2/favicons?domain=southindianbank.com&sz=128' },
    { id: 'qatar_bank', name: 'Qatar Bank', icon: <Building2 size={16} /> },
    { id: 'upi', name: 'UPI', logo: 'https://www.google.com/s2/favicons?domain=npci.org.in&sz=128' },
    { id: 'cash_inr', name: 'Cash (Rupees)', icon: <DollarSign size={16} /> },
    { id: 'cash_qar', name: 'Cash (Qatar Riyal)', icon: <DollarSign size={16} /> },
    { id: 'dues_inr', name: 'Dues (Rupees)', icon: <AlertCircle size={16} className="text-orange-500" /> },
    { id: 'dues_qar', name: 'Dues (Qatar Riyal)', icon: <AlertCircle size={16} className="text-orange-500" /> }
  ];

  const handleSaveTransaction = () => {
    if (txType === 'Transfer') {
      if (!amount) return alert("Please enter amount");
      const fromAcc = accounts.find(a => a.id === selectedAccount);
      const toAcc = accounts.find(a => a.id === transferToAccount);
      if (!fromAcc || !toAcc) return alert("Please select accounts");
      if (fromAcc.id === toAcc.id) return alert("Cannot transfer to the same account");
      
      const requiresConversion = transferType === 'Bank' && (selectedAccount === 'qatar_bank' || transferToAccount === 'qatar_bank');
      if (requiresConversion && (!conversionRate || isNaN(parseFloat(conversionRate)))) {
        return alert("Please enter a valid conversion rate");
      }

      const outAmount = parseFloat(amount);
      const inAmount = requiresConversion ? outAmount * parseFloat(conversionRate) : outAmount;

      const outTx = {
        id: Date.now(),
        date: txDate,
        type: 'Expense',
        category: 'Transfer/Loan',
        description: `Transfer to ${toAcc.name}`,
        mode: fromAcc.name,
        amount: outAmount,
        status: 'Completed'
      };

      const inTx = {
        id: Date.now() + 1,
        date: txDate,
        type: 'Income',
        category: 'Transfer/Loan',
        description: `Transfer from ${fromAcc.name}`,
        mode: toAcc.name,
        amount: inAmount,
        status: 'Completed'
      };

      fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(outTx)
      }).then(() => {
        fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/transactions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(inTx)
        });
      });

      setIsAddModalOpen(false);
      setAmount('');
      setTxDate(getLocalDateString());
      return;
    }

    if (!amount || !description) return alert("Please enter amount and description");
    
    let finalCategory = category;
    if (isAddingNewCategory) {
      if (!newCategoryName) return alert("Please enter a new category name");
      setCustomCategories([...customCategories, newCategoryName]);
      finalCategory = newCategoryName;
    }

    let finalDescription = description;
    if (txType === 'Income' && planIncome && !description.includes('[PLANNED]')) {
      finalDescription = `${description} [PLANNED]`;
    }

    const newTx = {
      id: editId || Date.now(),
      date: txDate,
      type: txType,
      dueAction: txType === 'Dues' ? dueAction : null,
      dueCurrency: txType === 'Dues' ? dueCurrency : null,
      includeInBalance: txType === 'Dues' ? includeInBalance : false,
      category: txType === 'Debt' ? 'Debt' : finalCategory,
      description: finalDescription,
      toWhom: txType === 'Debt' ? toWhom : null,
      mode: (txType === 'Dues' && dueAction === 'add') 
        ? `Dues (${dueCurrency === 'INR' ? 'Rupees' : 'Qatar Riyal'})` 
        : (selectedAccount === 'upi' ? `UPI (${accounts.find(a => a.id === upiAccount)?.name})` : (accounts.find(a => a.id === selectedAccount)?.name || 'Cash')),
      amount: parseFloat(amount),
      status: 'Completed'
    };

    const url = editId ? `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/transactions/${editId}` : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/transactions`;
    const method = editId ? 'PUT' : 'POST';

    fetch(url, {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newTx)
    })
    .then(res => res.json())
    .then((savedTx) => {
      // Update local state immediately with the saved data
      setTransactions(prev => {
        if (editId) {
          return prev.map(t => t.id === editId ? savedTx : t);
        } else {
          // Prevent duplicates if socket already added it
          if (prev.find(t => t.id === savedTx.id)) return prev;
          return [savedTx, ...prev];
        }
      });

      // Budget Reminder Logic for Needs
      if (txType === 'Expense' && ['Housing & Rent', 'Food & Dining', 'Utilities', 'Healthcare'].includes(finalCategory)) {
        const currentMonth = new Date(txDate).getMonth();
        const currentYear = new Date(txDate).getFullYear();
        
        const needsLimit = transactions
          .filter(t => t.type === 'Income' && t.description.includes('[PLANNED]') && new Date(t.date).getMonth() === currentMonth && new Date(t.date).getFullYear() === currentYear)
          .reduce((s, t) => s + (t.amount * 0.5), 0);

        if (needsLimit > 0) {
          const needsSpent = transactions
            .filter(t => t.type === 'Expense' && ['Housing & Rent', 'Food & Dining', 'Utilities', 'Healthcare'].includes(t.category) && new Date(t.date).getMonth() === currentMonth && new Date(t.date).getFullYear() === currentYear && t.id !== editId)
            .reduce((s, t) => s + t.amount, 0);

          const prevPercent = (needsSpent / needsLimit) * 100;
          const newPercent = ((needsSpent + parseFloat(amount)) / needsLimit) * 100;
          
          const thresholds = [100, 80, 60, 40, 20];
          const crossed = thresholds.find(t => prevPercent < t && newPercent >= t);
          
          if (crossed) {
            alert(`⚠️ BUDGET REMINDER: You have reached ${crossed}% of your planned Needs budget for this month!`);
          }
        }
      }
      if (addToCash && txType === 'Dues' && dueAction === 'add') {
        const cashTx = {
          id: Date.now() + 1,
          date: txDate,
          type: 'Expense',
          category: 'Dues Given',
          description: `Given Dues: ${finalDescription}`,
          mode: dueCurrency === 'INR' ? 'Cash (Rupees)' : 'Cash (Qatar Riyal)',
          amount: parseFloat(amount),
          status: 'Completed'
        };
        fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/transactions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(cashTx)
        });
      } else if (addToCash && txType === 'Dues' && dueAction === 'settle') {
        const cashTx = {
          id: Date.now() + 1,
          date: txDate,
          type: 'Income',
          category: 'Dues Received',
          description: `Received Dues: ${finalDescription}`,
          mode: dueCurrency === 'INR' ? 'Cash (Rupees)' : 'Cash (Qatar Riyal)',
          amount: parseFloat(amount),
          status: 'Completed'
        };
        fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/transactions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(cashTx)
        });
      }

      setIsAddModalOpen(false);
      setAmount('');
      setDescription('');
      setToWhom('');
      setIsAddingNewCategory(false);
      setNewCategoryName('');
      setPlanIncome(false);
      setIncludeInBalance(false);
      setAddToCash(false);
      setEditId(null);
      setTxDate(getLocalDateString());
    })
    .catch(err => {
      console.error('Failed to save transaction:', err);
      alert('Failed to save. Is the backend running?');
    });
  };

  const handleEdit = (tx) => {
    setEditId(tx.id);
    setTxDate(tx.date);
    setTxType(tx.type);
    setAmount(tx.amount.toString());
    setDescription(tx.description.replace(' [PLANNED]', ''));
    setToWhom(tx.toWhom || '');
    setPlanIncome(tx.description.includes('[PLANNED]'));
    setCategory(allCategories.includes(tx.category) ? tx.category : 'General');
    if (!allCategories.includes(tx.category)) {
      setCustomCategories([...customCategories, tx.category]);
      setCategory(tx.category);
    }
    setDueAction(tx.dueAction || 'add');
    setDueCurrency(tx.dueCurrency || 'INR');
    setIncludeInBalance(tx.includeInBalance === 1 || tx.includeInBalance === true);
    
    if (tx.type !== 'Dues' || tx.dueAction === 'settle') {
      if (tx.mode && tx.mode.startsWith('UPI (')) {
        setSelectedAccount('upi');
        const upiBankName = tx.mode.match(/UPI \((.*)\)/)?.[1];
        const upiAccDef = accounts.find(a => a.name === upiBankName);
        if (upiAccDef) setUpiAccount(upiAccDef.id);
      } else {
        const modeAcc = accounts.find(a => a.name === tx.mode);
        if (modeAcc) setSelectedAccount(modeAcc.id);
      }
    }
    setIsAddModalOpen(true);
  };

  const handleDelete = (id) => {
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/transactions/${id}`, { method: 'DELETE' })
      .catch(err => console.error('Failed to delete', err));
  };

  const filteredTransactions = transactions.filter(tx => {
    const matchSearch = tx.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchAccount = true;
    if (activeAccount !== 'all') {
      if (activeAccount === 'total_dues') {
        matchAccount = tx.type === 'Dues';
      } else if (activeAccount === 'total_debt') {
        matchAccount = tx.type === 'Debt';
      } else if (activeAccount === 'total_cash') {
        matchAccount = tx.mode === 'Cash (Rupees)' || tx.mode === 'Cash (Qatar Riyal)';
      } else {
        const accDef = accounts.find(a => a.id === activeAccount);
        matchAccount = accDef ? (tx.mode === accDef.name || tx.mode === `UPI (${accDef.name})`) : false;
      }
    }

    const matchType = filters.type === 'All' || tx.type === filters.type;
    const matchCategory = filters.category === 'All' || tx.category === filters.category;
    
    let matchDate = true;
    if (filters.startDate) {
      matchDate = matchDate && new Date(tx.date) >= new Date(filters.startDate);
    }
    if (filters.endDate) {
      matchDate = matchDate && new Date(tx.date) <= new Date(filters.endDate);
    }
    
    return matchSearch && matchAccount && matchType && matchCategory && matchDate;
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
      .filter(tx => tx.type === 'Debt' && (currency === 'QAR' ? (tx.mode?.includes('Qatar') || tx.dueCurrency === 'QAR') : !(tx.mode?.includes('Qatar') || tx.dueCurrency === 'QAR')))
      .reduce((acc, tx) => acc + tx.amount, 0);
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-8 gap-6">
        <div className="whitespace-nowrap">
          <h1 className="text-3xl font-bold mb-1">Transactions</h1>
          <p className="opacity-60">Manage and track your recent financial activities.</p>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-2 xl:pb-0 w-full xl:flex-1 px-0 xl:px-4 custom-scrollbar-x min-w-0">
          <button 
            onClick={() => setActiveAccount('all')}
            className={`px-4 py-2 rounded-2xl flex items-center gap-3 shrink-0 border transition-all whitespace-nowrap text-left ${activeAccount === 'all' ? 'glass border-blue-500 shadow-md shadow-blue-500/20' : 'bg-black/5 dark:bg-white/5 border-[var(--border)] opacity-70 hover:opacity-100'}`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center overflow-hidden border shrink-0 ${activeAccount === 'all' ? 'bg-blue-500/20 text-blue-500 border-blue-500/30' : 'bg-white border-black/10 text-black'}`}>
              <Wallet size={16} />
            </div>
            <div>
              <div className="text-xs opacity-60 font-medium">All Accounts</div>
              <div className="font-bold">View All</div>
            </div>
          </button>

          <button 
            onClick={() => setActiveAccount('total_dues')}
            className={`px-4 py-2 rounded-2xl flex items-center gap-3 shrink-0 border transition-all whitespace-nowrap text-left ${activeAccount === 'total_dues' ? 'glass border-red-500 shadow-md shadow-red-500/20' : 'bg-red-500/5 border-red-500/30 opacity-80 hover:opacity-100'}`}
          >
            <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center overflow-hidden border border-red-500/20 shrink-0">
              <AlertCircle size={16} className="text-red-500" />
            </div>
            <div>
              <div className="text-xs opacity-60 font-medium text-red-500">Total Dues</div>
              <div className="font-bold text-red-500 flex gap-2">
                <span>₹{getDuesBalance('INR').toLocaleString()}</span>
                <span className="opacity-50">|</span>
                <span>QAR {getDuesBalance('QAR').toLocaleString()}</span>
              </div>
            </div>
          </button>

          <button 
            onClick={() => setActiveAccount('total_debt')}
            className={`px-4 py-2 rounded-2xl flex items-center gap-3 shrink-0 border transition-all whitespace-nowrap text-left ${activeAccount === 'total_debt' ? 'glass border-indigo-500 shadow-md shadow-indigo-500/20' : 'bg-indigo-500/5 border-indigo-500/30 opacity-80 hover:opacity-100'}`}
          >
            <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center overflow-hidden border border-indigo-500/20 shrink-0">
              <AlertCircle size={16} className="text-indigo-500" />
            </div>
            <div>
              <div className="text-xs opacity-60 font-medium text-indigo-500">Total Debt</div>
              <div className="font-bold text-indigo-500 flex gap-2">
                <span>₹{getDebtBalance('INR').toLocaleString()}</span>
                <span className="opacity-50">|</span>
                <span>QAR {getDebtBalance('QAR').toLocaleString()}</span>
              </div>
            </div>
          </button>

          <button 
            onClick={() => setActiveAccount('total_cash')}
            className={`px-4 py-2 rounded-2xl flex items-center gap-3 shrink-0 border transition-all whitespace-nowrap text-left ${activeAccount === 'total_cash' ? 'glass border-green-500 shadow-md shadow-green-500/20' : 'bg-green-500/5 border-green-500/30 opacity-80 hover:opacity-100'}`}
          >
            <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center overflow-hidden border border-green-500/20 shrink-0">
              <DollarSign size={16} className="text-green-500" />
            </div>
            <div>
              <div className="text-xs opacity-60 font-medium text-green-500">Total Cash</div>
              <div className="font-bold text-green-500 flex gap-2">
                <span>₹{getBalance('Cash (Rupees)').toLocaleString()}</span>
                <span className="opacity-50">|</span>
                <span>QAR {getBalance('Cash (Qatar Riyal)').toLocaleString()}</span>
              </div>
            </div>
          </button>

          {accounts.filter(a => !a.id.startsWith('dues_') && !a.id.startsWith('cash_') && a.id !== 'upi').map(acc => {
            const balance = getBalance(acc.name);
            const isActive = activeAccount === acc.id;
            return (
              <button 
                key={acc.id} 
                onClick={() => setActiveAccount(acc.id)}
                className={`px-4 py-2 rounded-2xl flex items-center gap-3 shrink-0 border transition-all whitespace-nowrap text-left ${isActive ? 'glass border-blue-500 shadow-md shadow-blue-500/20' : 'bg-black/5 dark:bg-white/5 border-[var(--border)] opacity-70 hover:opacity-100'}`}
              >
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center overflow-hidden border border-black/10 shrink-0 text-black">
                  {acc.logo ? (
                    <img src={acc.logo} alt={acc.name} className="w-6 h-6 object-contain" />
                  ) : (
                    acc.icon
                  )}
                </div>
                <div>
                  <div className="text-xs opacity-60 font-medium">{acc.name}</div>
                  <div className={`font-bold ${balance < 0 ? 'text-red-500' : ''}`}>
                    {balance < 0 ? '-' : ''}₹{Math.abs(balance).toLocaleString()}
                  </div>
                </div>
              </button>
            );
          })}
          
          <div className="w-8 shrink-0"></div>
        </div>

        <button 
          onClick={() => {
            setEditId(null);
            setAmount('');
            setDescription('');
            setToWhom('');
            setIncludeInBalance(false);
            setAddToCash(false);
            setIsAddModalOpen(true);
          }}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-0.5 shrink-0"
        >
          <Plus size={20} />
          <span className="font-semibold">Add New</span>
        </button>
      </div>

      <div className="glass-panel rounded-3xl overflow-hidden flex flex-col">
        <div className="p-6 border-b border-[var(--border)] flex flex-wrap gap-4 items-center justify-between">
          <div className="flex items-center glass rounded-xl px-4 py-2 w-full md:w-80">
            <Search size={18} className="opacity-50" />
            <input 
              type="text" 
              placeholder="Search transactions..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="bg-transparent border-none outline-none ml-2 w-full text-sm"
            />
          </div>
          <div className="relative" ref={filterMenuRef}>
            <button 
              onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)} 
              className={`flex items-center gap-2 px-4 py-2 rounded-xl glass hover:bg-[var(--card)] transition-colors relative ${isFilterMenuOpen ? 'bg-[var(--card)]' : ''}`}
            >
              <Filter size={18} />
              <span className="text-sm font-medium">Filters</span>
              {(filters.type !== 'All' || filters.category !== 'All' || filters.startDate || filters.endDate) && (
                <span className="w-2 h-2 rounded-full bg-blue-500 absolute top-2 right-2"></span>
              )}
            </button>

            {isFilterMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-72 glass-panel rounded-2xl p-4 shadow-xl z-10 border border-[var(--border)] animate-in fade-in slide-in-from-top-2">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold">Filters</h3>
                  <button 
                    onClick={() => setFilters({ type: 'All', category: 'All', startDate: '', endDate: '' })}
                    className="text-xs text-blue-500 hover:underline"
                  >
                    Clear All
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs opacity-70 mb-1">Type</label>
                    <select 
                      value={filters.type} 
                      onChange={e => setFilters({...filters, type: e.target.value})}
                      className="w-full bg-black/5 dark:bg-white/5 border border-[var(--border)] rounded-lg px-3 py-2 text-sm outline-none appearance-none"
                    >
                      <option value="All" className="text-black dark:text-white bg-white dark:bg-slate-900">All Types</option>
                      <option value="Expense" className="text-black dark:text-white bg-white dark:bg-slate-900">Expense</option>
                      <option value="Income" className="text-black dark:text-white bg-white dark:bg-slate-900">Income</option>
                      <option value="Dues" className="text-black dark:text-white bg-white dark:bg-slate-900">Dues</option>
                      <option value="Transfer" className="text-black dark:text-white bg-white dark:bg-slate-900">Transfer</option>
                      <option value="Debt" className="text-black dark:text-white bg-white dark:bg-slate-900">Debt</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs opacity-70 mb-1">Category</label>
                    <select 
                      value={filters.category} 
                      onChange={e => setFilters({...filters, category: e.target.value})}
                      className="w-full bg-black/5 dark:bg-white/5 border border-[var(--border)] rounded-lg px-3 py-2 text-sm outline-none appearance-none"
                    >
                      <option value="All" className="text-black dark:text-white bg-white dark:bg-slate-900">All Categories</option>
                      {allCategories.map(cat => (
                        <option key={cat} value={cat} className="text-black dark:text-white bg-white dark:bg-slate-900">{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs opacity-70 mb-1">From</label>
                      <input 
                        type="date" 
                        value={filters.startDate}
                        onChange={e => setFilters({...filters, startDate: e.target.value})}
                        className="w-full bg-black/5 dark:bg-white/5 border border-[var(--border)] rounded-lg px-2 py-2 text-sm outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs opacity-70 mb-1">To</label>
                      <input 
                        type="date" 
                        value={filters.endDate}
                        onChange={e => setFilters({...filters, endDate: e.target.value})}
                        className="w-full bg-black/5 dark:bg-white/5 border border-[var(--border)] rounded-lg px-2 py-2 text-sm outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="overflow-x-auto min-h-[300px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--border)] bg-black/5 dark:bg-white/5">
                <th className="p-4 font-semibold opacity-70 whitespace-nowrap">Date</th>
                <th className="p-4 font-semibold opacity-70 whitespace-nowrap">Transaction</th>
                <th className="p-4 font-semibold opacity-70 whitespace-nowrap">To Whom</th>
                <th className="p-4 font-semibold opacity-70 whitespace-nowrap">Category</th>
                <th className="p-4 font-semibold opacity-70 whitespace-nowrap">Mode</th>
                <th className="p-4 font-semibold opacity-70 text-right whitespace-nowrap">Amount</th>
                <th className="p-4 font-semibold opacity-70 text-center whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center opacity-50">
                    No transactions found. Add a new one to get started!
                  </td>
                </tr>
              ) : filteredTransactions.map((tx) => (
                <tr key={tx.id} className="border-b border-[var(--border)] hover:bg-black/5 dark:hover:bg-white/5 transition-colors group">
                  <td className="p-4 text-sm whitespace-nowrap opacity-80">{tx.date}</td>
                  <td className="p-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${tx.type === 'Income' ? 'bg-green-500/10 text-green-500' : tx.type === 'Debt' ? 'bg-indigo-500/10 text-indigo-500' : 'bg-red-500/10 text-red-500'}`}>
                        {tx.type === 'Income' ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                      </div>
                      <div>
                        <div className="font-medium flex items-center gap-2">
                          {tx.description.replace(' [PLANNED]', '')}
                          {tx._offline && <span title="Pending sync"><CloudOff size={14} className="text-orange-500 animate-pulse" /></span>}
                        </div>
                        <div className="text-xs flex gap-2">
                          <span className="opacity-50">{tx.type}</span>
                          {tx.description.includes('[PLANNED]') && (
                            <span className="text-blue-500 font-bold opacity-80">Planned</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-sm opacity-80 whitespace-nowrap">{tx.toWhom || '-'}</td>
                  <td className="p-4 whitespace-nowrap">
                    <span className="px-3 py-1 text-xs rounded-full border border-[var(--border)] bg-black/5 dark:bg-white/5">
                      {tx.category}
                    </span>
                  </td>
                  <td className="p-4 text-sm opacity-80 whitespace-nowrap">{tx.mode}</td>
                  <td className={`p-4 font-bold text-right whitespace-nowrap ${tx.type === 'Income' ? 'text-green-500' : 'text-red-500'}`}>
                    {tx.type === 'Income' ? '+' : '-'}{(tx.mode?.includes('Qatar') || tx.dueCurrency === 'QAR' || tx.mode?.includes('QAR')) ? 'QAR ' : '₹'}{tx.amount.toLocaleString()}
                  </td>
                  <td className="p-4 text-center whitespace-nowrap">
                    <div className="flex items-center justify-center gap-2 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleEdit(tx)} className="p-1.5 hover:bg-blue-500/20 text-blue-500 rounded-lg transition-colors"><Edit2 size={16}/></button>
                      <button onClick={() => handleDelete(tx.id)} className="p-1.5 hover:bg-red-500/20 text-red-500 rounded-lg transition-colors"><Trash2 size={16}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="p-4 border-t border-[var(--border)] flex items-center justify-between text-sm opacity-70">
          <span>Showing {filteredTransactions.length} transactions</span>
          <div className="flex gap-2">
            <button className="px-3 py-1 rounded glass hover:bg-[var(--card)] opacity-50 cursor-not-allowed">Previous</button>
            <button className="px-3 py-1 rounded glass hover:bg-[var(--card)] opacity-50 cursor-not-allowed">Next</button>
          </div>
        </div>
      </div>

      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="glass-panel w-full max-w-md rounded-3xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-[var(--border)]">
              <h2 className="text-xl font-bold">{editId ? 'Edit Transaction' : 'Add Transaction'}</h2>
              <button onClick={() => setIsAddModalOpen(false)} className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div>
                <label className="block text-sm font-medium mb-2 opacity-80">Date</label>
                <input 
                  type="date" 
                  value={txDate}
                  onChange={(e) => setTxDate(e.target.value)}
                  className="w-full bg-black/5 dark:bg-white/5 border border-[var(--border)] rounded-xl px-4 py-3 outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 opacity-80">
                  Amount {(['qatar_bank', 'cash_qar', 'dues_qar'].includes(selectedAccount) && txType !== 'Dues') || (txType === 'Dues' && dueCurrency === 'QAR') ? '(QAR)' : '(₹)'}
                </label>
                <input 
                  type="number" 
                  step="any"
                  placeholder="0.00" 
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-black/5 dark:bg-white/5 border border-[var(--border)] rounded-xl px-4 py-3 outline-none focus:border-blue-500 transition-colors" 
                />
              </div>

              {!(txType === 'Dues' && dueAction === 'add') && (
                <div>
                  <label className="block text-sm font-medium mb-2 opacity-80">
                    {txType === 'Transfer' ? 'From Account' : 'Account / Mode (For Settlement)'}
                  </label>
                  <div className="grid grid-cols-1 gap-3 max-h-[160px] overflow-y-auto pr-2 custom-scrollbar">
                    {accounts
                      .filter(acc => {
                        if (txType === 'Transfer') {
                          if (acc.id.startsWith('dues_') || acc.id === 'upi') return false;
                          if (transferType === 'ATM' && acc.id.startsWith('cash_')) return false;
                        } else if (txType === 'Expense' || txType === 'Income') {
                          if (acc.id.startsWith('dues_')) return false;
                        }
                        return true;
                      })
                      .map(acc => (
                      <button 
                        key={acc.id}
                        onClick={() => {
                          setSelectedAccount(acc.id);
                          if (txType === 'Transfer') {
                            if (transferType === 'ATM') {
                              if (acc.id === 'qatar_bank') setTransferToAccount('cash_qar');
                              if (acc.id === 'icici' || acc.id === 'sib') setTransferToAccount('cash_inr');
                            } else if (transferType === 'Bank') {
                              if (acc.id === 'icici') setTransferToAccount('sib');
                              if (acc.id === 'sib') setTransferToAccount('icici');
                              if (acc.id === 'qatar_bank') setTransferToAccount('icici');
                            }
                          }
                        }}
                        className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${selectedAccount === acc.id ? 'border-blue-500 bg-blue-500/10' : 'border-[var(--border)] hover:bg-black/5 dark:hover:bg-white/5'}`}
                      >
                        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center overflow-hidden border border-black/10 shrink-0 text-black">
                          {acc.logo ? (
                            <img src={acc.logo} alt={acc.name} className="w-6 h-6 object-contain" />
                          ) : (
                            acc.icon
                          )}
                        </div>
                        <span className="font-semibold text-left">{acc.name}</span>
                      </button>
                    ))}
                  </div>
                  
                  {selectedAccount === 'upi' && (
                    <div className="mt-4 p-4 rounded-xl border border-[var(--border)] bg-black/5 dark:bg-white/5 animate-in slide-in-from-top-2">
                      <label className="block text-sm font-medium mb-3 opacity-80">Select Indian Bank Account</label>
                      <div className="flex gap-3">
                        {accounts.filter(a => a.id === 'icici' || a.id === 'sib').map(acc => (
                          <button
                            key={acc.id}
                            onClick={() => setUpiAccount(acc.id)}
                            className={`flex items-center justify-center gap-2 p-3 rounded-xl border transition-all flex-1 ${upiAccount === acc.id ? 'border-blue-500 bg-blue-500/10 text-blue-500 font-bold' : 'border-[var(--border)] hover:bg-[var(--card)]'}`}
                          >
                            <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center overflow-hidden border border-black/10 shrink-0 text-black">
                              {acc.logo ? (
                                <img src={acc.logo} alt={acc.name} className="w-4 h-4 object-contain" />
                              ) : (
                                acc.icon
                              )}
                            </div>
                            <span className="text-sm">{acc.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {txType === 'Transfer' && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-2 opacity-80">To Account</label>
                    <div className="grid grid-cols-1 gap-3 max-h-[160px] overflow-y-auto pr-2 custom-scrollbar">
                      {accounts
                        .filter(acc => {
                          if (acc.id.startsWith('dues_') || acc.id === 'upi') return false;
                          if (transferType === 'ATM') {
                            if (selectedAccount === 'qatar_bank') return acc.id === 'cash_qar';
                            if (selectedAccount === 'icici' || selectedAccount === 'sib') return acc.id === 'cash_inr';
                            return acc.id.startsWith('cash_');
                          } else {
                            // Bank Transfer
                            if (selectedAccount === 'icici') return acc.id === 'sib';
                            if (selectedAccount === 'sib') return acc.id === 'icici';
                            if (selectedAccount === 'qatar_bank') return acc.id === 'icici' || acc.id === 'sib';
                            return !acc.id.startsWith('cash_') && acc.id !== selectedAccount;
                          }
                        })
                        .map(acc => (
                        <button 
                          key={acc.id}
                          onClick={() => setTransferToAccount(acc.id)}
                          className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${transferToAccount === acc.id ? 'border-purple-500 bg-purple-500/10' : 'border-[var(--border)] hover:bg-black/5 dark:hover:bg-white/5'}`}
                        >
                          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center overflow-hidden border border-black/10 shrink-0 text-black">
                            {acc.logo ? (
                              <img src={acc.logo} alt={acc.name} className="w-6 h-6 object-contain" />
                            ) : (
                              acc.icon
                            )}
                          </div>
                          <span className="font-semibold text-left">{acc.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 opacity-80">Transfer Type</label>
                    <div className="flex gap-4">
                      <button 
                        onClick={() => {
                          setTransferType('ATM');
                          if (selectedAccount === 'qatar_bank') setTransferToAccount('cash_qar');
                          if (selectedAccount === 'icici' || selectedAccount === 'sib') setTransferToAccount('cash_inr');
                        }}
                        className={`flex-1 py-2 rounded-xl border font-semibold transition-colors ${transferType === 'ATM' ? 'border-purple-500 bg-purple-500/10 text-purple-500' : 'border-[var(--border)] hover:bg-black/5 dark:hover:bg-white/5 opacity-70'}`}
                      >
                        ATM Withdrawal
                      </button>
                      <button 
                        onClick={() => {
                          setTransferType('Bank');
                          if (selectedAccount === 'icici') setTransferToAccount('sib');
                          if (selectedAccount === 'sib') setTransferToAccount('icici');
                          if (selectedAccount === 'qatar_bank') setTransferToAccount('icici');
                        }}
                        className={`flex-1 py-2 rounded-xl border font-semibold transition-colors ${transferType === 'Bank' ? 'border-purple-500 bg-purple-500/10 text-purple-500' : 'border-[var(--border)] hover:bg-black/5 dark:hover:bg-white/5 opacity-70'}`}
                      >
                        Bank Transfer
                      </button>
                    </div>
                  </div>

                  {transferType === 'Bank' && (selectedAccount === 'qatar_bank' || transferToAccount === 'qatar_bank') && (
                    <div>
                      <label className="block text-sm font-medium mb-2 opacity-80">Conversion Rate</label>
                      <input 
                        type="number" 
                        step="any"
                        placeholder="e.g. 23.5"
                        value={conversionRate}
                        onChange={(e) => setConversionRate(e.target.value)}
                        className="w-full bg-black/5 dark:bg-white/5 border border-[var(--border)] rounded-xl px-4 py-3 outline-none focus:border-purple-500 transition-colors" 
                      />
                      <p className="text-xs opacity-60 mt-2">Amount will be multiplied by this rate.</p>
                    </div>
                  )}
                </div>
              )}

              {txType !== 'Transfer' && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-2 opacity-80">Description</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Groceries, Salary" 
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full bg-black/5 dark:bg-white/5 border border-[var(--border)] rounded-xl px-4 py-3 outline-none focus:border-blue-500 transition-colors" 
                    />
                  </div>

                  {txType === 'Debt' && (
                    <div>
                      <label className="block text-sm font-medium mb-2 opacity-80">To Whom (Name/Entity)</label>
                      <input 
                        type="text" 
                        placeholder="e.g. John Doe, Bank" 
                        value={toWhom}
                        onChange={(e) => setToWhom(e.target.value)}
                        className="w-full bg-black/5 dark:bg-white/5 border border-[var(--border)] rounded-xl px-4 py-3 outline-none focus:border-blue-500 transition-colors" 
                      />
                    </div>
                  )}

                  {txType !== 'Debt' && (
                    <div>
                      <label className="block text-sm font-medium mb-2 opacity-80">Category</label>
                    
                    {!isAddingNewCategory ? (
                      <select 
                        value={category}
                        onChange={(e) => {
                          if (e.target.value === 'add_new') {
                            setIsAddingNewCategory(true);
                          } else {
                            setCategory(e.target.value);
                          }
                        }}
                        className="w-full bg-black/5 dark:bg-white/5 border border-[var(--border)] rounded-xl px-4 py-3 outline-none focus:border-blue-500 transition-colors appearance-none"
                      >
                        {allCategories.map(cat => (
                          <option key={cat} value={cat} className="text-black dark:text-white bg-white dark:bg-slate-900">{cat}</option>
                        ))}
                        <option value="add_new" className="text-blue-500 font-bold bg-white dark:bg-slate-900">+ Add New Category...</option>
                      </select>
                    ) : (
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          placeholder="New Category Name" 
                          value={newCategoryName}
                          onChange={(e) => setNewCategoryName(e.target.value)}
                          className="w-full bg-black/5 dark:bg-white/5 border border-[var(--border)] rounded-xl px-4 py-3 outline-none focus:border-blue-500 transition-colors" 
                          autoFocus
                        />
                        <button 
                          onClick={() => setIsAddingNewCategory(false)}
                          className="px-4 py-3 rounded-xl border border-[var(--border)] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                  )}
                </>
              )}
              
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <button 
                  onClick={() => setTxType('Expense')}
                  className={`w-full py-3 rounded-xl border font-semibold transition-colors ${txType === 'Expense' ? 'border-red-500 bg-red-500/10 text-red-500' : 'border-[var(--border)] hover:bg-black/5 dark:hover:bg-white/5 text-red-500/70'}`}
                >
                  Expense
                </button>
                <button 
                  onClick={() => setTxType('Income')}
                  className={`w-full py-3 rounded-xl border font-semibold transition-colors ${txType === 'Income' ? 'border-green-500 bg-green-500/10 text-green-500' : 'border-[var(--border)] hover:bg-black/5 dark:hover:bg-white/5 text-green-500/70'}`}
                >
                  Income
                </button>
                <button 
                  onClick={() => setTxType('Dues')}
                  className={`w-full py-3 rounded-xl border font-semibold transition-colors ${txType === 'Dues' ? 'border-orange-500 bg-orange-500/10 text-orange-500' : 'border-[var(--border)] hover:bg-black/5 dark:hover:bg-white/5 text-orange-500/70'}`}
                >
                  Dues
                </button>
                <button 
                  onClick={() => setTxType('Transfer')}
                  className={`w-full py-3 rounded-xl border font-semibold transition-colors ${txType === 'Transfer' ? 'border-purple-500 bg-purple-500/10 text-purple-500' : 'border-[var(--border)] hover:bg-black/5 dark:hover:bg-white/5 text-purple-500/70'}`}
                >
                  Transfer
                </button>
                <button 
                  onClick={() => setTxType('Debt')}
                  className={`w-full py-3 rounded-xl border font-semibold transition-colors ${txType === 'Debt' ? 'border-indigo-500 bg-indigo-500/10 text-indigo-500' : 'border-[var(--border)] hover:bg-black/5 dark:hover:bg-white/5 text-indigo-500/70'}`}
                >
                  Debt
                </button>
              </div>

              {txType === 'Income' && (
                <div className="bg-black/5 dark:bg-white/5 p-4 rounded-2xl border border-[var(--border)]">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <label className="text-sm font-bold block">Plan the income</label>
                    </div>
                    <button 
                      onClick={() => setPlanIncome(!planIncome)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${planIncome ? 'bg-blue-600' : 'bg-black/20 dark:bg-white/20'}`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${planIncome ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>
                  
                  {planIncome && parseFloat(amount) > 0 && (
                    <div className="mt-4 space-y-3 animate-in slide-in-from-top-2">
                      <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                        <div className="flex justify-between text-sm font-bold text-blue-600 dark:text-blue-400 mb-1">
                          <span>Needs (50%)</span>
                          <span>₹{(parseFloat(amount) * 0.50).toLocaleString()}</span>
                        </div>
                        <div className="text-xs opacity-70">Housing, Food, Utilities, Healthcare</div>
                      </div>
                      <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
                        <div className="flex justify-between text-sm font-bold text-purple-600 dark:text-purple-400 mb-1">
                          <span>Wants (30%)</span>
                          <span>₹{(parseFloat(amount) * 0.30).toLocaleString()}</span>
                        </div>
                        <div className="text-xs opacity-70">Entertainment, Hobbies, Subscriptions</div>
                      </div>
                      <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20">
                        <div className="flex justify-between text-sm font-bold text-green-600 dark:text-green-400 mb-1">
                          <span>Savings (20%)</span>
                          <span>₹{(parseFloat(amount) * 0.20).toLocaleString()}</span>
                        </div>
                        <div className="text-xs opacity-70">Emergencies, Investments, Goals</div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {txType === 'Dues' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 opacity-80">Due Currency</label>
                    <div className="flex gap-4">
                      <button 
                        onClick={() => setDueCurrency('INR')}
                        className={`flex-1 py-2 rounded-xl border font-semibold transition-colors ${dueCurrency === 'INR' ? 'border-red-500 bg-red-500/10 text-red-500' : 'border-[var(--border)] hover:bg-black/5 dark:hover:bg-white/5 opacity-70'}`}
                      >
                        Rupees (₹)
                      </button>
                      <button 
                        onClick={() => setDueCurrency('QAR')}
                        className={`flex-1 py-2 rounded-xl border font-semibold transition-colors ${dueCurrency === 'QAR' ? 'border-red-500 bg-red-500/10 text-red-500' : 'border-[var(--border)] hover:bg-black/5 dark:hover:bg-white/5 opacity-70'}`}
                      >
                        Qatar Riyal (QAR)
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button 
                      onClick={() => setDueAction('add')}
                      className={`flex-1 py-3 rounded-xl border font-medium transition-colors ${dueAction === 'add' ? 'border-orange-500 bg-orange-500/10 text-orange-500' : 'border-[var(--border)] hover:bg-black/5 dark:hover:bg-white/5 opacity-70'}`}
                    >
                      + Add to Dues
                    </button>
                    <button 
                      onClick={() => setDueAction('settle')}
                      className={`flex-1 py-3 rounded-xl border font-medium transition-colors ${dueAction === 'settle' ? 'border-green-500 bg-green-500/10 text-green-500' : 'border-[var(--border)] hover:bg-black/5 dark:hover:bg-white/5 opacity-70'}`}
                    >
                      - Settle Dues
                    </button>
                  </div>

                  <div className="bg-black/5 dark:bg-white/5 p-4 rounded-2xl border border-[var(--border)] mt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-bold block">Include in Total Balance</label>
                        <p className="text-xs opacity-60">Should this due count towards your available balance?</p>
                      </div>
                      <button 
                        onClick={() => setIncludeInBalance(!includeInBalance)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${includeInBalance ? 'bg-orange-500' : 'bg-black/20 dark:bg-white/20'}`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${includeInBalance ? 'translate-x-6' : 'translate-x-1'}`} />
                      </button>
                    </div>
                  </div>

                  {dueAction === 'add' && (
                    <div className="bg-black/5 dark:bg-white/5 p-4 rounded-2xl border border-[var(--border)] mt-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-sm font-bold block">Also Deduct from Cash Account?</label>
                          <p className="text-xs opacity-60">Automatically create an expense transaction in your Cash account</p>
                        </div>
                        <button 
                          onClick={() => setAddToCash(!addToCash)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${addToCash ? 'bg-red-500' : 'bg-black/20 dark:bg-white/20'}`}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${addToCash ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                      </div>
                    </div>
                  )}

                  {dueAction === 'settle' && (
                    <div className="bg-black/5 dark:bg-white/5 p-4 rounded-2xl border border-[var(--border)] mt-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-sm font-bold block">Also Add to Cash Account?</label>
                          <p className="text-xs opacity-60">Automatically create an income transaction in your Cash account</p>
                        </div>
                        <button 
                          onClick={() => setAddToCash(!addToCash)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${addToCash ? 'bg-green-500' : 'bg-black/20 dark:bg-white/20'}`}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${addToCash ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <button 
                onClick={handleSaveTransaction}
                className="w-full py-3 mt-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-colors shadow-lg shadow-blue-500/30"
              >
                {editId ? 'Save Changes' : 'Save Transaction'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
