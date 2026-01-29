import React, { useState, useEffect, useCallback } from 'react';
import { FaCloudUploadAlt, FaCloudDownloadAlt, FaTrash, FaSave, FaPlus, FaTimes } from 'react-icons/fa';
import {
  isSavesApiAvailable,
  listSaves,
  getSave,
  createSave,
  updateSave,
  deleteSave,
} from '../services/savesApiService.js';

/**
 * SavesPanel – CRUD UI for cloud saves (MockAPI.io)
 * Create, Read (list + load), Update, Delete
 */
export default function SavesPanel({
  isOpen,
  onClose,
  cityState,
  zone,
  currentSaveId,
  onLoadSave,
  onCurrentSaveIdChange,
}) {
  const [saves, setSaves] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [saveName, setSaveName] = useState('');
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const available = isSavesApiAvailable();

  const loadList = useCallback(async () => {
    if (!available) return;
    setLoading(true);
    setError('');
    try {
      const data = await listSaves();
      setSaves(Array.isArray(data) ? data : []);
    } catch (e) {
      // ===== TODO #6 (Easy - UX): Improve this error message =====
      // Current error is generic. Make it helpful!
      //
      // BETTER OPTIONS:
      // - 'Cannot connect to MockAPI. Check VITE_MOCKAPI_BASE_URL in .env'
      // - 'Network error. Check internet connection and MockAPI project status'
      // - Include the actual error: `MockAPI error: ${e.message}`
      //
      // WHY: Good error messages save debugging time
      // LEARN: Always tell users WHAT failed and HOW to fix it
      setError(e.message || 'Failed to list saves');
      setSaves([]);
    } finally {
      setLoading(false);
    }
  }, [available]);

  useEffect(() => {
    if (isOpen && available) loadList();
  }, [isOpen, available, loadList]);

  const handleLoad = async (id) => {
    setError('');
    try {
      const save = await getSave(id);
      if (save?.snapshot) {
        onLoadSave?.(save);
        onCurrentSaveIdChange?.(save.id);
        onClose?.();
      } else {
        setError('Invalid save data');
      }
    } catch (e) {
      // ===== TODO #7 (Easy - UX): Improve error handling =====
      // TASK: Make this error message more specific
      // Example: 'Save not found. It may have been deleted.' (if 404)
      // Example: 'Network error loading save. Check connection.' (if network)
      setError(e.message || 'Failed to load save');
    }
  };

  const handleSave = async (asNew = false) => {
    if (!cityState || !zone) {
      setError('No city to save');
      return;
    }
    const name = (saveName || zone?.label || 'Unnamed City').trim() || 'Unnamed City';
    setSaving(true);
    setError('');
    try {
      const payload = {
        name,
        zoneLabel: zone?.label || 'Unknown',
        zoneLat: zone?.lat ?? 0,
        zoneLon: zone?.lon ?? 0,
        snapshot: { ...cityState },
      };
      if (!asNew && currentSaveId) {
        await updateSave(currentSaveId, payload);
        onCurrentSaveIdChange?.(currentSaveId);
      } else {
        const created = await createSave(payload);
        onCurrentSaveIdChange?.(created.id);
        await loadList();
      }
      setSaveName('');
      onClose?.();
    } catch (e) {
      setError(e.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    setDeletingId(id);
    setError('');
    try {
      await deleteSave(id);
      if (currentSaveId === id) onCurrentSaveIdChange?.(null);
      await loadList();
    } catch (e) {
      setError(e.message || 'Failed to delete');
    } finally {
      setDeletingId(null);
    }
  };

  if (!isOpen) return null;
  if (!available) {
    return (
      <div className="saves-panel-overlay" onClick={onClose}>
        <div className="saves-panel" onClick={(e) => e.stopPropagation()}>
          <div className="saves-panel-header">
            <h3>Cloud Saves (CRUD)</h3>
            <button type="button" className="saves-panel-close" onClick={onClose}><FaTimes /></button>
          </div>
          <p className="saves-panel-muted">
            Set <code>VITE_MOCKAPI_BASE_URL</code> in <code>.env</code> and create a <code>citysaves</code> resource on MockAPI.io. See <code>ENDPOINTS.md</code>.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="saves-panel-overlay" onClick={onClose}>
      <div className="saves-panel" onClick={(e) => e.stopPropagation()}>
        <div className="saves-panel-header">
          <h3><FaCloudUploadAlt /> Cloud Saves – CRUD</h3>
          <button type="button" className="saves-panel-close" onClick={onClose}><FaTimes /></button>
        </div>

        {error && (
          <div className="saves-panel-error">{error}</div>
        )}

        <div className="saves-panel-actions">
          <div className="saves-save-row">
            <input
              type="text"
              className="saves-name-input"
              placeholder="Save name (e.g. My City)"
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
            />
            <button
              type="button"
              className="control-btn control-btn-primary"
              disabled={saving || !cityState}
              onClick={() => handleSave(false)}
            >
              <FaSave /> {currentSaveId ? 'Update' : 'Save'}
            </button>
            {currentSaveId && (
              <button
                type="button"
                className="control-btn control-btn-secondary"
                disabled={saving || !cityState}
                onClick={() => handleSave(true)}
              >
                <FaPlus /> Save as new
              </button>
            )}
          </div>
        </div>

        <div className="saves-list-section">
          <h4><FaCloudDownloadAlt /> Load a save</h4>
          {loading ? (
            <p className="saves-panel-muted">Loading…</p>
          ) : saves.length === 0 ? (
            <p className="saves-panel-muted">No saves yet. Save your city to get started.</p>
          ) : (
            <ul className="saves-list">
              {saves.map((s) => (
                <li key={s.id} className="saves-list-item">
                  <div className="saves-list-info">
                    <span className="saves-list-name">{s.name || 'Unnamed'}</span>
                    <span className="saves-list-meta">
                      {s.zoneLabel} · {s.snapshot?.population ?? 0} pop · {s.snapshot?.coins ?? 0} coins
                    </span>
                  </div>
                  <div className="saves-list-btns">
                    <button
                      type="button"
                      className="saves-btn saves-btn-load"
                      onClick={() => handleLoad(s.id)}
                    >
                      <FaCloudDownloadAlt /> Load
                    </button>
                    <button
                      type="button"
                      className="saves-btn saves-btn-delete"
                      disabled={deletingId === s.id}
                      onClick={() => handleDelete(s.id)}
                    >
                      <FaTrash /> {deletingId === s.id ? '…' : 'Delete'}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
