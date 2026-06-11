import React from 'react';
import { motion } from 'framer-motion';
import { useNotifications } from '../../context/NotificationContext';
import { 
  Bell, AlertTriangle, Target, TrendingUp, Briefcase, ArrowRightLeft, 
  FileText, Sparkles, AlertCircle, Calendar, Trash2, Archive, CheckCircle2 
} from 'lucide-react';

const NotificationCard = ({ notification }) => {
  const { markAsRead, markAsUnread, archive, deleteNotification } = useNotifications();
  const { id, type, priority, title, description, timestamp, isRead, actionText } = notification;

  // Visual mapping
  const config = {
    critical: { color: 'red', border: 'border-red-500/50', bg: 'bg-red-500/10' },
    high: { color: 'orange', border: 'border-orange-500/50', bg: 'bg-orange-500/10' },
    medium: { color: 'blue', border: 'border-blue-500/50', bg: 'bg-blue-500/10' },
    low: { color: 'slate', border: 'border-[var(--border)]', bg: 'bg-black/5 dark:bg-white/5' }
  };

  const icons = {
    budget: <AlertTriangle size={20} />,
    transaction: <ArrowRightLeft size={20} />,
    goal: <Target size={20} />,
    insight: <TrendingUp size={20} />,
    investment: <Briefcase size={20} />,
    transfer: <ArrowRightLeft size={20} />,
    due: <Calendar size={20} />,
    report: <FileText size={20} />,
    system: <AlertCircle size={20} />,
    ai: <Sparkles size={20} />
  };

  const { color, border, bg } = config[priority] || config.low;
  const icon = icons[type] || <Bell size={20} />;

  // Calculate time ago
  const getTimeAgo = (dateString) => {
    const seconds = Math.floor((new Date() - new Date(dateString)) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days === 1) return 'Yesterday';
    return `${days}d ago`;
  };

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
      whileHover={{ y: -2 }}
      className={`relative overflow-hidden rounded-2xl glass-panel transition-all duration-300 ${!isRead ? `border-l-4 border-l-${color}-500 shadow-lg shadow-${color}-500/10` : 'border border-[var(--border)] opacity-80'}`}
    >
      <div className="p-5 flex gap-4">
        {/* Icon */}
        <div className={`w-12 h-12 shrink-0 rounded-full flex items-center justify-center ${bg} text-${color}-500`}>
          {icon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start gap-4 mb-1">
            <h4 className={`font-bold text-base ${!isRead ? 'text-[var(--text)]' : 'opacity-80'}`}>
              {title}
            </h4>
            <span className="text-xs font-medium opacity-50 shrink-0 whitespace-nowrap">
              {getTimeAgo(timestamp)}
            </span>
          </div>
          <p className="text-sm opacity-70 leading-relaxed mb-3 whitespace-pre-line">
            {description}
          </p>
          
          <div className="flex flex-wrap items-center gap-3">
            {actionText && (
              <button className={`text-xs font-bold text-${color}-500 bg-${color}-500/10 hover:bg-${color}-500/20 px-3 py-1.5 rounded-lg transition-colors`}>
                {actionText}
              </button>
            )}
            
            <div className="flex-1"></div>
            
            {/* Quick Actions */}
            <div className="flex items-center gap-1 opacity-0 hover:opacity-100 focus-within:opacity-100 transition-opacity absolute right-4 bottom-4 bg-[var(--card)] p-1 rounded-xl border border-[var(--border)] shadow-lg">
              <button 
                onClick={() => isRead ? markAsUnread(id) : markAsRead(id)}
                className="p-2 hover:bg-[var(--bg)] rounded-lg text-[var(--text)] opacity-60 hover:opacity-100 transition-all"
                title={isRead ? "Mark as unread" : "Mark as read"}
              >
                <CheckCircle2 size={16} className={isRead ? '' : `text-${color}-500`} />
              </button>
              <button 
                onClick={() => archive(id)}
                className="p-2 hover:bg-[var(--bg)] rounded-lg text-[var(--text)] opacity-60 hover:opacity-100 transition-all"
                title="Archive"
              >
                <Archive size={16} />
              </button>
              <button 
                onClick={() => deleteNotification(id)}
                className="p-2 hover:bg-red-500/10 hover:text-red-500 rounded-lg text-[var(--text)] opacity-60 transition-all"
                title="Delete"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {!isRead && (
        <div className={`absolute top-5 right-5 w-2 h-2 rounded-full bg-${color}-500`}></div>
      )}
    </motion.div>
  );
};

export default NotificationCard;
