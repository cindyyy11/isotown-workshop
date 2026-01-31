import { useState, useEffect } from 'react';
import { fetchWeather } from '../services/weatherService';
import { 
  getServerCapabilities, 
  resetServerCache 
} from '../services/serverService';
import { loadCityState } from '../services/cityService';
import { syncCharactersWithPopulation } from '../services/characterService';

/**
 * Custom Hook: useAppInitialization
 * Handles all app initialization logic
 * 
 * Benefits:
 * - Separates complex initialization
 * - Better error handling
 * - Cleaner main component
 * - Easier to test
 */
export function useAppInitialization(mapsApiKey, onZoneLoaded, onCityLoaded) {
  const [isLoading, setIsLoading] = useState(true);
  const [setupRequired, setSetupRequired] = useState(false);
  const [setupError, setSetupError] = useState('');
  const [hasSave, setHasSave] = useState(false);
  const [capabilities, setCapabilities] = useState({ 
    available: false, 
    server: false, 
    gemini: false 
  });

  useEffect(() => {
    const initialize = async () => {
      setIsLoading(true);
      setSetupRequired(false);
      setSetupError('');

      // STEP 1: Check if server is running
      const serverCaps = await getServerCapabilities();
      setCapabilities(serverCaps);

      if (!serverCaps.available) {
        setSetupRequired(true);
        setSetupError('Backend server is not running. Please follow the setup instructions below.');
        setIsLoading(false);
        return;
      }

      // STEP 2: Check Weather API
      if (!serverCaps.weather) {
        setSetupRequired(true);
        setSetupError('OpenWeatherMap API key is not configured. Add OPENWEATHERMAP_API_KEY to your .env file.');
        setIsLoading(false);
        return;
      }

      // STEP 3: Check Google Maps API
      if (!mapsApiKey) {
        setSetupRequired(true);
        setSetupError('Google Maps API key is not configured. Add VITE_GOOGLE_MAPS_API_KEY to your .env file.');
        setIsLoading(false);
        return;
      }

      // STEP 4: Load saved zone from localStorage
      const savedZone = (() => {
        try {
          const raw = localStorage.getItem('isotown_zone_v1');
          return raw ? JSON.parse(raw) : null;
        } catch (error) {
          return null;
        }
      })();

      if (savedZone?.lat && savedZone?.lon) {
        onZoneLoaded(savedZone);
      }

      // STEP 5: Check for existing save
      const savedState = loadCityState();
      setHasSave(!!savedState);

      // STEP 6: Fetch weather
      const lat = savedZone?.lat ?? 3.1390;
      const lon = savedZone?.lon ?? 101.6869;
      const weather = await fetchWeather(lat, lon);

      if (savedState && savedState.worldCondition) {
        if (!savedState.characters) savedState.characters = [];
        savedState.characters = syncCharactersWithPopulation(
          savedState.characters,
          savedState.population || 0,
          savedState.grid || {},
          { includePlayer: savedState.includePlayer !== false }
        );
        savedState.worldCondition = weather.condition;
        savedState.worldTemperature = typeof weather.temperature === 'number' ? weather.temperature : undefined;
        savedState.worldConditionFetchedAt = Date.now();
        onCityLoaded(savedState);
      }

      setIsLoading(false);
    };

    initialize();
  }, [mapsApiKey, onZoneLoaded, onCityLoaded]);

  const handleRetrySetup = async () => {
    setIsLoading(true);
    setSetupError('');
    resetServerCache();
    const serverCaps = await getServerCapabilities();
    setCapabilities(serverCaps);
    setIsLoading(false);
  };

  return {
    isLoading,
    setupRequired,
    setupError,
    hasSave,
    capabilities,
    setHasSave,
    handleRetrySetup,
  };
}
