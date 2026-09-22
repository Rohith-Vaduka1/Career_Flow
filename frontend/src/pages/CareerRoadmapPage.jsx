import React, { useState, useEffect } from 'react';
import {
  Compass,
  Sparkles,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowRight,
  Target,
  Award,
  BookOpen
} from 'lucide-react';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { Card } from '../components/common/Card.jsx';
import { Button } from '../components/common/Button.jsx';
import { Badge } from '../components/common/Badge.jsx';
import { LoadingSpinner } from '../components/common/LoadingSpinner.jsx';

export const CareerRoadmapPage = () => {
  const { user } = useAuth();

  const [currentRole, setCurrentRole] = useState(user?.headline || 'Software Engineer');
  const [targetRole, setTargetRole] = useState(user?.targetRole || 'Staff / Principal Architect');
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchRoadmap = async () => {
    try {
      setLoading(true);
      const res = await api.ai.getRoadmap({ currentRole, targetRole });
      if (res.success && res.roadmap) {
        setRoadmap(res.roadmap);
      }
    } catch (err) {
      console.error('Failed to load roadmap:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoadmap();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>
          Personalized Career Roadmap
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem' }}>
          Visual progression milestones from your current foundation to senior engineering leadership.
        </p>
      </div>

      {/* Target Role Selector */}
      <Card>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', alignItems: 'flex-end' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Current Role / Level</label>
            <input
              type="text"
              className="form-input"
              value={currentRole}
              onChange={(e) => setCurrentRole(e.target.value)}
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Target Destination Role</label>
            <input
              type="text"
              className="form-input"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
            />
          </div>

          <Button variant="primary" onClick={fetchRoadmap} loading={loading} style={{ height: '42px' }}>
            <Sparkles size={16} /> Regenerate Roadmap
          </Button>
        </div>
      </Card>

      {loading ? (
        <LoadingSpinner text="Synthesizing career progression roadmap with milestone criteria..." />
      ) : roadmap ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Roadmap Summary Pill */}
          <div
            style={{
              padding: '1.25rem 1.75rem',
              backgroundColor: 'var(--bg-muted)',
              borderRadius: 'var(--radius-lg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem'
            }}
          >
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                Trajectory
              </span>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span>{roadmap.currentRole}</span>
                <ArrowRight size={18} style={{ color: 'var(--primary)' }} />
                <span style={{ color: 'var(--primary)' }}>{roadmap.targetRole}</span>
              </div>
            </div>

            <Badge variant="primary">
              <Calendar size={13} /> {roadmap.estimatedDuration || '6-12 Months'}
            </Badge>
          </div>

          {/* Timeline Stages */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'relative' }}>
            {roadmap.stages?.map((stage, idx) => (
              <Card key={idx} style={{ position: 'relative' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--primary-light)',
                        color: 'var(--primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: '1rem'
                      }}
                    >
                      {stage.stage || idx + 1}
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>{stage.title}</h3>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{stage.duration}</div>
                    </div>
                  </div>

                  <Badge variant="neutral">Stage {stage.stage || idx + 1}</Badge>
                </div>

                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', lineHeight: 1.55 }}>
                  {stage.description}
                </p>

                <div className="grid-2" style={{ gap: '1rem', marginBottom: '1rem' }}>
                  {/* Skills */}
                  <div style={{ backgroundColor: 'var(--bg-muted)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <BookOpen size={14} style={{ color: 'var(--primary)' }} /> Skills to Master:
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                      {stage.skills?.map((sk, sidx) => (
                        <span key={sidx} className="skill-pill" style={{ fontSize: '0.75rem' }}>
                          {sk}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Portfolio Projects */}
                  <div style={{ backgroundColor: 'var(--bg-muted)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Layers size={14} style={{ color: 'var(--accent)' }} /> Key Milestone Project:
                    </div>
                    <ul style={{ paddingLeft: '1rem', fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
                      {stage.projects?.map((proj, pidx) => (
                        <li key={pidx}>{proj}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Milestone Criterion */}
                {stage.milestone && (
                  <div
                    style={{
                      borderTop: '1px solid var(--border-subtle)',
                      paddingTop: '0.75rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontSize: '0.85rem',
                      color: 'var(--success)'
                    }}
                  >
                    <Award size={16} />
                    <span><strong>Exit Milestone:</strong> {stage.milestone}</span>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
};
