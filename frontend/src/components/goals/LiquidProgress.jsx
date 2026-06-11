import React from 'react';
import { motion } from 'framer-motion';

const LiquidProgress = ({ progress = 0, color = 'blue' }) => {
  const normalizedProgress = Math.min(Math.max(progress, 0), 100);
  
  // Convert color to Tailwind CSS classes
  const colorMap = {
    blue: 'from-blue-500 to-cyan-400',
    purple: 'from-purple-500 to-pink-500',
    emerald: 'from-emerald-500 to-teal-400',
    amber: 'from-orange-500 to-amber-400',
    rose: 'from-rose-500 to-red-500'
  };
  const gradient = colorMap[color] || colorMap.blue;

  return (
    <div className="relative w-full h-4 rounded-full bg-black/10 dark:bg-white/5 overflow-hidden ring-1 ring-inset ring-[var(--border)]">
      {/* Background track glow */}
      <div className={`absolute inset-0 bg-gradient-to-r ${gradient} opacity-10 blur-md`}></div>
      
      {/* Main fill */}
      <motion.div 
        className={`absolute top-0 left-0 bottom-0 bg-gradient-to-r ${gradient} rounded-full`}
        initial={{ width: 0 }}
        animate={{ width: `${normalizedProgress}%` }}
        transition={{ duration: 1.5, type: "spring", bounce: 0.2 }}
      >
        {/* Dynamic liquid effect overlays */}
        <div className="absolute inset-0 bg-white/20" style={{
          maskImage: 'linear-gradient(to right, transparent, black)',
          WebkitMaskImage: 'linear-gradient(to right, transparent, black)'
        }}></div>
        
        {/* Sparkle/glow on the edge */}
        <motion.div 
          className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-r from-transparent to-white opacity-40 blur-[2px]"
          animate={{ x: [0, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>
    </div>
  );
};

export default LiquidProgress;
