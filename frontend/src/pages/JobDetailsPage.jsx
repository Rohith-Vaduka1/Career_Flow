import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Building,
  MapPin,
  Bookmark,
  Send,
  Sparkles,
  CheckCircle2,
  XCircle,
  Briefcase,
  Layers,
  Calendar,
  ShieldCheck,
  Check
} from 'lucide-react';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { Button } from '../components/common/Button.jsx';
import { Badge } from '../components/common/Badge.jsx';
import { Card } from '../components/common/Card.jsx';
import { LoadingSpinner } from '../components/common/LoadingSpinner.jsx';

export const JobDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // overview | match | ai_fit

  // AI Fit state
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [loadingAi, setLoadingAi] = useState(false);

  // Apply state
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        setLoading(true);
        const res = await api.jobs.getById(id);
        if (res.success && res.job) {
          setJob(res.job);
          setApplied(!!res.job.application);
        }
      } catch (err) {
        console.error('Failed to load job details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [id]);

  const handleSaveToggle = async () => {
    if (!job) return;
    try {
      if (job.isSaved) {
        await api.jobs.unsave(job._id);
        setJob(prev => ({ ...prev, isSaved: false }));
      } else {
        await api.jobs.save(job._id);
        setJob(prev => ({ ...prev, isSaved: true }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleApply = async () => {
    if (!job || applied || applying) return;
    try {
      setApplying(true);
      const res = await api.jobs.apply(job._id);
      if (res.success) {
        setApplied(true);
      }
    } catch (err) {
      alert(err.message || 'Error applying to job.');
    } finally {
      setApplying(false);
    }
  };

  const handleFetchAiFit = async () => {
    if (aiAnalysis || loadingAi) return;
    try {
      setLoadingAi(true);
      const res = await api.jobs.getAiFit(job._id);
      if (res.success) {
        setAiAnalysis(res.analysis);
      }
    } catch (err) {
      console.error('AI Fit error:', err);
    } finally {
      setLoadingAi(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading role details..." fullScreen />;
  }

  if (!job) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
        <h3>Job listing not found.</h3>
        <Button variant="outline" onClick={() => navigate('/jobs')} style={{ marginTop: '1rem' }}>
          <ArrowLeft size={16} /> Back to Jobs
        </Button>
      </div>
    );
  }

  const matchDetails = job.matchDetails;
  const matchScore = job.matchScore;

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Back navigation */}
      <button
        onClick={() => navigate(-1)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.4rem',
          color: 'var(--text-secondary)',
          fontSize: '0.9rem',
          fontWeight: 600,
          cursor: 'pointer'
        }}
      >
        <ArrowLeft size={16} /> Back to Search Results
      </button>

      {/* Main Header Card */}
      <div
        className="cf-card"
        style={{
          padding: '2rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem' }}>
              <h1 style={{ fontSize: '1.85rem', fontWeight: 800 }}>{job.title}</h1>
              {matchScore !== null && (
                <Badge variant={matchScore >= 80 ? 'success' : matchScore >= 60 ? 'primary' : 'warning'}>
                  <Sparkles size={13} /> {matchScore}% Match
                </Badge>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', color: 'var(--text-secondary)', fontSize: '0.95rem', flexWrap: 'wrap' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                <Building size={16} /> {job.company}
              </span>
              <span>•</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <MapPin size={16} /> {job.location}
              </span>
              <span>•</span>
              <Badge variant="neutral">{job.workMode}</Badge>
              <Badge variant="neutral">{job.experience}</Badge>
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Button
              variant="outline"
              onClick={handleSaveToggle}
              style={{ color: job.isSaved ? 'var(--primary)' : 'inherit' }}
            >
              <Bookmark size={18} fill={job.isSaved ? 'currentColor' : 'none'} />
              <span>{job.isSaved ? 'Saved' : 'Save'}</span>
            </Button>

            {applied ? (
              <Badge variant="success" style={{ padding: '0.6rem 1rem', fontSize: '0.875rem' }}>
                <Check size={16} /> Applied
              </Badge>
            ) : (
              <Button variant="primary" onClick={handleApply} loading={applying}>
                <Send size={16} /> Apply Now
              </Button>
            )}
          </div>
        </div>

        {/* Compensation & Department Banner */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '2rem',
            padding: '1rem 1.25rem',
            backgroundColor: 'var(--bg-muted)',
            borderRadius: 'var(--radius-md)',
            flexWrap: 'wrap'
          }}
        >
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
              Compensation
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--primary)' }}>
              {job.salaryText}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
              Department
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 600 }}>
              {job.department || 'Engineering'}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
              Employment Type
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 600 }}>
              {job.employmentType}
            </div>
          </div>

          <div style={{ marginLeft: 'auto' }}>
            <Link
              to={`/interview-prep?company=${encodeURIComponent(job.company)}&role=${encodeURIComponent(job.title)}`}
              className="btn btn-outline btn-sm"
              style={{ borderColor: 'var(--accent)', color: 'var(--accent)' }}
            >
              <Sparkles size={14} /> Practice Interview For This Job
            </Link>
          </div>
        </div>
      </div>

      {/* Tabs Bar */}
      <div
        style={{
          display: 'flex',
          borderBottom: '1px solid var(--border-subtle)',
          gap: '1rem'
        }}
      >
        <button
          onClick={() => setActiveTab('overview')}
          style={{
            padding: '0.75rem 1rem',
            fontWeight: 600,
            fontSize: '0.95rem',
            color: activeTab === 'overview' ? 'var(--primary)' : 'var(--text-secondary)',
            borderBottom: activeTab === 'overview' ? '2px solid var(--primary)' : '2px solid transparent'
          }}
        >
          Role Overview
        </button>

        <button
          onClick={() => setActiveTab('match')}
          style={{
            padding: '0.75rem 1rem',
            fontWeight: 600,
            fontSize: '0.95rem',
            color: activeTab === 'match' ? 'var(--primary)' : 'var(--text-secondary)',
            borderBottom: activeTab === 'match' ? '2px solid var(--primary)' : '2px solid transparent',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem'
          }}
        >
          Skill Match Breakdown ({matchScore || 0}%)
        </button>

        <button
          onClick={() => {
            setActiveTab('ai_fit');
            handleFetchAiFit();
          }}
          style={{
            padding: '0.75rem 1rem',
            fontWeight: 600,
            fontSize: '0.95rem',
            color: activeTab === 'ai_fit' ? 'var(--accent)' : 'var(--text-secondary)',
            borderBottom: activeTab === 'ai_fit' ? '2px solid var(--accent)' : '2px solid transparent',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem'
          }}
        >
          <Sparkles size={16} /> AI Job Fit Insights
        </button>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          <Card title="About the Position">
            <p style={{ lineHeight: 1.65, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
              {job.description}
            </p>
          </Card>

          {job.responsibilities?.length > 0 && (
            <Card title="Key Responsibilities">
              <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {job.responsibilities.map((resp, idx) => (
                  <li key={idx} style={{ fontSize: '0.925rem', color: 'var(--text-secondary)' }}>
                    {resp}
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {job.requirements?.length > 0 && (
            <Card title="Requirements & Qualifications">
              <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {job.requirements.map((req, idx) => (
                  <li key={idx} style={{ fontSize: '0.925rem', color: 'var(--text-secondary)' }}>
                    {req}
                  </li>
                ))}
              </ul>
            </Card>
          )}

          <Card title="Required Technical Stack">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {job.skills?.map((sk, idx) => (
                <span key={idx} className="skill-pill" style={{ padding: '0.4rem 0.85rem' }}>
                  {sk}
                </span>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* TAB 2: SKILL MATCH BREAKDOWN */}
      {activeTab === 'match' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <Card
            title="Deterministic Skill Comparison"
            subtitle="Comparing your profile skills against requirements"
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1.25rem',
                backgroundColor: 'var(--bg-muted)',
                borderRadius: 'var(--radius-md)',
                marginBottom: '1.5rem'
              }}
            >
              <div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary)' }}>
                  {matchDetails?.matchPercentage || 0}%
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                  {matchDetails?.rating || 'Calculated match score'}
                </div>
              </div>
              <div style={{ textAlign: 'right', fontSize: '0.85rem' }}>
                <div>Matched: <strong>{matchDetails?.matchedSkills?.length || 0}</strong> skills</div>
                <div>Missing: <strong>{matchDetails?.missingSkills?.length || 0}</strong> skills</div>
              </div>
            </div>

            {/* Matched Skills */}
            <div style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--success)', marginBottom: '0.75rem' }}>
                <CheckCircle2 size={18} /> Matched Skills ({matchDetails?.matchedSkills?.length || 0})
              </h4>
              {matchDetails?.matchedSkills?.length > 0 ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {matchDetails.matchedSkills.map((sk, idx) => (
                    <span key={idx} className="skill-pill skill-pill-matched">
                      ✓ {sk}
                    </span>
                  ))}
                </div>
              ) : (
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No direct skill matches found.</p>
              )}
            </div>

            {/* Missing Skills */}
            <div>
              <h4 style={{ fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--danger)', marginBottom: '0.75rem' }}>
                <XCircle size={18} /> Missing Skills ({matchDetails?.missingSkills?.length || 0})
              </h4>
              {matchDetails?.missingSkills?.length > 0 ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {matchDetails.missingSkills.map((sk, idx) => (
                    <span key={idx} className="skill-pill skill-pill-missing">
                      ✗ {sk}
                    </span>
                  ))}
                </div>
              ) : (
                <p style={{ fontSize: '0.85rem', color: 'var(--success)' }}>
                  🎉 Amazing! You match all listed skills for this role.
                </p>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* TAB 3: AI FIT ANALYSIS */}
      {activeTab === 'ai_fit' && (
        <div>
          {loadingAi ? (
            <LoadingSpinner text="Analyzing your candidate profile against this role via Career Flow AI..." />
          ) : aiAnalysis ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <Card title="Why You're a Fit" subtitle="Executive alignment overview">
                <p style={{ fontSize: '0.95rem', lineHeight: 1.6 }}>
                  {aiAnalysis.whyGoodMatch}
                </p>
              </Card>

              <div className="grid-2">
                <Card title="Your Core Strengths for this Role">
                  <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {aiAnalysis.strengths?.map((str, idx) => (
                      <li key={idx} style={{ fontSize: '0.9rem' }}>{str}</li>
                    ))}
                  </ul>
                </Card>

                <Card title="Recommended Improvements">
                  <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {aiAnalysis.recommendedImprovements?.map((imp, idx) => (
                      <li key={idx} style={{ fontSize: '0.9rem' }}>{imp}</li>
                    ))}
                  </ul>
                </Card>
              </div>

              <Card title="Suggested Technical Interview Topics">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {aiAnalysis.preparationTopics?.map((top, idx) => (
                    <div key={idx} style={{ padding: '0.65rem 0.85rem', backgroundColor: 'var(--bg-muted)', borderRadius: 'var(--radius-md)', fontSize: '0.875rem' }}>
                      • {top}
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};
