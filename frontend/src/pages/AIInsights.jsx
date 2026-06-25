import { useState, useEffect } from 'react';
import { Sparkles, TrendingDown, AlertCircle, ArrowRight, Zap, X, Check } from 'lucide-react';

export default function AIInsights() {
  const [insights, setInsights] = useState([]);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/insights`)
      .then(res => res.json())
      .then(data => setInsights(Array.isArray(data) ? data : []))
      .catch(err => console.error('Failed to load insights', err));
  }, []);

  const handleDismiss = (id) => {
    setInsights(insights.filter(i => i.id !== id));
  };

  const handleApply = (id) => {
    alert("Action applied successfully!");
    setInsights(insights.filter(i => i.id !== id));
  };

  return (
    <div className="p-6 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-purple-500/10 text-purple-500 rounded-2xl">
          <Sparkles size={32} />
        </div>
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-500 to-blue-500 text-transparent bg-clip-text">AI Financial Assistant</h1>
          <p className="opacity-60">Smart insights based on your spending patterns.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 glass-panel rounded-3xl p-8 border border-purple-500/20 shadow-[0_0_40px_rgba(168,85,247,0.1)] relative overflow-hidden flex flex-col justify-center">
          <div className="absolute -right-10 -top-10 opacity-5 pointer-events-none">
            <Sparkles size={200} />
          </div>
          <Zap size={32} className="text-yellow-500 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Weekly AI Summary</h2>
          <p className="text-sm opacity-80 mb-6 max-w-md">
            Your financial health score is looking great. However, I've detected a few areas where you could optimize your spending to reach your goals faster.
          </p>
          <div className="flex items-center gap-4 text-sm font-semibold">
            <div className="px-4 py-2 bg-green-500/10 text-green-500 rounded-xl">Cashflow: Healthy</div>
            <div className="px-4 py-2 bg-purple-500/10 text-purple-500 rounded-xl">{insights.length} Insights Found</div>
          </div>
        </div>

        <div className="glass-panel rounded-3xl p-6 flex flex-col justify-center items-center text-center">
          <div className="w-24 h-24 rounded-full border-4 border-purple-500/30 border-t-purple-500 animate-spin flex items-center justify-center mb-4">
            <div className="w-20 h-20 bg-[var(--card)] rounded-full flex items-center justify-center animate-none">
              <Sparkles size={24} className="text-purple-500" />
            </div>
          </div>
          <h3 className="font-bold mb-1">Analyzing...</h3>
          <p className="opacity-50 text-xs">Monitoring new transactions in real-time.</p>
        </div>
      </div>

      <h2 className="text-xl font-bold mb-4">Actionable Recommendations</h2>
      
      {insights.length === 0 ? (
        <div className="glass-panel rounded-3xl p-12 text-center opacity-50 flex flex-col items-center animate-in zoom-in-95 duration-300">
          <Check size={48} className="mb-4 text-green-500" />
          <p className="text-lg font-semibold">You're all caught up!</p>
          <p className="text-sm">Check back later for more smart insights.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {insights.map((insight) => (
            <div key={insight.id} className={`glass-panel rounded-2xl p-6 border ${insight.color} relative group overflow-hidden transition-all hover:shadow-xl hover:-translate-y-1 duration-300`}>
              <button 
                onClick={() => handleDismiss(insight.id)}
                className="absolute top-4 right-4 p-2 bg-black/5 dark:bg-white/5 rounded-full opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/10 dark:hover:bg-white/10 z-10"
              >
                <X size={16} />
              </button>
              
              <div className="flex gap-4">
                <div className="mt-1">
                  {insight.icon === 'AlertCircle' && <AlertCircle size={24} className="text-orange-500" />}
                  {insight.icon === 'TrendingDown' && <TrendingDown size={24} className="text-red-500" />}
                  {(!insight.icon || (insight.icon !== 'AlertCircle' && insight.icon !== 'TrendingDown')) && <Sparkles size={24} className="text-purple-500" />}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-2">{insight.title}</h3>
                  <p className="opacity-80 text-sm mb-4 leading-relaxed max-w-2xl">{insight.description}</p>
                  
                  <button 
                    onClick={() => handleApply(insight.id)}
                    className="flex items-center gap-2 text-sm font-bold bg-[var(--foreground)] text-[var(--background)] px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
                  >
                    {insight.action}
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
