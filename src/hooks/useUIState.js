import { useReducer, useCallback } from 'react';

/**
 * UI State Actions
 */
const ACTIONS = {
  TOGGLE_PANEL: 'TOGGLE_PANEL',
  SET_PANEL: 'SET_PANEL',
  CLOSE_ALL_PANELS: 'CLOSE_ALL_PANELS',
  SET_MINIMAP: 'SET_MINIMAP',
  SET_DRAGGING: 'SET_DRAGGING',
  SET_TOAST: 'SET_TOAST',
  SET_INTERACT: 'SET_INTERACT',
  SET_GAME_STATUS: 'SET_GAME_STATUS',
};

/**
 * Initial UI State
 * Groups all UI-related state into a single object
 */
const initialUIState = {
  panels: {
    worldMap: false,
    saves: false,
    gazette: false,
    cityLog: false,
    rules: false,
  },
  minimap: {
    collapsed: false,
    position: { x: window.innerWidth - 156, y: window.innerHeight - 180 },
    isDragging: false,
  },
  toast: null,
  buildingInteract: null,
  gameStatus: null,
  isPaused: false,
};

/**
 * UI State Reducer
 * Centralizes all UI state mutations
 */
function uiStateReducer(state, action) {
  switch (action.type) {
    case ACTIONS.TOGGLE_PANEL:
      return {
        ...state,
        panels: {
          ...state.panels,
          [action.payload]: !state.panels[action.payload],
        },
      };

    case ACTIONS.SET_PANEL:
      return {
        ...state,
        panels: {
          ...state.panels,
          [action.payload.name]: action.payload.value,
        },
      };

    case ACTIONS.CLOSE_ALL_PANELS:
      return {
        ...state,
        panels: Object.keys(state.panels).reduce((acc, key) => {
          acc[key] = false;
          return acc;
        }, {}),
      };

    case ACTIONS.SET_MINIMAP:
      return {
        ...state,
        minimap: {
          ...state.minimap,
          ...action.payload,
        },
      };

    case ACTIONS.SET_DRAGGING:
      return {
        ...state,
        minimap: {
          ...state.minimap,
          isDragging: action.payload,
        },
      };

    case ACTIONS.SET_TOAST:
      return {
        ...state,
        toast: action.payload,
      };

    case ACTIONS.SET_INTERACT:
      return {
        ...state,
        buildingInteract: action.payload,
      };

    case ACTIONS.SET_GAME_STATUS:
      return {
        ...state,
        gameStatus: action.payload,
        isPaused: action.payload ? true : state.isPaused,
      };

    default:
      return state;
  }
}

/**
 * Custom Hook: useUIState
 * Manages all UI-related state with useReducer
 * 
 * Benefits:
 * - Reduces from 10+ useState to 1 useReducer
 * - Better organization
 * - Easier to track UI state
 * - Better performance
 */
export function useUIState() {
  const [uiState, dispatch] = useReducer(uiStateReducer, initialUIState);

  const actions = {
    togglePanel: useCallback((panelName) => {
      dispatch({ type: ACTIONS.TOGGLE_PANEL, payload: panelName });
    }, []),

    setPanel: useCallback((panelName, value) => {
      dispatch({ type: ACTIONS.SET_PANEL, payload: { name: panelName, value } });
    }, []),

    closeAllPanels: useCallback(() => {
      dispatch({ type: ACTIONS.CLOSE_ALL_PANELS });
    }, []),

    setMinimapPosition: useCallback((position) => {
      dispatch({ type: ACTIONS.SET_MINIMAP, payload: { position } });
    }, []),

    setMinimapCollapsed: useCallback((collapsed) => {
      dispatch({ type: ACTIONS.SET_MINIMAP, payload: { collapsed } });
    }, []),

    setMinimapDragging: useCallback((isDragging) => {
      dispatch({ type: ACTIONS.SET_DRAGGING, payload: isDragging });
    }, []),

    setToast: useCallback((toast) => {
      dispatch({ type: ACTIONS.SET_TOAST, payload: toast });
    }, []),

    setBuildingInteract: useCallback((interact) => {
      dispatch({ type: ACTIONS.SET_INTERACT, payload: interact });
    }, []),

    setGameStatus: useCallback((status) => {
      dispatch({ type: ACTIONS.SET_GAME_STATUS, payload: status });
    }, []),

    setPaused: useCallback((isPaused) => {
      dispatch({ type: ACTIONS.SET_MINIMAP, payload: { isPaused } });
    }, []),
  };

  return [uiState, actions];
}
