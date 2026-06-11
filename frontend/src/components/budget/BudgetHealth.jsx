import React from 'react';
import { Target, AlertTriangle, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const BudgetHealth = ({ categories, totalBudget, totalSpent }) => {
  const overspentCount = categories.filter(c => c.spent > c.budget).length;
  const safeCount = categories.filter(c => (c.spent / c.budget) <= 0.5).length;
  
  // Calculate a 0-100 score based on utilization and overspending penalties
  const baseUtilization = Math.min((totalSpent / totalBudget) * 100, 100);
  let score = 100 - baseUtilization;
  
  // Penalty for overspent categories
  score -= (overspentCount * 10);
  
  // Bonus for very safe categories
  score += (safeCount * 2);
  
  score = Math.max(0, Math.min(Math.round(score), 100));

  let statusColor = 'blue';
  let StatusIcon = Target;
  let statusText = 'Excellent';
  
  if (score < 40) {
    statusColor = 'red';
    StatusIcon = AlertCircle;
    statusText = 'Critical';
  } else if (score < 70) {
    statusColor = 'orange';
    StatusIcon = AlertTriangle;
    statusText = 'Needs Attention';
  } else if (score < 90) {
    statusColor = 'blue';
    StatusIcon = CheckCircle2;
    statusText = 'Good';
  } else {
    statusColor = 'emerald';
    StatusIcon = CheckCircle2;
    statusText = 'Excellent';
  }

  const remaining = totalBudget - totalSpent;

  return (
    <div className="glass-panel rounded-3xl p-6 lg:p-8 relative overflow-hidden mb-8 flex flex-col md:flex-row items-center justify-between gap-8">
      {/* Background Glow */}
      <div className={`absolute -right-20 -top-20 w-64 h-64 bg-${statusColor}-500/10 rounded-full blur-3xl`}></div>
      <div className={`absolute -left-20 -bottom-20 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl`}></div>

      {/* Health Score Circle */}
      <div className="flex items-center gap-6 relative z-10 shrink-0">
        <div className="relative w-32 h-32 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90">
            <circle cx="64" cy="64" r="56" fill="none" className="stroke-[var(--border)] stroke-[8]" />
            <motion.circle 
              cx="64" cy="64" r="56" fill="none" 
              className={`stroke-${statusColor}-500 stroke-[8] drop-shadow-lg`}
              strokeDasharray="351.85" // 2 * PI * 56
              initial={{ strokeDashoffset: 351.85 }}
              animate={{ strokeDashoffset: 351.85 - (351.85 * score) / 100 }}
              transition={{ duration: 1.5, type: 'spring' }}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-4xl font-black text-${statusColor}-500 tracking-tighter`}>{score}</span>
            <span className="text-[10px] font-bold opacity-50 uppercase tracking-widest">Health</span>
          </div>
        </div>
        
        <div>
          <h2 className="text-2xl font-bold mb-1 flex items-center gap-2">
            Budget Health
            <StatusIcon size={20} className={`text-${statusColor}-500`} />
          </h2>
          <p className={`font-medium text-${statusColor}-500`}>{statusText}</p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4 w-full relative z-10">
        <div className="p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-[var(--border)]">
          <div className="text-xs font-bold opacity-60 uppercase mb-1">Total Budget</div>
          <div className="text-xl font-bold">₹{totalBudget.toLocaleString()}</div>
        </div>
        <div className="p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-[var(--border)]">
          <div className="text-xs font-bold opacity-60 uppercase mb-1">Total Spent</div>
          <div className="text-xl font-bold">₹{totalSpent.toLocaleString()}</div>
        </div>
        <div className="p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-[var(--border)]">
          <div className="text-xs font-bold opacity-60 uppercase mb-1">Remaining</div>
          <div className={`text-xl font-bold ${remaining < 0 ? 'text-red-500' : 'text-emerald-500'}`}>
            ₹{remaining.toLocaleString()}
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-[var(--border)]">
          <div className="text-xs font-bold opacity-60 uppercase mb-1">At Risk</div>
          <div className={`text-xl font-bold ${overspentCount > 0 ? 'text-red-500' : ''}`}>
            {overspentCount} Categories
          </div>
        </div>
      </div>
    </div>
  );
};

export default BudgetHealth;
