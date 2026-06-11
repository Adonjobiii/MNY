import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, ArrowDownLeft, ArrowUpRight, Repeat, Target, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ACTIONS = [
  { icon: ArrowDownLeft, label: 'Income', color: 'bg-emerald-500', delay: 0.1 },
  { icon: ArrowUpRight, label: 'Expense', color: 'bg-red-500', delay: 0.15 },
  { icon: Repeat, label: 'Transfer', color: 'bg-blue-500', delay: 0.2 },
  { icon: Target, label: 'Dues', color: 'bg-purple-500', delay: 0.25 },
];

const FAB = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const toggleOpen = () => {
    // Vibrate if supported
    if (navigator.vibrate) navigator.vibrate(50);
    setIsOpen(!isOpen);
  };

  const handleActionClick = (action) => {
    if (navigator.vibrate) navigator.vibrate(30);
    setIsOpen(false);
    navigate('/transactions', { state: { openAddModal: true, txType: action.label } });
  };

  return (
    <div className="fixed bottom-24 right-6 z-50 md:hidden">
      
      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-[var(--background)]/80 backdrop-blur-sm z-40"
          />
        )}
      </AnimatePresence>

      {/* Radial Menu Options */}
      <div className="absolute bottom-16 right-0 flex flex-col-reverse items-end gap-4 z-50 pointer-events-none">
        <AnimatePresence>
          {isOpen && ACTIONS.map((action, index) => {
            const Icon = action.icon;
            return (
              <motion.button
                key={action.label}
                initial={{ opacity: 0, y: 20, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.8, transition: { duration: 0.2, delay: 0.05 * index } }}
                transition={{ type: 'spring', stiffness: 300, damping: 20, delay: action.delay }}
                onClick={() => handleActionClick(action)}
                className="flex items-center gap-3 pointer-events-auto group"
              >
                <span className="bg-[var(--card)] px-3 py-1.5 rounded-lg text-sm font-bold shadow-lg border border-[var(--border)]">
                  {action.label}
                </span>
                <div className={`w-12 h-12 rounded-full ${action.color} flex items-center justify-center text-white shadow-lg shadow-${action.color}/30 transform group-active:scale-95 transition-transform`}>
                  <Icon size={20} strokeWidth={2.5} />
                </div>
              </motion.button>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Main FAB Button */}
      <motion.button
        className="relative w-14 h-14 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white shadow-xl shadow-blue-500/40 z-50 overflow-hidden"
        whileTap={{ scale: 0.9 }}
        onClick={toggleOpen}
      >
        <motion.div
          animate={{ rotate: isOpen ? 135 : 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          <Plus size={28} strokeWidth={2.5} />
        </motion.div>
        
        {/* Ripple Effect Ring */}
        {!isOpen && (
          <motion.div 
            className="absolute inset-0 rounded-full border-2 border-white/30"
            animate={{ scale: [1, 1.5], opacity: [0.8, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeOut" }}
          />
        )}
      </motion.button>
    </div>
  );
};

export default FAB;
