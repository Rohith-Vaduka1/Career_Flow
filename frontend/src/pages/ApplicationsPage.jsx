import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Layers,
  Plus,
  Building,
  Calendar,
  MoreVertical,
  Trash2,
  FileText,
  Clock,
  ArrowRight,
  ExternalLink,
  MessageSquare,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Sparkles
} from 'lucide-react';
import { api } from '../services/api.js';
import { Button } from '../components/common/Button.jsx';
import { Badge } from '../components/common/Badge.jsx';
import { Modal } from '../components/common/Modal.jsx';
import { LoadingSpinner } from '../components/common/LoadingSpinner.jsx';
import { EmptyState } from '../components/common/EmptyState.jsx';

const STAGES = [
  { id: 'Saved', label: 'Saved', color: 'neutral' },
  { id: 'Applied', label: 'Applied', color: 'primary' },
  { id: 'Screening', label: 'Screening', color: 'info' },
  { id: 'Interview', label: 'Interview', color: 'warning' },
  { id: 'Offer', label: 'Offer', color: 'success' },
  { id: 'Rejected', label: 'Archived / Rejected', color: 'danger' }
];

export const ApplicationsPage = () => {
  const [applications, setApplications] = useState([]);
  const [grouped, setGrouped] = useState({});
  const [loading, setLoading] = useState(true);

  // Add Application Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [availableJobs, setAvailableJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [initialStatus, setInitialStatus] = useState('Applied');
  const [initialNotes, setInitialNotes] = useState('');
  const [initialNextAction, setInitialNextAction] = useState('');
  const [submittingAdd, setSubmittingAdd] = useState(false);

  // Application Details & Notes Modal
  const [activeApp, setActiveApp] = useState(null);
  const [newNoteText, setNewNoteText] = useState('');
  const [updatingNote, setUpdatingNote] = useState(false);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const res = await api.applications.getAll();
      if (res.success) {
        setApplications(res.applications || []);
        setGrouped(res.grouped || {});
      }
    } catch (err) {
      console.error('Failed to load applications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleOpenAddModal = async () => {
    setShowAddModal(true);
    try {
      const res = await api.jobs.getAll({ limit: 40 });
      if (res.success) {
        setAvailableJobs(res.jobs || []);
        if (res.jobs?.length > 0) setSelectedJobId(res.jobs[0]._id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateApplication = async (e) => {
    e.preventDefault();
    if (!selectedJobId) return;

    try {
      setSubmittingAdd(true);
      const res = await api.applications.create({
        jobId: selectedJobId,
        status: initialStatus,
        notes: initialNotes,
        nextAction: initialNextAction
      });

      if (res.success) {
        setShowAddModal(false);
        setInitialNotes('');
        setInitialNextAction('');
        fetchApplications();
      }
    } catch (err) {
      alert(err.message || 'Error tracking application.');
    } finally {
      setSubmittingAdd(false);
    }
  };

  const handleStatusChange = async (appId, newStatus) => {
    try {
      const res = await api.applications.update(appId, { status: newStatus });
      if (res.success) {
        fetchApplications();
      }
    } catch (err) {
      console.error('Status update failed:', err);
    }
  };

  const handleDeleteApplication = async (appId) => {
    if (!window.confirm('Remove this application from tracking?')) return;
    try {
      await api.applications.delete(appId);
      if (activeApp?._id === appId) setActiveApp(null);
      fetchApplications();
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!activeApp || !newNoteText.trim()) return;

    try {
      setUpdatingNote(true);
      const res = await api.applications.update(activeApp._id, { newNote: newNoteText.trim() });
      if (res.success) {
        setActiveApp(res.application);
        setNewNoteText('');
        fetchApplications();
      }
    } catch (err) {
      console.error('Add note failed:', err);
    } finally {
      setUpdatingNote(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading your Kanban application board..." fullScreen />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>
            Application Pipeline
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem' }}>
            Track progress across interview stages, log communications, and optimize conversion.
          </p>
        </div>

        <Button variant="primary" onClick={handleOpenAddModal}>
          <Plus size={18} /> Track New Application
        </Button>
      </div>

      {applications.length === 0 ? (
        <EmptyState
          icon={Layers}
          title="No applications tracked yet"
          description="Apply directly to jobs from the Find Jobs catalog or manually log an external application to start managing your pipeline."
          action={
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <Link to="/jobs" className="btn btn-primary">
                Explore Jobs
              </Link>
              <Button variant="outline" onClick={handleOpenAddModal}>
                Log Custom Application
              </Button>
            </div>
          }
        />
      ) : (
        /* Kanban Board Container */
        <div
          style={{
            display: 'flex',
            gap: '1.25rem',
            overflowX: 'auto',
            paddingBottom: '1.5rem',
            minHeight: '680px'
          }}
        >
          {STAGES.map(stage => {
            const stageApps = grouped[stage.id] || [];

            return (
              <div
                key={stage.id}
                style={{
                  flex: '0 0 310px',
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-lg)',
                  display: 'flex',
                  flexDirection: 'column',
                  maxHeight: 'calc(100vh - 200px)'
                }}
              >
                {/* Column Header */}
                <div
                  style={{
                    padding: '1rem 1.25rem',
                    borderBottom: '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{stage.label}</span>
                    <Badge variant={stage.color}>{stageApps.length}</Badge>
                  </div>
                </div>

                {/* Column Body: Application Cards */}
                <div
                  style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: '0.85rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.85rem'
                  }}
                >
                  {stageApps.map(app => {
                    const job = app.jobId || {};

                    return (
                      <div
                        key={app._id}
                        className="cf-card cf-card-interactive"
                        style={{
                          padding: '1rem',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.65rem'
                        }}
                      >
                        {/* Title & Delete */}
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
                          <div>
                            <Link
                              to={job._id ? `/jobs/${job._id}` : '#'}
                              style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)', lineHeight: 1.3 }}
                            >
                              {job.title || 'Untitled Role'}
                            </Link>
                            <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                              {job.company || 'Direct Outreach'} · {job.location || 'Remote'}
                            </div>
                          </div>

                          <button
                            onClick={() => handleDeleteApplication(app._id)}
                            style={{ color: 'var(--text-muted)', padding: '0.2rem' }}
                            title="Remove Application"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>

                        {/* Salary or Work Mode */}
                        {job.salaryText && (
                          <div style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600 }}>
                            {job.salaryText}
                          </div>
                        )}

                        {/* Next Action Pill */}
                        {app.nextAction && (
                          <div
                            style={{
                              fontSize: '0.75rem',
                              backgroundColor: 'var(--bg-muted)',
                              padding: '0.35rem 0.6rem',
                              borderRadius: 'var(--radius-sm)',
                              color: 'var(--text-secondary)',
                              lineHeight: 1.3
                            }}
                          >
                            <strong>Next:</strong> {app.nextAction}
                          </div>
                        )}

                        {/* Card Footer: Move Stage & Notes */}
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            paddingTop: '0.5rem',
                            borderTop: '1px solid var(--border-subtle)',
                            marginTop: '0.25rem'
                          }}
                        >
                          <select
                            value={app.status}
                            onChange={(e) => handleStatusChange(app._id, e.target.value)}
                            style={{
                              fontSize: '0.75rem',
                              padding: '0.25rem 0.5rem',
                              borderRadius: 'var(--radius-sm)',
                              backgroundColor: 'var(--bg-input)',
                              border: '1px solid var(--border-medium)',
                              color: 'var(--text-primary)',
                              outline: 'none',
                              cursor: 'pointer'
                            }}
                          >
                            {STAGES.map(s => (
                              <option key={s.id} value={s.id}>Move: {s.label}</option>
                            ))}
                          </select>

                          <button
                            onClick={() => setActiveApp(app)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.3rem',
                              fontSize: '0.75rem',
                              color: 'var(--text-secondary)',
                              cursor: 'pointer'
                            }}
                          >
                            <MessageSquare size={13} />
                            <span>{app.notes?.length || 0}</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Track New Application Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Track Job Application"
      >
        <form onSubmit={handleCreateApplication} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Select Position from Database</label>
            <select
              className="form-select"
              value={selectedJobId}
              onChange={(e) => setSelectedJobId(e.target.value)}
              required
            >
              {availableJobs.map(j => (
                <option key={j._id} value={j._id}>
                  {j.title} — {j.company} ({j.location})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Initial Stage</label>
            <select
              className="form-select"
              value={initialStatus}
              onChange={(e) => setInitialStatus(e.target.value)}
            >
              {STAGES.map(s => (
                <option key={s.id} value={s.id}>{s.label}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Next Action / Follow-up</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Follow up on LinkedIn in 5 days"
              value={initialNextAction}
              onChange={(e) => setInitialNextAction(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Initial Notes</label>
            <textarea
              className="form-textarea"
              placeholder="Log referral details, recruiter contact info, or customized resume points..."
              value={initialNotes}
              onChange={(e) => setInitialNotes(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <Button variant="ghost" onClick={() => setShowAddModal(false)} type="button">
              Cancel
            </Button>
            <Button variant="primary" type="submit" loading={submittingAdd}>
              Save to Pipeline
            </Button>
          </div>
        </form>
      </Modal>

      {/* Application Notes & History Modal */}
      <Modal
        isOpen={!!activeApp}
        onClose={() => setActiveApp(null)}
        title={activeApp ? `${activeApp.jobId?.title} at ${activeApp.jobId?.company}` : 'Notes'}
      >
        {activeApp && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', backgroundColor: 'var(--bg-muted)', borderRadius: 'var(--radius-md)' }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Current Stage:</span>
                <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{activeApp.status}</div>
              </div>
              <Link
                to={`/interview-prep?company=${encodeURIComponent(activeApp.jobId?.company || '')}&role=${encodeURIComponent(activeApp.jobId?.title || '')}`}
                className="btn btn-outline btn-sm"
              >
                <Sparkles size={14} /> AI Interview Prep
              </Link>
            </div>

            {/* Existing Notes Timeline */}
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.75rem' }}>
                Activity & Notes History ({activeApp.notes?.length || 0})
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '220px', overflowY: 'auto' }}>
                {activeApp.notes?.length > 0 ? (
                  activeApp.notes.map((note, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '0.65rem 0.85rem',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: 'var(--bg-card)',
                        border: '1px solid var(--border-subtle)',
                        fontSize: '0.85rem'
                      }}
                    >
                      <div style={{ color: 'var(--text-primary)', lineHeight: 1.4 }}>{note.text}</div>
                      <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                        {new Date(note.createdAt).toLocaleString()}
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No activity notes logged yet.</div>
                )}
              </div>
            </div>

            {/* Add New Note */}
            <form onSubmit={handleAddNote} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <label className="form-label">Add Follow-up Note</label>
              <textarea
                className="form-textarea"
                style={{ minHeight: '75px' }}
                placeholder="Log interviewer feedback, salary discussions, or interview questions asked..."
                value={newNoteText}
                onChange={(e) => setNewNoteText(e.target.value)}
                required
              />
              <Button type="submit" variant="primary" size="sm" loading={updatingNote} style={{ alignSelf: 'flex-end' }}>
                Append Note
              </Button>
            </form>
          </div>
        )}
      </Modal>
    </div>
  );
};
