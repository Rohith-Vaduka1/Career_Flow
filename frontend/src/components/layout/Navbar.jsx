import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  Sun,
  Moon,
  Bell,
  Menu,
  Sparkles,
  CheckCheck,
  Briefcase,
  Calendar,
  Layers,
  LogOut,
  User,
  Settings,
  ChevronDown
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useNotifications } from '../../context/NotificationContext.jsx';
import { api } from '../../services/api.js';

export const Navbar = ({ onOpenMobileMenu }) => {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const navigate = useNavigate();

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const searchRef = useRef(null);

  // Notification dropdown state
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef(null);

  // User menu state
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef(null);

  // Debounced search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults(null);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        setIsSearching(true);
        const res = await api.search.query(searchQuery);
        if (res.success) {
          setSearchResults(res.results);
          setShowSearchDropdown(true);
        }
      } catch {
        // ignore
      } finally {
        setIsSearching(false);
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSearchDropdown(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header
      style={{
        height: 'var(--navbar-height)',
        backgroundColor: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 2rem',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backdropFilter: 'blur(8px)'
      }}
    >
      {/* Left: Mobile Toggle & Search Bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, maxWidth: '600px' }}>
        <button
          onClick={onOpenMobileMenu}
          className="btn btn-ghost"
          style={{ padding: '0.4rem', display: 'none' }}
          id="mobile-menu-btn"
          aria-label="Open Navigation Menu"
        >
          <Menu size={22} />
        </button>

        <style>{`
          @media (max-width: 1024px) {
            #mobile-menu-btn { display: flex !important; }
          }
        `}</style>

        {/* Global Search Bar */}
        <div ref={searchRef} style={{ position: 'relative', width: '100%', maxWidth: '440px' }}>
          <div
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <Search
              size={18}
              style={{
                position: 'absolute',
                left: '12px',
                color: 'var(--text-muted)',
                pointerEvents: 'none'
              }}
            />
            <input
              type="text"
              placeholder="Search jobs, applications, interviews..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchResults && setShowSearchDropdown(true)}
              style={{
                width: '100%',
                padding: '0.55rem 1rem 0.55rem 2.4rem',
                backgroundColor: 'var(--bg-input)',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.875rem',
                color: 'var(--text-primary)',
                outline: 'none',
                transition: 'all var(--transition-fast)'
              }}
            />
          </div>

          {/* Search Dropdown Results */}
          {showSearchDropdown && searchResults && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                left: 0,
                right: 0,
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-lg)',
                padding: '0.75rem',
                zIndex: 200,
                maxHeight: '400px',
                overflowY: 'auto'
              }}
            >
              {searchResults.jobs?.length > 0 && (
                <div style={{ marginBottom: '0.75rem' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', padding: '0.25rem 0.5rem' }}>
                    Jobs ({searchResults.jobs.length})
                  </div>
                  {searchResults.jobs.map(j => (
                    <div
                      key={j._id}
                      onClick={() => {
                        navigate(`/jobs/${j._id}`);
                        setShowSearchDropdown(false);
                      }}
                      style={{
                        padding: '0.5rem',
                        borderRadius: 'var(--radius-md)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontSize: '0.85rem'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-muted)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <Briefcase size={15} style={{ color: 'var(--primary)' }} />
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{j.title}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{j.company} · {j.location}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {searchResults.applications?.length > 0 && (
                <div style={{ marginBottom: '0.75rem' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', padding: '0.25rem 0.5rem' }}>
                    Applications ({searchResults.applications.length})
                  </div>
                  {searchResults.applications.map(app => (
                    <div
                      key={app._id}
                      onClick={() => {
                        navigate('/applications');
                        setShowSearchDropdown(false);
                      }}
                      style={{
                        padding: '0.5rem',
                        borderRadius: 'var(--radius-md)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontSize: '0.85rem'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-muted)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <Layers size={15} style={{ color: 'var(--accent)' }} />
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{app.jobId?.title || 'Job Application'}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Stage: {app.status}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {searchResults.interviews?.length > 0 && (
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', padding: '0.25rem 0.5rem' }}>
                    Interviews ({searchResults.interviews.length})
                  </div>
                  {searchResults.interviews.map(inv => (
                    <div
                      key={inv._id}
                      onClick={() => {
                        navigate('/interviews');
                        setShowSearchDropdown(false);
                      }}
                      style={{
                        padding: '0.5rem',
                        borderRadius: 'var(--radius-md)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontSize: '0.85rem'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-muted)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <Calendar size={15} style={{ color: 'var(--success)' }} />
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{inv.company} - {inv.role}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{new Date(inv.date).toLocaleDateString()} at {inv.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {(!searchResults.jobs?.length && !searchResults.applications?.length && !searchResults.interviews?.length) && (
                <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  No matching jobs, applications, or interviews found for "{searchQuery}".
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right Controls: Theme Toggle, Notifications, Profile Dropdown */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="btn btn-ghost"
          style={{ padding: '0.5rem', borderRadius: 'var(--radius-full)', color: 'var(--text-secondary)' }}
          aria-label="Toggle light and dark mode"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {/* Notifications Dropdown */}
        <div ref={notifRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setShowNotifications(prev => !prev)}
            className="btn btn-ghost"
            style={{
              padding: '0.5rem',
              borderRadius: 'var(--radius-full)',
              color: 'var(--text-secondary)',
              position: 'relative'
            }}
            aria-label="View notifications"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '4px',
                  right: '4px',
                  backgroundColor: 'var(--primary)',
                  color: '#ffffff',
                  fontSize: '0.65rem',
                  fontWeight: 800,
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 8px var(--primary-glow)'
                }}
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 12px)',
                right: 0,
                width: '360px',
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-lg)',
                padding: '1rem',
                zIndex: 200,
                maxHeight: '440px',
                overflowY: 'auto'
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingBottom: '0.75rem',
                  borderBottom: '1px solid var(--border-subtle)',
                  marginBottom: '0.75rem'
                }}
              >
                <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                  Notifications {unreadCount > 0 && `(${unreadCount})`}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    style={{
                      fontSize: '0.75rem',
                      color: 'var(--primary)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      fontWeight: 600
                    }}
                  >
                    <CheckCheck size={14} /> Mark all read
                  </button>
                )}
              </div>

              {notifications.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '1.5rem 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  No notifications yet.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {notifications.map(n => (
                    <div
                      key={n._id}
                      onClick={() => {
                        markAsRead(n._id);
                        if (n.link) {
                          navigate(n.link);
                          setShowNotifications(false);
                        }
                      }}
                      style={{
                        padding: '0.65rem 0.75rem',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: n.read ? 'transparent' : 'var(--primary-light)',
                        cursor: 'pointer',
                        transition: 'background-color var(--transition-fast)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                          {n.title}
                        </span>
                        {!n.read && (
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--primary)' }} />
                        )}
                      </div>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem', lineHeight: 1.35 }}>
                        {n.message}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* User Profile Dropdown */}
        <div ref={userMenuRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setShowUserMenu(prev => !prev)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              padding: '0.35rem 0.65rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              backgroundColor: 'var(--bg-muted)',
              color: 'var(--text-primary)',
              cursor: 'pointer'
            }}
          >
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: 'var(--primary)',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div style={{ textAlign: 'left', display: 'none' }} className="user-nav-details">
              <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{user?.name || 'User'}</div>
              <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>{user?.targetRole || 'Software Engineer'}</div>
            </div>
            <ChevronDown size={15} style={{ color: 'var(--text-muted)' }} />
          </button>

          <style>{`
            @media (min-width: 640px) {
              .user-nav-details { display: block !important; }
            }
          `}</style>

          {showUserMenu && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: 0,
                width: '210px',
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-lg)',
                padding: '0.5rem',
                zIndex: 200
              }}
            >
              <div style={{ padding: '0.5rem', borderBottom: '1px solid var(--border-subtle)', marginBottom: '0.25rem' }}>
                <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{user?.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user?.email}
                </div>
              </div>

              <Link
                to="/profile"
                onClick={() => setShowUserMenu(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.55rem 0.65rem',
                  fontSize: '0.85rem',
                  color: 'var(--text-primary)',
                  borderRadius: 'var(--radius-md)'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-muted)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <User size={16} /> Profile & Skills
              </Link>

              <Link
                to="/settings"
                onClick={() => setShowUserMenu(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.55rem 0.65rem',
                  fontSize: '0.85rem',
                  color: 'var(--text-primary)',
                  borderRadius: 'var(--radius-md)'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-muted)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <Settings size={16} /> Settings
              </Link>

              <div style={{ height: '1px', backgroundColor: 'var(--border-subtle)', margin: '0.25rem 0' }} />

              <button
                onClick={() => {
                  setShowUserMenu(false);
                  logout();
                  navigate('/login');
                }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.55rem 0.65rem',
                  fontSize: '0.85rem',
                  color: 'var(--danger)',
                  borderRadius: 'var(--radius-md)',
                  textAlign: 'left'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--danger-bg)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <LogOut size={16} /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
