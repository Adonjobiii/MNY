import React from 'react';
import BudgetCard from './BudgetCard';
import { ShieldCheck, Eye, AlertTriangle, XOctagon } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';

const ColumnHeader = ({ title, icon, count, color }) => (
  <div className="flex justify-between items-center mb-4 p-3 rounded-xl bg-black/5 dark:bg-white/5 border border-[var(--border)]">
    <div className="flex items-center gap-2">
      <div className={`text-${color}-500`}>{icon}</div>
      <h3 className="font-bold text-sm tracking-widest uppercase opacity-80">{title}</h3>
    </div>
    <span className={`bg-${color}-500 text-white text-xs font-bold px-2 py-1 rounded-lg shadow-sm shadow-${color}-500/30`}>
      {count}
    </span>
  </div>
);

const BudgetBoard = ({ categories, onCardClick }) => {
  // Sort into columns based on utilization
  const safe = [];
  const watch = [];
  const warning = [];
  const critical = [];

  categories.forEach(cat => {
    const util = cat.spent / cat.budget;
    if (util > 1) {
      critical.push(cat);
    } else if (util >= 0.75) {
      warning.push(cat);
    } else if (util >= 0.5) {
      watch.push(cat);
    } else {
      safe.push(cat);
    }
  });

  return (
    <div className="flex gap-6 overflow-x-auto pb-8 custom-scrollbar min-h-[500px] snap-x">
      {/* SAFE COLUMN */}
      <div className="flex-none w-[320px] snap-start">
        <ColumnHeader title="Safe" icon={<ShieldCheck size={18} />} count={safe.length} color="emerald" />
        <div className="space-y-4">
          <AnimatePresence>
            {safe.map(cat => (
              <BudgetCard key={cat.id || cat.name} category={cat} columnId="safe" onClick={onCardClick} />
            ))}
          </AnimatePresence>
          {safe.length === 0 && <EmptyState message="No categories in safe zone." />}
        </div>
      </div>

      {/* WATCH COLUMN */}
      <div className="flex-none w-[320px] snap-start">
        <ColumnHeader title="Watch" icon={<Eye size={18} />} count={watch.length} color="amber" />
        <div className="space-y-4">
          <AnimatePresence>
            {watch.map(cat => (
              <BudgetCard key={cat.id || cat.name} category={cat} columnId="watch" onClick={onCardClick} />
            ))}
          </AnimatePresence>
          {watch.length === 0 && <EmptyState message="No categories to watch." />}
        </div>
      </div>

      {/* WARNING COLUMN */}
      <div className="flex-none w-[320px] snap-start">
        <ColumnHeader title="Warning" icon={<AlertTriangle size={18} />} count={warning.length} color="orange" />
        <div className="space-y-4">
          <AnimatePresence>
            {warning.map(cat => (
              <BudgetCard key={cat.id || cat.name} category={cat} columnId="warning" onClick={onCardClick} />
            ))}
          </AnimatePresence>
          {warning.length === 0 && <EmptyState message="No warnings." />}
        </div>
      </div>

      {/* CRITICAL COLUMN */}
      <div className="flex-none w-[320px] snap-start">
        <ColumnHeader title="Critical" icon={<XOctagon size={18} />} count={critical.length} color="red" />
        <div className="space-y-4">
          <AnimatePresence>
            {critical.map(cat => (
              <BudgetCard key={cat.id || cat.name} category={cat} columnId="critical" onClick={onCardClick} />
            ))}
          </AnimatePresence>
          {critical.length === 0 && <EmptyState message="No critical overspending." />}
        </div>
      </div>
    </div>
  );
};

const EmptyState = ({ message }) => (
  <div className="p-8 text-center border-2 border-dashed border-[var(--border)] rounded-2xl opacity-40 text-sm font-medium">
    {message}
  </div>
);

export default BudgetBoard;
