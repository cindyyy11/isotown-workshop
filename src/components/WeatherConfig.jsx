import React, { useEffect, useRef, useState } from 'react';

/**
 * WeatherConfig Component
 * Allows user to configure location coordinates
 */
export default function WeatherConfig({
  onApply,
  onCancel,
  mapEnabled = false,
  mapsApiKey = '',
  initialZone = { lat: 3.1390, lon: 101.6869, label: 'Kuala Lumpur' },
}) {
  const [lat, setLat] = useState(String(initialZone.lat ?? '3.1390'));
  const [lon, setLon] = useState(String(initialZone.lon ?? '101.6869'));
  const [label, setLabel] = useState(initialZone.label || 'Custom Zone');
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);

  const handleApply = () => {
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lon);

    if (isNaN(latitude) || isNaN(longitude)) {
      alert('Please enter valid numbers for latitude and longitude');
      return;
    }

    if (latitude < -90 || latitude > 90) {
      alert('Latitude must be between -90 and 90');
      return;
    }

    if (longitude < -180 || longitude > 180) {
      alert('Longitude must be between -180 and 180');
      return;
    }

    onApply(latitude, longitude, label);
  };

  useEffect(() => {
    if (!mapEnabled || !mapsApiKey) return;
    if (!mapRef.current) return;

    const initMap = () => {
      if (!window.google || !window.google.maps) return;

      const center = { lat: parseFloat(lat), lng: parseFloat(lon) };
      const map = new window.google.maps.Map(mapRef.current, {
        center,
        zoom: 12,
        disableDefaultUI: true,
        zoomControl: true,
      });
      const marker = new window.google.maps.Marker({ position: center, map });

      map.addListener('click', (event) => {
        const clicked = {
          lat: Number(event.latLng.lat().toFixed(4)),
          lon: Number(event.latLng.lng().toFixed(4)),
        };
        setLat(String(clicked.lat));
        setLon(String(clicked.lon));
        setLabel('Picked Zone');
        marker.setPosition({ lat: clicked.lat, lng: clicked.lon });
      });

      mapInstanceRef.current = map;
      markerRef.current = marker;
    };

    if (window.google && window.google.maps) {
      initMap();
      return;
    }

    const scriptId = 'google-maps-script';
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = `https://maps.googleapis.com/maps/api/js?key=${mapsApiKey}`;
      script.async = true;
      script.onload = initMap;
      document.body.appendChild(script);
    } else {
      initMap();
    }
  }, [mapEnabled, mapsApiKey]);

  return (
    <div className="weather-config">
      <h3>Configure Location</h3>
      <div className="weather-config-inputs">
        <div className="input-group">
          <label htmlFor="zone-label">Zone Label:</label>
          <input
            id="zone-label"
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Zone name"
            aria-label="Zone label"
          />
        </div>
        <div className="input-group">
          <label htmlFor="latitude">Latitude:</label>
          <input
            id="latitude"
            type="number"
            step="0.0001"
            value={lat}
            onChange={(e) => setLat(e.target.value)}
            placeholder="e.g., 3.1390"
            aria-label="Latitude"
          />
        </div>
        <div className="input-group">
          <label htmlFor="longitude">Longitude:</label>
          <input
            id="longitude"
            type="number"
            step="0.0001"
            value={lon}
            onChange={(e) => setLon(e.target.value)}
            placeholder="e.g., 101.6869"
            aria-label="Longitude"
          />
        </div>
      </div>
      {mapEnabled && mapsApiKey && (
        <div className="map-picker">
          <div className="map-hint">Click on the map to set coordinates.</div>
          <div ref={mapRef} className="map-canvas" />
        </div>
      )}
      <div className="weather-config-actions">
        <button className="config-btn config-btn-primary" onClick={handleApply}>
          Apply
        </button>
        {onCancel && (
          <button className="config-btn config-btn-secondary" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}
