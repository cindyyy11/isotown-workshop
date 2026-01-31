import { useState, useCallback } from 'react';

/**
 * Custom Hook: useServerState
 * Manages all server-related state and loading states
 * 
 * Benefits:
 * - Groups related state together
 * - Reduces prop drilling
 * - Easier to manage async operations
 */
export function useServerState() {
  const [capabilities, setCapabilities] = useState({ 
    available: false, 
    server: false, 
    gemini: false 
  });
  const [leaderboard, setLeaderboard] = useState([]);
  const [mayorReport, setMayorReport] = useState(null);
  
  // Loading states grouped
  const [loadingStates, setLoadingStates] = useState({
    leaderboard: false,
    mayor: false,
    publishing: false,
  });
  
  // Error states grouped
  const [errorStates, setErrorStates] = useState({
    mayor: null,
    setup: '',
  });

  const actions = {
    setCapabilities: useCallback((caps) => setCapabilities(caps), []),
    
    setLeaderboard: useCallback((data) => setLeaderboard(data), []),
    
    setMayorReport: useCallback((report) => setMayorReport(report), []),
    
    setLoading: useCallback((key, value) => {
      setLoadingStates(prev => ({ ...prev, [key]: value }));
    }, []),
    
    setError: useCallback((key, value) => {
      setErrorStates(prev => ({ ...prev, [key]: value }));
    }, []),
    
    resetErrors: useCallback(() => {
      setErrorStates({ mayor: null, setup: '' });
    }, []),
  };

  return {
    capabilities,
    leaderboard,
    mayorReport,
    isLeaderboardLoading: loadingStates.leaderboard,
    isMayorLoading: loadingStates.mayor,
    isPublishing: loadingStates.publishing,
    mayorError: errorStates.mayor,
    setupError: errorStates.setup,
    actions,
  };
}
