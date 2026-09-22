import React from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  Target,
  Briefcase,
  Layers,
  BrainCircuit,
  FileText,
  ShieldAlert,
  BarChart3,
  CheckCircle,
  Sun,
  Moon,
  ChevronRight,
  Star
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export const LandingPage = () => {
  const { theme, toggleTheme } = useTheme();
  const { isAuthenticated } = useAuth();

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-app)', display: 'flex', flexDirection: 'column' }}>
      {/* Landing Navigation */}
      <header
        style={{
          height: '72px',
          borderBottom: '1px solid var(--border-subtle)',
          backgroundColor: 'var(--bg-surface)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 2rem',
          position: 'sticky',
          top: 0,
          zIndex: 50,
          backdropFilter: 'blur(10px)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
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
            <span style={{ fontWeight: 800, fontSize: '1.2rem', letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
              CAREER FLOW
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            onClick={toggleTheme}
            className="btn btn-ghost"
            style={{ padding: '0.5rem', borderRadius: 'var(--radius-full)' }}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={19} /> : <Moon size={19} />}
          </button>

          {isAuthenticated ? (
            <Link to="/dashboard" className="btn btn-primary">
              Open Dashboard <ArrowRight size={16} />
            </Link>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost">
                Sign In
              </Link>
              <Link to="/register" className="btn btn-primary">
                Get Started Free <ArrowRight size={16} />
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section
        style={{
          padding: '5rem 2rem 4rem',
          maxWidth: '1200px',
          margin: '0 auto',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        <div
          className="badge badge-primary"
          style={{ padding: '0.4rem 1rem', fontSize: '0.85rem', marginBottom: '1.5rem' }}
        >
          <Sparkles size={14} /> AI-Powered Career Management & Job Search
        </div>

        <h1
          style={{
            fontSize: 'clamp(2.4rem, 5vw, 4rem)',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            maxWidth: '900px',
            lineHeight: 1.15,
            marginBottom: '1.5rem'
          }}
        >
          Your AI-powered career journey,{' '}
          <span
            style={{
              background: 'linear-gradient(135deg, var(--primary), var(--accent))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            in one place.
          </span>
        </h1>

        <p
          style={{
            fontSize: 'clamp(1.05rem, 2vw, 1.25rem)',
            color: 'var(--text-secondary)',
            maxWidth: '720px',
            lineHeight: 1.6,
            marginBottom: '2.5rem'
          }}
        >
          From discovering high-match roles and automated ATS resume optimization to AI mock interviews and application Kanban tracking—master the entire job-search lifecycle seamlessly.
        </p>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link to="/register" className="btn btn-primary btn-lg">
            Start Your Journey Free <ArrowRight size={18} />
          </Link>
          <Link to="/login" className="btn btn-secondary btn-lg">
            Explore Demo Account
          </Link>
        </div>

        {/* Hero Quick Feature Badges */}
        <div
          style={{
            display: 'flex',
            gap: '1.5rem',
            marginTop: '3rem',
            flexWrap: 'wrap',
            justifyContent: 'center',
            color: 'var(--text-secondary)',
            fontSize: '0.9rem',
            fontWeight: 500
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <CheckCircle size={16} style={{ color: 'var(--success)' }} /> Deterministic & AI Matching
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <CheckCircle size={16} style={{ color: 'var(--success)' }} /> Real-time ATS Scorer
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <CheckCircle size={16} style={{ color: 'var(--success)' }} /> Email Scam Risk Guardian
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <CheckCircle size={16} style={{ color: 'var(--success)' }} /> Interactive Mock Interviews
          </span>
        </div>
      </section>

      {/* Interactive Value Proposition Grid */}
      <section
        style={{
          padding: '4rem 2rem',
          maxWidth: '1240px',
          margin: '0 auto',
          width: '100%'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <h2 style={{ fontSize: '2.2rem', marginBottom: '0.75rem' }}>
            Built for Modern High-Growth Professionals
          </h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
            Every tool you need to stand out, track applications, and conquer engineering interviews.
          </p>
        </div>

        <div className="grid-3">
          {/* Card 1: Job Discovery & Matching */}
          <div className="cf-card cf-card-interactive">
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--primary-light)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.25rem'
              }}
            >
              <Briefcase size={24} />
            </div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Deterministic Job Matching</h3>
            <p style={{ fontSize: '0.9rem', lineHeight: 1.55 }}>
              Transparent mathematical skill comparison between your verified competencies and job specifications. Know your exact match score before applying.
            </p>
          </div>

          {/* Card 2: Application Kanban */}
          <div className="cf-card cf-card-interactive">
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--accent-light)',
                color: 'var(--accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.25rem'
              }}
            >
              <Layers size={24} />
            </div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Kanban Application Tracking</h3>
            <p style={{ fontSize: '0.9rem', lineHeight: 1.55 }}>
              Effortlessly track applications across Saved, Applied, Screening, Interview, Offer, and Rejected stages with automatic follow-up dates and notes.
            </p>
          </div>

          {/* Card 3: AI Interview Prep */}
          <div className="cf-card cf-card-interactive">
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--success-bg)',
                color: 'var(--success)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.25rem'
              }}
            >
              <BrainCircuit size={24} />
            </div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>AI Mock Interviews & Scoring</h3>
            <p style={{ fontSize: '0.9rem', lineHeight: 1.55 }}>
              Practice technical, behavioral, and system design questions. Receive instant scoring on technical correctness, clarity, and the STAR framework.
            </p>
          </div>

          {/* Card 4: ATS Resume Optimization */}
          <div className="cf-card cf-card-interactive">
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--warning-bg)',
                color: 'var(--warning)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.25rem'
              }}
            >
              <FileText size={24} />
            </div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>ATS Resume Analyzer</h3>
            <p style={{ fontSize: '0.9rem', lineHeight: 1.55 }}>
              Score your resume out of 100 against automated Applicant Tracking Systems. Pinpoint missing industry keywords and formatting flaws instantly.
            </p>
          </div>

          {/* Card 5: Skill Gap Analysis */}
          <div className="cf-card cf-card-interactive">
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--info-bg)',
                color: 'var(--info)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.25rem'
              }}
            >
              <Target size={24} />
            </div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Skill Gap & Roadmap</h3>
            <p style={{ fontSize: '0.9rem', lineHeight: 1.55 }}>
              Select your target role (e.g. AI Engineer, Full Stack Architect) and receive a prioritized breakdown of what to learn next with curated projects.
            </p>
          </div>

          {/* Card 6: Email Guardian & Scam Detection */}
          <div className="cf-card cf-card-interactive">
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--danger-bg)',
                color: 'var(--danger)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.25rem'
              }}
            >
              <ShieldAlert size={24} />
            </div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Email Guardian & Scam Alert</h3>
            <p style={{ fontSize: '0.9rem', lineHeight: 1.55 }}>
              Paste recruiter messages to detect red flags, suspicious payment requests, or phishing domains, with automatic interview date extraction.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section
        style={{
          padding: '4rem 2rem',
          maxWidth: '1000px',
          margin: '2rem auto 5rem',
          width: '100%'
        }}
      >
        <div
          className="cf-card"
          style={{
            background: 'linear-gradient(135deg, var(--bg-card), var(--bg-muted))',
            border: '1px solid var(--border-medium)',
            borderRadius: 'var(--radius-xl)',
            padding: '3.5rem 2rem',
            textAlign: 'center',
            boxShadow: 'var(--shadow-lg)'
          }}
        >
          <h2 style={{ fontSize: '2.4rem', fontWeight: 800, marginBottom: '1rem' }}>
            Ready to Take Control of Your Career?
          </h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto 2rem', fontSize: '1.05rem' }}>
            Join thousands of software engineers, AI specialists, and tech leaders accelerating their career trajectory with Career Flow.
          </p>
          <Link to="/register" className="btn btn-primary btn-lg">
            Create Your Free Account Now <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          marginTop: 'auto',
          borderTop: '1px solid var(--border-subtle)',
          backgroundColor: 'var(--bg-surface)',
          padding: '2.5rem 2rem',
          fontSize: '0.875rem',
          color: 'var(--text-secondary)'
        }}
      >
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles size={16} style={{ color: 'var(--primary)' }} />
            <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>CAREER FLOW</span>
            <span>— The AI-Powered Career Management Platform</span>
          </div>

          <div>
            © {new Date().getFullYear()} Career Flow Inc. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};
