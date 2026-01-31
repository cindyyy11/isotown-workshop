import { useState, useCallback } from 'react';

/**
 * Custom Hook: useLocationState
 * Manages location and zone state
 * 
 * Benefits:
 * - Groups related location state
 * - Simplifies coordinate management
 * - Single source for location data
 */
export function useLocationState() {
  const [zone, setZone] = useState({ 
    lat: 3.1390, 
    lon: 101.6869, 
    label: 'Kuala Lumpur' 
  });
  
  const [coordinates, setCoordinates] = useState({ 
    lat: 3.1390, 
    lon: 101.6869 
  });

  const updateZone = useCallback((newZone) => {
    setZone(newZone);
    setCoordinates({ lat: newZone.lat, lon: newZone.lon });
    
    // Persist to localStorage
    try {
      localStorage.setItem('isotown_zone_v1', JSON.stringify(newZone));
    } catch (e) {
      console.warn('Failed to save zone to localStorage:', e);
    }
  }, []);

  const updateCoordinates = useCallback((lat, lon) => {
    setCoordinates({ lat, lon });
  }, []);

  return {
    zone,
    coordinates,
    updateZone,
    updateCoordinates,
    setZone,
    setCoordinates,
  };
}
