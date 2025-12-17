'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faMusic,
  faPlus,
  faEdit,
  faTrash,
  faUpload,
  faSignOutAlt,
  faTimes,
  faSpinner,
  faCheck,
  faCompactDisc,
  faSearch,
  faChevronLeft,
  faChevronRight,
  faLink,
  faImage,
  faUser,
  faUsers,
  faCrown,
  faMobileAlt,
} from '@fortawesome/free-solid-svg-icons';
import { defaultCoverImages } from '@/util';
import AppVersionManager from '@/components/Admin/AppVersionManager';

interface Song {
  id: string;
  name: string;
  artist: string;
  cover: string;
  audio: string;
  color: [string, string];
  active: boolean;

  addedBy?: string;
  playCount?: number;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface SongFormData {
  name: string;
  artist: string;
  cover: string;
  audio: string;
  color: [string, string];
  playCount: number;
}

const initialFormData: SongFormData = {
  name: '',
  artist: '',
  cover: '',
  audio: '',
  color: ['#667eea', '#764ba2'],
  playCount: 0,
};

export default function AdminDashboardPage() {
  const router = useRouter();
  const [activeView, setActiveView] = useState<'songs' | 'mobile'>('songs');
  const [songs, setSongs] = useState<Song[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<SongFormData>(initialFormData);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [coverMode, setCoverMode] = useState<'url' | 'default'>('default');
  const [showCoverPicker, setShowCoverPicker] = useState(false);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [adminEmail, setAdminEmail] = useState<string>('');
  const [adminRole, setAdminRole] = useState<string>('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingSongId, setDeletingSongId] = useState<string | null>(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const isSuperAdmin = adminRole === 'super_admin';

  const fetchSongs = useCallback(async (page: number = 1, search: string = '') => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
      });
      if (search) {
        params.append('search', search);
      }

      const response = await fetch(`/api/songs?${params}`);
      if (!response.ok) throw new Error('Failed to fetch songs');
      
      const data = await response.json();
      setSongs(data.songs || []);
      setPagination(data.pagination || { page: 1, limit: 10, total: 0, totalPages: 0 });
    } catch (err) {
      setError('Failed to load songs');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Check authentication via API (httpOnly cookie is not readable by JS)
    const checkAuthAndLoad = async () => {
      try {
        const authRes = await fetch('/api/auth/me');
        const authData = await authRes.json();
        
        if (!authRes.ok || !authData.email) {
          // Not authenticated, redirect to login
          router.replace('/admin/login');
          return;
        }
        
        // Set admin email and role
        setAdminEmail(authData.email);
        setAdminRole(authData.role || 'admin');
        
        // Load songs
        fetchSongs(1, '');
      } catch (error) {
        // Error checking auth, redirect to login
        router.replace('/admin/login');
      }
    };
    
    checkAuthAndLoad();
  }, [router, fetchSongs]);

  // Check if current user can edit/delete a song
  const canModifySong = (song: Song) => {
    return isSuperAdmin || song.addedBy === adminEmail;
  };

  // Debounced search
  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      setSearchQuery(value);
      fetchSongs(1, value);
    }, 300);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchSongs(newPage, searchQuery);
    }
  };

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    document.cookie = 'admin_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    router.push('/admin/login');
  };

  const handleUploadAudio = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadProgress(0);
    setError('');

    const formDataUpload = new FormData();
    formDataUpload.append('file', file);
    formDataUpload.append('type', 'audio');

    const xhr = new XMLHttpRequest();
    
    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable) {
        const percentComplete = Math.round((event.loaded / event.total) * 100);
        setUploadProgress(percentComplete);
      }
    });

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText);
          setFormData((prev) => ({ ...prev, audio: data.url }));
        } catch {
          setError('Invalid response from server');
        }
      } else {
        try {
          const data = JSON.parse(xhr.responseText);
          setError(data.error || 'Upload failed');
        } catch {
          setError('Upload failed');
        }
      }
      setUploading(false);
      setUploadProgress(0);
    });

    xhr.addEventListener('error', () => {
      setError('Upload failed - network error');
      setUploading(false);
      setUploadProgress(0);
    });

    xhr.open('POST', '/api/upload');
    xhr.send(formDataUpload);
  };

  const handleSelectCover = (url: string) => {
    setFormData((prev) => ({ ...prev, cover: url }));
    setShowCoverPicker(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const url = editingId ? `/api/songs/${editingId}` : '/api/songs';
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save song');
      }

      await fetchSongs(pagination.page, searchQuery);
      closeModal();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (song: Song) => {
    setEditingId(song.id);
    setFormData({
      name: song.name,
      artist: song.artist,
      cover: song.cover,
      audio: song.audio,
      color: song.color,
      playCount: song.playCount || 0,
    });
    // Check if cover is a default image
    const isDefault = defaultCoverImages.some((img) => img.url === song.cover);
    setCoverMode(isDefault ? 'default' : 'url');
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    setDeletingSongId(id);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!deletingSongId) return;
    
    try {
      const response = await fetch(`/api/songs/${deletingSongId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete song');
      }

      await fetchSongs(pagination.page, searchQuery);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setShowDeleteConfirm(false);
      setDeletingSongId(null);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData(initialFormData);
    setError('');
    setCoverMode('default');
    setShowCoverPicker(false);
  };

  return (
    <div className="admin-dashboard-new">


      {/* Main Content */}
      <div className="main-content">
        {/* Header */}
        <div className="dashboard-header">
          <div className="header-title">
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '5px' }}>
                <h1 style={{ margin: 0 }}>{activeView === 'songs' ? 'Music Library' : 'Mobile App Settings'}</h1>
                <div className="view-switcher" style={{ display: 'flex', gap: '8px', background: 'rgba(255,255,255,0.05)', padding: '4px', borderRadius: '8px' }}>
                    <button 
                        onClick={() => setActiveView('songs')}
                        style={{
                            background: activeView === 'songs' ? 'var(--accent-color)' : 'transparent',
                            color: activeView === 'songs' ? 'white' : 'var(--text-secondary)',
                            border: 'none',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '0.85rem',
                            fontWeight: '600',
                            transition: 'all 0.2s ease',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                        }}
                    >
                        <FontAwesomeIcon icon={faMusic} size="sm"/> Music
                    </button>
                    <button 
                         onClick={() => setActiveView('mobile')}
                         style={{
                            background: activeView === 'mobile' ? 'var(--accent-color)' : 'transparent',
                            color: activeView === 'mobile' ? 'white' : 'var(--text-secondary)',
                            border: 'none',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '0.85rem',
                            fontWeight: '600',
                            transition: 'all 0.2s ease',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                        }}
                    >
                        <FontAwesomeIcon icon={faMobileAlt} size="sm"/> App
                    </button>
                </div>
            </div>
            <p>{activeView === 'songs' ? 'Manage your music collection' : 'Manage app versions and downloads'}</p>
          </div>
          <div className="header-actions">
            <div className="user-profile">
              <div className="user-avatar">
                <FontAwesomeIcon icon={isSuperAdmin ? faCrown : faUser} />
              </div>
              <div className="user-info">
                <span className="user-email">{adminEmail}</span>
                {isSuperAdmin && <span className="role-badge super">Super Admin</span>}
              </div>
            </div>
            {isSuperAdmin && (
              <button className="manage-admins-btn" onClick={() => router.push('/admin/manage-admins')}>
                <FontAwesomeIcon icon={faUsers} />
                <span>Manage Admins</span>
              </button>
            )}
            <button className="logout-btn" onClick={handleLogout}>
              <FontAwesomeIcon icon={faSignOutAlt} />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Page Content */}
        <main className="page-content">
          {activeView === 'songs' ? (
            <>
              {/* Stats Row */}
              <div className="stats-row">
                <div className="stat-card">
                  <div className="stat-icon">
                    <FontAwesomeIcon icon={faMusic} />
                  </div>
                  <div className="stat-info">
                    <span className="stat-value">{pagination.total}</span>
                    <span className="stat-label">Total Songs</span>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon accent">
                    <FontAwesomeIcon icon={faCompactDisc} />
                  </div>
                  <div className="stat-info">
                    <span className="stat-value">{pagination.total > 0 ? 'Active' : 'Empty'}</span>
                    <span className="stat-label">Library Status</span>
                  </div>
                </div>
              </div>

              {/* Quick Action */}
              <div className="quick-action">
                <button className="add-song-btn" onClick={() => setShowModal(true)}>
                  <FontAwesomeIcon icon={faPlus} />
                  <span>Add New Song</span>
                </button>
              </div>

              {/* Songs Table */}
              <div className="table-section">
                <div className="table-header">
                  <h3>Music Library</h3>
                  <div className="table-controls">
                    <div className="search-box">
                      <FontAwesomeIcon icon={faSearch} />
                      <input
                        type="text"
                        placeholder="Search songs or artists..."
                        value={searchInput}
                        onChange={(e) => handleSearchChange(e.target.value)}
                      />
                    </div>
                    <span className="song-count">{pagination.total} songs</span>
                  </div>
                </div>

                {loading ? (
                  <>
                    {/* Desktop Skeleton */}
                    <div className="table-container desktop-only">
                      <table className="songs-table">
                        <thead>
                          <tr>
                            <th>Song Name</th>
                            <th>Artist</th>
                            <th>Status</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {[1, 2, 3, 4, 5].map((i) => (
                            <tr key={i} className="skeleton-row">
                              <td>
                                <div className="skeleton-cell">
                                  <div className="skeleton skeleton-thumb"></div>
                                  <div className="skeleton skeleton-text"></div>
                                </div>
                              </td>
                              <td><div className="skeleton skeleton-text-short"></div></td>
                              <td><div className="skeleton skeleton-badge"></div></td>
                              <td>
                                <div className="skeleton-actions">
                                  <div className="skeleton skeleton-btn"></div>
                                  <div className="skeleton skeleton-btn"></div>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile Skeleton */}
                    <div className="cards-container mobile-only">
                      {[1, 2, 3, 4].map((i) => (
                        <div className="song-card skeleton-card" key={i}>
                          <div className="card-top">
                            <div className="skeleton skeleton-cover"></div>
                            <div className="card-info">
                              <div className="skeleton skeleton-title"></div>
                              <div className="skeleton skeleton-subtitle"></div>
                              <div className="skeleton skeleton-badge"></div>
                            </div>
                          </div>
                          <div className="card-actions">
                            <div className="skeleton skeleton-action-btn"></div>
                            <div className="skeleton skeleton-action-btn"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : songs.length === 0 ? (
                  <div className="empty-state">
                    <FontAwesomeIcon icon={faMusic} size="2x" />
                    <h4>{searchQuery ? 'No songs found' : 'No songs yet'}</h4>
                    <p>{searchQuery ? 'Try a different search term' : 'Click "Add New Song" to get started'}</p>
                  </div>
                ) : (
                  <>
                    {/* Desktop Table View */}
                    <div className="table-container desktop-only">
                      <table className="songs-table">
                        <thead>
                          <tr>
                            <th>Song Name</th>
                            <th>Artist</th>
                            <th>Plays</th>
                            <th>Added By</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {songs.map((song) => (
                            <tr key={song.id}>
                              <td>
                                <div className="song-cell">
                                  <img src={song.cover} alt={song.name} className="song-thumb" />
                                  <span>{song.name}</span>
                                </div>
                              </td>
                              <td>{song.artist}</td>
                              <td>
                                  <span className="play-count-badge">
                                      {song.playCount || 0}
                                  </span>
                              </td>
                              <td>
                                <span className={`added-by-badge ${song.addedBy === adminEmail ? 'own' : ''}`}>
                                  {song.addedBy === adminEmail ? 'You' : (song.addedBy || 'Unknown')}
                                </span>
                              </td>
                              <td>
                                <div className="action-btns">
                                  {canModifySong(song) ? (
                                    <>
                                      <button className="action-btn edit" onClick={() => handleEdit(song)}>
                                        <FontAwesomeIcon icon={faEdit} /> Edit
                                      </button>
                                      <button className="action-btn delete" onClick={() => handleDelete(song.id)}>
                                        <FontAwesomeIcon icon={faTrash} /> Delete
                                      </button>
                                    </>
                                  ) : (
                                    <span className="no-permission">View only</span>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile Card View */}
                    <div className="cards-container mobile-only">
                      {songs.map((song) => (
                        <div className="song-card" key={song.id}>
                          <div className="card-top">
                            <img src={song.cover} alt={song.name} className="card-cover" />
                            <div className="card-info">
                              <h4 className="card-title">{song.name}</h4>
                              <p className="card-artist">{song.artist}</p>
                              <span className={`added-by-badge ${song.addedBy === adminEmail ? 'own' : ''}`}>
                                {song.addedBy === adminEmail ? 'Added by you' : `By: ${song.addedBy || 'Unknown'}`}
                              </span>
                              <span className="mobile-play-count">
                                  <FontAwesomeIcon icon={faMusic} size="xs" /> {song.playCount || 0} plays
                              </span>
                            </div>
                          </div>
                          <div className="card-actions">
                            {canModifySong(song) ? (
                              <>
                                <button className="action-btn edit" onClick={() => handleEdit(song)}>
                                  <FontAwesomeIcon icon={faEdit} /> Edit
                                </button>
                                <button className="action-btn delete" onClick={() => handleDelete(song.id)}>
                                  <FontAwesomeIcon icon={faTrash} /> Delete
                                </button>
                              </>
                            ) : (
                              <span className="no-permission">View only</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Pagination */}
                    {pagination.totalPages > 1 && (
                      <div className="pagination">
                        <button
                          className="pagination-btn"
                          onClick={() => handlePageChange(pagination.page - 1)}
                          disabled={pagination.page <= 1}
                        >
                          <FontAwesomeIcon icon={faChevronLeft} />
                        </button>
                        
                        <div className="pagination-info">
                          <span>Page {pagination.page} of {pagination.totalPages}</span>
                        </div>

                        <button
                          className="pagination-btn"
                          onClick={() => handlePageChange(pagination.page + 1)}
                          disabled={pagination.page >= pagination.totalPages}
                        >
                          <FontAwesomeIcon icon={faChevronRight} />
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </>
          ) : (
            <AppVersionManager />
          )}
        </main>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingId ? 'Edit Song' : 'Add New Song'}</h2>
              <button className="close-btn" onClick={closeModal}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            <div className="modal-body">
              {error && <div className="error-msg">{error}</div>}
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Song Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter song name"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Artist</label>
                  <input
                    type="text"
                    value={formData.artist}
                    onChange={(e) => setFormData({ ...formData, artist: e.target.value })}
                    placeholder="Enter artist name"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Play Count (Read Only)</label>
                  <input
                    type="number"
                    value={formData.playCount}
                    disabled
                    style={{ opacity: 0.7, cursor: 'not-allowed' }}
                  />
                </div>

                {/* Cover Image Section */}
                <div className="form-group">
                  <label>Cover Image</label>
                  <div className="cover-tabs">
                    <button
                      type="button"
                      className={`cover-tab ${coverMode === 'default' ? 'active' : ''}`}
                      onClick={() => setCoverMode('default')}
                    >
                      <FontAwesomeIcon icon={faImage} /> Default Images
                    </button>
                    <button
                      type="button"
                      className={`cover-tab ${coverMode === 'url' ? 'active' : ''}`}
                      onClick={() => setCoverMode('url')}
                    >
                      <FontAwesomeIcon icon={faLink} /> Image URL
                    </button>
                  </div>

                  {coverMode === 'url' ? (
                    <input
                      type="url"
                      value={formData.cover}
                      onChange={(e) => setFormData({ ...formData, cover: e.target.value })}
                      placeholder="https://..."
                      required={coverMode === 'url'}
                    />
                  ) : (
                    <div className="cover-picker">
                      {formData.cover && (
                        <div className="selected-cover">
                          <img src={formData.cover} alt="Selected cover" />
                          <span>Selected</span>
                        </div>
                      )}
                      <button
                        type="button"
                        className="choose-cover-btn"
                        onClick={() => setShowCoverPicker(!showCoverPicker)}
                      >
                        {formData.cover ? 'Change Image' : 'Choose Image'}
                      </button>
                      
                      {showCoverPicker && (
                        <div className="cover-grid">
                          {defaultCoverImages.map((img) => (
                            <div
                              key={img.id}
                              className={`cover-option ${formData.cover === img.url ? 'selected' : ''}`}
                              onClick={() => handleSelectCover(img.url)}
                            >
                              <img src={img.url} alt={img.name} />
                              {formData.cover === img.url && (
                                <div className="cover-check">
                                  <FontAwesomeIcon icon={faCheck} />
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label>Audio File</label>
                  <input
                    type="file"
                    ref={audioInputRef}
                    accept="audio/*"
                    onChange={handleUploadAudio}
                    style={{ display: 'none' }}
                  />
                  <div
                    className={`upload-area ${formData.audio ? 'has-file' : ''} ${uploading ? 'uploading' : ''}`}
                    onClick={() => !uploading && audioInputRef.current?.click()}
                  >
                    {uploading ? (
                      <div className="upload-progress">
                        <div className="progress-bar">
                          <div className="progress-fill" style={{ width: `${uploadProgress}%` }} />
                        </div>
                        <span>Uploading... {uploadProgress}%</span>
                      </div>
                    ) : formData.audio ? (
                      <>
                        <FontAwesomeIcon icon={faCheck} /> Audio uploaded
                      </>
                    ) : (
                      <>
                        <FontAwesomeIcon icon={faUpload} /> Click to upload audio
                      </>
                    )}
                  </div>
                </div>
                <div className="form-group">
                  <label>Theme Colors</label>
                  <div className="color-inputs">
                    <div className="color-input">
                      <input
                        type="color"
                        value={formData.color[0]}
                        onChange={(e) =>
                          setFormData({ ...formData, color: [e.target.value, formData.color[1]] })
                        }
                      />
                      <input
                        type="text"
                        value={formData.color[0]}
                        onChange={(e) =>
                          setFormData({ ...formData, color: [e.target.value, formData.color[1]] })
                        }
                      />
                    </div>
                    <div className="color-input">
                      <input
                        type="color"
                        value={formData.color[1]}
                        onChange={(e) =>
                          setFormData({ ...formData, color: [formData.color[0], e.target.value] })
                        }
                      />
                      <input
                        type="text"
                        value={formData.color[1]}
                        onChange={(e) =>
                          setFormData({ ...formData, color: [formData.color[0], e.target.value] })
                        }
                      />
                    </div>
                  </div>
                </div>
                <button
                  type="submit"
                  className="submit-btn"
                  disabled={saving || uploading || (coverMode === 'default' && !formData.cover)}
                >
                  {saving ? (
                    <>
                      <FontAwesomeIcon icon={faSpinner} spin /> Saving...
                    </>
                  ) : (
                    <>{editingId ? 'Update Song' : 'Add Song'}</>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
          <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="confirm-icon delete">
              <FontAwesomeIcon icon={faTrash} />
            </div>
            <h3>Delete Song</h3>
            <p>Are you sure you want to delete this song? This action cannot be undone.</p>
            <div className="confirm-actions">
              <button className="cancel-btn" onClick={() => setShowDeleteConfirm(false)}>
                Cancel
              </button>
              <button className="delete-btn" onClick={confirmDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="modal-overlay" onClick={() => setShowLogoutConfirm(false)}>
          <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="confirm-icon logout">
              <FontAwesomeIcon icon={faSignOutAlt} />
            </div>
            <h3>Logout</h3>
            <p>Are you sure you want to logout from the admin dashboard?</p>
            <div className="confirm-actions">
              <button className="cancel-btn" onClick={() => setShowLogoutConfirm(false)}>
                Cancel
              </button>
              <button className="logout-confirm-btn" onClick={confirmLogout}>
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
