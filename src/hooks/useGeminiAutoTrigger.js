import { useState, useEffect, useCallback } from 'react';
import { requestMayorReport } from '../services/serverService';

/**
 * Custom Hook: useGeminiAutoTrigger
 * Manages automatic Gemini report triggering based on game conditions
 * 
 * Benefits:
 * - Separates AI logic from main component
 * - Easier to configure and test
 * - Better code organization
 */
export function useGeminiAutoTrigger(
  cityState, 
  capabilities, 
  isPaused,
  onReportReceived,
  onError
) {
  const [lastTrigger, setLastTrigger] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const COOLDOWN_MS = 120000; // 2 minutes

  useEffect(() => {
    if (!cityState || !capabilities.gemini || isPaused || isLoading) return;
    
    // Don't trigger too frequently
    const now = Date.now();
    if (lastTrigger && (now - lastTrigger) < COOLDOWN_MS) return;

    // Conditions for auto-trigger
    const shouldTrigger = 
      (cityState.happiness < 5 && cityState.tickCount > 3) ||
      (cityState.coins < 3 && cityState.tickCount > 5) ||
      (cityState.tickCount >= 20 && cityState.tickCount % 20 === 0);

    if (shouldTrigger) {
      setLastTrigger(now);
      
      (async () => {
        setIsLoading(true);
        try {
          const result = await requestMayorReport({
            stats: {
              coins: cityState.coins,
              population: cityState.population,
              jobs: cityState.jobs,
              happiness: cityState.happiness,
            },
            worldCondition: cityState.worldCondition || 'CLEAR',
            taxRate: cityState.taxRate,
            cityLog: (cityState.cityLog || []).slice(0, 5),
          });
          
          if (result?.report || result?.message) {
            onReportReceived(result);
          } else {
            onError('Could not generate report');
          }
        } catch (e) {
          onError('Gemini request failed');
        } finally {
          setIsLoading(false);
        }
      })();
    }
  }, [cityState, capabilities.gemini, isPaused, lastTrigger, isLoading, onReportReceived, onError]);

  return { isLoading, lastTrigger };
}
