"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface ApiEndpoint {
  method: "GET" | "POST" | "PUT" | "DELETE";
  path: string;
  description: string;
  auth: "none" | "admin" | "super_admin";
  requestBody?: string;
  responseExample: string;
  notes?: string;
}

interface ApiSection {
  title: string;
  description: string;
  endpoints: ApiEndpoint[];
}

const apiSections: ApiSection[] = [
  {
    title: "🔐 Authentication",
    description: "OTP-based authentication for admin access",
    endpoints: [
      {
        method: "POST",
        path: "/api/auth/send-otp",
        description: "Send OTP to admin email",
        auth: "none",
        requestBody: `{
  "email": "admin@example.com"
}`,
        responseExample: `{
  "success": true,
  "message": "OTP sent successfully",
  "expiresIn": 600
}`,
        notes: "Rate limited: 5 requests per hour per IP, 1 request per 2 minutes per email",
      },
      {
        method: "POST",
        path: "/api/auth/verify-otp",
        description: "Verify OTP and get JWT token",
        auth: "none",
        requestBody: `{
  "email": "admin@example.com",
  "otp": "123456"
}`,
        responseExample: `{
  "success": true,
  "message": "Login successful",
  "role": "admin" | "super_admin"
}`,
        notes: "Sets HTTP-only cookie 'admin_token' valid for 24 hours",
      },
      {
        method: "GET",
        path: "/api/auth/me",
        description: "Get current authenticated admin info",
        auth: "admin",
        responseExample: `{
  "authenticated": true,
  "email": "admin@example.com",
  "role": "admin"
}`,
      },
      {
        method: "POST",
        path: "/api/auth/logout",
        description: "Logout and clear token cookie",
        auth: "admin",
        responseExample: `{
  "success": true,
  "message": "Logged out successfully"
}`,
      },
    ],
  },
  {
    title: "🎵 Songs",
    description: "Manage regular songs in the music library",
    endpoints: [
      {
        method: "GET",
        path: "/api/songs",
        description: "Get songs with pagination and search",
        auth: "none",
        responseExample: `// With pagination (default)
{
  "songs": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "totalPages": 5,
    "totalStreams": 1500
  }
}

// With ?all=true - returns array directly
[{ "id": "...", "name": "...", ... }]`,
        notes: "Query params: page, limit, search, all (boolean)",
      },
      {
        method: "POST",
        path: "/api/songs",
        description: "Create a new song",
        auth: "admin",
        requestBody: `{
  "name": "Song Title",
  "artist": "Artist Name",
  "cover": "https://...", 
  "audio": "https://...",
  "color": ["#hex1", "#hex2"]
}`,
        responseExample: `{
  "success": true,
  "song": {
    "id": "...",
    "name": "Song Title",
    "artist": "Artist Name",
    ...
  }
}`,
      },
      {
        method: "PUT",
        path: "/api/songs/[id]",
        description: "Update a song (owner or super_admin only)",
        auth: "admin",
        requestBody: `{
  "name": "Updated Title",
  "artist": "Updated Artist",
  "cover": "https://...",
  "audio": "https://...",
  "color": ["#hex1", "#hex2"]
}`,
        responseExample: `{
  "success": true,
  "song": { ... }
}`,
      },
      {
        method: "DELETE",
        path: "/api/songs/[id]",
        description: "Delete a song (owner or super_admin only)",
        auth: "admin",
        responseExample: `{
  "success": true,
  "message": "Song deleted successfully"
}`,
      },
      {
        method: "POST",
        path: "/api/songs/play",
        description: "Increment song play count",
        auth: "none",
        requestBody: `{
  "songId": "song_id_here"
}`,
        responseExample: `{
  "success": true,
  "count": 42
}`,
      },
    ],
  },
  {
    title: "🎧 Lofi Songs",
    description: "Manage lofi/chill songs (same structure as Songs)",
    endpoints: [
      {
        method: "GET",
        path: "/api/lofi-songs",
        description: "Get lofi songs with pagination and search",
        auth: "none",
        responseExample: `// Same structure as /api/songs`,
        notes: "Query params: page, limit, search, all (boolean)",
      },
      {
        method: "POST",
        path: "/api/lofi-songs",
        description: "Create a new lofi song",
        auth: "admin",
        requestBody: `{
  "name": "Lofi Title",
  "artist": "Artist Name",
  "cover": "https://...", 
  "audio": "https://...",
  "color": ["#hex1", "#hex2"]
}`,
        responseExample: `{
  "success": true,
  "song": { ... }
}`,
      },
      {
        method: "PUT",
        path: "/api/lofi-songs/[id]",
        description: "Update a lofi song",
        auth: "admin",
        responseExample: `{ "success": true, "song": { ... } }`,
      },
      {
        method: "DELETE",
        path: "/api/lofi-songs/[id]",
        description: "Delete a lofi song",
        auth: "admin",
        responseExample: `{ "success": true, "message": "Lofi song deleted successfully" }`,
      },
      {
        method: "POST",
        path: "/api/lofi-songs/play",
        description: "Increment lofi song play count",
        auth: "none",
        requestBody: `{ "songId": "song_id_here" }`,
        responseExample: `{ "success": true, "count": 42 }`,
      },
    ],
  },
  {
    title: "👥 Admin Management",
    description: "Manage admin users (super_admin only)",
    endpoints: [
      {
        method: "GET",
        path: "/api/admins",
        description: "Get all admin users",
        auth: "super_admin",
        responseExample: `{
  "success": true,
  "admins": [
    {
      "id": "...",
      "email": "admin@example.com",
      "role": "admin",
      "addedBy": "superadmin@example.com",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}`,
      },
      {
        method: "POST",
        path: "/api/admins",
        description: "Add a new admin",
        auth: "super_admin",
        requestBody: `{
  "email": "newadmin@example.com"
}`,
        responseExample: `{
  "success": true,
  "message": "Admin added successfully. Invitation email sent!",
  "admin": { ... }
}`,
        notes: "Sends invitation email to the new admin",
      },
      {
        method: "DELETE",
        path: "/api/admins/[id]",
        description: "Remove an admin",
        auth: "super_admin",
        responseExample: `{
  "success": true,
  "message": "Admin removed successfully"
}`,
      },
    ],
  },
  {
    title: "📤 File Upload",
    description: "Upload files to Cloudinary",
    endpoints: [
      {
        method: "POST",
        path: "/api/upload",
        description: "Upload audio or image file",
        auth: "admin",
        requestBody: `FormData:
- file: File (audio or image)
- type: "audio" | "image"`,
        responseExample: `{
  "success": true,
  "url": "https://res.cloudinary.com/...",
  "publicId": "playly/songs/filename"
}`,
      },
      {
        method: "GET",
        path: "/api/upload/signature",
        description: "Get Cloudinary upload signature for client-side uploads",
        auth: "admin",
        responseExample: `{
  "signature": "...",
  "timestamp": 1234567890,
  "cloudName": "...",
  "apiKey": "..."
}`,
      },
    ],
  },
  {
    title: "📱 App Version",
    description: "Manage mobile app version and updates",
    endpoints: [
      {
        method: "GET",
        path: "/api/app-version",
        description: "Get current app version info",
        auth: "none",
        responseExample: `{
  "success": true,
  "version": "1.0.0",
  "minVersion": "1.0.0",
  "downloadUrl": {
    "android": "/android-app.apk",
    "ios": ""
  },
  "forceUpdate": false,
  "changelog": "Initial release"
}`,
      },
      {
        method: "GET",
        path: "/api/app-version/download",
        description: "Download the Android APK file",
        auth: "none",
        responseExample: `Binary APK file download`,
      },
      {
        method: "POST",
        path: "/api/app-version",
        description: "Update app version config",
        auth: "super_admin",
        requestBody: `{
  "version": "1.1.0",
  "minVersion": "1.0.0",
  "changelog": "Bug fixes and improvements",
  "androidUrl": "/android-app.apk",
  "forceUpdate": false
}`,
        responseExample: `{
  "success": true,
  "data": { ... }
}`,
      },
    ],
  },
];

const authLabels: Record<string, string> = {
  none: "Public",
  admin: "Admin",
  super_admin: "Super Admin",
};

export default function ApiDocPage() {
  const router = useRouter();
  const [expandedEndpoints, setExpandedEndpoints] = useState<Set<string>>(new Set());
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/me');
        const data = await res.json();
        
        if (!res.ok || !data.email) {
          // Not authenticated, redirect to login
          router.replace('/admin/login');
          return;
        }
        
        setIsAuthenticated(true);
      } catch (error) {
        router.replace('/admin/login');
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, [router]);

  const toggleEndpoint = (key: string) => {
    const newExpanded = new Set(expandedEndpoints);
    if (newExpanded.has(key)) {
      newExpanded.delete(key);
    } else {
      newExpanded.add(key);
    }
    setExpandedEndpoints(newExpanded);
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(key);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="api-doc" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📚</div>
          <p style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated (redirect will happen)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="api-doc">
      {/* Header */}
      <header className="api-doc__header">
        <div className="api-doc__header-content">
          <div className="api-doc__logo">📚</div>
          <div>
            <h1 className="api-doc__title">Playyly API Documentation</h1>
            <p className="api-doc__subtitle">Complete API reference for the Playyly Music Player</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="api-doc__main">
        {/* Base URL Info */}
        <div className="api-doc__base-url">
          <h2>Base URL</h2>
          <code>
            {typeof window !== "undefined" ? window.location.origin : "https://your-domain.com"}
          </code>
          <div className="api-doc__auth-badges">
            <div className="api-doc__auth-badge">
              <span className="api-doc__auth api-doc__auth--none">Public</span>
              <span>No authentication required</span>
            </div>
            <div className="api-doc__auth-badge">
              <span className="api-doc__auth api-doc__auth--admin">Admin</span>
              <span>Requires admin JWT token</span>
            </div>
            <div className="api-doc__auth-badge">
              <span className="api-doc__auth api-doc__auth--super_admin">Super Admin</span>
              <span>Requires super admin access</span>
            </div>
          </div>
        </div>

        {/* API Sections */}
        <div>
          {apiSections.map((section, sectionIndex) => (
            <section key={sectionIndex} className="api-doc__section">
              <div className="api-doc__section-header">
                <h2>{section.title}</h2>
                <p>{section.description}</p>
              </div>

              <div>
                {section.endpoints.map((endpoint, endpointIndex) => {
                  const key = `${sectionIndex}-${endpointIndex}`;
                  const isExpanded = expandedEndpoints.has(key);

                  return (
                    <div key={key} className="api-doc__endpoint">
                      {/* Endpoint Header */}
                      <button
                        onClick={() => toggleEndpoint(key)}
                        className="api-doc__endpoint-header"
                      >
                        <span className={`api-doc__method api-doc__method--${endpoint.method.toLowerCase()}`}>
                          {endpoint.method}
                        </span>
                        <code className="api-doc__endpoint-path">{endpoint.path}</code>
                        <span className={`api-doc__auth api-doc__auth--${endpoint.auth}`}>
                          {authLabels[endpoint.auth]}
                        </span>
                        <span className="api-doc__endpoint-desc">
                          {endpoint.description}
                        </span>
                        <svg
                          className={`api-doc__endpoint-toggle ${isExpanded ? "api-doc__endpoint-toggle--open" : ""}`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>

                      {/* Expanded Content */}
                      {isExpanded && (
                        <div className="api-doc__endpoint-body">
                          <p>{endpoint.description}</p>

                          {endpoint.notes && (
                            <div className="api-doc__notes">
                              💡 {endpoint.notes}
                            </div>
                          )}

                          {endpoint.requestBody && (
                            <div className="api-doc__code-block">
                              <h4>
                                <span>Request Body</span>
                                <button
                                  onClick={() => copyToClipboard(endpoint.requestBody!, `req-${key}`)}
                                  className={`api-doc__copy-btn ${copiedCode === `req-${key}` ? "api-doc__copy-btn--copied" : ""}`}
                                >
                                  {copiedCode === `req-${key}` ? "✓ Copied" : "Copy"}
                                </button>
                              </h4>
                              <pre className="api-doc__code">
                                <code className="request">{endpoint.requestBody}</code>
                              </pre>
                            </div>
                          )}

                          <div className="api-doc__code-block">
                            <h4>
                              <span>Response Example</span>
                              <button
                                onClick={() => copyToClipboard(endpoint.responseExample, `res-${key}`)}
                                className={`api-doc__copy-btn ${copiedCode === `res-${key}` ? "api-doc__copy-btn--copied" : ""}`}
                              >
                                {copiedCode === `res-${key}` ? "✓ Copied" : "Copy"}
                              </button>
                            </h4>
                            <pre className="api-doc__code">
                              <code className="response">{endpoint.responseExample}</code>
                            </pre>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>

        {/* Usage Example */}
        <section className="api-doc__usage">
          <h2>📝 Quick Usage Example</h2>
          <div className="api-doc__usage-example">
            <h3>1. Get All Songs (Public)</h3>
            <pre className="api-doc__code">
              <code>{`fetch('/api/songs?all=true')
  .then(res => res.json())
  .then(songs => console.log(songs));`}</code>
            </pre>
          </div>
          <div className="api-doc__usage-example">
            <h3>2. Authenticated Request (Admin)</h3>
            <pre className="api-doc__code">
              <code>{`// JWT token is automatically sent via HTTP-only cookie
fetch('/api/songs', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include', // Important for cookies
  body: JSON.stringify({
    name: 'My Song',
    artist: 'Artist',
    cover: 'https://...',
    audio: 'https://...',
    color: ['#667eea', '#764ba2']
  })
})`}</code>
            </pre>
          </div>
        </section>

        {/* Footer */}
        <footer className="api-doc__footer">
          <p>Playyly Music Player API v1.0</p>
        </footer>
      </main>
    </div>
  );
}
