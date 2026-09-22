import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Sparkles, Mail, Lock, ArrowRight, AlertCircle, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { Button } from '../components/common/Button.jsx';

export const LoginPage = () => {
  const { login, loginAsDemo } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [error, setError] = useState(null);

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in both email and password.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    try {
      setDemoLoading(true);
      setError(null);
      await loginAsDemo();
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Demo login failed. Make sure the backend server is running.');
    } finally {
      setDemoLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--bg-app)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1rem'
      }}
    >
      <div style={{ width: '100%', maxWidth: '440px' }}>
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Link
            to="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.65rem',
              marginBottom: '1rem'
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
                color: '#ffffff'
              }}
            >
              <Sparkles size={20} />
            </div>
            <span style={{ fontWeight: 800, fontSize: '1.35rem', letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
              CAREER FLOW
            </span>
          </Link>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: '0.35rem' }}>Welcome Back</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Sign in to continue your career journey
          </p>
        </div>

        {/* Card */}
        <div className="cf-card" style={{ padding: '2rem', boxShadow: 'var(--shadow-lg)' }}>
          {error && (
            <div
              style={{
                backgroundColor: 'var(--danger-bg)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                color: 'var(--danger)',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.85rem',
                marginBottom: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          {/* Quick 1-Click Demo Login */}
          <button
            type="button"
            onClick={handleDemoLogin}
            disabled={demoLoading || loading}
            style={{
              width: '100%',
              backgroundColor: 'var(--primary-light)',
              border: '1px solid var(--primary)',
              color: 'var(--primary)',
              borderRadius: 'var(--radius-md)',
              padding: '0.75rem',
              fontSize: '0.9rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              marginBottom: '1.5rem',
              cursor: 'pointer',
              transition: 'background-color var(--transition-fast)'
            }}
          >
            <Zap size={18} />
            <span>{demoLoading ? 'Authenticating Demo...' : '⚡ 1-Click Demo Login (Alex Mercer)'}</span>
          </button>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              marginBottom: '1.5rem',
              color: 'var(--text-muted)',
              fontSize: '0.75rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}
          >
            <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-subtle)' }} />
            <span>Or sign in with email</span>
            <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-subtle)' }} />
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Mail
                  size={18}
                  style={{ position: 'absolute', left: '12px', color: 'var(--text-muted)' }}
                />
                <input
                  type="email"
                  className="form-input"
                  style={{ paddingLeft: '2.5rem' }}
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Lock
                  size={18}
                  style={{ position: 'absolute', left: '12px', color: 'var(--text-muted)' }}
                />
                <input
                  type="password"
                  className="form-input"
                  style={{ paddingLeft: '2.5rem' }}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              loading={loading}
              style={{ width: '100%', marginTop: '0.5rem', padding: '0.75rem' }}
            >
              Sign In <ArrowRight size={18} />
            </Button>
          </form>

          <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 600 }}>
              Sign up free
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
