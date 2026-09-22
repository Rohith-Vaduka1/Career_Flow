import React, { useState } from 'react';
import {
  Settings,
  Sun,
  Moon,
  Bell,
  Shield,
  LogOut,
  CheckCircle,
  Smartphone
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { Card } from '../components/common/Card.jsx';
import { Button } from '../components/common/Button.jsx';

export const SettingsPage = () => {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [interviewAlerts, setInterviewAlerts] = useState(true);
  const [jobMatchAlerts, setJobMatchAlerts] = useState(true);
  const [savedSettings, setSavedSettings] = useState(false);

  const handleSavePreferences = () => {
    setSavedSettings(true);
    setTimeout(() => setSavedSettings(false), 2500);
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>
          Preferences & Settings
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem' }}>
          Customize your Career Flow interface, notifications, and security controls.
        </p>
      </div>

      {savedSettings && (
        <div style={{ backgroundColor: 'var(--success-bg)', color: 'var(--success)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle size={16} /> Preferences successfully updated.
        </div>
      )}

      {/* Appearance Settings */}
      <Card title="Appearance & Theme">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>Color Theme</div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
              Currently using <strong>{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</strong>
            </p>
          </div>

          <Button variant="secondary" onClick={toggleTheme}>
            {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
            <span>Switch to {theme === 'dark' ? 'Light' : 'Dark'} Mode</span>
          </Button>
        </div>
      </Card>

      {/* Notifications Preferences */}
      <Card title="Notification Preferences">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>In-App Interview Reminders</div>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
                Receive alerts 24 hours and 1 hour before scheduled interviews.
              </p>
            </div>
            <input
              type="checkbox"
              checked={interviewAlerts}
              onChange={(e) => setInterviewAlerts(e.target.checked)}
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>High-Match Job Recommendations</div>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
                Notify me when new jobs matching over 80% of my skills are added.
              </p>
            </div>
            <input
              type="checkbox"
              checked={jobMatchAlerts}
              onChange={(e) => setJobMatchAlerts(e.target.checked)}
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '0.5rem' }}>
            <Button variant="primary" size="sm" onClick={handleSavePreferences}>
              Save Notification Preferences
            </Button>
          </div>
        </div>
      </Card>

      {/* Account & Security */}
      <Card title="Account & Active Session">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ fontSize: '0.9rem' }}>
            Logged in as: <strong style={{ color: 'var(--text-primary)' }}>{user?.email}</strong>
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Authentication: JSON Web Token (JWT) with standard 30-day rolling session.
          </div>

          <div style={{ paddingTop: '0.5rem', borderTop: '1px solid var(--border-subtle)' }}>
            <Button variant="danger" size="sm" onClick={logout}>
              <LogOut size={16} /> Sign Out of Career Flow
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
