import { useState, useEffect } from 'react';

export const usePullToRefresh = (onRefresh) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullProgress, setPullProgress] = useState(0);

  useEffect(() => {
    let startY = 0;
    let isPulling = false;

    const handleTouchStart = (e) => {
      if (window.scrollY === 0) {
        startY = e.touches[0].clientY;
        isPulling = true;
      }
    };

    const handleTouchMove = (e) => {
      if (!isPulling) return;
      const currentY = e.touches[0].clientY;
      const deltaY = currentY - startY;

      // Only track if pulling down
      if (deltaY > 0 && window.scrollY === 0) {
        // Prevent default scrolling to handle custom pull
        // Note: e.preventDefault() here might throw passive listener errors in some browsers, 
        // so we use CSS touch-action: pan-y or handle it carefully.
        const progress = Math.min(deltaY / 150, 1); // Max out at 150px pull
        setPullProgress(progress);
      }
    };

    const handleTouchEnd = async () => {
      if (!isPulling) return;
      isPulling = false;
      
      if (pullProgress > 0.8 && !isRefreshing) {
        setIsRefreshing(true);
        if (onRefresh) {
          await onRefresh();
        } else {
          // Simulate network delay if no handler provided
          await new Promise(res => setTimeout(res, 1500));
        }
        setIsRefreshing(false);
      }
      setPullProgress(0);
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: true });
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [pullProgress, isRefreshing, onRefresh]);

  return { isRefreshing, pullProgress };
};
