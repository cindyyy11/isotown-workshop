import { useReducer, useCallback } from 'react';
import { 
  initializeCity, 
  placeBuilding, 
  eraseBuilding, 
  processTick,
  collectDroppedCoins,
  addCityLog 
} from '../services/cityService';
import { syncCharactersWithPopulation } from '../services/characterService';

/**
 * Game State Actions
 */
const ACTIONS = {
  SET_CITY_STATE: 'SET_CITY_STATE',
  UPDATE_CITY_STATE: 'UPDATE_CITY_STATE',
  SELECT_TOOL: 'SELECT_TOOL',
  PLACE_BUILDING: 'PLACE_BUILDING',
  ERASE_BUILDING: 'ERASE_BUILDING',
  PROCESS_TICK: 'PROCESS_TICK',
  COLLECT_COINS: 'COLLECT_COINS',
  SET_GAME_STATUS: 'SET_GAME_STATUS',
  RESET_GAME: 'RESET_GAME',
};

/**
 * Game State Reducer
 * Centralizes all state mutations for better testing and predictability
 */
function gameStateReducer(state, action) {
  switch (action.type) {
    case ACTIONS.SET_CITY_STATE:
      return action.payload;

    case ACTIONS.UPDATE_CITY_STATE:
      return { ...state, ...action.payload };

    case ACTIONS.SELECT_TOOL:
      return { ...state, selectedTool: action.payload };

    case ACTIONS.PLACE_BUILDING: {
      const { x, y, tool } = action.payload;
      return placeBuilding(state, x, y, tool) || state;
    }

    case ACTIONS.ERASE_BUILDING: {
      const { x, y } = action.payload;
      return eraseBuilding(state, x, y) || state;
    }

    case ACTIONS.PROCESS_TICK:
      return processTick(state);

    case ACTIONS.COLLECT_COINS: {
      const { x, y } = action.payload;
      const { newState, collected } = collectDroppedCoins(state, x, y);
      if (collected > 0) {
        return addCityLog(newState, `Collected ${collected} coin${collected > 1 ? 's' : ''}!`);
      }
      return state;
    }

    case ACTIONS.RESET_GAME:
      return null;

    default:
      return state;
  }
}

/**
 * Custom Hook: useGameState
 * Manages all game-related state with useReducer instead of multiple useState
 * 
 * Benefits:
 * - Single source of truth
 * - Easier to test
 * - Better performance (fewer re-renders)
 * - Predictable state updates
 */
export function useGameState() {
  const [cityState, dispatch] = useReducer(gameStateReducer, null);

  const actions = {
    setCityState: useCallback((state) => {
      dispatch({ type: ACTIONS.SET_CITY_STATE, payload: state });
    }, []),

    updateCityState: useCallback((updates) => {
      dispatch({ type: ACTIONS.UPDATE_CITY_STATE, payload: updates });
    }, []),

    selectTool: useCallback((toolId) => {
      dispatch({ type: ACTIONS.SELECT_TOOL, payload: toolId });
    }, []),

    placeBuilding: useCallback((x, y, tool) => {
      dispatch({ type: ACTIONS.PLACE_BUILDING, payload: { x, y, tool } });
    }, []),

    eraseBuilding: useCallback((x, y) => {
      dispatch({ type: ACTIONS.ERASE_BUILDING, payload: { x, y } });
    }, []),

    processTick: useCallback(() => {
      dispatch({ type: ACTIONS.PROCESS_TICK });
    }, []),

    collectCoins: useCallback((x, y) => {
      dispatch({ type: ACTIONS.COLLECT_COINS, payload: { x, y } });
      return collectDroppedCoins(cityState, x, y).collected;
    }, [cityState]),

    resetGame: useCallback(() => {
      dispatch({ type: ACTIONS.RESET_GAME });
    }, []),
  };

  return [cityState, actions];
}
