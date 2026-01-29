import React from 'react';
import { FaCoins, FaLightbulb, FaHammer } from 'react-icons/fa';
import { BUILDING_TYPES, TOOLS } from '../data/buildingData.js';

/**
 * Toolbar Component
 * Building and tool selection
 */
export default function Toolbar({ selectedTool, onSelectTool, coins }) {
  const tools = [...Object.values(BUILDING_TYPES), TOOLS.ERASE];

  return (
    <div className="toolbar">
      <h3 className="toolbar-title">
        <FaHammer /> Build
      </h3>
      <div className="toolbar-items">
        {tools.map((tool) => {
          const isSelected = selectedTool === tool.id;
          const canAfford = coins >= tool.cost;
          const isDisabled = tool.id !== 'ERASE' && !canAfford;
          const Icon = tool.icon;

          return (
            <button
              key={tool.id}
              className={`tool-btn ${isSelected ? 'tool-btn-selected' : ''} ${isDisabled ? 'tool-btn-disabled' : ''}`}
              onClick={() => onSelectTool(tool.id)}
              disabled={isDisabled}
              title={`${tool.name} - ${tool.description}${tool.cost > 0 ? ` (${tool.cost} coins)` : ''}`}
            >
              <span className="tool-icon">
                <Icon />
              </span>
              <span className="tool-name">{tool.name}</span>
              {tool.cost > 0 && (
                <span className="tool-cost">
                  {tool.cost}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="toolbar-hint">
        <p><FaLightbulb /> Click tiles to build</p>
        <p><FaCoins /> Cafes need roads for income</p>
      </div>
    </div>
  );
}
