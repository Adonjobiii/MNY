import React from 'react';
import { motion } from 'framer-motion';
import { BrainCircuit, Lightbulb, Clock, TrendingDown } from 'lucide-react';

const GoalForecaster = ({ goals }) => {
  // Aggregate data for insights
  const totalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0);
  const totalSaved = goals.reduce((sum, g) => sum + g.savedAmount, 0);
  const totalRemaining = totalTarget - totalSaved;

  // Mock AI insights based on the user's prompt
  const insights = [
    { id: 1, type: 'positive', text: 'You are ahead of schedule by ₹8,500 across all goals.', icon: <TrendingDown className="text-emerald-500" /> },
    { id: 2, type: 'acceleration', text: 'You can reach the MacBook Pro goal 18 days earlier if current savings continue.', icon: <Clock className="text-blue-500" /> },
    { id: 3, type: 'observation', text: 'Entertainment expenses reduced this month helped accelerate the Vacation Fund.', icon: <Lightbulb className="text-amber-500" /> },
    { id: 4, type: 'suggestion', text: 'Saving an additional ₹2,000 monthly would reduce completion time by 27 days.', icon: <BrainCircuit className="text-purple-500" /> }
  ];

  return (
    <div className="glass-panel rounded-3xl p-6 lg:p-8 relative overflow-hidden">
      {/* Decorative AI Glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl"></div>
      
      <div className="flex items-center gap-3 mb-6 relative z-10">
        <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center border border-purple-500/30">
          <BrainCircuit className="text-purple-500" size={20} />
        </div>
        <div>
          <h2 className="text-xl font-bold">Smart Goal Insights</h2>
          <p className="text-sm opacity-60">AI-powered forecasting and suggestions</p>
        </div>
      </div>

      <div className="space-y-4 relative z-10">
        {insights.map((insight, idx) => (
          <motion.div 
            key={insight.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.15 }}
            className="flex gap-4 p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-[var(--border)] items-start hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
          >
            <div className="mt-0.5 shrink-0">
              {insight.icon}
            </div>
            <p className="text-sm font-medium leading-relaxed opacity-90">
              {insight.text}
            </p>
          </motion.div>
        ))}
      </div>
      
      {/* Simple Forecaster Summary */}
      <div className="mt-6 pt-6 border-t border-[var(--border)] relative z-10">
        <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-2xl p-5">
          <h4 className="font-bold text-sm mb-2 opacity-80 uppercase tracking-wider">Overall Forecast</h4>
          <p className="text-sm leading-relaxed">
            At your current saving rate, you will achieve all active goals in approximately <span className="font-bold text-blue-500">8.4 months</span>. To complete everything one month earlier, increase total monthly contributions by <span className="font-bold text-purple-500">₹4,500</span>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default GoalForecaster;
