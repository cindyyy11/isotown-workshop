import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  FaCity, FaMapMarkerAlt, FaPlay, FaPlusCircle, FaHammer, FaSyncAlt, FaLightbulb, FaGlobeAsia,
  FaPause, FaRoad, FaHome, FaCoffee, FaBuilding, FaTrash, FaSave, FaCoins, FaUsers, FaBriefcase,
  FaSmile, FaSun, FaCloudRain, FaWind, FaFire, FaRedo, FaTimes, FaLeaf, FaCloudUploadAlt, FaImage,
  FaSnowflake, FaNewspaper, FaMoon, FaUtensils, FaShieldAlt, FaFireExtinguisher, FaList, FaInfoCircle,
} from 'react-icons/fa';
import IsometricCanvas from './components/IsometricCanvas';
import SavesPanel from './components/SavesPanel';
import Toolbar from './components/Toolbar';
import StatsPanel from './components/StatsPanel';
import ControlPanel from './components/ControlPanel';
import WeatherConfig from './components/WeatherConfig';
import WorldMap from './components/WorldMap';
import WorkshopPanel from './components/WorkshopPanel';
import LeaderboardPanel from './components/LeaderboardPanel';
import MayorReportPanel from './components/MayorReportPanel';
import { fetchWeather, clearWeatherCache } from './services/weatherService';
import {
  loadCityState,
  saveCityState,
  clearCityState,
  initializeCity,
  placeBuilding,
  eraseBuilding,
  processTick,
  shouldProcessTick,
  exportCity,
  downloadExport,
  exportCanvasAsImage,
  findSuggestedTile,
  collectDroppedCoins,
  addCityLog,
} from './services/cityService';
import { syncCharactersWithPopulation } from './services/characterService';
import {
  getServerCapabilities,
  publishScore,
  fetchLeaderboard,
  requestMayorReport,
  resetServerCache,
} from './services/serverService';
import { TICK_INTERVAL, BUILDING_TYPES } from './data/buildingData';
import { getSeasonColors } from './services/isometricRenderer';
import './App.css';

/**
 * Main App Component
 * IsoTown: Pixel Village Builder
 * 
 * WORKSHOP NOTE: This app requires the backend server to be running.
 * Participants must create a .env file and start both client + server.
 */
export default function App() {
  const [cityState, setCityState] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [setupRequired, setSetupRequired] = useState(false); // NEW: Track if setup is needed
  const [setupError, setSetupError] = useState(''); // NEW: Store error message
  const [hasSave, setHasSave] = useState(false);
  const [coordinates, setCoordinates] = useState({ lat: 3.1390, lon: 101.6869 });
  const [zone, setZone] = useState({ lat: 3.1390, lon: 101.6869, label: 'Kuala Lumpur' });
  const [nextTickIn, setNextTickIn] = useState(null);
  const [capabilities, setCapabilities] = useState({ available: false, server: false, gemini: false });
  const [leaderboard, setLeaderboard] = useState([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);
  const [publishingScore, setPublishingScore] = useState(false);
  const [mayorReport, setMayorReport] = useState(null);
  const [mayorLoading, setMayorLoading] = useState(false);
  const [showWorldMap, setShowWorldMap] = useState(false);
  const [showSavesPanel, setShowSavesPanel] = useState(false);
  const [showWorkshopPanel, setShowWorkshopPanel] = useState(false);
  const [showGazettePanel, setShowGazettePanel] = useState(false);
  const [currentSaveId, setCurrentSaveId] = useState(null);
  const [isPaused, setIsPaused] = useState(false);
  const [lastGeminiAutoTrigger, setLastGeminiAutoTrigger] = useState(null);
  const [gameStatus, setGameStatus] = useState(null);
  const [buildingInteract, setBuildingInteract] = useState(null); // { type, x, y } when E pressed near building
  const [showCityLog, setShowCityLog] = useState(false);
  const [showRulesPanel, setShowRulesPanel] = useState(false);
  const [collectToast, setCollectToast] = useState(null); // { amount } when player collects coins
  const [mayorError, setMayorError] = useState(null); // Gemini report fetch error
  const canvasRef = useRef(null);
  const lastTownSquareTriggerRef = useRef(0);
  const mayorReportInFlightRef = useRef(false);

  // Game goals (simple end game rules)
  const GOAL_POPULATION = 20;
  const GOAL_HAPPINESS = 20;
  const GOAL_COINS = 30;

  const mapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
  const mapEnabled = Boolean(mapsApiKey);

  // Event logging removed - characters now show speech bubbles on canvas instead

  // Initialize app - REQUIRES server to be running
  useEffect(() => {
    const initialize = async () => {
      setIsLoading(true);
      setSetupRequired(false);
      setSetupError('');

      // STEP 1: Check if server is running (REQUIRED)
      const serverCaps = await getServerCapabilities();
      setCapabilities(serverCaps);

      // If server is not available, show setup screen
      if (!serverCaps.available) {
        setSetupRequired(true);
        setSetupError('Backend server is not running. Please follow the setup instructions below.');
        setIsLoading(false);
        return;
      }

      // REQUIRED: Check if Weather API is configured (workshop requirement)
      if (!serverCaps.weather) {
        setSetupRequired(true);
        setSetupError('OpenWeatherMap API key is not configured. Add OPENWEATHERMAP_API_KEY to your .env file.');
        setIsLoading(false);
        return;
      }

      // REQUIRED: Check if Google Maps API is configured (central feature)
      if (!mapsApiKey) {
        setSetupRequired(true);
        setSetupError('Google Maps API key is not configured. Add VITE_GOOGLE_MAPS_API_KEY to your .env file.');
        setIsLoading(false);
        return;
      }

      // STEP 2: Load saved zone from localStorage
      const savedZone = (() => {
        try {
          const raw = localStorage.getItem('isotown_zone_v1');
          return raw ? JSON.parse(raw) : null;
        } catch (error) {
          return null;
        }
      })();

      if (savedZone?.lat && savedZone?.lon) {
        setZone(savedZone);
        setCoordinates({ lat: savedZone.lat, lon: savedZone.lon });
      }

      // STEP 3: Check for existing save
      const savedState = loadCityState();
      setHasSave(!!savedState);

      // STEP 4: Fetch weather from server (location-based)
      const lat = savedZone?.lat ?? coordinates.lat;
      const lon = savedZone?.lon ?? coordinates.lon;
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
        setCityState(savedState);
      }

      setIsLoading(false);
    };

    initialize();
  }, []);

  // Auto-save whenever cityState changes
  useEffect(() => {
    if (cityState) {
      saveCityState(cityState);
    }
  }, [cityState]);

  // Tick simulation loop (pauses when isPaused is true)
  useEffect(() => {
    if (!cityState || isPaused || gameStatus) return; // Don't tick if game ended

    const interval = setInterval(() => {
      if (shouldProcessTick(cityState)) {
        setCityState(prevState => {
          const newState = processTick(prevState);
          
          // Check end game conditions
          if (newState.happiness <= 0) {
            setGameStatus('lost');
          } else if (
            newState.population >= GOAL_POPULATION &&
            newState.happiness >= GOAL_HAPPINESS &&
            newState.coins >= GOAL_COINS
          ) {
            setGameStatus('won');
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
  }, [cityState, isPaused, gameStatus]);

  // Auto-trigger Gemini suggestions based on conditions (no manual prompt needed)
  useEffect(() => {
    if (!cityState || !capabilities.gemini || isPaused) return;
    
    // Don't trigger too frequently (max once per 2 minutes)
    const now = Date.now();
    if (lastGeminiAutoTrigger && (now - lastGeminiAutoTrigger) < 120000) return;

    const shouldTrigger = 
      (cityState.happiness < 5 && cityState.tickCount > 3) ||   // Low happiness after a few ticks
      (cityState.coins < 3 && cityState.tickCount > 5) ||       // Very low coins
      (cityState.tickCount >= 20 && cityState.tickCount % 20 === 0); // Every 20 ticks (milestone)

    if (shouldTrigger) {
      setLastGeminiAutoTrigger(now);
      (async () => {
        setMayorLoading(true);
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
          if (result?.report) {
            setMayorReport(result);
            setShowGazettePanel(true);
          } else if (result?.message) {
            setMayorReport({ report: result.message, parsed: null });
            setShowGazettePanel(true);
          }
        } finally {
          setMayorLoading(false);
        }
      })();
    }
  }, [cityState, capabilities.gemini, isPaused, lastGeminiAutoTrigger]);

  useEffect(() => {
    if (!collectToast) return;
    const t = setTimeout(() => setCollectToast(null), 2000);
    return () => clearTimeout(t);
  }, [collectToast]);

  // Start new game
  const handleStartGame = async () => {
    setIsLoading(true);
    setGameStatus(null);
    const weather = await fetchWeather(coordinates.lat, coordinates.lon);
    const newState = initializeCity(weather.condition, weather.temperature);
    newState.characters = syncCharactersWithPopulation(
      [],
      0,
      newState.grid || {},
      { includePlayer: newState.includePlayer !== false }
    );
    setCityState(newState);
    setHasSave(true);
    setIsLoading(false);
  };

  // Continue saved game
  const handleContinue = () => {
    const savedState = loadCityState();
    if (savedState) {
      setGameStatus(null);
      savedState.characters = syncCharactersWithPopulation(
        savedState.characters || [],
        savedState.population || 0,
        savedState.grid || {},
        { includePlayer: savedState.includePlayer !== false }
      );
      setCityState(savedState);
    }
  };

  // Restart game
  const handleRestart = async () => {
    clearCityState();
    setHasSave(false);
    setCurrentSaveId(null);
    await handleStartGame();
  };

  // Load save from CRUD API (cloud)
  const handleLoadSave = (save) => {
    const snapshot = save.snapshot || {};
    if (!snapshot.worldCondition) return;
    setGameStatus(null);
    const characters = syncCharactersWithPopulation(
      snapshot.characters || [],
      snapshot.population || 0,
      snapshot.grid || {},
      { includePlayer: snapshot.includePlayer !== false }
    );
    setCityState({ ...snapshot, characters });
    const loadedZone = {
      lat: save.zoneLat ?? 3.139,
      lon: save.zoneLon ?? 101.6869,
      label: save.zoneLabel || 'Unknown',
    };
    setZone(loadedZone);
    setCoordinates({ lat: loadedZone.lat, lon: loadedZone.lon });
    try {
      localStorage.setItem('isotown_zone_v1', JSON.stringify(loadedZone));
    } catch (_) {}
    setHasSave(true);
    setCurrentSaveId(save.id);
  };

  // Handle tile click (place or erase)
  const handleTileClick = (x, y) => {
    if (!cityState) return;

    let newState;
    if (cityState.selectedTool === 'ERASE') {
      newState = eraseBuilding(cityState, x, y);
    } else {
      newState = placeBuilding(cityState, x, y, cityState.selectedTool);
    }

    if (newState) {
      setCityState(newState);
    }
  };

  // Handle tool selection
  const handleSelectTool = (toolId) => {
    if (!cityState) return;
    setCityState({ ...cityState, selectedTool: toolId });
  };

  // Option B: Collect dropped coins when player walks over tile
  const handleCollectCoins = useCallback((px, py) => {
    if (!cityState) return;
    const { newState, collected } = collectDroppedCoins(cityState, px, py);
    if (collected > 0) {
      const withLog = addCityLog(newState, `Collected ${collected} coin${collected > 1 ? 's' : ''}!`);
      setCityState(withLog);
      setCollectToast({ amount: collected });
    }
  }, [cityState]);

  // Option B: E key – interact with adjacent building, show info
  const handleBuildingInteract = useCallback((buildingType, gx, gy) => {
    const b = BUILDING_TYPES[buildingType];
    if (b) setBuildingInteract({ type: buildingType, name: b.name, x: gx, y: gy, ...b });
  }, []);

  const TOWN_SQUARE_COOLDOWN_MS = 30000;

  // Shared: request Gemini report and show in Gazette panel
  const requestAndShowReport = useCallback(async () => {
    if (!cityState || !capabilities.gemini) return;
    if (mayorReportInFlightRef.current) return;
    mayorReportInFlightRef.current = true;
    setMayorError(null);
    setMayorLoading(true);
    try {
      const result = await requestMayorReport({
        stats: { coins: cityState.coins, population: cityState.population, jobs: cityState.jobs, happiness: cityState.happiness },
        worldCondition: cityState.worldCondition || 'CLEAR',
        taxRate: cityState.taxRate,
        cityLog: (cityState.cityLog || []).slice(0, 5),
      });
      if (result?.report) {
        setMayorReport(result);
        setShowGazettePanel(true);
      } else if (result?.message) {
        setMayorReport({ report: result.message, parsed: null });
        setShowGazettePanel(true);
      } else {
        setMayorError('Could not generate report. Check server logs and GEMINI_API_KEY.');
        setMayorReport(null);
        setShowGazettePanel(true);
      }
    } catch (e) {
      setMayorError('Gemini request failed. Check network and server.');
      setMayorReport(null);
      setShowGazettePanel(true);
    } finally {
      setMayorLoading(false);
      mayorReportInFlightRef.current = false;
    }
  }, [cityState, capabilities.gemini]);

  // Option B: Player on town square (5,5) or (6,6) → trigger Gemini (throttled)
  const handleTriggerGemini = useCallback(async () => {
    if (!cityState || !capabilities.gemini) return;
    const now = Date.now();
    if (now - lastTownSquareTriggerRef.current < TOWN_SQUARE_COOLDOWN_MS) return;
    lastTownSquareTriggerRef.current = now;
    await requestAndShowReport();
  }, [cityState, capabilities.gemini, requestAndShowReport]);

  // Tax rate slider (0–10%)
  const handleTaxChange = useCallback((e) => {
    if (!cityState) return;
    const v = Math.max(0, Math.min(10, Number(e.target.value) || 0));
    setCityState({ ...cityState, taxRate: v / 100 });
  }, [cityState]);

  // Handle export as JSON
  const handleExport = () => {
    if (!cityState) return;
    const jsonData = exportCity(cityState);
    downloadExport(jsonData);
  };

  // Handle export as image
  const handleExportImage = () => {
    if (!canvasRef.current) {
      console.error('Canvas ref not available');
      return;
    }
    try {
      exportCanvasAsImage(canvasRef.current);
    } catch (error) {
      console.error('Failed to export image:', error);
      alert('Failed to export image. Please try again.');
    }
  };

  // Handle refresh weather
  const handleRefreshWeather = async () => {
    clearWeatherCache();
    const weather = await fetchWeather(coordinates.lat, coordinates.lon);
    if (cityState) {
      setCityState({
        ...cityState,
        worldCondition: weather.condition,
        worldTemperature: typeof weather.temperature === 'number' ? weather.temperature : undefined,
        worldConditionFetchedAt: Date.now(),
      });
    }
  };

  // Handle change location (from WorldMap or WeatherConfig)
  const handleApplyCoordinates = async (lat, lon, label = 'Custom Zone') => {
    setCoordinates({ lat, lon });
    setZone({ lat, lon, label });
    try {
      localStorage.setItem('isotown_zone_v1', JSON.stringify({ lat, lon, label }));
    } catch (error) {
      // Ignore storage errors
    }
    clearWeatherCache();
    const weather = await fetchWeather(lat, lon);
    if (cityState) {
      setCityState({
        ...cityState,
        worldCondition: weather.condition,
        worldTemperature: typeof weather.temperature === 'number' ? weather.temperature : undefined,
        worldConditionFetchedAt: Date.now(),
      });
    }
    setShowLocationConfig(false);
    setShowWorldMap(false);
  };

  const handlePublishScore = async () => {
    if (!cityState || !capabilities.available) return;
    setPublishingScore(true);
    const payload = {
      city: { grid: cityState.grid },
      stats: {
        coins: cityState.coins,
        population: cityState.population,
        jobs: cityState.jobs,
        happiness: cityState.happiness,
      },
    };
    const result = await publishScore(payload);
    if (result?.id) {
      await handleRefreshLeaderboard();
    }
    setPublishingScore(false);
  };

  const handleRefreshLeaderboard = async () => {
    if (!capabilities.available) return;
    setLeaderboardLoading(true);
    const result = await fetchLeaderboard();
    if (result?.leaderboard) {
      setLeaderboard(result.leaderboard);
    }
    setLeaderboardLoading(false);
  };

  const handleMayorReport = useCallback(() => {
    requestAndShowReport();
  }, [requestAndShowReport]);

  const handleApplyVote = useCallback((voteType) => {
    if (!cityState) return null;
    const target = findSuggestedTile(cityState.grid);
    if (!target) {
      return null;
    }

    let newState = null;
    if (voteType === 'ERASE') {
      newState = eraseBuilding(cityState, target.x, target.y);
    } else {
      newState = placeBuilding(cityState, target.x, target.y, voteType);
    }

    if (newState) {
      setCityState(newState);
      return newState;
    }

    return null;
  }, [cityState]);

  const handleReceiveState = useCallback((state) => {
    if (!state) return;
    setCityState(state);
  }, []);

  const handleWorkshopLog = useCallback((msg) => {
    console.log('[Workshop]', msg);
  }, []);

  // Retry connection to server
  const handleRetrySetup = async () => {
    setIsLoading(true);
    setSetupError('');
    resetServerCache();
    const serverCaps = await getServerCapabilities();
    setCapabilities(serverCaps);
    
    if (!serverCaps.available) {
      setSetupError('Still cannot connect to server. Make sure you followed all steps.');
      setIsLoading(false);
      return;
    }

    // All requirements met - continue initialization
    setSetupRequired(false);
    const savedZone = (() => {
      try {
        const raw = localStorage.getItem('isotown_zone_v1');
        return raw ? JSON.parse(raw) : null;
      } catch (error) {
        return null;
      }
    })();

    if (savedZone?.lat && savedZone?.lon) {
      setZone(savedZone);
      setCoordinates({ lat: savedZone.lat, lon: savedZone.lon });
    }

    const savedState = loadCityState();
    setHasSave(!!savedState);

    const lat = savedZone?.lat ?? coordinates.lat;
    const lon = savedZone?.lon ?? coordinates.lon;
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
      setCityState(savedState);
    }

    setIsLoading(false);
  };

  // Loading screen
  if (isLoading) {
    return (
      <div className="app">
        <div className="loading-screen">
          <div className="loading-spinner" />
          <p>Connecting to server...</p>
        </div>
      </div>
    );
  }

  // SETUP REQUIRED SCREEN - Shows when server or API keys are missing
  if (setupRequired) {
    const isServerMissing = !capabilities.available;
    const isWeatherMissing = capabilities.available && !capabilities.weather;

    return (
      <div className="app">
        <div className="setup-screen">
          <img src="/logo.gif" alt="IsoTown" className="setup-logo" />
          <h1 className="setup-title">
            IsoTown Workshop Setup
          </h1>
          
          {setupError && (
            <div className="setup-error">
              {setupError}
            </div>
          )}

          <div className="setup-instructions">
            <h2>Welcome to the API Workshop!</h2>
            <p>This workshop teaches you how to work with real APIs. Follow these steps to get started:</p>

            <div className={`setup-step ${!isServerMissing ? 'setup-step-done' : ''}`}>
              <h3>Step 1: Create your <code>.env</code> file</h3>
              <p>In your terminal, run:</p>
              <pre className="setup-code">
{`# Windows (PowerShell):
Copy-Item env.example .env

# Mac/Linux:
cp env.example .env`}
              </pre>
            </div>

            <div className={`setup-step ${isWeatherMissing ? 'setup-step-highlight' : ''}`}>
              <h3>Step 2: Get your FREE OpenWeatherMap API Key 🌤️</h3>
              <p><strong>This is required!</strong> The workshop won't work without it.</p>
              <ol className="setup-substeps">
                <li>Go to <a href="https://openweathermap.org/api" target="_blank" rel="noopener noreferrer">openweathermap.org/api</a></li>
                <li>Click "Sign Up" and create a free account</li>
                <li>Go to "API Keys" tab in your profile</li>
                <li>Copy your API key (or create a new one)</li>
              </ol>
              <p>Then add it to your <code>.env</code> file:</p>
              <pre className="setup-code">OPENWEATHERMAP_API_KEY=your_api_key_here</pre>
              <p className="setup-note">Note: New API keys may take a few minutes to activate.</p>
            </div>

            <div className="setup-step">
              <h3>Step 3: Get your Google Maps API Key 🗺️</h3>
              <p><strong>Required for the map picker feature.</strong></p>
              <ol className="setup-substeps">
                <li>Go to <a href="https://console.cloud.google.com" target="_blank" rel="noopener noreferrer">console.cloud.google.com</a></li>
                <li>Create a new project (or select existing)</li>
                <li>Enable "Maps JavaScript API"</li>
                <li>Go to Credentials → Create API Key</li>
              </ol>
              <p>Then add it to your <code>.env</code> file:</p>
              <pre className="setup-code">VITE_GOOGLE_MAPS_API_KEY=your_api_key_here</pre>
            </div>

            <div className={`setup-step ${!isServerMissing ? 'setup-step-done' : ''}`}>
              <h3>Step 4: Start the development server</h3>
              <p>Make sure both client and server are running:</p>
              <pre className="setup-code">npm run dev</pre>
              <p className="setup-note">⚠️ Restart the server after adding your API keys!</p>
            </div>

            <div className="setup-step">
              <h3>Step 5: Verify your setup</h3>
              <p>Test the server:</p>
              <pre className="setup-code">curl http://localhost:5176/api/capabilities</pre>
              <p>You should see: <code>{`{"server":true,"weather":true,...}`}</code></p>
            </div>

            <div className="setup-info">
              <h3>🎓 What you're learning:</h3>
              <ul>
                <li><strong>API Keys</strong> - How apps authenticate with external services</li>
                <li><strong>Environment Variables</strong> - Secure configuration management</li>
                <li><strong>Client-Server Architecture</strong> - Frontend talks to backend via API</li>
                <li><strong>Third-Party APIs</strong> - Using OpenWeatherMap and Google Maps</li>
              </ul>
            </div>
          </div>

          <div className="setup-status">
            <div className={`status-item ${capabilities.available ? 'status-ok' : 'status-missing'}`}>
              {capabilities.available ? '✓' : '✗'} Server Running
            </div>
            <div className={`status-item ${capabilities.weather ? 'status-ok' : 'status-missing'}`}>
              {capabilities.weather ? '✓' : '✗'} OpenWeatherMap API Key
            </div>
            <div className={`status-item ${mapsApiKey ? 'status-ok' : 'status-missing'}`}>
              {mapsApiKey ? '✓' : '✗'} Google Maps API Key
            </div>
          </div>

          <button className="setup-retry-btn" onClick={handleRetrySetup}>
            <FaSyncAlt /> I've completed setup - Retry Connection
          </button>

          <div className="setup-help">
            <p>Need help? Check the <code>README.md</code> file or ask your instructor.</p>
          </div>
        </div>
      </div>
    );
  }

  // Start screen
  if (!cityState) {
    return (
      <div className="app">
        <div className="start-screen">
          <img src="/logo.gif" alt="IsoTown" className="start-logo" />
          <h1 className="start-title">
            IsoTown
          </h1>
          <h2 className="start-subtitle">Pixel Village Builder</h2>
          
          <div className="start-intro">
            <p>
              Build your pixel village on an isometric grid! Place roads, houses, cafes, and offices.
              Watch your city grow and earn coins every 5 seconds.
            </p>
            <p>
              Weather conditions affect your buildings—plan wisely!
            </p>
          </div>

          <div className="location-display">
            <FaMapMarkerAlt />
            <span className="location-name">{zone.label}</span>
            <span className="location-coords">({zone.lat.toFixed(2)}, {zone.lon.toFixed(2)})</span>
          </div>
          
          <button
            className="explore-world-btn"
            onClick={() => setShowWorldMap(true)}
          >
            <FaGlobeAsia /> Explore Earth & Pick Location
          </button>

          <div className="start-controls">
            {hasSave ? (
              <>
                <button className="start-btn start-btn-primary" onClick={handleContinue}>
                  <FaPlay /> Continue City
                </button>
                <button className="start-btn start-btn-secondary" onClick={handleStartGame}>
                  <FaPlusCircle /> New City
                </button>
              </>
            ) : (
              <button className="start-btn start-btn-primary" onClick={handleStartGame}>
                <FaHammer /> Start Building
              </button>
            )}
          </div>
        </div>

        {/* World Map Explorer Overlay - Start Screen */}
        {showWorldMap && (
          <WorldMap
            mapsApiKey={mapsApiKey}
            currentZone={zone}
            onSelectLocation={handleApplyCoordinates}
            onClose={() => setShowWorldMap(false)}
          />
        )}
      </div>
    );
  }

  // Game time: Day (simulation). Economy ticks every 5s; 12 ticks = 1 day.
  const getGameTime = () => {
    const tickCount = cityState.tickCount || 0;
    const day = Math.floor(tickCount / 12) + 1;
    const tickInDay = tickCount % 12; // 0-11 within current day
    const season = getSeasonFromLocationAndWeather(zone?.lat, cityState?.worldTemperature);
    // First half of day (ticks 0-5) = day, second half (ticks 6-11) = night
    const isNight = tickInDay >= 6;
    // Map tick to hour24 for day/night overlay (dawn/dusk gradient)
    const hour24 = tickInDay <= 5 ? 6 + tickInDay * 2 : (18 + (tickInDay - 6) * 2) % 24;
    return { day, hour24, isNight, season };
  };

  /**
   * Four-season calculation based on location (latitude) and weather API temperature.
   * Uses real weather for the selected location when available; otherwise latitude + date.
   */
  function getSeasonFromLocationAndWeather(lat, temp) {
    const month = new Date().getMonth(); // 0–11 (Jan=0, Dec=11)
    const isNorth = lat != null && typeof lat === 'number' && lat >= 0;

    // When we have location-based temperature from weather API, use it to infer season
    if (typeof temp === 'number' && !Number.isNaN(temp)) {
      if (temp < 12) return 'WINTER';
      if (temp >= 26) return 'SUMMER';
      // Mild: use month + hemisphere
    }

    // Fallback: latitude + date (meteorological seasons)
    if (lat == null || typeof lat !== 'number') {
      if (month >= 2 && month < 5) return 'SPRING';
      if (month >= 5 && month < 8) return 'SUMMER';
      if (month >= 8 && month < 11) return 'FALL';
      return 'WINTER';
    }

    let season;
    if (month >= 2 && month < 5) season = 'SPRING';
    else if (month >= 5 && month < 8) season = 'SUMMER';
    else if (month >= 8 && month < 11) season = 'FALL';
    else season = 'WINTER';

    if (!isNorth) {
      const opposite = { SPRING: 'FALL', SUMMER: 'WINTER', FALL: 'SPRING', WINTER: 'SUMMER' };
      season = opposite[season];
    }
    return season;
  }

  const gameTime = getGameTime();
  const landColor = getSeasonColors(gameTime.season).land;
  
  const WeatherIcon = {
    CLEAR: FaSun,
    RAIN: FaCloudRain,
    WIND: FaWind,
    HEAT: FaFire
  }[cityState.worldCondition] || FaSun;

  const SeasonIcon = { SPRING: FaLeaf, SUMMER: FaSun, FALL: FaLeaf, WINTER: FaSnowflake }[gameTime.season] || FaLeaf;

  return (
    <div className="game-fullscreen" style={{ background: landColor }}>
      <IsometricCanvas
        ref={canvasRef}
        grid={cityState.grid}
        selectedTool={cityState.selectedTool}
        onTileClick={handleTileClick}
        characters={cityState.characters || []}
        onCharactersUpdate={(updatedChars) => {
          setCityState(prev => ({ ...prev, characters: updatedChars }));
        }}
        cityState={cityState}
        zone={zone}
        season={gameTime.season}
        hour24={gameTime.hour24}
        isNight={gameTime.isNight}
        showPlayerCharacter={cityState.includePlayer !== false}
        onCollectCoins={handleCollectCoins}
        onBuildingInteract={handleBuildingInteract}
        onTriggerGemini={handleTriggerGemini}
      />

      {/* TOP STATUS BAR */}
      <div className="floating-top-bar">
        <button 
          className={`top-bar-btn pause-btn ${isPaused ? 'paused' : ''}`}
          title={isPaused 
            ? "Resume simulation — rounds and economy run again" 
            : "Pause simulation — stops rounds and economy. Use when inspecting APIs, Network tab, or state (workshop-friendly)."}
          onClick={() => setIsPaused(!isPaused)}
        >
          {isPaused ? <FaPlay /> : <FaPause />}
        </button>
        <div 
          className="time-display"
          title={
            isPaused 
              ? "Paused. Economy updates every 5s. 12 updates = 1 day. First half of day = day, second half = night." 
              : `Next update in ${nextTickIn ?? '—'}s. Economy updates every 5s. 12 updates = 1 day.`
          }
        >
          {gameTime.isNight ? <FaMoon className="time-icon" /> : <FaSun className="time-icon" />}
          Day {gameTime.day}
        </div>
        <div className="weather-badge" title="Weather from OpenWeatherMap (location-based)">
          <span className="weather-badge-label">Weather</span>
          <WeatherIcon className="weather-icon-inline" /> {cityState.worldCondition}
        </div>
        <div className="season-badge" title="Season from real-world location & date">
          <SeasonIcon className="season-icon" /> {gameTime.season}
        </div>
      </div>

      {/* FLOATING LEFT TOOLBAR */}
      <div className="floating-toolbar">
        <div className="toolbar-section">
          <div className="toolbar-section-title">INFRASTRUCTURE</div>
          <button 
            className={`floating-tool-btn ${cityState.selectedTool === 'ROAD' ? 'active' : ''}`}
            onClick={() => handleSelectTool('ROAD')}
          >
            <FaRoad /> Road <span className="tool-cost">$1</span>
          </button>
        </div>

        <div className="toolbar-section">
          <div className="toolbar-section-title">RESIDENTIAL</div>
          <button 
            className={`floating-tool-btn ${cityState.selectedTool === 'HOUSE' ? 'active' : ''}`}
            onClick={() => handleSelectTool('HOUSE')}
          >
            <FaHome /> House <span className="tool-cost">$3</span>
          </button>
        </div>

        <div className="toolbar-section">
          <div className="toolbar-section-title">WORKPLACES</div>
          <button 
            className={`floating-tool-btn ${cityState.selectedTool === 'CAFE' ? 'active' : ''}`}
            onClick={() => handleSelectTool('CAFE')}
          >
            <FaCoffee /> Cafe <span className="tool-cost">$5</span>
          </button>
          <button 
            className={`floating-tool-btn ${cityState.selectedTool === 'OFFICE' ? 'active' : ''}`}
            onClick={() => handleSelectTool('OFFICE')}
          >
            <FaBuilding /> Office <span className="tool-cost">$8</span>
          </button>
          <button 
            className={`floating-tool-btn ${cityState.selectedTool === 'RESTAURANT' ? 'active' : ''}`}
            onClick={() => handleSelectTool('RESTAURANT')}
          >
            <FaUtensils /> Restaurant <span className="tool-cost">$7</span>
          </button>
        </div>

        <div className="toolbar-section">
          <div className="toolbar-section-title">SERVICES</div>
          <button 
            className={`floating-tool-btn ${cityState.selectedTool === 'POLICE' ? 'active' : ''}`}
            onClick={() => handleSelectTool('POLICE')}
          >
            <FaShieldAlt /> Police <span className="tool-cost">$10</span>
          </button>
          <button 
            className={`floating-tool-btn ${cityState.selectedTool === 'FIRE' ? 'active' : ''}`}
            onClick={() => handleSelectTool('FIRE')}
          >
            <FaFireExtinguisher /> Fire <span className="tool-cost">$10</span>
          </button>

          {/* ===== TODO #5 (Challenge - Easy): Add PARK Button Here ===== */}
          {/*
            After you add PARK to src/data/buildingData.js (see TODO #4),
            uncomment the button below to make it clickable in the UI:

            <button 
              className={`floating-tool-btn ${cityState.selectedTool === 'PARK' ? 'active' : ''}`}
              onClick={() => handleSelectTool('PARK')}
            >
              <FaTree /> Park <span className="tool-cost">$4</span>
            </button>

            IMPORTANT: Don't forget to import FaTree at the top of this file!
            Find line 2-6 and add FaTree to the imports:
            import { ..., FaTree } from 'react-icons/fa';

            TEST:
            1. Uncomment the button above
            2. Add FaTree to imports
            3. Refresh app
            4. Click PARK button
            5. Place on grid
            6. Check happiness increases!

            WHY: This connects your data (buildingData.js) to the UI
            LEARN: React components = Data + UI + Interactions
          */}
        </div>

        <div className="toolbar-section">
          <div className="toolbar-section-title">TOOLS</div>
          <button 
            className={`floating-tool-btn erase-btn ${cityState.selectedTool === 'ERASE' ? 'active' : ''}`}
            onClick={() => handleSelectTool('ERASE')}
          >
            <FaTrash /> Erase
          </button>
        </div>

        <button className="floating-tool-btn export-btn" onClick={handleExport} title="Export as JSON">
          <FaSave /> Export JSON
        </button>
        <button className="floating-tool-btn export-btn" onClick={handleExportImage} title="Export as Image">
          <FaImage /> Export Image
        </button>
      </div>

      {/* FLOATING STATS (Top Right) */}
      <div className="floating-stats">
        <div className="stat-item coins">
          <span className="stat-icon"><FaCoins /></span>
          <span className="stat-value">{cityState.coins}</span>
          <span className="stat-goal">/{GOAL_COINS}</span>
        </div>
        <div className="stat-item population">
          <span className="stat-icon"><FaUsers /></span>
          <span className="stat-value">{cityState.population}</span>
          <span className="stat-goal">/{GOAL_POPULATION}</span>
        </div>
        <div className="stat-item jobs">
          <span className="stat-icon"><FaBriefcase /></span>
          <span className="stat-value">{cityState.jobs}</span>
        </div>
        <div className="stat-item happiness">
          <span className="stat-icon"><FaSmile /></span>
          <span className="stat-value">{cityState.happiness}</span>
          <span className="stat-goal">/{GOAL_HAPPINESS}</span>
        </div>
        <div className="stat-item tax-row">
          <span className="stat-icon"><FaCoins /></span>
          <span className="stat-label">Tax</span>
          <input
            type="range"
            min="0"
            max="10"
            value={Math.round((cityState.taxRate || 0) * 100)}
            onChange={handleTaxChange}
            className="tax-slider"
            title="Mayor tax 0–10%. Reduces income."
          />
          <span className="stat-value">{Math.round((cityState.taxRate || 0) * 100)}%</span>
        </div>
        <button 
          className={`floating-tool-btn city-log-btn ${showCityLog ? 'active' : ''}`}
          onClick={() => setShowCityLog(!showCityLog)}
          title="City log (memories)"
        >
          <FaList /> City log
        </button>
      </div>

      {showCityLog && (
        <div className="city-log-panel">
          <h4 className="city-log-title">City log (last {cityState.cityLog?.length || 0})</h4>
          <ul className="city-log-list">
            {(cityState.cityLog || []).map((msg, i) => (
              <li key={i}>{msg}</li>
            ))}
            {(!cityState.cityLog || cityState.cityLog.length === 0) && (
              <li className="city-log-empty">No events yet. Build something!</li>
            )}
          </ul>
        </div>
      )}

      {/* Game rules overlay */}
      {showRulesPanel && (
        <div className="workshop-overlay" onClick={() => setShowRulesPanel(false)}>
          <div className="workshop-modal rules-panel" onClick={(e) => e.stopPropagation()}>
            <h3 className="rules-panel-title"><FaInfoCircle /> Game rules & costs</h3>
            <div className="rules-section">
              <h4>Costs</h4>
              <ul className="rules-list">
                <li><strong>Road</strong> — $1 (connects buildings; needed for income in RAIN/WIND)</li>
                <li><strong>House</strong> — $3 · +2 population, pays rent</li>
                <li><strong>Cafe</strong> — $5 · +2 happiness, earns coins (day)</li>
                <li><strong>Office</strong> — $8 · +3 jobs, earns coins (day)</li>
                <li><strong>Restaurant</strong> — $7 · +1 happiness, earns coins (day)</li>
                <li><strong>Police / Fire</strong> — $10 each · +1 safety</li>
                <li><strong>Erase</strong> — free (refund 50% of building cost)</li>
              </ul>
            </div>
            <div className="rules-section">
              <h4>Win / Lose</h4>
              <p>Win: 20 population, 20 happiness, 30 coins. Lose: happiness reaches 0.</p>
            </div>
            <div className="rules-section">
              <h4>Time</h4>
              <p>Economy updates every 5s. 12 updates = 1 day. First half = day, second = night.</p>
            </div>
            <button className="workshop-close-btn" onClick={() => setShowRulesPanel(false)} title="Close"><FaTimes /></button>
          </div>
        </div>
      )}

      {/* MINIMAP (Bottom Right) */}
      <div className="floating-minimap">
        <div className="minimap-header">
          MINIMAP
          <button className="minimap-close" onClick={() => {}}><FaTimes /></button>
        </div>
        <div className="minimap-canvas">
          {/* Simple minimap representation */}
          <div className="minimap-grid">
            {Array.from({ length: 144 }).map((_, i) => {
              const x = i % 12;
              const y = Math.floor(i / 12);
              const key = `${x},${y}`;
              const building = cityState.grid[key];
              let color = '#4a7c59'; // grass
              if (building) {
                if (building.type === 'ROAD') color = '#666';
                else if (building.type === 'HOUSE') color = '#5c9eed';
                else if (building.type === 'CAFE') color = '#f4a460';
                else if (building.type === 'OFFICE') color = '#8b7355';
              }
              return <div key={i} className="minimap-cell" style={{ background: color }} />;
            })}
          </div>
          <div className="minimap-legend">
            <span className="legend-item"><span style={{background:'#4a7c59'}}></span>G</span>
            <span className="legend-item"><span style={{background:'#666'}}></span>R</span>
            <span className="legend-item"><span style={{background:'#5c9eed'}}></span>H</span>
            <span className="legend-item"><span style={{background:'#f4a460'}}></span>C</span>
          </div>
        </div>
      </div>

      {/* FLOATING ACTION BUTTONS (Bottom Left) */}
      <div className="floating-actions">
        <button className="action-btn" onClick={() => setShowRulesPanel(true)} title="Game rules & costs">
          <FaInfoCircle />
        </button>
        <button className="action-btn" onClick={() => setShowWorkshopPanel(true)} title="Workshop Mode">
          <FaUsers />
        </button>
        <button className="action-btn" onClick={() => setShowSavesPanel(true)} title="Cloud Saves (CRUD)">
          <FaCloudUploadAlt />
        </button>
        <button className="action-btn" onClick={() => setShowWorldMap(true)} title="Explore Earth">
          <FaGlobeAsia />
        </button>
        <button 
          className="action-btn" 
          onClick={() => { setShowGazettePanel(true); if (!mayorReport) handleMayorReport(); }} 
          title="Town Gazette (Gemini AI)"
        >
          <FaNewspaper />
        </button>
        <button className="action-btn" onClick={handleRefreshWeather} title="Refresh Weather">
          <FaSyncAlt />
        </button>
        <button className="action-btn" onClick={handleRestart} title="Restart">
          <FaRedo />
        </button>
      </div>

      {/* LOCATION BADGE (Bottom Center) */}
      <div className="floating-location" title="Location from Google Maps">
        <FaMapMarkerAlt /> {zone?.label || 'Unknown'}
      </div>

      {/* CONTROLS HINT (when player character enabled) */}
      {cityState?.includePlayer !== false && (
        <div className="controls-hint" title="Keyboard shortcuts">
          <span>WASD</span> move · <span>E</span> inspect · walk over <FaCoins className="controls-hint-coin" /> to collect · <span>Center</span> = Gazette
        </div>
      )}

      {/* Collect-coin toast */}
      {collectToast && (
        <div className="collect-toast" role="status">
          <FaCoins /> +{collectToast.amount}
        </div>
      )}

      {/* World Map Explorer Overlay */}
      {showWorldMap && (
        <WorldMap
          mapsApiKey={mapsApiKey}
          currentZone={zone}
          onSelectLocation={handleApplyCoordinates}
          onClose={() => setShowWorldMap(false)}
        />
      )}

      {/* Cloud Saves (CRUD) Panel */}
      <SavesPanel
        isOpen={showSavesPanel}
        onClose={() => setShowSavesPanel(false)}
        cityState={cityState}
        zone={zone}
        currentSaveId={currentSaveId}
        onLoadSave={handleLoadSave}
        onCurrentSaveIdChange={setCurrentSaveId}
      />

      {/* Workshop Mode Panel */}
      {showWorkshopPanel && (
        <div className="workshop-overlay" onClick={() => setShowWorkshopPanel(false)}>
          <div className="workshop-modal" onClick={(e) => e.stopPropagation()}>
            <WorkshopPanel
              enabled={capabilities.available}
              cityState={cityState}
              onApplyVote={handleApplyVote}
              onReceiveState={handleReceiveState}
              onLog={handleWorkshopLog}
            />
            <button
              className="workshop-close-btn"
              onClick={() => setShowWorkshopPanel(false)}
              title="Close"
            >
              <FaTimes />
            </button>
          </div>
        </div>
      )}

      {/* Building Info (E key when adjacent) */}
      {buildingInteract && (
        <div className="workshop-overlay" onClick={() => setBuildingInteract(null)}>
          <div className="workshop-modal building-info-modal" onClick={(e) => e.stopPropagation()}>
            <div className="building-info-header">
              <span className="building-info-icon" style={{ color: buildingInteract.color || '#7c6b5e' }}>
                {buildingInteract.id === 'HOUSE' && <FaHome />}
                {buildingInteract.id === 'CAFE' && <FaCoffee />}
                {buildingInteract.id === 'OFFICE' && <FaBuilding />}
                {buildingInteract.id === 'RESTAURANT' && <FaUtensils />}
                {buildingInteract.id === 'POLICE' && <FaShieldAlt />}
                {buildingInteract.id === 'FIRE' && <FaFireExtinguisher />}
                {buildingInteract.id === 'ROAD' && <FaRoad />}
              </span>
              <h3 className="building-info-title">{buildingInteract.name}</h3>
            </div>
            <p className="building-info-desc">{buildingInteract.description}</p>
            <div className="building-info-meta">
              <span className="building-info-cost"><FaCoins /> Cost: {buildingInteract.cost ?? '—'}</span>
              <span className="building-info-pos">Tile ({buildingInteract.x}, {buildingInteract.y})</span>
            </div>
            {buildingInteract.effects && (
              <ul className="building-info-effects">
                {buildingInteract.effects.population ? <li><FaUsers /> Population +{buildingInteract.effects.population}</li> : null}
                {buildingInteract.effects.happiness ? <li><FaSmile /> Happiness +{buildingInteract.effects.happiness}</li> : null}
                {buildingInteract.effects.jobs ? <li><FaBriefcase /> Jobs +{buildingInteract.effects.jobs}</li> : null}
                {buildingInteract.effects.safety ? <li><FaShieldAlt /> Safety +{buildingInteract.effects.safety}</li> : null}
              </ul>
            )}
            {['CAFE', 'OFFICE', 'RESTAURANT'].includes(buildingInteract.type) && (
              <p className="building-info-tip">Earns coins during the day. Connect to a <strong>road</strong> for income.</p>
            )}
            {buildingInteract.type === 'HOUSE' && (
              <p className="building-info-tip">Pays rent each day. Connect to a <strong>road</strong> for happiness.</p>
            )}
            <p className="building-info-hint">Walk next to a building and press <kbd>E</kbd> to inspect.</p>
            <button className="workshop-close-btn" onClick={() => setBuildingInteract(null)} title="Close"><FaTimes /></button>
          </div>
        </div>
      )}

      {/* Town Gazette (Gemini) Popup - auto-opens on suggestions */}
      {showGazettePanel && (
        <div className="workshop-overlay gazette-overlay" onClick={() => { setShowGazettePanel(false); setMayorError(null); }}>
          <div className="workshop-modal gazette-modal" onClick={(e) => e.stopPropagation()}>
            <MayorReportPanel
              enabled={capabilities.gemini}
              report={mayorReport}
              loading={mayorLoading}
              error={mayorError}
              onGenerate={handleMayorReport}
              townSquareCooldownSec={Math.ceil(TOWN_SQUARE_COOLDOWN_MS / 1000)}
            />
            <button
              className="workshop-close-btn"
              onClick={() => { setShowGazettePanel(false); setMayorError(null); }}
              title="Close"
            >
              <FaTimes />
            </button>
          </div>
        </div>
      )}

      {/* End Game Modal */}
      {gameStatus && (
        <div className="workshop-overlay" onClick={() => setGameStatus(null)}>
          <div className="workshop-modal end-game-modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="end-game-title">
              {gameStatus === 'won' ? '🎉 You Won!' : '😢 Game Over'}
            </h2>
            <div className="end-game-content">
              {gameStatus === 'won' ? (
                <>
                  <p>Congratulations! You reached all goals:</p>
                  <ul className="end-game-goals">
                    <li>✅ Population: {cityState.population} / {GOAL_POPULATION}</li>
                    <li>✅ Happiness: {cityState.happiness} / {GOAL_HAPPINESS}</li>
                    <li>✅ Coins: {cityState.coins} / {GOAL_COINS}</li>
                  </ul>
                  <p>Your city is thriving!</p>
                </>
              ) : (
                <>
                  <p>Your city's happiness reached 0.</p>
                  <p>Citizens abandoned the city.</p>
                  <p>Try building more cafes and connecting houses to roads!</p>
                </>
              )}
            </div>
            <div className="end-game-actions">
              <button className="start-btn start-btn-primary" onClick={handleRestart}>
                <FaRedo /> Play Again
              </button>
              <button className="start-btn start-btn-secondary" onClick={() => setGameStatus(null)}>
                <FaTimes /> Continue Building
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
