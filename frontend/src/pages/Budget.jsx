import { useState, useEffect } from 'react';
import { Target, Sparkles, Calendar, LayoutGrid } from 'lucide-react';
import BudgetHealth from '../components/budget/BudgetHealth';
import BudgetBoard from '../components/budget/BudgetBoard';
import BudgetDrawer from '../components/budget/BudgetDrawer';

export default function Budget() {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [viewMode, setViewMode] = useState('board'); // 'board' or 'calendar'

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/budgets`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setCategories(data.map(d => ({ ...d, budget: d.limit_amount })));
        } else {
          setCategories([]);
        }
      })
      .catch(err => console.error('Failed to load budgets', err));
  }, []);

  const totalBudget = categories.reduce((sum, c) => sum + c.budget, 0);
  const totalSpent = categories.reduce((sum, c) => sum + c.spent, 0);

  return (
    <div className="flex-1 overflow-y-auto min-h-screen bg-[var(--bg)] custom-scrollbar">
      <div className="p-6 lg:p-8 xl:p-10 max-w-[1600px] mx-auto pb-24">
        
        {/* Header */}
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-8 gap-6">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3 tracking-tight">
              <Target className="text-blue-500" size={36} />
              Smart Budget Board
            </h1>
            <p className="opacity-60 text-lg">Financial mission control center.</p>
          </div>

          <div className="flex items-center gap-3 bg-black/5 dark:bg-white/5 p-1 rounded-xl border border-[var(--border)]">
            <button 
              onClick={() => setViewMode('board')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all ${viewMode === 'board' ? 'bg-[var(--text)] text-[var(--bg)] shadow-md' : 'opacity-60 hover:opacity-100'}`}
            >
              <LayoutGrid size={18} /> Board
            </button>
            <button 
              onClick={() => setViewMode('calendar')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all ${viewMode === 'calendar' ? 'bg-[var(--text)] text-[var(--bg)] shadow-md' : 'opacity-60 hover:opacity-100'}`}
            >
              <Calendar size={18} /> Calendar
            </button>
          </div>
        </div>

        {/* AI Insight Highlight */}
        {categories.length > 0 && (
          <div className="mb-8 p-4 rounded-2xl bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center shrink-0 border border-purple-500/30">
              <Sparkles className="text-purple-500" size={20} />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-purple-500 mb-1">Budget Insight</h4>
              <p className="text-sm md:text-base font-medium opacity-90 leading-relaxed">
                Add your budget limits to start receiving AI-powered spending insights and predictions.
              </p>
            </div>
          </div>
        )}

        {/* Budget Health Summary */}
        <BudgetHealth 
          categories={categories} 
          totalBudget={totalBudget} 
          totalSpent={totalSpent} 
        />

        {/* Main Board Area */}
        {viewMode === 'board' ? (
          <BudgetBoard 
            categories={categories} 
            onCardClick={(cat) => setSelectedCategory(cat)} 
          />
        ) : (
          <div className="p-12 text-center border-2 border-dashed border-[var(--border)] rounded-3xl opacity-60">
            <Calendar size={48} className="mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-bold mb-2">Calendar View Coming Soon</h3>
            <p>The daily spending activity calendar is under construction.</p>
          </div>
        )}

      </div>

      <BudgetDrawer 
        category={selectedCategory} 
        isOpen={!!selectedCategory} 
        onClose={() => setSelectedCategory(null)} 
      />
    </div>
  );
}
