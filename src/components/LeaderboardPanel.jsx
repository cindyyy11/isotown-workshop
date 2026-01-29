import React from 'react';

export default function LeaderboardPanel({
  enabled,
  items = [],
  loading,
  publishing,
  onPublish,
  onRefresh,
}) {
  return (
    <div className="panel">
      <h3 className="panel-title">Leaderboard</h3>
      {!enabled ? (
        <p className="panel-muted">Not enabled. Start the server to use this feature.</p>
      ) : (
        <>
          <div className="panel-actions">
            <button className="panel-btn" onClick={onPublish} disabled={publishing}>
              {publishing ? 'Publishing...' : 'Publish Score'}
            </button>
            <button className="panel-btn panel-btn-secondary" onClick={onRefresh} disabled={loading}>
              {loading ? 'Loading...' : 'Refresh'}
            </button>
          </div>
          {items.length === 0 ? (
            <p className="panel-muted">No scores yet.</p>
          ) : (
            <ul className="leaderboard-list">
              {items.map((item, index) => (
                <li key={item.id} className="leaderboard-item">
                  <span className="leaderboard-rank">{index + 1}</span>
                  <span className="leaderboard-score">{item.score}</span>
                  <span className="leaderboard-time">{new Date(item.createdAt).toLocaleString()}</span>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
