import React, { useState, useEffect } from 'react';
import {
  Target,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  ArrowRight,
  Plus,
  Sparkles,
  TrendingUp,
  Award
} from 'lucide-react';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { Card } from '../components/common/Card.jsx';
import { Button } from '../components/common/Button.jsx';
import { Badge } from '../components/common/Badge.jsx';
import { LoadingSpinner } from '../components/common/LoadingSpinner.jsx';

export const SkillGapPage = () => {
  const { user, refreshUser } = useAuth();

  const [targetRole, setTargetRole] = useState(user?.targetRole || 'Full Stack Engineer');
  const [availableRoles, setAvailableRoles] = useState([]);
  const [gapData, setGapData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [addingSkill, setAddingSkill] = useState(null);

  const fetchSkillGap = async (role) => {
    try {
      setLoading(true);
      const res = await api.skills.getGap(role);
      if (res.success) {
        setGapData(res);
      }
    } catch (err) {
      console.error('Error fetching skill gap:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        const catRes = await api.skills.getCategories();
        if (catRes.success) {
          setAvailableRoles(catRes.availableRoles || []);
        }
      } catch (err) {
        console.error(err);
      }
      fetchSkillGap(targetRole);
    };

    init();
  }, []);

  const handleRoleChange = (newRole) => {
    setTargetRole(newRole);
    fetchSkillGap(newRole);
  };

  const handleAddSkillToProfile = async (skillName) => {
    try {
      setAddingSkill(skillName);
      const currentSkills = user?.skills || [];
      const updated = [
        ...currentSkills,
        { name: skillName, category: 'Programming', proficiency: 'Intermediate' }
      ];
      const res = await api.skills.update(updated);
      if (res.success) {
        await refreshUser();
        fetchSkillGap(targetRole);
      }
    } catch (err) {
      alert(err.message || 'Error updating skills.');
    } finally {
      setAddingSkill(null);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Computing skill gap analysis for your target role..." fullScreen />;
  }

  const readinessScore = gapData?.readinessScore || 0;
  const missing = gapData?.missingSkills || { high: [], medium: [], low: [] };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header & Target Role Selector */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>
            Skill Gap & Competency Analysis
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem' }}>
            Bridge the delta between your current stack and target industry benchmarks.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Target Role:</span>
          <select
            className="form-select"
            style={{ width: 'auto', fontWeight: 600 }}
            value={targetRole}
            onChange={(e) => handleRoleChange(e.target.value)}
          >
            {availableRoles.map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Role Readiness Score Card */}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              backgroundColor: 'var(--primary-light)',
              color: 'var(--primary)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800
            }}
          >
            <span style={{ fontSize: '1.5rem', lineHeight: 1 }}>{readinessScore}%</span>
            <span style={{ fontSize: '0.65rem', textTransform: 'uppercase' }}>Readiness</span>
          </div>

          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.25rem' }}>
              Target: {targetRole}
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', maxWidth: '520px' }}>
              You currently possess <strong>{gapData?.matchedSkills?.length || 0}</strong> verified core skills. Mastering <strong>{missing.high?.length || 0}</strong> high-priority gaps will maximize your candidate competitiveness.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1.25rem' }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Matched Skills</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--success)' }}>
              {gapData?.matchedSkills?.length || 0}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>High Priority Missing</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--danger)' }}>
              {missing.high?.length || 0}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Nice to Have</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--warning)' }}>
              {missing.medium?.length + missing.low?.length || 0}
            </div>
          </div>
        </div>
      </div>

      {/* Matched Skills Section */}
      <Card
        title="Your Verified Competencies for this Role"
        subtitle="Skills already in your profile matching the role benchmark"
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {gapData?.matchedSkills?.map((s, idx) => (
            <span key={idx} className="skill-pill skill-pill-matched" style={{ padding: '0.4rem 0.85rem' }}>
              ✓ {s.name}
            </span>
          ))}
        </div>
      </Card>

      {/* Missing Skills Prioritized Breakdown */}
      <div className="grid-3">
        {/* High Priority */}
        <Card
          title="High Priority"
          subtitle="Critical core requirements"
          action={<Badge variant="danger">Mandatory</Badge>}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {missing.high?.map((sk, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.5rem 0.65rem',
                  backgroundColor: 'var(--bg-muted)',
                  borderRadius: 'var(--radius-md)'
                }}
              >
                <span style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                  {sk.name}
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  loading={addingSkill === sk.name}
                  onClick={() => handleAddSkillToProfile(sk.name)}
                  title="Add to my profile"
                  style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
                >
                  <Plus size={13} /> Add
                </Button>
              </div>
            ))}
          </div>
        </Card>

        {/* Medium Priority */}
        <Card
          title="Medium Priority"
          subtitle="Competitive differentiators"
          action={<Badge variant="warning">Advantage</Badge>}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {missing.medium?.map((sk, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.5rem 0.65rem',
                  backgroundColor: 'var(--bg-muted)',
                  borderRadius: 'var(--radius-md)'
                }}
              >
                <span style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                  {sk.name}
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  loading={addingSkill === sk.name}
                  onClick={() => handleAddSkillToProfile(sk.name)}
                  title="Add to my profile"
                  style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
                >
                  <Plus size={13} /> Add
                </Button>
              </div>
            ))}
          </div>
        </Card>

        {/* Low Priority */}
        <Card
          title="Low Priority"
          subtitle="Nice-to-have capabilities"
          action={<Badge variant="neutral">Bonus</Badge>}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {missing.low?.map((sk, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.5rem 0.65rem',
                  backgroundColor: 'var(--bg-muted)',
                  borderRadius: 'var(--radius-md)'
                }}
              >
                <span style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                  {sk.name}
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  loading={addingSkill === sk.name}
                  onClick={() => handleAddSkillToProfile(sk.name)}
                  title="Add to my profile"
                  style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
                >
                  <Plus size={13} /> Add
                </Button>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Curated Learning Plan */}
      <Card
        title="Recommended Learning Strategy"
        subtitle="Action steps to bridge your highest priority technical gaps"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {gapData?.recommendedLearning?.map((item, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                padding: '1rem',
                backgroundColor: 'var(--bg-muted)',
                borderRadius: 'var(--radius-md)',
                flexWrap: 'wrap',
                gap: '0.75rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <BookOpen size={20} style={{ color: 'var(--primary)', flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Master {item.skill}</div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                    {item.action}
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Badge variant="primary">{item.estimatedTime}</Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
