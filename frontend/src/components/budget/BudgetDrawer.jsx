import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, TrendingUp, Calendar, AlertTriangle, ArrowRight, Settings2 } from 'lucide-react';

const BudgetDrawer = ({ category, isOpen, onClose }) => {
  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!category) return null;

  const { name, budget, spent } = category;
  const utilized = Math.round((spent / budget) * 100);
  const remaining = budget - spent;
  
  // Dummy forecast analytics
  const dailyAverage = Math.round(spent / new Date().getDate());
  const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
  const projectedSpend = Math.round(dailyAverage * daysInMonth);
  const variance = projectedSpend - budget;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />

          {/* Drawer Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%', transition: { type: 'tween', ease: 'easeInOut', duration: 0.3 } }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-md glass border-l border-[var(--border)] shadow-2xl z-[101] flex flex-col overflow-y-auto"
          >
            {/* Header */}
            <div className="p-6 border-b border-[var(--border)] flex justify-between items-center sticky top-0 bg-[var(--background)]/80 backdrop-blur-md z-10">
              <div>
                <h2 className="text-2xl font-bold">{name} Insights</h2>
                <p className="text-sm opacity-60">Category Deep Dive</p>
              </div>
              <button onClick={onClose} className="p-2 rounded-full hover:bg-[var(--card)] transition-colors">
                <X size={24} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 flex-1 space-y-8">
              
              {/* Top Overview */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-[var(--card)] border border-[var(--border)] text-center">
                  <div className="text-sm opacity-60 mb-1">Monthly Budget</div>
                  <div className="text-xl font-bold">₹{budget.toLocaleString()}</div>
                </div>
                <div className="p-4 rounded-2xl bg-[var(--card)] border border-[var(--border)] text-center">
                  <div className="text-sm opacity-60 mb-1">Actual Spend</div>
                  <div className="text-xl font-bold">₹{spent.toLocaleString()}</div>
                </div>
              </div>

              {/* Progress Detail */}
              <div>
                <div className="flex justify-between items-end mb-2">
                  <h3 className="font-bold flex items-center gap-2"><TrendingUp size={18} /> Utilization</h3>
                  <span className="font-bold text-blue-500">{utilized}%</span>
                </div>
                <div className="h-3 w-full bg-[var(--border)] rounded-full overflow-hidden mb-2">
                  <div className={`h-full ${utilized > 100 ? 'bg-red-500' : utilized > 75 ? 'bg-orange-500' : 'bg-emerald-500'}`} style={{ width: `${Math.min(utilized, 100)}%` }}></div>
                </div>
                <p className="text-sm opacity-70">
                  {remaining >= 0 ? `₹${remaining.toLocaleString()} left to spend this month.` : `Overspent by ₹${Math.abs(remaining).toLocaleString()}`}
                </p>
              </div>

              {/* Smart Forecast Engine */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/20">
                <h3 className="font-bold mb-4 flex items-center gap-2"><AlertTriangle size={18} className="text-purple-500"/> Smart Forecast</h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="opacity-70">Daily Average Spend</span>
                    <span className="font-bold">₹{dailyAverage.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="opacity-70">Projected Month-End</span>
                    <span className="font-bold">₹{projectedSpend.toLocaleString()}</span>
                  </div>
                  <div className="pt-3 border-t border-purple-500/20 flex justify-between text-sm">
                    <span className="opacity-70">Expected Variance</span>
                    <span className={`font-bold ${variance > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                      {variance > 0 ? '+' : ''}₹{variance.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Recent Transactions Mock */}
              <div>
                <h3 className="font-bold mb-4 flex items-center gap-2"><Calendar size={18} /> Recent Activity</h3>
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="flex justify-between items-center p-3 rounded-xl hover:bg-[var(--card)] transition-colors border border-transparent hover:border-[var(--border)]">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 font-bold">V{i}</div>
                        <div>
                          <div className="text-sm font-bold">Vendor Name {i}</div>
                          <div className="text-xs opacity-60">Today, 2:30 PM</div>
                        </div>
                      </div>
                      <div className="font-bold">-₹{Math.round(Math.random() * 500 + 100)}</div>
                    </div>
                  ))}
                  <button className="w-full text-center text-sm font-bold text-blue-500 py-2 hover:bg-blue-500/10 rounded-xl transition-colors flex items-center justify-center gap-2">
                    View All <ArrowRight size={16} />
                  </button>
                </div>
              </div>

            </div>

            {/* Footer Actions */}
            <div className="p-6 border-t border-[var(--border)] bg-[var(--background)] flex gap-4 sticky bottom-0 z-10">
              <button className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all">
                Adjust Budget
              </button>
              <button className="w-12 h-12 rounded-xl border border-[var(--border)] flex items-center justify-center hover:bg-[var(--card)] transition-colors">
                <Settings2 size={20} />
              </button>
            </div>

          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default BudgetDrawer;
