import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Briefcase,
  Building,
  MapPin,
  Bookmark,
  Send,
  Filter,
  ArrowUpDown,
  Check,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { Card } from '../components/common/Card.jsx';
import { Button } from '../components/common/Button.jsx';
import { Badge } from '../components/common/Badge.jsx';
import { Modal } from '../components/common/Modal.jsx';
import { LoadingSpinner } from '../components/common/LoadingSpinner.jsx';
import { EmptyState } from '../components/common/EmptyState.jsx';

export const JobsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [totalJobs, setTotalJobs] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [workMode, setWorkMode] = useState('All');
  const [experience, setExperience] = useState('All');
  const [skill, setSkill] = useState('');
  const [sortBy, setSortBy] = useState('match_desc');

  // Apply Modal state
  const [selectedJobToApply, setSelectedJobToApply] = useState(null);
  const [applying, setApplying] = useState(false);
  const [applySuccess, setApplySuccess] = useState(false);

  // Scam Risk Modal
  const [scamModalJob, setScamModalJob] = useState(null);
  const [scamAssessment, setScamAssessment] = useState(null);
  const [scanningScam, setScanningScam] = useState(false);

  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.jobs.getAll({
        search,
        workMode: workMode !== 'All' ? workMode : undefined,
        experience: experience !== 'All' ? experience : undefined,
        skill: skill || undefined,
        sortBy,
        page: currentPage,
        limit: 9
      });

      if (res.success) {
        setJobs(res.jobs || []);
        setTotalJobs(res.total || 0);
        setTotalPages(res.totalPages || 1);
      }
    } catch (err) {
      console.error('Failed to load jobs:', err);
    } finally {
      setLoading(false);
    }
  }, [search, workMode, experience, skill, sortBy, currentPage]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleSaveToggle = async (job, e) => {
    e.stopPropagation();
    try {
      if (job.isSaved) {
        await api.jobs.unsave(job._id);
        setJobs(prev => prev.map(j => j._id === job._id ? { ...j, isSaved: false } : j));
      } else {
        await api.jobs.save(job._id);
        setJobs(prev => prev.map(j => j._id === job._id ? { ...j, isSaved: true } : j));
      }
    } catch (err) {
      console.error('Save error:', err);
    }
  };

  const handleApplyConfirm = async () => {
    if (!selectedJobToApply) return;
    try {
      setApplying(true);
      const res = await api.jobs.apply(selectedJobToApply._id);
      if (res.success) {
        setApplySuccess(true);
        setJobs(prev => prev.map(j => j._id === selectedJobToApply._id ? { ...j, isApplied: true } : j));
        setTimeout(() => {
          setSelectedJobToApply(null);
          setApplySuccess(false);
        }, 1200);
      }
    } catch (err) {
      alert(err.message || 'Error submitting application.');
      setSelectedJobToApply(null);
    } finally {
      setApplying(false);
    }
  };

  const handleCheckJobScam = async (job, e) => {
    e.stopPropagation();
    setScamModalJob(job);
    setScanningScam(true);
    try {
      const res = await api.jobs.checkScam(`${job.title} at ${job.company}\n${job.description}\nSalary: ${job.salaryText}`);
      if (res.success) {
        setScamAssessment(res.assessment);
      }
    } catch (err) {
      console.error('Scam check failed:', err);
    } finally {
      setScanningScam(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.35rem' }}>
          Find & Discover Jobs
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem' }}>
          Explore {totalJobs} active engineering roles with transparent deterministic skill matching.
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div
        className="cf-card"
        style={{
          padding: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}
      >
        {/* Top search input row */}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
            <Search
              size={18}
              style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
            />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '2.5rem' }}
              placeholder="Search by job title, company, technology, or city..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: '180px' }}>
            <ArrowUpDown size={16} style={{ color: 'var(--text-muted)' }} />
            <select
              className="form-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="match_desc">Highest Match %</option>
              <option value="newest">Newest Posted</option>
              <option value="salary_desc">Highest Salary</option>
              <option value="salary_asc">Lowest Salary</option>
            </select>
          </div>
        </div>

        {/* Filter pills */}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center', fontSize: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            <Filter size={15} /> Filters:
          </div>

          <select
            className="form-select"
            style={{ width: 'auto', padding: '0.4rem 0.75rem', fontSize: '0.85rem' }}
            value={workMode}
            onChange={(e) => { setWorkMode(e.target.value); setCurrentPage(1); }}
          >
            <option value="All">All Work Modes</option>
            <option value="Remote">Remote</option>
            <option value="Hybrid">Hybrid</option>
            <option value="On-site">On-site</option>
          </select>

          <select
            className="form-select"
            style={{ width: 'auto', padding: '0.4rem 0.75rem', fontSize: '0.85rem' }}
            value={experience}
            onChange={(e) => { setExperience(e.target.value); setCurrentPage(1); }}
          >
            <option value="All">All Experience Levels</option>
            <option value="Entry Level">Entry Level</option>
            <option value="Mid Level">Mid Level</option>
            <option value="Senior Level">Senior Level</option>
            <option value="Lead / Staff">Lead / Staff</option>
          </select>

          <input
            type="text"
            className="form-input"
            style={{ width: '160px', padding: '0.4rem 0.75rem', fontSize: '0.85rem' }}
            placeholder="Skill (e.g. Python)"
            value={skill}
            onChange={(e) => { setSkill(e.target.value); setCurrentPage(1); }}
          />

          {(search || workMode !== 'All' || experience !== 'All' || skill) && (
            <button
              onClick={() => {
                setSearch('');
                setWorkMode('All');
                setExperience('All');
                setSkill('');
                setCurrentPage(1);
              }}
              style={{
                fontSize: '0.8rem',
                color: 'var(--primary)',
                fontWeight: 600,
                textDecoration: 'underline'
              }}
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Jobs Grid */}
      {loading ? (
        <LoadingSpinner text="Searching jobs and calculating match percentages..." />
      ) : jobs.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No jobs matched your criteria"
          description="Try broadening your search query, clearing specific filters, or searching for alternative tech skills."
          action={
            <Button
              variant="outline"
              onClick={() => {
                setSearch('');
                setWorkMode('All');
                setExperience('All');
                setSkill('');
              }}
            >
              Clear All Filters
            </Button>
          }
        />
      ) : (
        <>
          <div className="grid-3">
            {jobs.map(job => {
              const matchScore = job.matchScore;
              let matchVariant = 'neutral';
              if (matchScore >= 80) matchVariant = 'success';
              else if (matchScore >= 60) matchVariant = 'primary';
              else if (matchScore >= 40) matchVariant = 'warning';

              return (
                <div
                  key={job._id}
                  className="cf-card cf-card-interactive"
                  onClick={() => navigate(`/jobs/${job._id}`)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    cursor: 'pointer',
                    position: 'relative'
                  }}
                >
                  {/* Card Top: Title, Company, Bookmark */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <div>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.3 }}>
                        {job.title}
                      </h3>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.2rem' }}>
                        <Building size={14} /> {job.company}
                      </div>
                    </div>

                    <button
                      onClick={(e) => handleSaveToggle(job, e)}
                      style={{
                        padding: '0.35rem',
                        color: job.isSaved ? 'var(--primary)' : 'var(--text-muted)',
                        transition: 'color var(--transition-fast)'
                      }}
                      aria-label={job.isSaved ? 'Unsave job' : 'Save job'}
                      title={job.isSaved ? 'Job is saved' : 'Save job'}
                    >
                      <Bookmark size={20} fill={job.isSaved ? 'currentColor' : 'none'} />
                    </button>
                  </div>

                  {/* Location & Salary */}
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.5rem' }}>
                    <MapPin size={14} /> {job.location} · <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{job.workMode}</span>
                  </div>

                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.75rem' }}>
                    {job.salaryText}
                  </div>

                  {/* Match Percentage Badge */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                    {matchScore !== null ? (
                      <Badge variant={matchVariant}>
                        <Sparkles size={13} /> {matchScore}% Match
                      </Badge>
                    ) : (
                      <Badge variant="neutral">Sign in to see match</Badge>
                    )}
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {job.experience}
                    </span>
                  </div>

                  {/* Skills Pills */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '1.25rem' }}>
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

                  {/* Actions Footer */}
                  <div
                    style={{
                      marginTop: 'auto',
                      paddingTop: '0.75rem',
                      borderTop: '1px solid var(--border-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '0.5rem'
                    }}
                  >
                    <button
                      onClick={(e) => handleCheckJobScam(job, e)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        fontSize: '0.75rem',
                        color: 'var(--text-muted)',
                        padding: '0.3rem 0.5rem',
                        borderRadius: 'var(--radius-sm)'
                      }}
                      title="Run Scam & Authenticity Risk Check"
                    >
                      <ShieldCheck size={14} /> Risk Check
                    </button>

                    {job.isApplied ? (
                      <Badge variant="success">
                        <Check size={13} /> Applied
                      </Badge>
                    ) : (
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedJobToApply(job);
                        }}
                      >
                        <Send size={14} /> 1-Click Apply
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.75rem',
                marginTop: '1.5rem'
              }}
            >
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              >
                <ChevronLeft size={16} /> Previous
              </Button>

              <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                Page {currentPage} of {totalPages}
              </span>

              <Button
                variant="outline"
                size="sm"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              >
                Next <ChevronRight size={16} />
              </Button>
            </div>
          )}
        </>
      )}

      {/* Apply Confirmation Modal */}
      <Modal
        isOpen={!!selectedJobToApply}
        onClose={() => !applying && setSelectedJobToApply(null)}
        title={applySuccess ? 'Application Submitted!' : `Apply to ${selectedJobToApply?.company}`}
      >
        {applySuccess ? (
          <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
            <div
              style={{
                width: '54px',
                height: '54px',
                borderRadius: '50%',
                backgroundColor: 'var(--success-bg)',
                color: 'var(--success)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem'
              }}
            >
              <Check size={28} />
            </div>
            <h4 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.35rem' }}>Application Submitted!</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Your profile has been submitted for <strong>{selectedJobToApply?.title}</strong>. Track progress on your Applications Kanban Board.
            </p>
          </div>
        ) : (
          <div>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
              You are applying for <strong style={{ color: 'var(--text-primary)' }}>{selectedJobToApply?.title}</strong> at <strong style={{ color: 'var(--text-primary)' }}>{selectedJobToApply?.company}</strong>.
            </p>

            <div style={{ backgroundColor: 'var(--bg-muted)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>Attached Candidate Profile:</div>
              <div>• Name: {user?.name}</div>
              <div>• Email: {user?.email}</div>
              <div>• Target Role: {user?.targetRole}</div>
              <div>• Registered Skills: {user?.skills?.length || 0} skills included</div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <Button
                variant="ghost"
                onClick={() => setSelectedJobToApply(null)}
                disabled={applying}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                loading={applying}
                onClick={handleApplyConfirm}
              >
                <Send size={16} /> Confirm Submission
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Scam Check Modal */}
      <Modal
        isOpen={!!scamModalJob}
        onClose={() => setScamModalJob(null)}
        title="Job Authenticity & Scam Analysis"
      >
        {scanningScam ? (
          <LoadingSpinner text="Analyzing job listing signals and safety indicators..." />
        ) : scamAssessment ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h4 style={{ fontWeight: 700 }}>{scamModalJob?.title}</h4>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{scamModalJob?.company}</div>
              </div>
              <Badge variant={scamAssessment.riskLevel === 'Low Risk' ? 'success' : scamAssessment.riskLevel === 'Medium Risk' ? 'warning' : 'danger'}>
                {scamAssessment.riskLevel} ({scamAssessment.riskScore}/100)
              </Badge>
            </div>

            {scamAssessment.signals?.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>Risk Signals Detected:</div>
                {scamAssessment.signals.map((sig, idx) => (
                  <div key={idx} style={{ padding: '0.65rem', borderRadius: 'var(--radius-md)', backgroundColor: sig.type === 'danger' ? 'var(--danger-bg)' : 'var(--warning-bg)', fontSize: '0.8rem', color: sig.type === 'danger' ? 'var(--danger)' : 'var(--warning)' }}>
                    • {sig.message}
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: '0.85rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--success-bg)', color: 'var(--success)', fontSize: '0.85rem' }}>
                ✓ No scam signals detected. Standard legitimate job listing verified by Career Flow heuristics.
              </div>
            )}

            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem' }}>
              {scamAssessment.disclaimer}
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
};
