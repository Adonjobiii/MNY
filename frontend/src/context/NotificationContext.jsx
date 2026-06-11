import React, { createContext, useContext, useState, useEffect } from 'react';

const NotificationContext = createContext();

export const useNotifications = () => useContext(NotificationContext);

const MOCK_NOTIFICATIONS = [
  {
    id: 1,
    type: 'budget',
    priority: 'critical',
    title: 'Budget Alert',
    description: 'Food budget exceeded by ₹2,450.',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    isRead: false,
    isArchived: false,
    actionText: 'View Budget'
  },
  {
    id: 2,
    type: 'goal',
    priority: 'high',
    title: 'Goal Milestone Achieved',
    description: 'Emergency Fund has reached 50% completion.',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    isRead: false,
    isArchived: false,
    actionText: 'View Goal'
  },
  {
    id: 3,
    type: 'transfer',
    priority: 'medium',
    title: 'Transfer Completed',
    description: 'QAR 500 transferred from Qatar Bank to ICICI Bank.',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    isRead: true,
    isArchived: false,
  },
  {
    id: 4,
    type: 'investment',
    priority: 'high',
    title: 'Investment Update',
    description: 'Portfolio value increased by ₹3,850.',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    isRead: true,
    isArchived: false,
  },
  {
    id: 5,
    type: 'ai',
    priority: 'medium',
    title: 'AI Insight',
    description: 'You spent ₹4,200 less this month compared to last month.',
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    isRead: true,
    isArchived: false,
  },
  {
    id: 6,
    type: 'report',
    priority: 'low',
    title: 'Monthly Financial Summary',
    description: 'June 2026\nIncome: ₹45,000\nExpenses: ₹28,500\nSavings: ₹16,500',
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    isRead: true,
    isArchived: false,
    actionText: 'View Full Report'
  }
];

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);

  const addNotification = (notif) => {
    setNotifications(prev => [{
      id: Date.now(),
      timestamp: new Date().toISOString(),
      isRead: false,
      isArchived: false,
      ...notif
    }, ...prev]);
  };

  // Mock Socket.io connection logic
  useEffect(() => {
    const timer = setTimeout(() => {
      // Simulate an incoming notification after 10 seconds
      addNotification({
        type: 'ai',
        priority: 'low',
        title: 'AI Recommendation',
        description: 'You may exceed your Travel budget within 5 days. Consider slowing down.',
        actionText: 'Review Budget'
      });
    }, 10000);

    return () => clearTimeout(timer);
  }, []);

  const markAsRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const markAsUnread = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: false } : n));
  };

  const archive = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isArchived: true } : n));
  };

  const deleteNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const archiveAll = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isArchived: true })));
  };

  return (
    <NotificationContext.Provider value={{
      notifications,
      addNotification,
      markAsRead,
      markAsUnread,
      archive,
      deleteNotification,
      markAllAsRead,
      archiveAll
    }}>
      {children}
    </NotificationContext.Provider>
  );
};
