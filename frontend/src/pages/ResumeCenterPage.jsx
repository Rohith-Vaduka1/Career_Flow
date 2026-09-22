import React, { useState, useEffect } from 'react';
import {
  FileText,
  Sparkles,
  Save,
  CheckCircle,
  AlertTriangle,
  Lightbulb,
  Briefcase,
  Target,
  ArrowRight,
  TrendingUp,
  RefreshCw
} from 'lucide-react';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { Card } from '../components/common/Card.jsx';
import { Button } from '../components/common/Button.jsx';
import { Badge } from '../components/common/Badge.jsx';
import { LoadingSpinner } from '../components/common/LoadingSpinner.jsx';

export const ResumeCenterPage = () => {
  const { user } = useAuth();

  const [resume, setResume] = useState(null);
  const [rawText, setRawText] = useState('');
  const [targetRole, setTargetRole] = useState('Full Stack Engineer');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Job matching tool state
  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [jobMatchResult, setJobMatchResult] = useState(null);
  const [matchingJob, setMatchingJob] = useState(false);

  useEffect(() => {
    const fetchResumeData = async () => {
      try {
        setLoading(true);
        const [resRes, jobsRes] = await Promise.all([
          api.resume.get(),
          api.jobs.getAll({ limit: 20 })
        ]);

        if (resRes.success && resRes.resume) {
          setResume(resRes.resume);
          setRawText(resRes.resume.rawText || '');
          setTargetRole(resRes.resume.targetRole || user?.targetRole || 'Full Stack Engineer');
        }

        if (jobsRes.success) {
          setJobs(jobsRes.jobs || []);
          if (jobsRes.jobs?.length > 0) setSelectedJobId(jobsRes.jobs[0]._id);
        }
      } catch (err) {
        console.error('Error fetching resume:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchResumeData();
  }, [user]);

  const handleSaveAndAnalyze = async () => {
    if (!rawText.trim()) return;
    try {
      setSaving(true);
      setSaveSuccess(false);
      const res = await api.resume.save({
        rawText,
        targetRole,
        title: 'Primary ATS Resume'
      });
      if (res.success && res.resume) {
        setResume(res.resume);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err) {
      alert(err.message || 'Failed to analyze resume.');
    } finally {
      setSaving(false);
    }
  };

  const handleMatchWithJob = async () => {
    if (!selectedJobId || !rawText) return;
    try {
      setMatchingJob(true);
      const res = await api.resume.matchJob({
        resumeText: rawText,
        jobId: selectedJobId
      });
      if (res.success) {
        setJobMatchResult(res);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setMatchingJob(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading ATS resume engine..." fullScreen />;
  }

  const atsScore = resume?.atsScore || 75;
  const feedback = resume?.atsFeedback || {};
  const breakdown = feedback.breakdown || {
    sectionCompleteness: 20,
    actionVerbs: 20,
    quantifiableMetrics: 18,
    keywords: 22
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>
            ATS Resume Center
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem' }}>
            Optimize your resume for automated applicant screening algorithms and role targeting.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {saveSuccess && (
            <span style={{ fontSize: '0.85rem', color: 'var(--success)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <CheckCircle size={16} /> Saved & Scored!
            </span>
          )}
          <Button variant="primary" onClick={handleSaveAndAnalyze} loading={saving}>
            <Sparkles size={16} /> Run ATS Scan & Save
          </Button>
        </div>
      </div>

      {/* Top ATS Score Summary Banner */}
      <div
        className="cf-card"
        style={{
          background: 'linear-gradient(135deg, var(--bg-card), var(--bg-muted))',
          padding: '1.75rem 2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '2rem'
        }}
      >
        {/* Score Gauge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div
            style={{
              width: '90px',
              height: '90px',
              borderRadius: '50%',
              background: `conic-gradient(var(--primary) ${atsScore * 3.6}deg, var(--border-medium) 0deg)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 15px var(--primary-glow)'
            }}
          >
            <div
              style={{
                width: '74px',
                height: '74px',
                borderRadius: '50%',
                backgroundColor: 'var(--bg-surface)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <span style={{ fontSize: '1.4rem', fontWeight: 800, lineHeight: 1, color: 'var(--text-primary)' }}>
                {atsScore}
              </span>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                ATS Score
              </span>
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>
                {atsScore >= 80 ? 'Exceptional ATS Compatibility' : atsScore >= 65 ? 'Competitive ATS Profile' : 'Needs Optimization'}
              </h3>
              <Badge variant={atsScore >= 80 ? 'success' : atsScore >= 65 ? 'primary' : 'warning'}>
                {atsScore >= 80 ? 'Top Tier' : 'Good'}
              </Badge>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', maxWidth: '480px' }}>
              Analyzed for <strong style={{ color: 'var(--text-primary)' }}>{targetRole}</strong> positions. Standard corporate applicant tracking systems will successfully parse your keywords and chronology.
            </p>
          </div>
        </div>

        {/* 4 Score Component Pillars */}
        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Keywords</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--primary)' }}>{breakdown.keywords || 22}/25</div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Action Verbs</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--primary)' }}>{breakdown.actionVerbs || 20}/25</div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Metrics & Impact</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--primary)' }}>{breakdown.quantifiableMetrics || 18}/25</div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Completeness</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--primary)' }}>{breakdown.sectionCompleteness || 25}/25</div>
          </div>
        </div>
      </div>

      {/* Editor & Strengths/Weaknesses Split View */}
      <div className="grid-2">
        {/* Left: Resume Text Editor */}
        <Card
          title="Master Resume Content"
          subtitle="Keep your primary text up-to-date for scans and applications"
          action={
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Target:</span>
              <select
                className="form-select"
                style={{ width: 'auto', padding: '0.35rem 0.65rem', fontSize: '0.8rem' }}
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
              >
                <option value="Full Stack Engineer">Full Stack Engineer</option>
                <option value="AI / Machine Learning Engineer">AI / Machine Learning Engineer</option>
                <option value="Frontend Architect">Frontend Architect</option>
                <option value="Backend / Cloud Engineer">Backend / Cloud Engineer</option>
                <option value="DevOps / SRE Engineer">DevOps / SRE Engineer</option>
                <option value="Data Scientist">Data Scientist</option>
              </select>
            </div>
          }
        >
          <textarea
            className="form-textarea"
            style={{
              minHeight: '480px',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.825rem',
              lineHeight: 1.55,
              padding: '1rem',
              whiteSpace: 'pre-wrap'
            }}
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            placeholder="Paste your plain-text or markdown resume here..."
          />
        </Card>

        {/* Right: Detailed ATS Feedback & Insights */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Strengths */}
          <Card title="Identified Strengths">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {(feedback.strengths || ['Clear single-column structure and standardized headers.']).map((str, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                  <CheckCircle size={16} style={{ color: 'var(--success)', flexShrink: 0, marginTop: '3px' }} />
                  <span>{str}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Weaknesses */}
          <Card title="ATS Weaknesses & Flaws">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {(feedback.weaknesses || ['Lacks quantifiable metrics.']).map((wk, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  <AlertTriangle size={16} style={{ color: 'var(--warning)', flexShrink: 0, marginTop: '3px' }} />
                  <span>{wk}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Missing Keywords Pills */}
          <Card title="Recommended Missing Keywords">
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
              Incorporating these tech keywords in project descriptions helps pass automated filters:
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {(feedback.missingKeywords || ['Docker', 'PostgreSQL', 'CI/CD', 'Redis', 'AWS']).map((kw, idx) => (
                <span key={idx} className="skill-pill skill-pill-missing" style={{ fontSize: '0.75rem' }}>
                  + {kw}
                </span>
              ))}
            </div>
          </Card>

          {/* Recommendations */}
          <Card title="Actionable Optimization Tips">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {(feedback.recommendations || ['Add quantifiable metrics to bullet points.']).map((rec, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.85rem' }}>
                  <Lightbulb size={16} style={{ color: 'var(--primary)', flexShrink: 0, marginTop: '3px' }} />
                  <span>{rec}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Resume ↔ Job Specific Targeting Tool */}
      <Card
        title="Target Specific Role with Resume"
        subtitle="Compare your active resume text against a specific live opening"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <select
              className="form-select"
              style={{ flex: 1, minWidth: '240px' }}
              value={selectedJobId}
              onChange={(e) => setSelectedJobId(e.target.value)}
            >
              {jobs.map(j => (
                <option key={j._id} value={j._id}>
                  {j.title} at {j.company} ({j.location})
                </option>
              ))}
            </select>

            <Button variant="primary" onClick={handleMatchWithJob} loading={matchingJob}>
              <Target size={16} /> Compare Alignment
            </Button>
          </div>

          {jobMatchResult && (
            <div
              style={{
                padding: '1.25rem',
                backgroundColor: 'var(--bg-muted)',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 700, fontSize: '1rem' }}>
                  {jobMatchResult.job?.title} at {jobMatchResult.job?.company}
                </span>
                <Badge variant={jobMatchResult.matchScore >= 75 ? 'success' : 'primary'}>
                  {jobMatchResult.matchScore}% Resume Match
                </Badge>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', alignSelf: 'center' }}>
                  Matched in Resume:
                </span>
                {jobMatchResult.matchedSkills?.map((s, idx) => (
                  <span key={idx} className="skill-pill skill-pill-matched" style={{ fontSize: '0.75rem' }}>
                    ✓ {s}
                  </span>
                ))}
              </div>

              {jobMatchResult.missingSkills?.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', alignSelf: 'center' }}>
                    Missing in Resume:
                  </span>
                  {jobMatchResult.missingSkills.map((s, idx) => (
                    <span key={idx} className="skill-pill skill-pill-missing" style={{ fontSize: '0.75rem' }}>
                      ✗ {s}
                    </span>
                  ))}
                </div>
              )}

              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.5rem' }}>
                {jobMatchResult.recommendations?.[0]}
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};
