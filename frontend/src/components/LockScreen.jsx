import React, { useState, useEffect } from 'react';
import { Lock, ArrowRight, AlertCircle, ShieldCheck } from 'lucide-react';

export default function LockScreen({ onUnlock }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleVerify = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });

      const data = await res.json();
      
      if (data.success) {
        localStorage.setItem('APP_PASSWORD', password);
        onUnlock(password);
      } else {
        setError('Incorrect Master Password');
      }
    } catch (err) {
      setError('Could not connect to server to verify password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[var(--background)] flex items-center justify-center z-[9999] p-4">
      <div className="glass-panel p-8 md:p-12 rounded-3xl max-w-md w-full text-center shadow-2xl shadow-blue-500/10 border border-[var(--border)] animate-in fade-in zoom-in duration-500">
        <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShieldCheck size={40} className="text-blue-500" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Vault Locked</h1>
        <p className="opacity-60 mb-8">Enter your Master Password to access your finances.</p>

        <form onSubmit={handleVerify} className="space-y-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Lock size={18} className="opacity-40" />
            </div>
            <input 
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Master Password"
              className="w-full bg-black/5 dark:bg-white/5 border border-[var(--border)] rounded-2xl py-4 pl-12 pr-4 outline-none focus:ring-2 ring-blue-500 transition-all font-medium"
              autoFocus
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-500 text-sm justify-center font-medium p-3 bg-red-500/10 rounded-xl">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <button 
            type="submit" 
            disabled={!password || isLoading}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:transform-none disabled:shadow-none"
          >
            {isLoading ? 'Verifying...' : 'Unlock Vault'}
            {!isLoading && <ArrowRight size={18} />}
          </button>
        </form>
      </div>
    </div>
  );
}
