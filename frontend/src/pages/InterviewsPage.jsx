import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Clock,
  MapPin,
  Building,
  Plus,
  Sparkles,
  Trash2,
  Edit2,
  CheckCircle,
  XCircle,
  ExternalLink,
  UserCheck
} from 'lucide-react';
import { api } from '../services/api.js';
import { Card } from '../components/common/Card.jsx';
import { Button } from '../components/common/Button.jsx';
import { Badge } from '../components/common/Badge.jsx';
import { Modal } from '../components/common/Modal.jsx';
import { LoadingSpinner } from '../components/common/LoadingSpinner.jsx';
import { EmptyState } from '../components/common/EmptyState.jsx';

export const InterviewsPage = () => {
  const navigate = useNavigate();

  const [upcoming, setUpcoming] = useState([]);
  const [past, setPast] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [editingInterview, setEditingInterview] = useState(null);
  const [formData, setFormData] = useState({
    company: '',
    role: '',
    date: '',
    time: '10:00 AM',
    type: 'Technical',
    round: 'Round 1 - Technical Coding',
    locationOrLink: 'https://meet.google.com/',
    interviewerName: '',
    notes: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchInterviews = async () => {
    try {
      setLoading(true);
      const res = await api.interviews.getAll();
      if (res.success) {
        setUpcoming(res.upcoming || []);
        setPast(res.past || []);
      }
    } catch (err) {
      console.error('Failed to load interviews:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterviews();
  }, []);

  const handleOpenSchedule = (interviewToEdit = null) => {
    if (interviewToEdit) {
      setEditingInterview(interviewToEdit);
      setFormData({
        company: interviewToEdit.company,
        role: interviewToEdit.role,
        date: interviewToEdit.date ? new Date(interviewToEdit.date).toISOString().split('T')[0] : '',
        time: interviewToEdit.time || '10:00 AM',
        type: interviewToEdit.type || 'Technical',
        round: interviewToEdit.round || 'Round 1',
        locationOrLink: interviewToEdit.locationOrLink || '',
        interviewerName: interviewToEdit.interviewerName || '',
        notes: interviewToEdit.notes || ''
      });
    } else {
      setEditingInterview(null);
      setFormData({
        company: '',
        role: '',
        date: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
        time: '10:00 AM',
        type: 'Technical',
        round: 'Round 1 - Technical Assessment',
        locationOrLink: 'https://meet.google.com/',
        interviewerName: '',
        notes: ''
      });
    }
    setShowScheduleModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      if (editingInterview) {
        await api.interviews.update(editingInterview._id, formData);
      } else {
        await api.interviews.create(formData);
      }
      setShowScheduleModal(false);
      fetchInterviews();
    } catch (err) {
      alert(err.message || 'Error saving interview.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await api.interviews.update(id, { status });
      fetchInterviews();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this interview?')) return;
    try {
      await api.interviews.delete(id);
      fetchInterviews();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading your interview schedule..." fullScreen />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>
            Interview Hub
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem' }}>
            Schedule interview rounds, log meeting links, and launch targeted AI preparation.
          </p>
        </div>

        <Button variant="primary" onClick={() => handleOpenSchedule()}>
          <Plus size={18} /> Schedule Interview
        </Button>
      </div>

      {/* Upcoming Section */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Upcoming Interviews</h2>
          <Badge variant="success">{upcoming.length}</Badge>
        </div>

        {upcoming.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title="No upcoming interviews"
            description="When recruiters schedule interviews with you, add them here to track your rounds and generate personalized AI questions."
            action={
              <Button variant="outline" onClick={() => handleOpenSchedule()}>
                Schedule First Interview
              </Button>
            }
          />
        ) : (
          <div className="grid-2">
            {upcoming.map(inv => (
              <Card key={inv._id} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>{inv.role}</h3>
                    <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--primary)', marginTop: '0.15rem' }}>
                      {inv.company}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Badge variant="primary">{inv.type}</Badge>
                    <button
                      onClick={() => handleOpenSchedule(inv)}
                      style={{ padding: '0.3rem', color: 'var(--text-muted)' }}
                      title="Edit interview"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(inv._id)}
                      style={{ padding: '0.3rem', color: 'var(--text-muted)' }}
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Calendar size={15} style={{ color: 'var(--primary)' }} />
                    <strong style={{ color: 'var(--text-primary)' }}>
                      {new Date(inv.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                    </strong>
                    <span>at {inv.time}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <MapPin size={15} />
                    {inv.locationOrLink.startsWith('http') ? (
                      <a href={inv.locationOrLink} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>
                        Join Video Meeting <ExternalLink size={12} style={{ display: 'inline' }} />
                      </a>
                    ) : (
                      <span>{inv.locationOrLink}</span>
                    )}
                  </div>

                  {inv.interviewerName && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <UserCheck size={15} />
                      <span>Interviewer: {inv.interviewerName}</span>
                    </div>
                  )}

                  {inv.round && (
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Focus: {inv.round}
                    </div>
                  )}
                </div>

                {inv.notes && (
                  <div style={{ backgroundColor: 'var(--bg-muted)', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-md)', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {inv.notes}
                  </div>
                )}

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginTop: 'auto',
                    paddingTop: '0.75rem',
                    borderTop: '1px solid var(--border-subtle)'
                  }}
                >
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => navigate(`/interview-prep?company=${encodeURIComponent(inv.company)}&role=${encodeURIComponent(inv.role)}`)}
                  >
                    <Sparkles size={14} /> AI Interview Prep
                  </Button>

                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleStatusUpdate(inv._id, 'Completed')}
                      style={{ color: 'var(--success)' }}
                    >
                      Mark Completed
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Past / Completed Section */}
      {past.length > 0 && (
        <div style={{ marginTop: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Past & Completed Rounds</h2>
            <Badge variant="neutral">{past.length}</Badge>
          </div>

          <div className="grid-3">
            {past.map(inv => (
              <Card key={inv._id} style={{ opacity: 0.85 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <h4 style={{ fontWeight: 700 }}>{inv.role}</h4>
                  <Badge variant={inv.status === 'Completed' ? 'success' : 'neutral'}>
                    {inv.status}
                  </Badge>
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600, marginBottom: '0.5rem' }}>
                  {inv.company}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {new Date(inv.date).toLocaleDateString()} · {inv.time}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Schedule / Edit Modal */}
      <Modal
        isOpen={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        title={editingInterview ? 'Edit Interview Details' : 'Schedule New Interview'}
      >
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Company Name *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Apex Cloud Solutions"
              value={formData.company}
              onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Role Title *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Senior Full Stack Engineer"
              value={formData.role}
              onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
              required
            />
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Interview Date *</label>
              <input
                type="date"
                className="form-input"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Time</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. 2:30 PM"
                value={formData.time}
                onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Interview Type</label>
              <select
                className="form-select"
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
              >
                <option value="Technical">Technical</option>
                <option value="System Design">System Design</option>
                <option value="Behavioral">Behavioral</option>
                <option value="Screening">Screening</option>
                <option value="Hiring Manager">Hiring Manager</option>
                <option value="HR">HR</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Round Details</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Round 2 Architecture"
                value={formData.round}
                onChange={(e) => setFormData(prev => ({ ...prev, round: e.target.value }))}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Video Call Link or Location</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. https://meet.google.com/xyz or Office address"
              value={formData.locationOrLink}
              onChange={(e) => setFormData(prev => ({ ...prev, locationOrLink: e.target.value }))}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Interviewer Name / Title</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Sarah Jenkins (VP of Engineering)"
              value={formData.interviewerName}
              onChange={(e) => setFormData(prev => ({ ...prev, interviewerName: e.target.value }))}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Preparation Notes</label>
            <textarea
              className="form-textarea"
              placeholder="Specific architecture topics, company background, questions to ask..."
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <Button variant="ghost" type="button" onClick={() => setShowScheduleModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" loading={submitting}>
              {editingInterview ? 'Update Interview' : 'Save Interview'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
