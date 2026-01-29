import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { FaUsers, FaCrown, FaVoteYea, FaClock, FaCheckCircle, FaCopy, FaRandom } from 'react-icons/fa';
import { getSocketUrl } from '../services/serverService.js';

const VOTE_OPTIONS = ['HOUSE', 'CAFE', 'OFFICE', 'ROAD', 'ERASE'];

// Generate random room code (e.g., "WORKSHOP-ABC123")
function generateRoomCode() {
  const prefix = 'WORKSHOP';
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Exclude confusing chars
  const suffix = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `${prefix}-${suffix}`;
}

export default function WorkshopPanel({
  enabled,
  cityState,
  onApplyVote,
  onReceiveState,
  onLog,
}) {
  const [roomId, setRoomId] = useState(() => generateRoomCode());
  const [role, setRole] = useState('host');
  const [votes, setVotes] = useState({ HOUSE: 0, CAFE: 0, OFFICE: 0, ROAD: 0, ERASE: 0 });
  const [remainingMs, setRemainingMs] = useState(0);
  const [connected, setConnected] = useState(false);
  const [joined, setJoined] = useState(false);
  const [participantCount, setParticipantCount] = useState(0);
  const socketRef = useRef(null);

  const winningVote = useMemo(() => {
    let best = 'HOUSE';
    let bestCount = -1;
    VOTE_OPTIONS.forEach(option => {
      const count = votes[option] || 0;
      if (count > bestCount) {
        bestCount = count;
        best = option;
      }
    });
    return { option: best, count: bestCount };
  }, [votes]);

  // Use refs for callbacks to avoid dependency issues
  const onReceiveStateRef = useRef(onReceiveState);
  const onLogRef = useRef(onLog);

  useEffect(() => {
    onReceiveStateRef.current = onReceiveState;
    onLogRef.current = onLog;
  }, [onReceiveState, onLog]);

  useEffect(() => {
    if (!enabled) {
      // Clean up if disabled
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setConnected(false);
        setJoined(false);
      }
      return;
    }

    // Only create socket if it doesn't exist and is not already connected
    if (socketRef.current?.connected) {
      return;
    }

    // Clean up existing socket if it exists but isn't connected
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    const socket = io(getSocketUrl(), { 
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      autoConnect: true,
    });
    socketRef.current = socket;

    const handleConnect = () => {
      setConnected(true);
      onLogRef.current('Connected to workshop server.');
    };

    const handleDisconnect = () => {
      setConnected(false);
      onLogRef.current('Disconnected from workshop server.');
    };

    const handleStateUpdate = (payload) => {
      if (payload?.state) {
        onReceiveStateRef.current(payload.state);
        onLogRef.current('Received city update from host.');
      }
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('vote_update', (payload) => {
      if (payload?.votes) setVotes(payload.votes);
    });
    socket.on('timer_tick', (payload) => {
      if (typeof payload?.remainingMs === 'number') {
        setRemainingMs(payload.remainingMs);
      }
    });
    socket.on('state_update', handleStateUpdate);
    socket.on('participant_count', (payload) => {
      if (typeof payload?.count === 'number') {
        setParticipantCount(payload.count);
      }
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.off('connect', handleConnect);
        socketRef.current.off('disconnect', handleDisconnect);
        socketRef.current.off('vote_update');
        socketRef.current.off('timer_tick');
        socketRef.current.off('state_update', handleStateUpdate);
        socketRef.current.off('participant_count');
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [enabled]); // Only depend on enabled, not the callbacks

  const handleGenerateCode = () => {
    setRoomId(generateRoomCode());
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(roomId).then(() => {
      onLog('Room code copied to clipboard!');
    }).catch(() => {
      onLog('Failed to copy room code.');
    });
  };

  const handleJoin = () => {
    if (!socketRef.current || !roomId) return;
    socketRef.current.emit('join_room', { roomId, role });
    setJoined(true);
    onLog(`${role === 'host' ? 'Host' : 'Audience'} joined room ${roomId}.`);
  };

  const handleStartVote = () => {
    if (!socketRef.current || !roomId) return;
    socketRef.current.emit('start_vote', { roomId, durationMs: 30000 });
    setVotes({ HOUSE: 0, CAFE: 0, OFFICE: 0, ROAD: 0, ERASE: 0 });
    setRemainingMs(30000);
    onLog('Voting started.');
  };

  const handleCastVote = (vote) => {
    if (!socketRef.current || !roomId) return;
    socketRef.current.emit('cast_vote', { roomId, vote });
  };

  const handleApplyWinning = () => {
    if (!cityState) return;
    const updatedState = onApplyVote(winningVote.option);
    if (socketRef.current && updatedState) {
      socketRef.current.emit('state_update', { roomId, state: updatedState });
    }
    onLog(`Applied winning vote: ${winningVote.option}.`);
  };

  return (
    <div className="workshop-panel-container">
      <div className="workshop-header">
        <h3 className="workshop-title">
          {role === 'host' ? <FaCrown /> : <FaUsers />} Workshop Mode
        </h3>
        {joined && (
          <div className="workshop-status">
            <span className={`status-indicator ${connected ? 'connected' : 'disconnected'}`} />
            {connected ? 'Connected' : 'Disconnected'}
            {role === 'host' && participantCount > 0 && (
              <span className="participant-count">
                <FaUsers /> {participantCount} participant{participantCount !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        )}
      </div>

      {!enabled ? (
        <p className="workshop-muted">Server not running. Start the server to use Workshop Mode.</p>
      ) : !connected ? (
        <p className="workshop-muted">Connecting to server...</p>
      ) : !joined ? (
        <div className="workshop-join">
          <div className="workshop-room-section">
            <label htmlFor="room-id" className="workshop-label">Room Code</label>
            <div className="workshop-room-input-group">
              <input
                id="room-id"
                type="text"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                className="workshop-input"
                placeholder="WORKSHOP-XXXX"
                maxLength={20}
              />
              <button
                type="button"
                className="workshop-btn-icon"
                onClick={handleGenerateCode}
                title="Generate random code"
              >
                <FaRandom />
              </button>
              <button
                type="button"
                className="workshop-btn-icon"
                onClick={handleCopyCode}
                title="Copy room code"
              >
                <FaCopy />
              </button>
            </div>
            <p className="workshop-hint">Share this code with participants</p>
          </div>

          <div className="workshop-role-section">
            <label htmlFor="role-select" className="workshop-label">Your Role</label>
            <select
              id="role-select"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="workshop-select"
            >
              <option value="host">
                <FaCrown /> Host (Speaker) - Control city, start votes
              </option>
              <option value="audience">
                <FaUsers /> Audience (Participant) - Vote on actions
              </option>
            </select>
          </div>

          <button
            className="workshop-btn workshop-btn-primary"
            onClick={handleJoin}
            disabled={!roomId.trim()}
          >
            Join Room
          </button>
        </div>
      ) : (
        <div className="workshop-active">

          {role === 'host' ? (
            <>
              <div className="workshop-host-controls">
                <button
                  className="workshop-btn workshop-btn-primary"
                  onClick={handleStartVote}
                  disabled={remainingMs > 0}
                >
                  <FaVoteYea /> Start Vote (30s)
                </button>
                {remainingMs > 0 && (
                  <div className="workshop-timer">
                    <FaClock /> {Math.ceil(remainingMs / 1000)}s remaining
                  </div>
                )}
                {remainingMs === 0 && winningVote.count > 0 && (
                  <button
                    className="workshop-btn workshop-btn-success"
                    onClick={handleApplyWinning}
                  >
                    <FaCheckCircle /> Apply {winningVote.option} ({winningVote.count} votes)
                  </button>
                )}
              </div>

              <div className="workshop-vote-results">
                <h4 className="workshop-section-title">Vote Results</h4>
                <div className="workshop-vote-grid">
                  {VOTE_OPTIONS.map(option => {
                    const count = votes[option] || 0;
                    const isWinning = winningVote.option === option && count > 0;
                    return (
                      <div
                        key={option}
                        className={`workshop-vote-card ${isWinning ? 'winning' : ''}`}
                      >
                        <span className="vote-option">{option}</span>
                        <span className="vote-count">{count}</span>
                        {isWinning && <span className="vote-badge">WINNER</span>}
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            <>
              {remainingMs > 0 ? (
                <>
                  <div className="workshop-audience-timer">
                    <FaClock /> {Math.ceil(remainingMs / 1000)}s remaining
                  </div>
                  <div className="workshop-audience-votes">
                    <h4 className="workshop-section-title">Cast Your Vote</h4>
                    <div className="workshop-vote-buttons">
                      {VOTE_OPTIONS.map(option => (
                        <button
                          key={option}
                          className="workshop-vote-btn"
                          onClick={() => handleCastVote(option)}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="workshop-waiting">
                  <p>Waiting for host to start a vote...</p>
                </div>
              )}

              <div className="workshop-vote-results">
                <h4 className="workshop-section-title">Current Votes</h4>
                <div className="workshop-vote-grid">
                  {VOTE_OPTIONS.map(option => {
                    const count = votes[option] || 0;
                    return (
                      <div key={option} className="workshop-vote-card">
                        <span className="vote-option">{option}</span>
                        <span className="vote-count">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
