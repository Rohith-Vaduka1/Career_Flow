import React, { useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { X, Sparkles, User, Settings, LogOut } from 'lucide-react';
import { navItems } from './Sidebar.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

export const MobileDrawer = ({ isOpen, onClose }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(4px)',
        zIndex: 999,
        display: 'flex'
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '280px',
          maxWidth: '85%',
          backgroundColor: 'var(--bg-surface)',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: 'var(--shadow-lg)',
          animation: 'slideInLeft 200ms ease-out',
          overflowY: 'auto'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <style>{`
          @keyframes slideInLeft {
            from { transform: translateX(-100%); }
            to { transform: translateX(0); }
          }
        `}</style>

        {/* Drawer Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid var(--border-subtle)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: 'var(--radius-md)',
                background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff'
              }}
            >
              <Sparkles size={18} />
            </div>
            <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-primary)' }}>
              CAREER FLOW
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              padding: '0.4rem',
              color: 'var(--text-secondary)'
            }}
            aria-label="Close menu"
          >
            <X size={22} />
          </button>
        </div>

        {/* Drawer Nav Links */}
        <nav style={{ flex: 1, padding: '1rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          {navItems.map(item => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.95rem',
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? 'var(--primary)' : 'var(--text-primary)',
                  backgroundColor: isActive ? 'var(--primary-light)' : 'transparent'
                })}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom actions */}
        <div style={{ padding: '1rem 0.75rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          <NavLink
            to="/profile"
            onClick={onClose}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.7rem 1rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.95rem',
              color: 'var(--text-primary)'
            }}
          >
            <User size={18} /> Profile & Skills
          </NavLink>

          <NavLink
            to="/settings"
            onClick={onClose}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.7rem 1rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.95rem',
              color: 'var(--text-primary)'
            }}
          >
            <Settings size={18} /> Settings
          </NavLink>

          <button
            onClick={() => {
              onClose();
              logout();
              navigate('/login');
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.7rem 1rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.95rem',
              color: 'var(--danger)',
              textAlign: 'left',
              width: '100%'
            }}
          >
            <LogOut size={18} /> Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};
