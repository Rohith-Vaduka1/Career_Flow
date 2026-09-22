import React, { useState, useEffect } from 'react';
import {
  User,
  Briefcase,
  GraduationCap,
  MapPin,
  Phone,
  Mail,
  Plus,
  Trash2,
  Save,
  CheckCircle,
  Sparkles,
  Tag
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { Card } from '../components/common/Card.jsx';
import { Button } from '../components/common/Button.jsx';
import { Badge } from '../components/common/Badge.jsx';

const SKILL_CATEGORIES = [
  'Programming',
  'Frontend',
  'Backend',
  'Database',
  'AI/ML',
  'Cloud',
  'DevOps',
  'Tools',
  'Soft Skills'
];

export const ProfilePage = () => {
  const { user, updateProfile } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    headline: '',
    bio: '',
    targetRole: 'Full Stack Engineer',
    workPreference: 'Any',
    expectedSalary: '',
    careerGoals: '',
    skills: []
  });

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // New Skill Input state
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillCategory, setNewSkillCategory] = useState('Programming');
  const [newSkillProficiency, setNewSkillProficiency] = useState('Intermediate');

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        location: user.location || '',
        headline: user.headline || '',
        bio: user.bio || '',
        targetRole: user.targetRole || 'Full Stack Engineer',
        workPreference: user.workPreference || 'Any',
        expectedSalary: user.expectedSalary || '',
        careerGoals: user.careerGoals || '',
        skills: user.skills || []
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAddSkill = (e) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;

    const skillObj = {
      name: newSkillName.trim(),
      category: newSkillCategory,
      proficiency: newSkillProficiency
    };

    setFormData(prev => ({
      ...prev,
      skills: [...prev.skills, skillObj]
    }));

    setNewSkillName('');
  };

  const handleRemoveSkill = (indexToRemove) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter((_, idx) => idx !== indexToRemove)
    }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setSaveSuccess(false);
      await updateProfile(formData);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      alert(err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  // Group skills by category for visual display
  const skillsByCategory = {};
  SKILL_CATEGORIES.forEach(cat => {
    skillsByCategory[cat] = formData.skills.filter(s => s.category === cat);
  });

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>
            Professional Profile & Skills
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem' }}>
            Your competencies and preferences drive deterministic matching and AI recommendations.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {saveSuccess && (
            <span style={{ fontSize: '0.85rem', color: 'var(--success)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <CheckCircle size={16} /> Profile Saved!
            </span>
          )}
          <Button variant="primary" onClick={handleSaveProfile} loading={saving}>
            <Save size={16} /> Save Changes
          </Button>
        </div>
      </div>

      <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
        {/* Core Identity Card */}
        <Card title="Candidate Identity & Headline">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                name="name"
                className="form-input"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email (Read Only)</label>
              <input
                type="email"
                className="form-input"
                value={formData.email}
                disabled
                style={{ opacity: 0.7 }}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input
                type="text"
                name="phone"
                className="form-input"
                placeholder="+1 (555) 000-0000"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Location / City</label>
              <input
                type="text"
                name="location"
                className="form-input"
                placeholder="e.g. San Francisco, CA or Bengaluru"
                value={formData.location}
                onChange={handleChange}
              />
            </div>

            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Professional Headline</label>
              <input
                type="text"
                name="headline"
                className="form-input"
                placeholder="e.g. Senior Full Stack & Distributed Systems Engineer"
                value={formData.headline}
                onChange={handleChange}
              />
            </div>

            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Professional Bio / Executive Summary</label>
              <textarea
                name="bio"
                className="form-textarea"
                rows={3}
                placeholder="Briefly describe your core engineering background and accomplishments..."
                value={formData.bio}
                onChange={handleChange}
              />
            </div>
          </div>
        </Card>

        {/* Career Preferences */}
        <Card title="Role & Work Preferences">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
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

            <div className="form-group">
              <label className="form-label">Work Mode Preference</label>
              <select
                name="workPreference"
                className="form-select"
                value={formData.workPreference}
                onChange={handleChange}
              >
                <option value="Any">Any / Flexible</option>
                <option value="Remote">Remote Only</option>
                <option value="Hybrid">Hybrid</option>
                <option value="On-site">On-site</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Expected Salary</label>
              <input
                type="text"
                name="expectedSalary"
                className="form-input"
                placeholder="e.g. $140,000 / year or ₹25 LPA"
                value={formData.expectedSalary}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Primary Career Goal</label>
              <input
                type="text"
                name="careerGoals"
                className="form-input"
                placeholder="e.g. Transition into AI Architecture leadership"
                value={formData.careerGoals}
                onChange={handleChange}
              />
            </div>
          </div>
        </Card>

        {/* Skills Management Hub */}
        <Card
          title="Technical & Professional Skills"
          subtitle="Add or remove skills to update your real-time job match percentages"
        >
          {/* Add Skill Control Bar */}
          <div
            style={{
              padding: '1rem',
              backgroundColor: 'var(--bg-muted)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              gap: '0.75rem',
              alignItems: 'center',
              flexWrap: 'wrap',
              marginBottom: '1.5rem'
            }}
          >
            <input
              type="text"
              className="form-input"
              style={{ flex: 1, minWidth: '180px' }}
              placeholder="Add skill (e.g. PyTorch, Docker, Kubernetes)..."
              value={newSkillName}
              onChange={(e) => setNewSkillName(e.target.value)}
            />

            <select
              className="form-select"
              style={{ width: 'auto' }}
              value={newSkillCategory}
              onChange={(e) => setNewSkillCategory(e.target.value)}
            >
              {SKILL_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            <select
              className="form-select"
              style={{ width: 'auto' }}
              value={newSkillProficiency}
              onChange={(e) => setNewSkillProficiency(e.target.value)}
            >
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
              <option value="Expert">Expert</option>
            </select>

            <Button type="button" variant="primary" onClick={handleAddSkill}>
              <Plus size={16} /> Add Skill
            </Button>
          </div>

          {/* Categorized Skills Display */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {SKILL_CATEGORIES.map(category => {
              const catSkills = skillsByCategory[category] || [];
              if (catSkills.length === 0) return null;

              return (
                <div key={category}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                    {category} ({catSkills.length})
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {catSkills.map((sk, idx) => {
                      const globalIdx = formData.skills.findIndex(s => s.name === sk.name && s.category === sk.category);
                      return (
                        <span
                          key={idx}
                          className="skill-pill"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                            padding: '0.35rem 0.65rem'
                          }}
                        >
                          <span style={{ fontWeight: 600 }}>{sk.name}</span>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>({sk.proficiency})</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveSkill(globalIdx)}
                            style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}
                            title="Remove skill"
                          >
                            ×
                          </button>
                        </span>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </form>
    </div>
  );
};
