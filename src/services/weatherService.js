/**
 * Weather Service - Fetches current weather from OpenWeatherMap API
 * 
 * WORKSHOP NOTE: This service REQUIRES an OpenWeatherMap API key!
 * Get your free key at: https://openweathermap.org/api
 * 
 * Features:
 * - 5-minute cache (memory + localStorage)
 * - Default: Kuala Lumpur (lat 3.1390, lon 101.6869)
 * - Maps weather to world conditions: RAIN, WIND, HEAT, CLEAR
 */
import { FaSun, FaCloudRain, FaWind, FaFire } from 'react-icons/fa';
import { getApiBase } from './serverService.js';

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds
const CACHE_KEY = 'isotown_weather_cache';

// In-memory cache (faster than localStorage)
let memoryCache = null;

/**
 * Determine world condition from weather data
 * @param {Object} weather - Weather data from API
 * @returns {string} - RAIN, WIND, HEAT, or CLEAR
 */
function determineWorldCondition(weather) {
  const precipitation = weather.rain || weather.snow || 0;
  const windSpeed = weather.windspeed || 0;
  const temperature = weather.temperature || 25;

  // Priority order: RAIN > WIND > HEAT > CLEAR
  if (precipitation > 0) {
    return 'RAIN';
  }
  if (windSpeed > 20) {
    return 'WIND';
  }
  if (temperature > 32) {
    return 'HEAT';
  }
  return 'CLEAR';
}

/**
 * Check if cached data is still valid
 * @param {number} timestamp - Cache timestamp
 * @returns {boolean}
 */
function isCacheValid(timestamp) {
  if (!timestamp) return false;
  return Date.now() - timestamp < CACHE_DURATION;
}

/**
 * Get cached weather data
 * @returns {Object|null} - Cached data or null
 */
function getCachedWeather() {
  // Try memory cache first
  if (memoryCache && isCacheValid(memoryCache.timestamp)) {
    return memoryCache.data;
  }

  // Try localStorage cache
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (isCacheValid(parsed.timestamp)) {
        memoryCache = parsed; // Update memory cache
        return parsed.data;
      }
    }
  } catch (error) {
    console.warn('Failed to read weather cache:', error);
  }

  return null;
}

/**
 * Save weather data to cache
 * @param {Object} data - Weather data to cache
 */
function setCachedWeather(data) {
  const cacheObject = {
    data,
    timestamp: Date.now(),
  };

  // Update memory cache
  memoryCache = cacheObject;

  // Update localStorage cache
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheObject));
  } catch (error) {
    console.warn('Failed to save weather cache:', error);
  }
}

/**
 * Fetch current weather from backend (which calls OpenWeatherMap)
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @returns {Promise<Object>} - Weather data with world condition
 */
export async function fetchWeather(lat = 3.1390, lon = 101.6869) {
  // Check cache first
  const cached = getCachedWeather();
  if (cached) {
    // ===== TODO #1 (Easy - Debugging): Add console.log here =====
    // When does this code run? Add a console.log to find out!
    // 
    // TASK: Add this line below (uncomment it):
    // console.log('✅ Using cached weather data:', cached);
    // 
    // WHY: Helps you see when the cache is hit (should happen within 5 min of previous fetch)
    // TEST: Change location twice within 5 minutes, check Console tab
    // LEARN: Caching reduces API calls = faster app + lower costs
    return cached;
  }

  // ===== TODO #2 (Easy - Debugging): Add console.log here =====
  // TASK: Add this line below (uncomment it):
  // console.log('🌐 Fetching fresh weather from server...', { lat, lon });
  // 
  // WHY: Shows when a real API call happens
  // TEST: Change location, watch Console tab AND Network tab
  // LEARN: Each fetch costs money in production (that's why we cache!)

  try {
    const apiBase = getApiBase();
    const url = `${apiBase}/api/weather?lat=${lat}&lon=${lon}`;
    const response = await fetch(url, { method: 'GET', headers: { 'Content-Type': 'application/json' } });

    const contentType = response.headers.get('Content-Type') || '';
    const isJson = contentType.includes('application/json');
    let data;
    try {
      data = isJson ? await response.json() : null;
    } catch (_) {
      throw new Error('Server returned non-JSON (check backend is running and URL is correct).');
    }

    if (!response.ok) {
      throw new Error((data && data.error) || `Weather API error: ${response.status}`);
    }
    if (!data) throw new Error('No weather data');

    const weatherData = {
      temperature: data.temperature ?? 25,
      windspeed: data.windspeed ?? 0,
      humidity: data.humidity ?? 50,
      description: data.description ?? 'clear',
      condition: data.condition || determineWorldCondition(data),
      lat,
      lon,
      fetchedAt: new Date().toISOString(),
    };

    // Cache the result
    setCachedWeather(weatherData);

    return weatherData;
  } catch (error) {
    console.error('Weather fetch failed:', error);
    
    // Fallback to default weather so the app still works
    // This allows participants to continue while their API key activates
    const fallbackData = {
      temperature: 28,
      windspeed: 12,
      humidity: 75,
      description: 'clear sky (fallback)',
      condition: 'CLEAR',
      lat,
      lon,
      fetchedAt: new Date().toISOString(),
      isFallback: true,
      errorMessage: error.message,
    };
    
    // Cache the fallback to prevent repeated failed requests
    setCachedWeather(fallbackData);
    
    return fallbackData;
  }
}

/**
 * Clear weather cache (useful for testing)
 */
export function clearWeatherCache() {
  memoryCache = null;
  try {
    localStorage.removeItem(CACHE_KEY);
  } catch (error) {
    console.warn('Failed to clear weather cache:', error);
  }
}

/**
 * Get world condition display info
 * @param {string} condition - RAIN, WIND, HEAT, or CLEAR
 * @returns {Object} - Display info with icon component and description
 */
export function getConditionDisplay(condition) {
  const displays = {
    RAIN: { IconComponent: FaCloudRain, name: 'Rainy', description: 'Cafes need roads' },
    WIND: { IconComponent: FaWind, name: 'Windy', description: 'Offices affected' },
    HEAT: { IconComponent: FaFire, name: 'Hot', description: 'Need cafes for happiness' },
    CLEAR: { IconComponent: FaSun, name: 'Clear', description: 'Optimal conditions' },
  };

  return displays[condition] || displays.CLEAR;
}
