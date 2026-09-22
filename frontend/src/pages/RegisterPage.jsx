import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, Mail, Lock, User, Briefcase, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { Button } from '../components/common/Button.jsx';

export const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    headline: 'Software Engineer',
    targetRole: 'Full Stack Engineer'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      setError('Please fill in all required fields.');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await register(formData);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
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
        padding: '2.5rem 1rem'
      }}
    >
      <div style={{ width: '100%', maxWidth: '480px' }}>
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
          <h2 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: '0.35rem' }}>Create Your Account</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Start managing your end-to-end career journey with AI
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

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <User size={18} style={{ position: 'absolute', left: '12px', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  name="name"
                  className="form-input"
                  style={{ paddingLeft: '2.5rem' }}
                  placeholder="e.g. Alex Mercer"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Email Address *</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Mail size={18} style={{ position: 'absolute', left: '12px', color: 'var(--text-muted)' }} />
                <input
                  type="email"
                  name="email"
                  className="form-input"
                  style={{ paddingLeft: '2.5rem' }}
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password * (minimum 6 characters)</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Lock size={18} style={{ position: 'absolute', left: '12px', color: 'var(--text-muted)' }} />
                <input
                  type="password"
                  name="password"
                  className="form-input"
                  style={{ paddingLeft: '2.5rem' }}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Current Professional Headline</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Briefcase size={18} style={{ position: 'absolute', left: '12px', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  name="headline"
                  className="form-input"
                  style={{ paddingLeft: '2.5rem' }}
                  placeholder="e.g. Full Stack Engineer"
                  value={formData.headline}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Target Career Role</label>
              <select
                name="targetRole"
                className="form-select"
                value={formData.targetRole}
                onChange={handleChange}
              >
                <option value="Full Stack Engineer">Full Stack Engineer</option>
                <option value="AI / Machine Learning Engineer">AI / Machine Learning Engineer</option>
                <option value="Frontend Architect">Frontend Architect</option>
                <option value="Backend / Cloud Engineer">Backend / Cloud Engineer</option>
                <option value="DevOps / SRE Engineer">DevOps / SRE Engineer</option>
                <option value="Data Scientist">Data Scientist</option>
              </select>
            </div>

            <Button
              type="submit"
              variant="primary"
              loading={loading}
              style={{ width: '100%', marginTop: '0.75rem', padding: '0.75rem' }}
            >
              Create Account <ArrowRight size={18} />
            </Button>
          </form>

          <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
