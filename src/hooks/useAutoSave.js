import { useEffect } from 'react';

/**
 * Custom Hook: useAutoSave
 * Automatically saves city state to localStorage when it changes
 * 
 * Benefits:
 * - Separates save logic
 * - Debouncing can be added easily
 * - Testable
 */
export function useAutoSave(cityState, saveFn) {
  useEffect(() => {
    if (cityState) {
      saveFn(cityState);
    }
  }, [cityState, saveFn]);
}
