import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, AlertTriangle, ArrowRightLeft, Target, TrendingUp, Sparkles } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useNotifications } from '../../context/NotificationContext';

export default function NotificationBell() {
  const { notifications, markAsRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const unreadCount = notifications.filter(n => !n.isRead && !n.isArchived).length;
  const recentNotifications = notifications.filter(n => !n.isArchived).slice(0, 5); // top 5

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNotificationClick = (id) => {
    markAsRead(id);
    setIsOpen(false);
    navigate('/notifications');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 md:w-12 md:h-12 rounded-full glass flex items-center justify-center hover:bg-[var(--card)] transition-colors relative"
      >
        <Bell size={20} className="text-[var(--text)] opacity-70" />
        
        {unreadCount > 0 && (
          <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-blue-500 rounded-full border border-[var(--bg)] shadow-[0_0_8px_rgba(59,130,246,0.8)]">
            <span className="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-75"></span>
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 top-full mt-2 w-80 sm:w-96 glass-panel rounded-2xl shadow-2xl border border-[var(--border)] overflow-hidden z-50"
          >
            <div className="p-4 border-b border-[var(--border)] flex justify-between items-center bg-black/5 dark:bg-white/5">
              <h3 className="font-bold">Notifications</h3>
              {unreadCount > 0 && (
                <span className="text-xs font-bold bg-blue-500/10 text-blue-500 px-2 py-1 rounded-lg">
                  {unreadCount} New
                </span>
              )}
            </div>

            <div className="max-h-[60vh] overflow-y-auto custom-scrollbar">
              {recentNotifications.length === 0 ? (
                <div className="p-8 text-center opacity-50">
                  <Bell size={32} className="mx-auto mb-2 opacity-50" />
                  <p className="text-sm">You're all caught up!</p>
                </div>
              ) : (
                <div className="flex flex-col">
                  {recentNotifications.map((notif) => (
                    <button 
                      key={notif.id}
                      onClick={() => handleNotificationClick(notif.id)}
                      className={`p-4 flex gap-3 text-left hover:bg-[var(--card)] transition-colors border-b border-[var(--border)] last:border-0 ${!notif.isRead ? 'bg-blue-500/5' : ''}`}
                    >
                      <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${!notif.isRead ? 'bg-blue-500' : 'bg-transparent'}`}></div>
                      <div>
                        <h4 className={`text-sm font-bold leading-tight ${!notif.isRead ? '' : 'opacity-80'}`}>{notif.title}</h4>
                        <p className="text-xs opacity-60 mt-1 line-clamp-2">{notif.description}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="p-3 border-t border-[var(--border)] bg-black/5 dark:bg-white/5">
              <Link 
                to="/notifications" 
                onClick={() => setIsOpen(false)}
                className="block w-full text-center text-sm font-bold text-blue-500 hover:text-blue-600 transition-colors py-2"
              >
                View All Notifications
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
