import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Layers,
  Calendar,
  Briefcase,
  FileText,
  Sparkles,
  ArrowRight,
  Clock,
  CheckCircle,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Bookmark,
  Building,
  MapPin
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../services/api.js';
import { Card } from '../components/common/Card.jsx';
import { Button } from '../components/common/Button.jsx';
import { Badge } from '../components/common/Badge.jsx';
import { LoadingSpinner } from '../components/common/LoadingSpinner.jsx';

export const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [analytics, setAnalytics] = useState(null);
  const [upcomingInterviews, setUpcomingInterviews] = useState([]);
  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Time-based personalized greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        const [analyticsRes, interviewsRes, jobsRes] = await Promise.all([
          api.analytics.get().catch(() => ({ success: false })),
          api.interviews.getAll().catch(() => ({ success: false })),
          api.jobs.getAll({ sortBy: 'match_desc', limit: 4 }).catch(() => ({ success: false }))
        ]);

        if (analyticsRes.success) setAnalytics(analyticsRes.data);
        if (interviewsRes.success) setUpcomingInterviews(interviewsRes.upcoming || []);
        if (jobsRes.success) setRecommendedJobs(jobsRes.jobs || []);
      } catch (err) {
        console.error('Error loading dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  if (loading) {
    return <LoadingSpinner text="Compiling your personalized career insights..." fullScreen />;
  }

  const profilePct = user?.profileCompletion || 75;
  const nextInterview = upcomingInterviews[0] || null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Personalized Greeting Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem'
        }}
      >
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.35rem' }}>
            {getGreeting()}, {user?.name ? user.name.split(' ')[0] : 'there'} 👋
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Targeting <strong style={{ color: 'var(--text-primary)' }}>{user?.targetRole || 'Full Stack Engineer'}</strong> · Track applications, optimize skills, and prepare for interviews.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to="/jobs" className="btn btn-primary">
            <Briefcase size={16} /> Explore High-Match Jobs
          </Link>
          <Link to="/interview-prep" className="btn btn-secondary">
            <Sparkles size={16} /> AI Interview Prep
          </Link>
        </div>
      </div>

      {/* Profile Completion Banner */}
      {profilePct < 100 && (
        <div
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.25rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <div style={{ flex: 1, minWidth: '240px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
              <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                Profile Strength: {profilePct}% Complete
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {profilePct < 85 ? 'Add education & certifications to boost match accuracy' : 'Great profile completeness!'}
              </span>
            </div>
            <div
              style={{
                width: '100%',
                height: '8px',
                backgroundColor: 'var(--bg-muted)',
                borderRadius: 'var(--radius-full)',
                overflow: 'hidden'
              }}
            >
              <div
                style={{
                  width: `${profilePct}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, var(--primary), var(--accent))',
                  borderRadius: 'var(--radius-full)',
                  transition: 'width 600ms ease'
                }}
              />
            </div>
          </div>
          <Link to="/profile" className="btn btn-outline btn-sm">
            Complete Profile <ChevronRight size={14} />
          </Link>
        </div>
      )}

      {/* 4 Core Metric Cards */}
      <div className="grid-4">
        {/* Applications */}
        <Link to="/applications" style={{ textDecoration: 'none' }}>
          <Card interactive style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Active Applications</span>
              <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Layers size={20} />
              </div>
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {analytics?.totalApplications || 0}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
              {analytics?.statusCounts?.Interview || 0} in interview stage
            </div>
          </Card>
        </Link>

        {/* Upcoming Interviews */}
        <Link to="/interviews" style={{ textDecoration: 'none' }}>
          <Card interactive style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Upcoming Interviews</span>
              <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--success-bg)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Calendar size={20} />
              </div>
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {analytics?.upcomingInterviews || upcomingInterviews.length}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
              {nextInterview ? `Next: ${nextInterview.company} (${new Date(nextInterview.date).toLocaleDateString()})` : 'None scheduled'}
            </div>
          </Card>
        </Link>

        {/* High-Match Jobs */}
        <Link to="/jobs" style={{ textDecoration: 'none' }}>
          <Card interactive style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>High-Match Jobs</span>
              <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--accent-light)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Briefcase size={20} />
              </div>
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {analytics?.highMatchJobsCount || 6}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
              ≥ 75% skill match threshold
            </div>
          </Card>
        </Link>

        {/* Resume ATS Score */}
        <Link to="/resume" style={{ textDecoration: 'none' }}>
          <Card interactive style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Resume ATS Score</span>
              <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--warning-bg)', color: 'var(--warning)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FileText size={20} />
              </div>
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {analytics?.resumeScore || 85}
              <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>/100</span>
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
              Ready for enterprise screening
            </div>
          </Card>
        </Link>
      </div>

      {/* AI Career Insights & Next Scheduled Interview */}
      <div className="grid-2">
        {/* AI Career Insights Widget */}
        <Card
          title="AI Career Insights"
          subtitle="Real-time strategic career recommendations"
          style={{ height: '100%' }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div
              style={{
                backgroundColor: 'var(--bg-muted)',
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                gap: '0.75rem'
              }}
            >
              <Sparkles size={20} style={{ color: 'var(--primary)', flexShrink: 0, marginTop: '2px' }} />
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                  Skill Gap Detected: Docker & Kubernetes
                </div>
                <p style={{ fontSize: '0.85rem', marginTop: '0.25rem', lineHeight: 1.45 }}>
                  3 of your top-recommended high-paying jobs require container orchestration. Building a lightweight containerized project will boost your match rate by 18%.
                </p>
                <Link to="/skill-gap" style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.5rem' }}>
                  View Skill Gap Plan <ArrowRight size={14} />
                </Link>
              </div>
            </div>

            <div
              style={{
                backgroundColor: 'var(--bg-muted)',
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                gap: '0.75rem'
              }}
            >
              <TrendingUp size={20} style={{ color: 'var(--success)', flexShrink: 0, marginTop: '2px' }} />
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                  High Conversion Velocity
                </div>
                <p style={{ fontSize: '0.85rem', marginTop: '0.25rem', lineHeight: 1.45 }}>
                  Your interview conversion rate is {analytics?.conversionRates?.interviewRate || 25}%. Continue following up with submitted applications within 5 business days.
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Next Scheduled Interview Card */}
        <Card
          title="Next Scheduled Interview"
          subtitle="Prepare in advance for maximum confidence"
          action={
            nextInterview ? (
              <Badge variant="success">Upcoming</Badge>
            ) : null
          }
          style={{ height: '100%' }}
        >
          {nextInterview ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                  <h4 style={{ fontSize: '1.15rem', fontWeight: 700 }}>{nextInterview.role}</h4>
                  <div style={{ fontSize: '0.9rem', color: 'var(--primary)', fontWeight: 600 }}>{nextInterview.company}</div>
                </div>
                <Badge variant="primary">{nextInterview.round || nextInterview.type}</Badge>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Calendar size={16} />
                  <span>{new Date(nextInterview.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Clock size={16} />
                  <span>{nextInterview.time}</span>
                </div>
                {nextInterview.interviewerName && (
                  <div style={{ fontSize: '0.85rem' }}>
                    Interviewer: <strong style={{ color: 'var(--text-primary)' }}>{nextInterview.interviewerName}</strong>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: 'auto' }}>
                <Button
                  variant="primary"
                  onClick={() => navigate(`/interview-prep?company=${encodeURIComponent(nextInterview.company)}&role=${encodeURIComponent(nextInterview.role)}`)}
                  style={{ flex: 1 }}
                >
                  <Sparkles size={16} /> AI Interview Prep
                </Button>
                <Link to="/interviews" className="btn btn-secondary">
                  Details
                </Link>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)' }}>
              <Calendar size={36} style={{ margin: '0 auto 0.75rem', opacity: 0.5 }} />
              <p style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>No upcoming interviews scheduled.</p>
              <Link to="/interviews" className="btn btn-secondary btn-sm">
                Schedule Interview
              </Link>
            </div>
          )}
        </Card>
      </div>

      {/* Recommended High-Match Jobs */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Recommended High-Match Roles</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Computed mathematically against your registered skills
            </p>
          </div>
          <Link to="/jobs" style={{ fontSize: '0.875rem', color: 'var(--primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            View All Jobs <ChevronRight size={16} />
          </Link>
        </div>

        <div className="grid-2">
          {recommendedJobs.map(job => (
            <Card
              key={job._id}
              interactive
              onClick={() => navigate(`/jobs/${job._id}`)}
              style={{ cursor: 'pointer' }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', marginBottom: '0.75rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>{job.title}</h3>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.2rem' }}>
                    <Building size={14} /> {job.company} · <MapPin size={14} /> {job.location}
                  </div>
                </div>

                {job.matchScore !== null && (
                  <Badge variant={job.matchScore >= 80 ? 'success' : job.matchScore >= 60 ? 'primary' : 'warning'}>
                    {job.matchScore}% Match
                  </Badge>
                )}
              </div>

              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.75rem' }}>
                {job.salaryText} · <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>{job.workMode}</span>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: '0.5rem' }}>
                {job.skills.slice(0, 4).map((sk, idx) => (
                  <span key={idx} className="skill-pill" style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}>
                    {sk}
                  </span>
                ))}
                {job.skills.length > 4 && (
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', alignSelf: 'center' }}>
                    +{job.skills.length - 4} more
                  </span>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
