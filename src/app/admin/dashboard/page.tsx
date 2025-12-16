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
  faHome,
  faGear,
  faCompactDisc,
  faSearch,
  faChevronLeft,
  faChevronRight,
  faLink,
  faImage,
} from '@fortawesome/free-solid-svg-icons';
import { defaultCoverImages } from '@/util';

interface Song {
  id: string;
  name: string;
  artist: string;
  cover: string;
  audio: string;
  color: [string, string];
  active: boolean;
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
}

const initialFormData: SongFormData = {
  name: '',
  artist: '',
  cover: '',
  audio: '',
  color: ['#667eea', '#764ba2'],
};

export default function AdminDashboardPage() {
  const router = useRouter();
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
    fetchSongs(pagination.page, searchQuery);
  }, []);

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

  const handleLogout = async () => {
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
    });
    // Check if cover is a default image
    const isDefault = defaultCoverImages.some((img) => img.url === song.cover);
    setCoverMode(isDefault ? 'default' : 'url');
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this song?')) return;

    try {
      const response = await fetch(`/api/songs/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete song');
      }

      await fetchSongs(pagination.page, searchQuery);
    } catch (err: any) {
      setError(err.message);
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
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <div className="logo-icon">
              <FontAwesomeIcon icon={faMusic} />
            </div>
            <span>Playyly</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section">
            <span className="nav-label">Menu</span>
            <a href="#" className="nav-item active">
              <FontAwesomeIcon icon={faHome} />
              <span>Overview</span>
            </a>
            <a href="#" className="nav-item">
              <FontAwesomeIcon icon={faCompactDisc} />
              <span>Music Library</span>
            </a>
            <a href="#" className="nav-item">
              <FontAwesomeIcon icon={faUpload} />
              <span>Upload</span>
            </a>
          </div>
        </nav>

        <div className="sidebar-footer">
          <a href="#" className="nav-item">
            <FontAwesomeIcon icon={faGear} />
            <span>Settings</span>
          </a>

        </div>
      </aside>

      {/* Main Content */}
      <div className="main-content">
        {/* Header */}
        <header className="dashboard-header">
          <div className="header-title">
            <h1>Admin Dashboard</h1>
            <p>Manage your music library</p>
          </div>
          <div className="header-actions">
            <button className="logout-btn" onClick={handleLogout}>
              <FontAwesomeIcon icon={faSignOutAlt} />
              <span>Logout</span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="page-content">
          {/* Stats Cards */}
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
              <div className="loading">
                <FontAwesomeIcon icon={faSpinner} spin size="2x" />
              </div>
            ) : songs.length === 0 ? (
              <div className="empty-state">
                <FontAwesomeIcon icon={faMusic} size="2x" />
                <h4>{searchQuery ? 'No songs found' : 'No songs yet'}</h4>
                <p>{searchQuery ? 'Try a different search term' : 'Click "Add New Song" to get started'}</p>
              </div>
            ) : (
              <>
                <div className="table-container">
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
                            <span className="status-badge active">Active</span>
                          </td>
                          <td>
                            <div className="action-btns">
                              <button className="action-btn edit" onClick={() => handleEdit(song)}>
                                <FontAwesomeIcon icon={faEdit} /> Edit
                              </button>
                              <button className="action-btn delete" onClick={() => handleDelete(song.id)}>
                                <FontAwesomeIcon icon={faTrash} /> Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
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
    </div>
  );
}
