import React, { useState } from 'react';
import { FaTimes, FaBrain, FaHeart, FaBriefcase, FaRunning } from 'react-icons/fa';
import { getMBTIInfo, getMoodEmoji } from '../data/mbtiData';

/**
 * CharacterInfoPanel - Advanced UI for displaying character MBTI and stats
 */
export default function CharacterInfoPanel({ character, onClose }) {
  if (!character) return null;
  
  const mbtiInfo = character.mbtiType ? getMBTIInfo(character.mbtiType) : null;
  const happiness = character.happiness || 75;
  const mood = mbtiInfo ? getMoodEmoji(character.mbtiType, happiness) : '🙂';
  
  return (
    <div className="character-info-overlay" onClick={onClose}>
      <div className="character-info-panel" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="character-info-header">
          <div className="character-avatar" style={{ 
            background: mbtiInfo ? `#${mbtiInfo.color.toString(16).padStart(6, '0')}` : '#7cb342' 
          }}>
            {mood}
          </div>
          <div className="character-title">
            <h3>{character.isPlayer ? '👤 You' : `${mbtiInfo?.name || 'Citizen'}`}</h3>
            <p className="character-subtitle">
              {character.isPlayer ? 'Player Character' : `${character.mbtiType || 'NPC'}`}
            </p>
          </div>
          <button className="close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>
        
        {/* MBTI Info */}
        {mbtiInfo && !character.isPlayer && (
          <div className="mbti-section">
            <div className="mbti-badge" style={{
              background: `linear-gradient(135deg, #${mbtiInfo.color.toString(16).padStart(6, '0')} 0%, #${(mbtiInfo.color - 0x222222).toString(16).padStart(6, '0')} 100%)`
            }}>
              <FaBrain className="mbti-icon" />
              <span className="mbti-type">{character.mbtiType}</span>
            </div>
            <div className="mbti-name">{mbtiInfo.name}</div>
            <div className="mbti-traits">
              {mbtiInfo.traits.map((trait, i) => (
                <span key={i} className="trait-tag">{trait}</span>
              ))}
            </div>
          </div>
        )}
        
        {/* Stats */}
        <div className="character-stats">
          <div className="stat-row">
            <div className="stat-item">
              <FaHeart className="stat-icon happiness" />
              <div className="stat-details">
                <span className="stat-label">Happiness</span>
                <div className="stat-bar">
                  <div className="stat-fill happiness-fill" style={{ width: `${happiness}%` }} />
                </div>
                <span className="stat-value">{happiness}%</span>
              </div>
            </div>
          </div>
          
          {mbtiInfo && !character.isPlayer && (
            <>
              <div className="stat-row">
                <div className="stat-item">
                  <FaBriefcase className="stat-icon work" />
                  <div className="stat-details">
                    <span className="stat-label">Work Speed</span>
                    <div className="stat-bar">
                      <div className="stat-fill work-fill" style={{ width: `${mbtiInfo.workSpeed * 80}%` }} />
                    </div>
                    <span className="stat-value">{(mbtiInfo.workSpeed * 100).toFixed(0)}%</span>
                  </div>
                </div>
              </div>
              
              <div className="stat-row">
                <div className="stat-item">
                  <FaRunning className="stat-icon social" />
                  <div className="stat-details">
                    <span className="stat-label">Social Need</span>
                    <div className="stat-bar">
                      <div className="stat-fill social-fill" style={{ width: `${mbtiInfo.socialNeed * 100}%` }} />
                    </div>
                    <span className="stat-value">{(mbtiInfo.socialNeed * 100).toFixed(0)}%</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
        
        {/* Preferred Building */}
        {mbtiInfo && !character.isPlayer && (
          <div className="preferred-section">
            <h4>Preferred Workplace</h4>
            <div className="preferred-building">
              {mbtiInfo.preferredBuilding === 'OFFICE' && '🏢 Office'}
              {mbtiInfo.preferredBuilding === 'CAFE' && '☕ Cafe'}
              {mbtiInfo.preferredBuilding === 'RESTAURANT' && '🍽️ Restaurant'}
              {mbtiInfo.preferredBuilding === 'POLICE' && '👮 Police Station'}
              {mbtiInfo.preferredBuilding === 'FIRE' && '🚒 Fire Station'}
              {mbtiInfo.preferredBuilding === 'HOUSE' && '🏠 House'}
            </div>
          </div>
        )}
        
        {/* Position */}
        <div className="position-section">
          <h4>Current Position</h4>
          <p>Grid: ({Math.round(character.x)}, {Math.round(character.y)})</p>
          <p>Status: {character.isMoving ? '🚶 Walking' : '🧍 Standing'}</p>
        </div>
      </div>
    </div>
  );
}
