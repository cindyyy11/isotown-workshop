import React from 'react';
import { FaCog, FaPlay, FaRedo, FaDownload, FaCoins, FaCloudSun } from 'react-icons/fa';

/**
 * ControlPanel Component
 * Game controls (Continue, Restart, Export)
 */
export default function ControlPanel({ hasSave, onContinue, onRestart, onExport }) {
  return (
    <div className="control-panel">
      <h3 className="control-title">
        <FaCog /> Controls
      </h3>
      
      <div className="control-buttons">
        {hasSave ? (
          <>
            <button className="control-btn control-btn-primary" onClick={onContinue}>
              <FaPlay /> Continue
            </button>
            <button className="control-btn control-btn-secondary" onClick={onRestart}>
              <FaRedo /> Restart
            </button>
          </>
        ) : (
          <button className="control-btn control-btn-primary" onClick={onRestart}>
            <FaPlay /> New City
          </button>
        )}
        
        <button className="control-btn control-btn-export" onClick={onExport}>
          <FaDownload /> Export City
        </button>
      </div>

      <div className="control-hint">
        <p><strong><FaCoins /> Income Rules:</strong></p>
        <ul>
          <li>Cafe: +1 coin/5s if next to road</li>
          <li>Office: +2 coins/5s if next to road + house nearby</li>
        </ul>
        <p><strong><FaCloudSun /> Weather Effects:</strong></p>
        <ul>
          <li>Rain: Cafes need roads</li>
          <li>Wind: Offices need roads</li>
          <li>Heat: Need cafes or lose happiness</li>
        </ul>
      </div>
    </div>
  );
}
