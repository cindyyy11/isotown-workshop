import React from 'react';
import { FaCoins, FaUsers, FaBriefcase, FaSmile, FaChartLine, FaClock } from 'react-icons/fa';
import { getConditionDisplay } from '../services/weatherService.js';

/**
 * StatsPanel Component
 * Displays city stats and weather condition
 */
export default function StatsPanel({ coins, population, jobs, happiness, worldCondition, nextTickIn }) {
  const conditionDisplay = worldCondition ? getConditionDisplay(worldCondition) : null;

  return (
    <div className="stats-panel">
      <h2 className="stats-title">
        <FaChartLine /> IsoTown Stats
      </h2>
      
      <div className="stats-grid">
        <div className="stat-box">
          <span className="stat-icon">
            <FaCoins />
          </span>
          <div className="stat-info">
            <span className="stat-label">Coins</span>
            <span className="stat-value">{coins}</span>
          </div>
        </div>

        <div className="stat-box">
          <span className="stat-icon">
            <FaUsers />
          </span>
          <div className="stat-info">
            <span className="stat-label">Population</span>
            <span className="stat-value">{population}</span>
          </div>
        </div>

        <div className="stat-box">
          <span className="stat-icon">
            <FaBriefcase />
          </span>
          <div className="stat-info">
            <span className="stat-label">Jobs</span>
            <span className="stat-value">{jobs}</span>
          </div>
        </div>

        <div className="stat-box">
          <span className="stat-icon">
            <FaSmile />
          </span>
          <div className="stat-info">
            <span className="stat-label">Happiness</span>
            <span className="stat-value">{happiness}</span>
          </div>
        </div>
      </div>

      {conditionDisplay && (
        <div className="weather-box">
          <span className="weather-icon">
            {conditionDisplay.IconComponent && <conditionDisplay.IconComponent />}
          </span>
          <div className="weather-info">
            <span className="weather-label">Weather</span>
            <span className="weather-name">{conditionDisplay.name}</span>
            <span className="weather-desc">{conditionDisplay.description}</span>
          </div>
        </div>
      )}

      {nextTickIn !== null && (
        <div className="tick-timer">
          <span className="timer-label">
            <FaClock /> Next income:
          </span>
          <span className="timer-value">{nextTickIn}</span>
        </div>
      )}
    </div>
  );
}
