'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUsers,
  faUserPlus,
  faTrash,
  faSpinner,
  faArrowLeft,
  faUser,
  faCrown,
  faEnvelope,
  faCalendar,
  faShieldAlt,
  faExclamationTriangle,
} from '@fortawesome/free-solid-svg-icons';

interface AdminUser {
  id: string;
  email: string;
  role: 'super_admin' | 'admin';
  addedBy: string;
  createdAt: string;
}

export default function ManageAdminsPage() {
  const router = useRouter();
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [addingAdmin, setAddingAdmin] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminRole, setAdminRole] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  // Delete confirmation modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [adminToDelete, setAdminToDelete] = useState<{id: string; email: string} | null>(null);

  // Check auth and load admins
  useEffect(() => {
    const checkAuthAndLoad = async () => {
      try {
        const authRes = await fetch('/api/auth/me');
        const authData = await authRes.json();
        
        if (!authRes.ok || !authData.email) {
          router.replace('/admin/login');
          return;
        }
        
        // Only super admin can access this page
        if (authData.role !== 'super_admin') {
          router.replace('/admin/dashboard');
          return;
        }
        
        setAdminEmail(authData.email);
        setAdminRole(authData.role);
        fetchAdmins();
      } catch (error) {
        router.replace('/admin/login');
      }
    };
    
    checkAuthAndLoad();
  }, [router]);

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admins');
      if (!response.ok) throw new Error('Failed to fetch admins');
      
      const data = await response.json();
      setAdmins(data.admins || []);
    } catch (err) {
      setError('Failed to load admins');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminEmail.trim()) return;

    setAddingAdmin(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/admins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newAdminEmail }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add admin');
      }

      setNewAdminEmail('');
      setSuccess(`Admin added! Invitation email sent to ${newAdminEmail}`);
      fetchAdmins();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setAddingAdmin(false);
    }
  };

  // Show delete confirmation modal
  const showDeleteConfirmation = (id: string, email: string) => {
    setAdminToDelete({ id, email });
    setShowDeleteModal(true);
  };

  // Cancel delete
  const cancelDelete = () => {
    setShowDeleteModal(false);
    setAdminToDelete(null);
  };

  // Confirm and execute delete
  const confirmDelete = async () => {
    if (!adminToDelete) return;
    
    setShowDeleteModal(false);
    setDeletingId(adminToDelete.id);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`/api/admins/${adminToDelete.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to remove admin');
      }

      setSuccess(`${adminToDelete.email} has been removed. Notification email sent.`);
      fetchAdmins();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setDeletingId(null);
      setAdminToDelete(null);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="manage-admins-page">
      {/* Header */}
      <header className="page-header">
        <div className="header-left">
          <button className="back-btn" onClick={() => router.push('/admin/dashboard')}>
            <FontAwesomeIcon icon={faArrowLeft} />
          </button>
          <div className="header-title">
            <h1><FontAwesomeIcon icon={faUsers} /> Manage Admins</h1>
            <p>Add or remove admin access to the dashboard</p>
          </div>
        </div>
        <div className="header-right">
          <div className="current-user">
            <FontAwesomeIcon icon={faCrown} className="crown-icon" />
            <span>{adminEmail}</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="page-content">
        {/* Add Admin Section */}
        <section className="add-admin-section">
          <div className="section-header">
            <FontAwesomeIcon icon={faUserPlus} />
            <h2>Add New Admin</h2>
          </div>
          <p className="section-description">
            Enter an email address to grant admin access. They will receive an invitation email with a login button.
          </p>
          
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}
          
          <form onSubmit={handleAddAdmin} className="add-admin-form">
            <div className="input-group">
              <FontAwesomeIcon icon={faEnvelope} className="input-icon" />
              <input
                type="email"
                value={newAdminEmail}
                onChange={(e) => setNewAdminEmail(e.target.value)}
                placeholder="Enter email address"
                required
              />
            </div>
            <button type="submit" disabled={addingAdmin || !newAdminEmail.trim()}>
              {addingAdmin ? (
                <>
                  <FontAwesomeIcon icon={faSpinner} spin /> Adding...
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faUserPlus} /> Add Admin
                </>
              )}
            </button>
          </form>
        </section>

        {/* Admin List Section */}
        <section className="admin-list-section">
          <div className="section-header">
            <FontAwesomeIcon icon={faShieldAlt} />
            <h2>Current Admins ({admins.length})</h2>
          </div>
          
          {loading ? (
            <div className="loading-state">
              <FontAwesomeIcon icon={faSpinner} spin size="2x" />
              <p>Loading admins...</p>
            </div>
          ) : admins.length === 0 ? (
            <div className="empty-state">
              <FontAwesomeIcon icon={faUsers} size="2x" />
              <h3>No Admins Yet</h3>
              <p>Add your first admin using the form above</p>
            </div>
          ) : (
            <div className="admin-grid">
              {admins.map((admin) => (
                <div key={admin.id} className="admin-card">
                  <div className="admin-avatar">
                    <FontAwesomeIcon icon={faUser} />
                  </div>
                  <div className="admin-details">
                    <h3 className="admin-email">{admin.email}</h3>
                    <div className="admin-meta">
                      <span className="meta-item">
                        <FontAwesomeIcon icon={faCalendar} />
                        Added {formatDate(admin.createdAt)}
                      </span>
                    </div>
                  </div>
                  <button
                    className="remove-btn"
                    onClick={() => showDeleteConfirmation(admin.id, admin.email)}
                    disabled={deletingId === admin.id}
                    title="Remove admin"
                  >
                    {deletingId === admin.id ? (
                      <FontAwesomeIcon icon={faSpinner} spin />
                    ) : (
                      <FontAwesomeIcon icon={faTrash} />
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Info Section */}
        <section className="info-section">
          <h3>📝 About Admin Permissions</h3>
          <ul>
            <li><strong>Super Admin (You):</strong> Can manage all songs, add/remove other admins</li>
            <li><strong>Regular Admins:</strong> Can add songs and edit/delete only their own songs</li>
            <li>Admins receive an email when added or removed</li>
          </ul>
        </section>
      </main>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && adminToDelete && (
        <div className="modal-overlay" onClick={cancelDelete}>
          <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="confirm-icon delete">
              <FontAwesomeIcon icon={faExclamationTriangle} />
            </div>
            <h3>Remove Admin?</h3>
            <p>
              Are you sure you want to remove <strong>{adminToDelete.email}</strong> from admin access? 
              They will receive a notification email.
            </p>
            <div className="confirm-actions">
              <button className="cancel-btn" onClick={cancelDelete}>
                Cancel
              </button>
              <button className="delete-btn" onClick={confirmDelete}>
                <FontAwesomeIcon icon={faTrash} /> Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
