import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, CheckCircle2, Archive, Trash2, Filter } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';
import NotificationCard from '../components/notifications/NotificationCard';

export default function NotificationsPage() {
  const { notifications, markAllAsRead, archiveAll } = useNotifications();
  const [filter, setFilter] = useState('all'); // all, unread, budget, goal, etc.

  const activeNotifications = notifications.filter(n => !n.isArchived);
  
  const filteredNotifications = activeNotifications.filter(n => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !n.isRead;
    return n.type === filter;
  });

  const unreadCount = activeNotifications.filter(n => !n.isRead).length;
  const budgetCount = activeNotifications.filter(n => n.type === 'budget').length;
  const goalCount = activeNotifications.filter(n => n.type === 'goal').length;
  const todayCount = activeNotifications.filter(n => {
    const today = new Date();
    const notifDate = new Date(n.timestamp);
    return notifDate.getDate() === today.getDate() && notifDate.getMonth() === today.getMonth();
  }).length;

  return (
    <div className="flex-1 overflow-y-auto min-h-screen bg-[var(--bg)] custom-scrollbar">
      <div className="p-6 lg:p-8 xl:p-10 max-w-[1200px] mx-auto pb-24">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3 tracking-tight">
              <Bell className="text-blue-500" size={36} />
              Notification Center
              {unreadCount > 0 && (
                <span className="text-sm font-bold bg-blue-500 text-white px-3 py-1 rounded-full shadow-lg shadow-blue-500/30">
                  {unreadCount} New
                </span>
              )}
            </h1>
            <p className="opacity-60 text-lg">Your financial command inbox.</p>
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            <button 
              onClick={markAllAsRead}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 px-4 py-2.5 rounded-xl transition-all border border-[var(--border)] font-semibold text-sm"
            >
              <CheckCircle2 size={18} />
              Mark All Read
            </button>
            <button 
              onClick={archiveAll}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 px-4 py-2.5 rounded-xl transition-all border border-[var(--border)] font-semibold text-sm text-red-500"
            >
              <Archive size={18} />
              Archive All
            </button>
          </div>
        </div>

        {/* Quick Statistics Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatBox label="Total Alerts" value={activeNotifications.length} />
          <StatBox label="Unread" value={unreadCount} color="blue" />
          <StatBox label="Alerts Today" value={todayCount} color="emerald" />
          <StatBox label="Budget Warnings" value={budgetCount} color="red" />
        </div>

        {/* Smart Filtering */}
        <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2 custom-scrollbar-x hide-scrollbar min-w-0">
          <Filter size={20} className="opacity-50 mr-2 shrink-0" />
          {['all', 'unread', 'budget', 'goal', 'ai', 'transfer', 'investment', 'report'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-bold capitalize whitespace-nowrap transition-all border shrink-0 ${
                filter === f 
                  ? 'bg-[var(--text)] text-[var(--bg)] border-[var(--text)]' 
                  : 'bg-black/5 dark:bg-white/5 border-[var(--border)] opacity-70 hover:opacity-100'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Notification List */}
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {filteredNotifications.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="p-12 text-center border border-dashed border-[var(--border)] rounded-3xl opacity-60 flex flex-col items-center justify-center gap-4"
              >
                <Bell size={48} className="opacity-20" />
                <p className="text-lg">No notifications found.</p>
              </motion.div>
            ) : (
              filteredNotifications.map(notif => (
                <NotificationCard key={notif.id} notification={notif} />
              ))
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}

const StatBox = ({ label, value, color = 'slate' }) => (
  <div className="glass-panel p-5 rounded-2xl border border-[var(--border)] relative overflow-hidden">
    <div className={`absolute -right-4 -top-4 w-16 h-16 bg-${color}-500/10 rounded-full blur-xl`}></div>
    <div className="text-sm font-bold opacity-60 mb-1">{label}</div>
    <div className={`text-3xl font-black text-${color}-500 tracking-tight`}>{value}</div>
  </div>
);
