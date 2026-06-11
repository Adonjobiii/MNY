import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, TrendingUp, Calendar, Target, Award } from 'lucide-react';
import LiquidProgress from './LiquidProgress';
import confetti from 'canvas-confetti';

const GoalCard = ({ goal }) => {
  const { name, targetAmount, savedAmount, currency = '₹', targetDate, color = 'blue' } = goal;
  const progress = Math.min((savedAmount / targetAmount) * 100, 100);
  const remaining = targetAmount - savedAmount;
  
  // Calculate ETA and required monthly rate simply for now
  const monthsRemaining = Math.max(1, (new Date(targetDate) - new Date()) / (1000 * 60 * 60 * 24 * 30));
  const monthlyRate = remaining > 0 ? (remaining / monthsRemaining) : 0;

  useEffect(() => {
    // Trigger confetti if goal is just completed (mock behavior for when progress hits 100 on load)
    if (progress >= 100 && !goal.confettiFired) {
      const end = Date.now() + 1.5 * 1000;
      const colors = ['#3b82f6', '#8b5cf6', '#10b981'];

      (function frame() {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: colors
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: colors
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      }());
    }
  }, [progress, goal.confettiFired]);

  const milestones = [10, 25, 50, 75, 90, 100];
  const nextMilestone = milestones.find(m => progress < m) || 100;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel p-6 rounded-3xl relative overflow-hidden group hover:shadow-2xl transition-all duration-500"
    >
      {/* Background Glow */}
      <div className={`absolute -right-20 -top-20 w-64 h-64 bg-${color}-500/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700`}></div>

      <div className="flex justify-between items-start mb-6 relative z-10">
        <div>
          <h3 className="text-2xl font-bold mb-1">{name}</h3>
          <div className="flex gap-4 opacity-70 text-sm">
            <span className="flex items-center gap-1"><Target size={14}/> {currency}{targetAmount.toLocaleString()} Target</span>
            <span className="flex items-center gap-1"><Calendar size={14}/> {new Date(targetDate).toLocaleDateString('en-IN', {day: 'numeric', month: 'short', year: 'numeric'})}</span>
          </div>
        </div>
        
        {/* Circular Progress Avatar */}
        <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
          <svg className="w-full h-full transform -rotate-90">
            <circle cx="32" cy="32" r="28" fill="none" className="stroke-[var(--border)] stroke-[4]" />
            <motion.circle 
              cx="32" cy="32" r="28" fill="none" 
              className={`stroke-${color}-500 stroke-[4] drop-shadow-lg`}
              strokeDasharray="175"
              initial={{ strokeDashoffset: 175 }}
              animate={{ strokeDashoffset: 175 - (175 * progress) / 100 }}
              transition={{ duration: 1.5, type: 'spring' }}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute font-bold text-sm">
            {progress >= 100 ? <Award className={`text-${color}-500`} size={24} /> : `${Math.floor(progress)}%`}
          </div>
        </div>
      </div>

      <div className="space-y-4 relative z-10">
        <div className="flex justify-between items-end">
          <div>
            <div className={`text-3xl font-extrabold text-${color}-500 tracking-tight`}>
              {currency}{savedAmount.toLocaleString()}
            </div>
            <div className="text-sm opacity-60 font-medium">Saved so far</div>
          </div>
          <div className="text-right">
            <div className="text-xl font-bold opacity-90 tracking-tight">
              {remaining > 0 ? `${currency}${remaining.toLocaleString()}` : '0'}
            </div>
            <div className="text-sm opacity-60 font-medium">Remaining</div>
          </div>
        </div>

        <LiquidProgress progress={progress} color={color} />

        {/* Milestone Timeline */}
        <div className="pt-4 flex justify-between items-center relative">
          <div className="absolute left-0 right-0 h-0.5 bg-[var(--border)] top-1/2 -translate-y-1/2 -z-10"></div>
          {milestones.map((m, i) => (
            <div key={m} className="flex flex-col items-center gap-2 bg-[var(--bg)] px-1">
              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center z-10 ${progress >= m ? `bg-${color}-500 border-${color}-500 shadow-lg shadow-${color}-500/40` : 'bg-[var(--card)] border-[var(--border)]'}`}>
                {progress >= m && <CheckCircle2 size={10} className="text-white" />}
              </div>
              <span className={`text-[10px] font-bold ${progress >= m ? `text-${color}-500` : 'opacity-40'}`}>{m}%</span>
            </div>
          ))}
        </div>
        
        <div className="mt-4 p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-[var(--border)] flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl bg-${color}-500/10 flex items-center justify-center`}>
              <TrendingUp className={`text-${color}-500`} size={20} />
            </div>
            <div>
              <div className="text-xs opacity-60 font-medium">Monthly Target Rate</div>
              <div className="font-bold text-sm">{currency}{Math.ceil(monthlyRate).toLocaleString()}/month</div>
            </div>
          </div>
          <div className="text-right text-xs opacity-70">
            Next: <span className={`font-bold text-${color}-500`}>{nextMilestone}% Milestone</span>
          </div>
        </div>

      </div>
    </motion.div>
  );
};

export default GoalCard;
