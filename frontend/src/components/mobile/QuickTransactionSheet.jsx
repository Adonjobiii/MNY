import React, { useState } from 'react';
import BottomSheet from './BottomSheet';
import { ArrowDownLeft, ArrowUpRight, Repeat, Target, CheckCircle2 } from 'lucide-react';

const QuickTransactionSheet = ({ isOpen, onClose, initialType = 'Expense' }) => {
  const [type, setType] = useState(initialType);
  const [amount, setAmount] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSave = () => {
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
      setAmount('');
    }, 1500);
  };

  const types = [
    { id: 'Income', icon: ArrowDownLeft, color: 'text-emerald-500 bg-emerald-500/10' },
    { id: 'Expense', icon: ArrowUpRight, color: 'text-red-500 bg-red-500/10' },
    { id: 'Transfer', icon: Repeat, color: 'text-blue-500 bg-blue-500/10' },
    { id: 'Goal', icon: Target, color: 'text-purple-500 bg-purple-500/10' }
  ];

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Quick Entry">
      {isSuccess ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mb-4">
            <CheckCircle2 size={40} className="text-emerald-500" />
          </div>
          <h3 className="text-2xl font-bold">Saved!</h3>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Type Selector */}
          <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar snap-x">
            {types.map(t => {
              const Icon = t.icon;
              const isActive = type === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setType(t.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl border snap-center whitespace-nowrap transition-all ${
                    isActive 
                      ? 'border-[var(--border)] bg-[var(--card)] shadow-md font-bold' 
                      : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <div className={`p-1 rounded-md ${t.color}`}><Icon size={16}/></div>
                  {t.id}
                </button>
              );
            })}
          </div>

          {/* Amount Input */}
          <div className="text-center py-4">
            <div className="text-5xl font-black flex items-center justify-center">
              <span className="opacity-50 text-3xl mr-2">₹</span>
              <input 
                type="number" 
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0" 
                className="bg-transparent border-none outline-none w-full max-w-[200px] text-center"
                autoFocus
              />
            </div>
          </div>

          {/* Smart Categories */}
          <div>
            <label className="text-sm font-bold opacity-60 uppercase mb-2 block">Category</label>
            <div className="grid grid-cols-3 gap-3">
              {['Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'More...'].map(cat => (
                <button key={cat} className="p-3 rounded-xl bg-black/5 dark:bg-white/5 border border-[var(--border)] text-sm font-medium hover:bg-[var(--card)] transition-colors">
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <button 
            onClick={handleSave}
            disabled={!amount}
            className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-500/30 disabled:opacity-50 disabled:shadow-none hover:bg-blue-700 transition-colors"
          >
            Save Transaction
          </button>
        </div>
      )}
    </BottomSheet>
  );
};

export default QuickTransactionSheet;
