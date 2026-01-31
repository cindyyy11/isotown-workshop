import { useState, useEffect, useCallback, useRef } from 'react';
import { shouldProcessTick } from '../services/cityService';
import { TICK_INTERVAL } from '../data/buildingData';

/**
 * Custom Hook: useGameLoop
 * Manages the game tick loop and timer
 * 
 * Benefits:
 * - Separates game loop logic from UI
 * - Easier to test
 * - Cleaner component code
 */
export function useGameLoop(cityState, isPaused, gameStatus, onTick, onGameEnd) {
  const [nextTickIn, setNextTickIn] = useState(null);
  
  // Game goals
  const GOAL_POPULATION = 20;
  const GOAL_HAPPINESS = 20;
  const GOAL_COINS = 30;

  // Tick simulation loop
  useEffect(() => {
    if (!cityState || isPaused || gameStatus) return;

    const interval = setInterval(() => {
      if (shouldProcessTick(cityState)) {
        onTick((prevState) => {
          const newState = prevState;
          
          // Check end game conditions
          if (newState.happiness <= 0) {
            onGameEnd('lost');
          } else if (
            newState.population >= GOAL_POPULATION &&
            newState.happiness >= GOAL_HAPPINESS &&
            newState.coins >= GOAL_COINS
          ) {
            onGameEnd('won');
          }
          
          return newState;
        });
      }

      // Update countdown timer
      const timeSinceLastTick = Date.now() - cityState.lastTickAt;
      const timeUntilNextTick = Math.ceil((TICK_INTERVAL - timeSinceLastTick) / 1000);
      setNextTickIn(Math.max(0, timeUntilNextTick));
    }, 100);

    return () => clearInterval(interval);
  }, [cityState, isPaused, gameStatus, onTick, onGameEnd]);

  return { nextTickIn };
}
