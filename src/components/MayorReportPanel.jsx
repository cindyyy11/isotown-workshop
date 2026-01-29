import React from 'react';
import { FaNewspaper, FaBullhorn, FaUser, FaLightbulb, FaMapMarkerAlt, FaExclamationTriangle } from 'react-icons/fa';

/**
 * Town Gazette (Gemini Mayor Report)
 * AI-generated headlines, citizen quotes, and tips based on town stats, tax, and city log.
 */
export default function MayorReportPanel({ enabled, report, loading, error, onGenerate, townSquareCooldownSec = 30 }) {
  const parsed = report?.parsed || null;
  const rawText = typeof report?.report === 'string' ? report.report : (typeof report === 'string' ? report : '');
  const hasReport = !!parsed || !!rawText;

  return (
    <div className="panel newspaper-panel">
      <h3 className="panel-title">
        <FaNewspaper /> Town Gazette
      </h3>
      
      {!enabled ? (
        <p className="panel-muted">
          Not enabled. Add GEMINI_API_KEY to your server .env and restart to unlock AI-powered town news.
        </p>
      ) : (
        <>
          <button 
            className="panel-btn newspaper-btn" 
            onClick={onGenerate} 
            disabled={loading}
          >
            <FaNewspaper /> {loading ? 'Printing…' : 'Print Today\'s Edition'}
          </button>
          
          {error && (
            <p className="newspaper-error" role="alert">
              <FaExclamationTriangle /> {error}
            </p>
          )}
          
          <p className="newspaper-hint">
            <FaMapMarkerAlt /> Walk to the town square (center tiles) to trigger a report (once every {townSquareCooldownSec}s).
          </p>
          
          {hasReport && !error && (
            <div className="newspaper-container">
              <div className="newspaper-header">
                <span className="newspaper-logo"><FaNewspaper /></span>
                <div className="newspaper-masthead">
                  <h4>The IsoTown Gazette</h4>
                  <span className="newspaper-tagline">All the news that fits in pixels</span>
                </div>
              </div>
              
              <div className="newspaper-content">
                {parsed ? (
                  <>
                    <div className="newspaper-section headline-section">
                      <span className="section-icon"><FaBullhorn /></span>
                      <div className="section-content">
                        <span className="section-label">HEADLINE</span>
                        <p className="headline-text">{parsed.headline}</p>
                      </div>
                    </div>
                    
                    <div className="newspaper-section citizen-section">
                      <span className="section-icon"><FaUser /></span>
                      <div className="section-content">
                        <span className="section-label">CITIZEN SAYS</span>
                        <p className="citizen-quote">{parsed.citizen}</p>
                      </div>
                    </div>
                    
                    <div className="newspaper-section tip-section">
                      <span className="section-icon"><FaLightbulb /></span>
                      <div className="section-content">
                        <span className="section-label">MAYOR'S TIP</span>
                        <p className="tip-text">{parsed.tip}</p>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="newspaper-fallback">
                    {rawText || 'No news today!'}
                  </div>
                )}
              </div>
            </div>
          )}
          
          {!hasReport && !loading && !error && (
            <p className="panel-muted">Click the button to generate today&apos;s town news, or walk to the center!</p>
          )}
        </>
      )}
    </div>
  );
}
