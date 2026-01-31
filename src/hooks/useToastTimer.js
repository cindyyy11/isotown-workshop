import { useEffect } from 'react';

/**
 * Custom Hook: useToastTimer
 * Auto-dismisses toast notifications after a delay
 * 
 * Benefits:
 * - Reusable toast logic
 * - Automatic cleanup
 * - Configurable delay
 */
export function useToastTimer(toast, onDismiss, delay = 2000) {
  useEffect(() => {
    if (!toast) return;
    
    const timer = setTimeout(() => onDismiss(), delay);
    return () => clearTimeout(timer);
  }, [toast, onDismiss, delay]);
}
