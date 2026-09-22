import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Briefcase,
  Layers,
  Calendar,
  FileText,
  Target,
  BrainCircuit,
  Compass,
  ShieldAlert,
  BarChart3,
  User,
  Settings,
  LogOut,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

export const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/jobs', label: 'Find Jobs', icon: Briefcase },
  { path: '/applications', label: 'Applications', icon: Layers },
  { path: '/interviews', label: 'Interviews', icon: Calendar },
  { path: '/resume', label: 'Resume Center', icon: FileText },
  { path: '/skill-gap', label: 'Skill Gap', icon: Target },
  { path: '/interview-prep', label: 'Interview Prep', icon: BrainCircuit },
  { path: '/career-roadmap', label: 'Career Roadmap', icon: Compass },
  { path: '/email-guardian', label: 'Email Guardian', icon: ShieldAlert },
  { path: '/analytics', label: 'Analytics', icon: BarChart3 }
];

export const Sidebar = ({ onCloseMobile }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    if (onCloseMobile) onCloseMobile();
    logout();
    navigate('/login');
  };

  return (
    <aside
      style={{
        width: 'var(--sidebar-width)',
        backgroundColor: 'var(--bg-surface)',
        borderRight: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 110,
        overflowY: 'auto'
      }}
      className="desktop-sidebar"
    >
      <style>{`
        @media (max-width: 1024px) {
          .desktop-sidebar { display: none !important; }
        }
      `}</style>

      {/* Brand Header */}
      <div
        style={{
          padding: '1.25rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          borderBottom: '1px solid var(--border-subtle)'
        }}
      >
        <div
          style={{
            width: '38px',
            height: '38px',
            borderRadius: 'var(--radius-md)',
            background: 'linear-gradient(135deg, var(--primary), var(--accent))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            boxShadow: '0 2px 10px var(--primary-glow)'
          }}
        >
          <Sparkles size={20} />
        </div>
        <div>
          <div
            style={{
              fontWeight: 800,
              fontSize: '1.15rem',
              letterSpacing: '-0.02em',
              color: 'var(--text-primary)',
              lineHeight: 1.1
            }}
          >
            CAREER FLOW
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: 600, letterSpacing: '0.05em' }}>
            AI CAREER COPILOT
          </div>
        </div>
      </div>

      {/* Main Navigation Links */}
      <nav
        style={{
          flex: 1,
          padding: '1rem 0.75rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.25rem'
        }}
      >
        <div
          style={{
            fontSize: '0.7rem',
            fontWeight: 700,
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            padding: '0.25rem 0.75rem 0.5rem'
          }}
        >
          Menu
        </div>
        {navItems.map(item => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onCloseMobile}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.65rem 0.85rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.9rem',
                fontWeight: isActive ? 600 : 500,
                color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                backgroundColor: isActive ? 'var(--primary-light)' : 'transparent',
                transition: 'all var(--transition-fast)'
              })}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom Navigation: Profile, Settings, Logout */}
      <div
        style={{
          padding: '1rem 0.75rem',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.25rem'
        }}
      >
        <NavLink
          to="/profile"
          onClick={onCloseMobile}
          style={({ isActive }) => ({
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.6rem 0.85rem',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.9rem',
            fontWeight: isActive ? 600 : 500,
            color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
            backgroundColor: isActive ? 'var(--primary-light)' : 'transparent'
          })}
        >
          <User size={18} />
          <span>Profile & Skills</span>
        </NavLink>

        <NavLink
          to="/settings"
          onClick={onCloseMobile}
          style={({ isActive }) => ({
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.6rem 0.85rem',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.9rem',
            fontWeight: isActive ? 600 : 500,
            color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
            backgroundColor: isActive ? 'var(--primary-light)' : 'transparent'
          })}
        >
          <Settings size={18} />
          <span>Settings</span>
        </NavLink>

        <button
          onClick={handleLogout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.6rem 0.85rem',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.9rem',
            fontWeight: 500,
            color: 'var(--danger)',
            backgroundColor: 'transparent',
            textAlign: 'left',
            width: '100%',
            cursor: 'pointer',
            transition: 'background-color var(--transition-fast)'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--danger-bg)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          <LogOut size={18} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
