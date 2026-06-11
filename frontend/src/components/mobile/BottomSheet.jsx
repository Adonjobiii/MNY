import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';

const BottomSheet = ({ isOpen, onClose, title, children }) => {
  const controls = useAnimation();
  const [isDragging, setIsDragging] = useState(false);

  // Lock body scroll when sheet is open to prevent background scrolling
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      controls.start('visible');
    } else {
      document.body.style.overflow = 'unset';
      controls.start('hidden');
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen, controls]);

  if (!isOpen) return null;

  const handleDragEnd = (event, info) => {
    setIsDragging(false);
    // If dragged down past 100px or velocity is high, close the sheet
    if (info.offset.y > 100 || info.velocity.y > 500) {
      onClose();
    } else {
      // Snap back to top
      controls.start('visible');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] md:hidden"
          />

          {/* Draggable Sheet */}
          <motion.div
            initial="hidden"
            animate={controls}
            exit="hidden"
            variants={{
              visible: { y: 0, transition: { type: 'spring', damping: 25, stiffness: 200 } },
              hidden: { y: '100%', transition: { type: 'tween', duration: 0.3 } }
            }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.2}
            onDragStart={() => setIsDragging(true)}
            onDragEnd={handleDragEnd}
            className={`fixed bottom-0 left-0 right-0 max-h-[90vh] bg-[var(--background)] rounded-t-[2rem] z-[101] shadow-2xl flex flex-col md:hidden border-t border-[var(--border)] ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
          >
            {/* Drag Handle Indicator */}
            <div className="w-full flex justify-center py-4">
              <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full" />
            </div>

            {title && (
              <div className="px-6 pb-4 border-b border-[var(--border)]">
                <h2 className="text-xl font-bold">{title}</h2>
              </div>
            )}

            {/* Scrollable Content Area */}
            <div className="overflow-y-auto px-6 py-4 custom-scrollbar pb-24">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default BottomSheet;
