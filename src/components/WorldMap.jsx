import React, { useEffect, useRef, useState, useCallback } from 'react';
import { FaGlobeAsia, FaMapMarkerAlt, FaSearch, FaTimes, FaCheck } from 'react-icons/fa';
import { getApiBase } from '../services/serverService.js';

/**
 * WorldMap Component
 * Full-screen scrollable Google Maps for exploring Earth and picking locations
 * This is the central feature - your town exists at a real place on Earth!
 */
export default function WorldMap({
  mapsApiKey,
  currentZone,
  onSelectLocation,
  onClose,
}) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const geocoderRef = useRef(null);
  
  const [selectedLocation, setSelectedLocation] = useState({
    lat: currentZone?.lat || 3.1390,
    lon: currentZone?.lon || 101.6869,
    label: currentZone?.label || 'Kuala Lumpur',
    type: currentZone?.type || 'city',
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [weatherPreview, setWeatherPreview] = useState(null);

  // Fetch weather preview for selected location (uses backend /api/weather → OpenWeatherMap)
  const fetchWeatherPreview = useCallback(async (lat, lon) => {
    try {
      const base = getApiBase();
      if (!base) return;
      const response = await fetch(`${base}/api/weather?lat=${lat}&lon=${lon}`);
      if (response.ok) {
        const data = await response.json();
        setWeatherPreview(data);
      }
    } catch (error) {
      console.log('Weather preview not available');
    }
  }, []);

  // Initialize Google Maps
  useEffect(() => {
    if (!mapsApiKey || !mapRef.current) return;

    const initMap = () => {
      if (!window.google || !window.google.maps) return;

      const center = { lat: selectedLocation.lat, lng: selectedLocation.lon };
      
      const map = new window.google.maps.Map(mapRef.current, {
        center,
        zoom: 4,
        minZoom: 2,
        maxZoom: 18,
        mapTypeId: 'terrain',
        styles: [
          { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#a8d4e6' }] },
          { featureType: 'landscape', elementType: 'geometry', stylers: [{ color: '#c5e8c5' }] },
          { featureType: 'road', stylers: [{ visibility: 'simplified' }] },
          { featureType: 'poi', stylers: [{ visibility: 'off' }] },
        ],
        gestureHandling: 'greedy',
        zoomControl: true,
        mapTypeControl: true,
        streetViewControl: false,
        fullscreenControl: false,
      });

      // Custom marker icon
      const markerIcon = {
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: 12,
        fillColor: '#ff6b6b',
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 3,
      };

      const marker = new window.google.maps.Marker({
        position: center,
        map,
        icon: markerIcon,
        animation: window.google.maps.Animation.DROP,
        title: 'Your Town Location',
      });

      // Geocoder for place names
      const geocoder = new window.google.maps.Geocoder();
      geocoderRef.current = geocoder;

      // Click on map to select location
      map.addListener('click', async (event) => {
        const lat = Number(event.latLng.lat().toFixed(4));
        const lon = Number(event.latLng.lng().toFixed(4));
        
        marker.setPosition({ lat, lng: lon });
        marker.setAnimation(window.google.maps.Animation.BOUNCE);
        setTimeout(() => marker.setAnimation(null), 700);

        // Get place name
        geocoder.geocode({ location: { lat, lng: lon } }, (results, status) => {
          let label = 'Custom Location';
          let type = 'location';
          if (status === 'OK' && results[0]) {
            // Try to get city name
            const cityComponent = results[0].address_components.find(
              c => c.types.includes('locality') || c.types.includes('administrative_area_level_1')
            );
            const countryComponent = results[0].address_components.find(
              c => c.types.includes('country')
            );
            
            // Determine location type
            if (cityComponent?.types.includes('locality')) {
              type = 'city';
            } else if (cityComponent?.types.includes('administrative_area_level_1')) {
              type = 'region';
            } else if (countryComponent) {
              type = 'country';
            }
            
            if (cityComponent) {
              label = cityComponent.long_name;
              if (countryComponent) {
                label += `, ${countryComponent.short_name}`;
              }
            } else if (countryComponent) {
              label = countryComponent.long_name;
            }
          }
          
          setSelectedLocation({ lat, lon, label, type });
          fetchWeatherPreview(lat, lon);
        });
      });

      mapInstanceRef.current = map;
      markerRef.current = marker;

      // Initial weather fetch
      fetchWeatherPreview(selectedLocation.lat, selectedLocation.lon);
    };

    // Load Google Maps script
    if (window.google && window.google.maps) {
      initMap();
    } else {
      const scriptId = 'google-maps-script';
      if (!document.getElementById(scriptId)) {
        const script = document.createElement('script');
        script.id = scriptId;
        script.src = `https://maps.googleapis.com/maps/api/js?key=${mapsApiKey}&libraries=places`;
        script.async = true;
        script.onload = initMap;
        document.body.appendChild(script);
      }
    }
  }, [mapsApiKey, fetchWeatherPreview]);

  // Search for a place
  const handleSearch = useCallback(() => {
    if (!searchQuery.trim() || !geocoderRef.current || !mapInstanceRef.current) return;

    setIsSearching(true);
    geocoderRef.current.geocode({ address: searchQuery }, (results, status) => {
      setIsSearching(false);
      if (status === 'OK' && results[0]) {
        const location = results[0].geometry.location;
        const lat = Number(location.lat().toFixed(4));
        const lon = Number(location.lng().toFixed(4));
        
        mapInstanceRef.current.panTo({ lat, lng: lon });
        mapInstanceRef.current.setZoom(10);
        markerRef.current.setPosition({ lat, lng: lon });
        markerRef.current.setAnimation(window.google.maps.Animation.BOUNCE);
        setTimeout(() => markerRef.current.setAnimation(null), 700);

        const cityComponent = results[0].address_components.find(
          c => c.types.includes('locality') || c.types.includes('administrative_area_level_1')
        );
        const label = cityComponent?.long_name || results[0].formatted_address.split(',')[0];
        
        // Determine location type
        let type = 'location';
        if (cityComponent?.types.includes('locality')) {
          type = 'city';
        } else if (cityComponent?.types.includes('administrative_area_level_1')) {
          type = 'region';
        } else {
          const countryComponent = results[0].address_components.find(
            c => c.types.includes('country')
          );
          if (countryComponent) type = 'country';
        }
        
        setSelectedLocation({ lat, lon, label, type });
        setSearchQuery('');
        fetchWeatherPreview(lat, lon);
      }
    });
  }, [searchQuery, fetchWeatherPreview]);

  // Handle confirm selection
  const handleConfirm = () => {
    onSelectLocation(selectedLocation.lat, selectedLocation.lon, selectedLocation.label, selectedLocation.type);
    onClose();
  };

  // Get weather condition display
  const getWeatherDisplay = () => {
    if (!weatherPreview) return { icon: '🌍', text: 'Loading...' };
    const condition = weatherPreview.condition || 'CLEAR';
    const temp = weatherPreview.temperature ? `${Math.round(weatherPreview.temperature)}°C` : '';
    const displays = {
      RAIN: { icon: '🌧️', text: `Rainy ${temp}` },
      WIND: { icon: '💨', text: `Windy ${temp}` },
      HEAT: { icon: '🔥', text: `Hot ${temp}` },
      CLEAR: { icon: '☀️', text: `Clear ${temp}` },
    };
    return displays[condition] || displays.CLEAR;
  };

  const weather = getWeatherDisplay();

  return (
    <div className="world-map-overlay">
      <div className="world-map-container">
        {/* Header */}
        <div className="world-map-header">
          <div className="world-map-title">
            <FaGlobeAsia /> Explore Earth
          </div>
          <button className="world-map-close" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        {/* Search Bar */}
        <div className="world-map-search">
          <input
            type="text"
            placeholder="Search city or country..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button onClick={handleSearch} disabled={isSearching}>
            <FaSearch />
          </button>
        </div>

        {/* Map */}
        <div ref={mapRef} className="world-map-canvas" />

        {/* Selected Location Info */}
        <div className="world-map-info">
          <div className="location-badge">
            <FaMapMarkerAlt />
            <span className="location-name">{selectedLocation.label}</span>
          </div>
          <div className="location-coords">
            {selectedLocation.lat.toFixed(4)}, {selectedLocation.lon.toFixed(4)}
          </div>
          <div className="location-weather">
            <span className="weather-icon">{weather.icon}</span>
            <span className="weather-text">{weather.text}</span>
          </div>
        </div>

        {/* Confirm Button */}
        <button className="world-map-confirm" onClick={handleConfirm}>
          <FaCheck /> Build Town Here
        </button>

        {/* Instructions */}
        <div className="world-map-hint">
          Click anywhere on the map to select a location for your town!
          Weather conditions will affect your gameplay.
        </div>
      </div>
    </div>
  );
}
