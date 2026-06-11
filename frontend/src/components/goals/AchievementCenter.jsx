import React from 'react';
import { motion } from 'framer-motion';
import { Award, Star, Zap, Flame, Trophy, Crown } from 'lucide-react';

const achievementsData = [
  { id: 1, title: 'First Steps', desc: 'Created your first goal', icon: <Star />, color: 'blue', unlocked: true, date: '12 Jan 2026' },
  { id: 2, title: 'Quarter Saver', desc: 'Reached 25% on any goal', icon: <Zap />, color: 'purple', unlocked: true, date: '15 Feb 2026' },
  { id: 3, title: 'Halfway Hero', desc: 'Reached 50% on any goal', icon: <Award />, color: 'emerald', unlocked: true, date: '10 Apr 2026' },
  { id: 4, title: 'Financial Warrior', desc: 'Reached 75% on any goal', icon: <Trophy />, color: 'amber', unlocked: false },
  { id: 5, title: 'Goal Achieved', desc: 'Completed 100% of a goal', icon: <Crown />, color: 'rose', unlocked: false },
  { id: 6, title: '3 Month Streak', desc: 'Saved for 3 consecutive months', icon: <Flame />, color: 'orange', unlocked: true, date: '01 May 2026' },
];

const AchievementCenter = () => {
  return (
    <div className="glass-panel rounded-3xl p-6 lg:p-8">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-2xl font-bold mb-2 flex items-center gap-3">
            <Trophy className="text-amber-500" />
            Achievement Center
          </h2>
          <p className="opacity-60">Unlock badges as you hit your savings milestones.</p>
        </div>
        <div className="text-right hidden sm:block">
          <div className="text-3xl font-black text-amber-500">{achievementsData.filter(a => a.unlocked).length} <span className="text-lg opacity-50 font-medium">/ {achievementsData.length}</span></div>
          <div className="text-sm font-bold opacity-70 tracking-widest uppercase mt-1">Badges Unlocked</div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {achievementsData.map((badge, idx) => (
          <motion.div
            key={badge.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
            className={`relative p-4 rounded-2xl flex flex-col items-center text-center gap-3 transition-all duration-300 ${badge.unlocked ? `bg-gradient-to-br from-${badge.color}-500/10 to-${badge.color}-600/5 border border-${badge.color}-500/30 hover:shadow-lg hover:shadow-${badge.color}-500/20 hover:-translate-y-1` : 'bg-black/5 dark:bg-white/5 border border-[var(--border)] opacity-60 grayscale'}`}
          >
            {/* Hexagon Shape Mockup */}
            <div className={`w-16 h-16 flex items-center justify-center rounded-xl rotate-45 ${badge.unlocked ? `bg-gradient-to-br from-${badge.color}-400 to-${badge.color}-600 shadow-inner shadow-white/20` : 'bg-[var(--border)]'}`}>
              <div className="-rotate-45 text-white">
                {badge.icon}
              </div>
            </div>
            
            <div className="mt-2">
              <h4 className="font-bold text-sm leading-tight mb-1">{badge.title}</h4>
              <p className="text-[10px] opacity-70 leading-tight">{badge.desc}</p>
            </div>

            {badge.unlocked && (
              <div className={`absolute top-2 right-2 text-[8px] font-bold px-1.5 py-0.5 rounded bg-${badge.color}-500/20 text-${badge.color}-600 dark:text-${badge.color}-400`}>
                {badge.date}
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default AchievementCenter;
