import React from 'react';
import { motion } from 'framer-motion';
import { Plus, Eye, PauseCircle, Activity } from 'lucide-react';

const BudgetCard = ({ category, columnId, onClick }) => {
  const { name, budget, spent } = category;
  const remaining = budget - spent;
  const utilized = Math.round((spent / budget) * 100);

  // Column specific formatting
  let config = {
    color: 'emerald',
    badgeText: 'SAFE',
    content: (
      <div className="flex justify-between items-end mt-4">
        <div>
          <div className="text-xs opacity-60 mb-1">Remaining</div>
          <div className="font-bold text-lg">₹{remaining.toLocaleString()}</div>
        </div>
        <div className="w-16 h-8 bg-emerald-500/10 rounded-lg flex items-center justify-center border border-emerald-500/20">
          <Activity size={16} className="text-emerald-500" />
        </div>
      </div>
    )
  };

  if (columnId === 'watch') {
    const forecastedSpend = spent * 1.4; // Mock forecast
    config = {
      color: 'amber',
      badgeText: 'WATCH',
      content: (
        <div className="mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
          <div className="text-xs opacity-80 mb-1 font-medium text-amber-500">Forecasted Month-End</div>
          <div className="font-bold">₹{Math.round(forecastedSpend).toLocaleString()}</div>
        </div>
      )
    };
  } else if (columnId === 'warning') {
    const forecastedOverspend = (spent * 1.2) - budget; // Mock forecast
    config = {
      color: 'orange',
      badgeText: 'WARNING',
      content: (
        <div className="mt-4 p-3 rounded-xl bg-orange-500/10 border border-orange-500/20">
          <div className="text-xs opacity-80 mb-1 font-medium text-orange-500">Projected Overspend</div>
          <div className="font-bold">₹{Math.max(0, Math.round(forecastedOverspend)).toLocaleString()}</div>
        </div>
      )
    };
  } else if (columnId === 'critical') {
    const exceeded = spent - budget;
    const weeklyReduction = exceeded / 4; // Mock recovery
    config = {
      color: 'red',
      badgeText: 'CRITICAL',
      content: (
        <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
          <div className="text-xs opacity-80 mb-1 font-medium text-red-500">Exceeded By</div>
          <div className="font-bold text-red-500">₹{exceeded.toLocaleString()}</div>
          <div className="text-[10px] mt-1 opacity-80">Reduce weekly spending by ₹{Math.round(weeklyReduction).toLocaleString()} to recover.</div>
        </div>
      )
    };
  }

  return (
    <motion.div
      layout
      layoutId={name}
      onClick={() => onClick(category)}
      whileHover={{ y: -4, scale: 1.02 }}
      className={`glass-panel p-4 rounded-2xl border-l-4 border-l-${config.color}-500 cursor-pointer shadow-sm hover:shadow-xl transition-shadow bg-black/5 dark:bg-white/5 relative group overflow-hidden`}
    >
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-bold">{name}</h4>
        <span className={`text-[10px] font-bold px-2 py-1 rounded bg-${config.color}-500/10 text-${config.color}-500`}>
          {utilized}%
        </span>
      </div>

      <div className="flex justify-between items-end mb-2">
        <div>
          <div className="text-xs opacity-60">Budget</div>
          <div className="font-medium">₹{budget.toLocaleString()}</div>
        </div>
        <div className="text-right">
          <div className="text-xs opacity-60">Spent</div>
          <div className="font-medium">₹{spent.toLocaleString()}</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-1.5 w-full bg-[var(--border)] rounded-full overflow-hidden my-3">
        <motion.div 
          className={`h-full bg-${config.color}-500`}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(utilized, 100)}%` }}
          transition={{ duration: 1 }}
        />
      </div>

      {config.content}

      {/* Quick Actions Hover State */}
      <div className="absolute inset-0 bg-[var(--card)]/90 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
        <button className="p-2 rounded-xl bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white transition-colors" title="View Details">
          <Eye size={18} />
        </button>
        <button className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-colors" title="Add Expense">
          <Plus size={18} />
        </button>
        <button className="p-2 rounded-xl bg-orange-500/10 text-orange-500 hover:bg-orange-500 hover:text-white transition-colors" title="Pause Category">
          <PauseCircle size={18} />
        </button>
      </div>
    </motion.div>
  );
};

export default BudgetCard;
