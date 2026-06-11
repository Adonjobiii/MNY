import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, WalletCards, LineChart, Target, User } from 'lucide-react';

const NAV_ITEMS = [
  { path: '/', icon: LayoutDashboard, label: 'Home' },
  { path: '/transactions', icon: WalletCards, label: 'Accounts' },
  { path: '/analytics', icon: LineChart, label: 'Analytics' },
  { path: '/goals', icon: Target, label: 'Goals' },
  { path: '/settings', icon: User, label: 'Profile' }
];

const BottomNav = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const location = useLocation();

  // Scroll detection to hide/show nav
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 50) {
        setIsVisible(false); // Scrolling down
      } else {
        setIsVisible(true);  // Scrolling up
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed bottom-4 left-4 right-4 z-40 md:hidden"
        >
          <div className="glass-panel bg-[var(--background)]/80 backdrop-blur-xl border border-[var(--border)] rounded-[2rem] px-6 py-4 flex justify-between items-center shadow-2xl shadow-blue-900/10 dark:shadow-black/50">
            {NAV_ITEMS.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              
              return (
                <NavLink 
                  key={item.path} 
                  to={item.path}
                  className="relative flex flex-col items-center justify-center w-12 h-12 rounded-full"
                >
                  <motion.div
                    animate={isActive ? { scale: 1.1, y: -2 } : { scale: 1, y: 0 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                  >
                    <Icon 
                      size={24} 
                      className={`transition-colors duration-300 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'}`} 
                      strokeWidth={isActive ? 2.5 : 2}
                    />
                  </motion.div>
                  
                  {isActive && (
                    <motion.div 
                      layoutId="navIndicator"
                      className="absolute -bottom-2 w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400"
                      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    />
                  )}
                </NavLink>
              );
            })}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BottomNav;
