import { useState, useEffect } from 'react';
import { Plus, TrendingUp, Calendar, Trash2 } from 'lucide-react';

export default function Investments() {
  const [investments, setInvestments] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    completion_date: '',
    type: 'SIP',
    currency: 'INR',
    sourceAccount: 'none'
  });

  const accounts = [
    { id: 'none', name: 'Do not deduct (Manual)' },
    { id: 'cash_inr', name: 'Cash in Hand (Rupees)' },
    { id: 'cash_qar', name: 'Cash in Hand (Qatar Riyal)' },
    { id: 'icici', name: 'ICICI Bank' },
    { id: 'sib', name: 'South Indian Bank' },
    { id: 'qatar_bank', name: 'Qatar Bank' },
    { id: 'debt_inr', name: 'Debt (Rupees)' },
    { id: 'debt_qar', name: 'Debt (Qatar Riyal)' }
  ];

  const fetchInvestments = () => {
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/investments`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setInvestments(data);
        }
      })
      .catch(err => console.error('Failed to load investments:', err));
  };

  const [exchangeRate, setExchangeRate] = useState(22.95);
  const [isFetchingRate, setIsFetchingRate] = useState(true);

  useEffect(() => {
    fetchInvestments();
    
    // Fetch live QAR to INR exchange rate
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/exchange-rate`)
      .then(res => res.json())
      .then(data => {
        if (data && data.rate) {
          setExchangeRate(data.rate);
        }
      })
      .catch(err => console.error('Failed to fetch exchange rate:', err))
      .finally(() => setIsFetchingRate(false));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/investments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...formData,
        amount: Number(formData.amount)
      })
    })
      .then(res => res.json())
      .then(async (newInv) => {
        setInvestments(prev => [newInv, ...prev]);
        
        if (formData.sourceAccount !== 'none') {
          const isDebt = formData.sourceAccount.startsWith('debt_');
          const isQarDebt = formData.sourceAccount === 'debt_qar';

          let cashTx;
          if (isDebt) {
            cashTx = {
              id: Date.now() + 1,
              date: new Date().toISOString().split('T')[0],
              type: 'Debt',
              dueAction: 'add',
              dueCurrency: isQarDebt ? 'QAR' : 'INR',
              includeInBalance: true,
              category: 'Debt',
              description: `Investment: ${formData.type}`,
              toWhom: 'Investment',
              mode: `Debt (${isQarDebt ? 'Qatar Riyal' : 'Rupees'})`,
              amount: Number(formData.amount),
              status: 'Completed'
            };
          } else {
            const selectedAcc = accounts.find(a => a.id === formData.sourceAccount);
            const accName = selectedAcc ? selectedAcc.name : 'Cash';
            const modeName = accName.replace('Cash in Hand', 'Cash');
            
            cashTx = {
              id: Date.now() + 1,
              date: new Date().toISOString().split('T')[0],
              type: 'Expense',
              category: 'Investments',
              description: `Investment: ${formData.type}`,
              mode: modeName,
              amount: Number(formData.amount),
              status: 'Completed'
            };
          }
          
          try {
            await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/transactions`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(cashTx)
            });
          } catch (err) {
            console.error('Failed to post auto transaction:', err);
          }
        }

        setShowAddForm(false);
        setFormData({ amount: '', completion_date: '', type: 'SIP', currency: 'INR', sourceAccount: 'none' });
      })
      .catch(err => console.error('Failed to add investment:', err));
  };

  const handleDelete = (id) => {
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/investments/${id}`, { method: 'DELETE' })
      .then(() => setInvestments(prev => prev.filter(inv => inv.id !== id)))
      .catch(err => console.error('Failed to delete investment:', err));
  };

  return (
    <div className="p-6 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-1">Investments</h1>
          <p className="opacity-60 flex items-center gap-2">
            Track your SIPs, FDs, Stocks, and Gold.
            {isFetchingRate ? (
              <span className="text-xs bg-blue-500/10 text-blue-500 px-2 py-0.5 rounded animate-pulse">Updating rate...</span>
            ) : (
              <span className="text-xs bg-blue-500/10 text-blue-500 px-2 py-0.5 rounded">1 QAR = ₹{exchangeRate}</span>
            )}
          </p>
        </div>
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-all shadow-lg shadow-blue-600/30"
        >
          <Plus size={18} />
          <span>Add Investment</span>
        </button>
      </div>

      {showAddForm && (
        <div className="glass-panel rounded-3xl p-6 mb-8 animate-in fade-in slide-in-from-top-4">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><TrendingUp size={20} className="text-blue-500"/> New Investment</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 opacity-70">Amount</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-sm opacity-50">{formData.currency === 'INR' ? '₹' : 'QAR'}</span>
                </div>
                <input
                  type="number"
                  step="any"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  required
                  className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl py-2 pl-8 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 opacity-70">Currency</label>
              <select
                name="currency"
                value={formData.currency}
                onChange={handleChange}
                className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="INR">INR (₹)</option>
                <option value="QAR">QAR</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 opacity-70">Investment Type</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="SIP">SIP</option>
                <option value="FD">FD</option>
                <option value="STOCK">STOCK</option>
                <option value="GOLD">GOLD</option>
                <option value="CASH">CASH</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 opacity-70">Deduct From Account</label>
              <select
                name="sourceAccount"
                value={formData.sourceAccount}
                onChange={handleChange}
                className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {accounts.map(acc => (
                  <option key={acc.id} value={acc.id}>{acc.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 opacity-70">Completion Date</label>
              <input
                type="date"
                name="completion_date"
                value={formData.completion_date}
                onChange={handleChange}
                required
                className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="lg:col-span-4 flex justify-end gap-3 mt-4">
              <button 
                type="button" 
                onClick={() => setShowAddForm(false)}
                className="px-6 py-2 rounded-xl font-semibold opacity-70 hover:opacity-100 hover:bg-[var(--card)] transition-all"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-lg shadow-blue-600/30 transition-all"
              >
                Save Investment
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {investments.length === 0 ? (
          <div className="col-span-full text-center py-12 opacity-50 glass-panel rounded-3xl">
            <TrendingUp size={48} className="mx-auto mb-4 opacity-50" />
            <p>No investments found.</p>
          </div>
        ) : (
          investments.map(inv => (
            <div key={inv.id} className="glass-panel rounded-3xl p-6 flex flex-col gap-4 hover:shadow-2xl transition-all duration-300 relative group">
              <button 
                onClick={() => handleDelete(inv.id)}
                className="absolute top-4 right-4 p-2 bg-red-500/10 text-red-500 rounded-lg opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 hover:text-white"
              >
                <Trash2 size={16} />
              </button>
              <div className="flex justify-between items-start">
                <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                  inv.type === 'SIP' ? 'bg-blue-500/20 text-blue-500' :
                  inv.type === 'FD' ? 'bg-green-500/20 text-green-500' :
                  inv.type === 'STOCK' ? 'bg-purple-500/20 text-purple-500' :
                  inv.type === 'CASH' ? 'bg-emerald-500/20 text-emerald-500' :
                  'bg-yellow-500/20 text-yellow-500'
                }`}>
                  {inv.type}
                </div>
              </div>
              
              <div>
                <div className="text-3xl font-bold">
                  {inv.currency === 'INR' ? '₹' : 'QAR '}
                  {inv.amount.toLocaleString()}
                </div>
                {inv.currency === 'QAR' && (
                  <div className="text-sm font-bold text-emerald-600 mt-1">
                    ≈ ₹{(inv.amount * exchangeRate).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </div>
                )}
                <div className="text-sm opacity-60 mt-1 flex items-center gap-1">
                  <Calendar size={14} /> Completion: {new Date(inv.completion_date).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
