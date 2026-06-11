import React, { useState } from 'react';
import { Moon, Sun, Bell, Database, Lock, Globe, Shield, Download, Trash2, Smartphone } from 'lucide-react';

export default function Settings() {
  const [notifications, setNotifications] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(false);
  const [currency, setCurrency] = useState('INR');
  const [language, setLanguage] = useState('English');

  const handleExport = () => {
    alert("Exporting your transaction history as CSV... (Coming soon)");
  };

  const handleClearData = () => {
    if (window.confirm("Are you sure you want to delete all your data? This action cannot be undone.")) {
      alert("Please contact support to completely wipe your account.");
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 text-transparent bg-clip-text">Settings</h1>
          <p className="text-[var(--foreground)] opacity-60 mt-1">Manage your account preferences and app configurations</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Sidebar Nav (Mock) */}
        <div className="lg:col-span-1 space-y-2">
          <div className="glass-panel p-2 rounded-2xl">
            <button className="w-full text-left px-4 py-3 rounded-xl bg-blue-500/10 text-blue-500 font-semibold flex items-center gap-3">
              <Globe size={18} /> General
            </button>
            <button className="w-full text-left px-4 py-3 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors flex items-center gap-3 opacity-80 hover:opacity-100">
              <Bell size={18} /> Notifications
            </button>
            <button className="w-full text-left px-4 py-3 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors flex items-center gap-3 opacity-80 hover:opacity-100">
              <Shield size={18} /> Security
            </button>
            <button className="w-full text-left px-4 py-3 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors flex items-center gap-3 opacity-80 hover:opacity-100">
              <Database size={18} /> Data Management
            </button>
          </div>
        </div>

        {/* Main Settings Area */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Preferences Card */}
          <div className="glass-panel rounded-3xl p-6">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><Globe size={20} className="text-blue-500"/> Regional Preferences</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2 opacity-80">Primary Currency</label>
                <select 
                  value={currency} 
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full bg-black/5 dark:bg-white/5 border border-[var(--border)] rounded-xl px-4 py-3 outline-none focus:border-blue-500 transition-colors appearance-none"
                >
                  <option value="INR" className="text-black dark:text-white bg-white dark:bg-slate-900">Indian Rupee (₹)</option>
                  <option value="QAR" className="text-black dark:text-white bg-white dark:bg-slate-900">Qatari Riyal (QAR)</option>
                  <option value="USD" className="text-black dark:text-white bg-white dark:bg-slate-900">US Dollar ($)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 opacity-80">Display Language</label>
                <select 
                  value={language} 
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full bg-black/5 dark:bg-white/5 border border-[var(--border)] rounded-xl px-4 py-3 outline-none focus:border-blue-500 transition-colors appearance-none"
                >
                  <option value="English" className="text-black dark:text-white bg-white dark:bg-slate-900">English (US)</option>
                  <option value="Hindi" className="text-black dark:text-white bg-white dark:bg-slate-900">Hindi</option>
                  <option value="Arabic" className="text-black dark:text-white bg-white dark:bg-slate-900">Arabic</option>
                </select>
              </div>
            </div>
          </div>

          {/* Notifications Card */}
          <div className="glass-panel rounded-3xl p-6">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><Bell size={20} className="text-purple-500"/> Notifications</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl border border-[var(--border)] bg-black/5 dark:bg-white/5">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500">
                    <Smartphone size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold">Push Notifications</h3>
                    <p className="text-xs opacity-70">Receive alerts for budget limits and reminders</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={notifications} onChange={() => setNotifications(!notifications)} />
                  <div className="w-11 h-6 bg-gray-300 dark:bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl border border-[var(--border)] bg-black/5 dark:bg-white/5">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-500">
                    <Bell size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold">Email Alerts</h3>
                    <p className="text-xs opacity-70">Receive weekly summaries and reports</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={emailAlerts} onChange={() => setEmailAlerts(!emailAlerts)} />
                  <div className="w-11 h-6 bg-gray-300 dark:bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Data & Privacy Card */}
          <div className="glass-panel rounded-3xl p-6">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><Database size={20} className="text-green-500"/> Data & Privacy</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button onClick={handleExport} className="flex flex-col items-center justify-center p-6 rounded-xl border border-[var(--border)] hover:bg-blue-500/10 hover:border-blue-500 transition-all group">
                <Download size={24} className="mb-2 opacity-70 group-hover:text-blue-500 group-hover:opacity-100 transition-colors" />
                <span className="font-semibold">Export Data</span>
                <span className="text-xs opacity-60 mt-1">Download as CSV</span>
              </button>

              <button onClick={handleClearData} className="flex flex-col items-center justify-center p-6 rounded-xl border border-[var(--border)] hover:bg-red-500/10 hover:border-red-500 transition-all group">
                <Trash2 size={24} className="mb-2 opacity-70 group-hover:text-red-500 group-hover:opacity-100 transition-colors" />
                <span className="font-semibold">Clear Account</span>
                <span className="text-xs opacity-60 mt-1">Delete all records</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
