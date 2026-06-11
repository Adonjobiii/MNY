import React, { useState, useEffect } from 'react';
import { Target, TrendingUp, Plus, LayoutDashboard, Flame } from 'lucide-react';
import GoalCard from '../components/goals/GoalCard';
import AchievementCenter from '../components/goals/AchievementCenter';
import GoalForecaster from '../components/goals/GoalForecaster';

// Removed predefined mock goals
const mockGoals = [];

export default function Goals() {
  const [goals, setGoals] = useState([]);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/goals`)
      .then(res => res.json())
      .then(data => setGoals(Array.isArray(data) ? data : []))
      .catch(err => console.error('Failed to load goals', err));
  }, []);
  const totalTarget = goals.reduce((sum, g) => sum + (g.currency === '₹' ? g.targetAmount : g.targetAmount * 22.5), 0);
  const totalSaved = goals.reduce((sum, g) => sum + (g.currency === '₹' ? g.savedAmount : g.savedAmount * 22.5), 0);
  const completionRate = totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0;

  return (
    <div className="flex-1 overflow-y-auto min-h-screen bg-[var(--bg)] custom-scrollbar">
      <div className="p-6 lg:p-8 xl:p-10 max-w-[1600px] mx-auto pb-24">
        
        {/* Header Section */}
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-10 gap-6">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3 tracking-tight">
              <Target className="text-blue-500" size={36} />
              Goal Achievement Center
            </h1>
            <p className="opacity-60 text-lg">Turn your financial aspirations into reality.</p>
          </div>
          
          <button className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-6 py-3 rounded-2xl transition-all shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-0.5 shrink-0 font-bold text-lg">
            <Plus size={22} />
            <span>Create Goal</span>
          </button>
        </div>

        {/* Dashboard Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6 mb-10">
          <StatCard title="Total Goals" value={goals.length} icon={<LayoutDashboard size={24} className="text-blue-500" />} color="blue" />
          <StatCard title="Total Saved (Est. INR)" value={`₹${totalSaved.toLocaleString()}`} icon={<Target size={24} className="text-emerald-500" />} color="emerald" />
          <StatCard title="Overall Completion" value={`${completionRate}%`} icon={<TrendingUp size={24} className="text-purple-500" />} color="purple" />
          <StatCard title="Savings Streak" value="3 Months" icon={<Flame size={24} className="text-orange-500" />} color="orange" subtitle="🔥 Keep it up!" />
        </div>

        {/* Goals Grid */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            Active Missions
          </h2>
          {goals.length === 0 ? (
            <div className="p-12 text-center border border-dashed border-[var(--border)] rounded-3xl opacity-60">
              No active goals yet. Click "Create Goal" to start your journey!
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6">
              {goals.map(goal => (
                <GoalCard key={goal.id} goal={goal} />
              ))}
            </div>
          )}
        </div>

        {/* Achievement Center & Forecaster */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-2">
            <AchievementCenter />
          </div>
          <div className="xl:col-span-1">
            <GoalForecaster goals={goals} />
          </div>
        </div>

      </div>
    </div>
  );
}

const StatCard = ({ title, value, icon, color, subtitle }) => (
  <div className="glass-panel p-6 rounded-3xl relative overflow-hidden group">
    <div className={`absolute -right-6 -top-6 w-24 h-24 bg-${color}-500/10 rounded-full blur-2xl group-hover:bg-${color}-500/20 transition-all duration-500`}></div>
    <div className="flex items-center gap-4 mb-4">
      <div className={`w-12 h-12 rounded-2xl bg-${color}-500/10 flex items-center justify-center`}>
        {icon}
      </div>
      <h3 className="font-bold opacity-70 text-sm">{title}</h3>
    </div>
    <div className="text-3xl font-black tracking-tight">{value}</div>
    {subtitle && <div className={`text-sm font-bold mt-2 text-${color}-500`}>{subtitle}</div>}
  </div>
);
