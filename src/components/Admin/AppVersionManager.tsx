import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAndroid, faApple } from '@fortawesome/free-brands-svg-icons';
import { faSave, faSpinner, faCheckCircle, faExclamationCircle, faLock } from '@fortawesome/free-solid-svg-icons';

interface AppVersionData {
  version: string;
  minVersion: string;
  changelog: string;
  androidUrl: string;
  forceUpdate: boolean;
  uploadLimit: number;
}

interface AppVersionManagerProps {
  isSuperAdmin?: boolean;
}

export default function AppVersionManager({ isSuperAdmin = false }: AppVersionManagerProps) {
  const [data, setData] = useState<AppVersionData>({
    version: '',
    minVersion: '',
    changelog: '',
    androidUrl: '',
    forceUpdate: false,
    uploadLimit: 20,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchVersion();
  }, []);

  const fetchVersion = async () => {
    try {
      const res = await fetch('/api/app-version');
      const json = await res.json();
      if (json.success) {
        setData({
          version: json.version,
          minVersion: json.minVersion,
          changelog: json.changelog || '',
          androidUrl: json.downloadUrl?.android || '',
          forceUpdate: json.forceUpdate || false,
          uploadLimit: json.uploadLimit || 20,
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isSuperAdmin) {
      setMessage({ type: 'error', text: 'Only super admin can update configuration.' });
      return;
    }
    
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch('/api/app-version', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      
      if (json.success) {
        setMessage({ type: 'success', text: 'App version updated successfully!' });
      } else {
        throw new Error(json.error || 'Failed to update');
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="loading"><FontAwesomeIcon icon={faSpinner} spin size="2x"/></div>;

  return (
    <div className="table-section" style={{ padding: '30px' }}>
      <div className="table-header" style={{ borderBottom: 'none', paddingLeft: 0 }}>
        <h3>Manage Mobile App Version</h3>
      </div>

      {!isSuperAdmin && (
        <div style={{ 
          background: 'rgba(251, 146, 60, 0.1)', 
          border: '1px solid rgba(251, 146, 60, 0.3)',
          borderRadius: '10px',
          padding: '16px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          color: '#fb923c'
        }}>
          <FontAwesomeIcon icon={faLock} />
          <span>Only super admin can modify these settings. You have read-only access.</span>
        </div>
      )}

      {message && (
        <div className={message.type === 'success' ? 'success' : 'error'}>
          <FontAwesomeIcon icon={message.type === 'success' ? faCheckCircle : faExclamationCircle} style={{marginRight: '8px'}} />
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ maxWidth: '600px' }}>
        <div className="form-group">
          <label>Current Version</label>
          <input
            type="text"
            value={data.version}
            onChange={(e) => setData({ ...data, version: e.target.value })}
            placeholder="e.g. 1.0.0"
            required
            disabled={!isSuperAdmin}
            style={!isSuperAdmin ? { opacity: 0.6, cursor: 'not-allowed' } : {}}
          />
        </div>

        <div className="form-group">
          <label>Minimum Required Version</label>
          <input
            type="text"
            value={data.minVersion}
            onChange={(e) => setData({ ...data, minVersion: e.target.value })}
            placeholder="e.g. 1.0.0"
            required
            disabled={!isSuperAdmin}
            style={!isSuperAdmin ? { opacity: 0.6, cursor: 'not-allowed' } : {}}
          />
          <small style={{ color: 'var(--dash-text-secondary)', marginTop: '4px', display: 'block' }}>
            Users on versions below this will be forced to update.
          </small>
        </div>

        <div className="form-group">
          <label>Android APK Filename (in public folder)</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FontAwesomeIcon icon={faAndroid} color="#3DDC84" />
            <input
              type="text"
              value={data.androidUrl}
              onChange={(e) => setData({ ...data, androidUrl: e.target.value })}
              placeholder="/android-app.apk"
              required
              disabled={!isSuperAdmin}
              style={!isSuperAdmin ? { opacity: 0.6, cursor: 'not-allowed' } : {}}
            />
          </div>
        </div>

        <div className="form-group">
          <label>Changelog / Update Message</label>
          <textarea
            value={data.changelog}
            onChange={(e) => setData({ ...data, changelog: e.target.value })}
            placeholder="What's new in this update?"
            disabled={!isSuperAdmin}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '10px',
              border: '1px solid var(--dash-border)',
              background: 'var(--dash-card-bg)',
              color: 'var(--dash-text)',
              minHeight: '100px',
              fontSize: '0.9rem',
              outline: 'none',
              fontFamily: 'inherit',
              ...(! isSuperAdmin ? { opacity: 0.6, cursor: 'not-allowed' } : {})
            }}
          />
        </div>

        <div className="form-group">
          <label>Song Upload Limit (MB)</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <input
              type="number"
              min="1"
              max="100"
              value={data.uploadLimit}
              onChange={(e) => setData({ ...data, uploadLimit: parseInt(e.target.value) || 20 })}
              placeholder="20"
              required
              disabled={!isSuperAdmin}
              style={{ 
                width: '100px',
                ...(! isSuperAdmin ? { opacity: 0.6, cursor: 'not-allowed' } : {})
              }}
            />
            <span style={{ color: 'var(--dash-text-secondary)' }}>MB</span>
          </div>
          <small style={{ color: 'var(--dash-text-secondary)', marginTop: '4px', display: 'block' }}>
            Maximum file size admins can upload for songs (1-100 MB).
          </small>
        </div>
        
        <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
             <input 
                type="checkbox" 
                id="forceUpdate"
                checked={data.forceUpdate}
                onChange={(e) => setData({...data, forceUpdate: e.target.checked})}
                style={{ width: 'auto' }}
                disabled={!isSuperAdmin}
             />
             <label htmlFor="forceUpdate" style={{ margin: 0, ...(! isSuperAdmin ? { opacity: 0.6 } : {}) }}>Force Update (Maintenance Mode)</label>
        </div>

        {isSuperAdmin && (
          <button type="submit" className="submit-btn" disabled={saving}>
            {saving ? <FontAwesomeIcon icon={faSpinner} spin /> : <FontAwesomeIcon icon={faSave} />}
            {saving ? 'Saving...' : 'Update Configuration'}
          </button>
        )}
      </form>
    </div>
  );
}
