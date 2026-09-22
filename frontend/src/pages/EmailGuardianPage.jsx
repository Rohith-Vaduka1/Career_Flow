import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Mail,
  Calendar,
  ExternalLink,
  Sparkles,
  CheckCircle,
  FileText,
  HelpCircle
} from 'lucide-react';
import { api } from '../services/api.js';
import { Card } from '../components/common/Card.jsx';
import { Button } from '../components/common/Button.jsx';
import { Badge } from '../components/common/Badge.jsx';
import { LoadingSpinner } from '../components/common/LoadingSpinner.jsx';

const SAMPLE_EMAILS = {
  interview: {
    subject: 'Interview Invitation: Senior Full Stack Engineer at Apex Cloud',
    sender: 'recruiting@apexcloud.io',
    body: `Hi Alex,

Thank you for applying for the Senior Full Stack Engineer role at Apex Cloud Solutions. We were very impressed by your technical background in React, TypeScript, and distributed systems.

We would like to invite you to a 45-minute technical video conversation with our engineering team on March 18, 2025 at 2:00 PM EST.

Please confirm your availability by responding to this email or accessing our scheduling calendar: https://meet.google.com/apex-interview-tech

Best regards,
Sarah Jenkins
Talent Acquisition Lead, Apex Cloud Solutions`
  },
  scam: {
    subject: 'URGENT: Immediate Job Offer - $5,000 Weekly Guaranteed',
    sender: 'hr-talent-department992@gmail.com',
    body: `Dear Applicant,

Congratulations! We reviewed your resume online and you have been immediately accepted for the position of Data Operations Specialist. No interview is required!

Your starting pay is $5,000 per week. To finalize your employment and receive your company MacBook and home office setup, you must urgently send a $350 processing fee via wire transfer or Bitcoin to our equipment vendor today. Also reply with your Social Security Number and banking routing details.

Act now within 2 hours or this offer expires immediately. Telegram us at @quickhireops to proceed.`
  },
  rejection: {
    subject: 'Update on your application with Horizon Tech',
    sender: 'careers@horizontech.com',
    body: `Hi Alex,

Thank you for your interest in the Lead Software Architect position at Horizon Tech. We received many strong applications for this role.

While your background is impressive, we have decided to move forward with other candidates whose experience more closely aligns with our immediate requirements at this time.

We will keep your profile in our candidate pool for future opportunities that match your skill set. We wish you every success in your job search.`
  }
};

export const EmailGuardianPage = () => {
  const [subject, setSubject] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [emailText, setEmailText] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);

  const loadSample = (type) => {
    const s = SAMPLE_EMAILS[type];
    if (s) {
      setSubject(s.subject);
      setSenderEmail(s.sender);
      setEmailText(s.body);
    }
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!emailText.trim()) return;

    try {
      setAnalyzing(true);
      const res = await api.emailGuardian.analyze({
        subject,
        senderEmail,
        emailText
      });
      if (res.success && res.analysis) {
        setAnalysis(res.analysis);
      }
    } catch (err) {
      alert(err.message || 'Error analyzing communication.');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>
          Email Guardian & Scam Risk Shield
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem' }}>
          Analyze recruiter messages, verify authenticity, extract meeting dates, and avoid employment scams.
        </p>
      </div>

      {/* Quick Load Test Samples */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Try Sample Inputs:</span>
        <button
          type="button"
          onClick={() => loadSample('interview')}
          className="btn btn-outline btn-sm"
        >
          ✓ Legitimate Interview Invite
        </button>
        <button
          type="button"
          onClick={() => loadSample('scam')}
          className="btn btn-outline btn-sm"
          style={{ borderColor: 'var(--danger)', color: 'var(--danger)' }}
        >
          ⚠️ Phishing / Money Scam Sample
        </button>
        <button
          type="button"
          onClick={() => loadSample('rejection')}
          className="btn btn-outline btn-sm"
        >
          ℹ️ Standard Rejection Notice
        </button>
      </div>

      {/* Input Form & Results */}
      <div className="grid-2">
        {/* Left: Input */}
        <Card title="Recruiter Communication Input">
          <form onSubmit={handleAnalyze} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Sender Email Address (Optional)</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. recruiter@company.com or @gmail.com"
                value={senderEmail}
                onChange={(e) => setSenderEmail(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Subject Line (Optional)</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Invitation to Interview"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Body Text *</label>
              <textarea
                className="form-textarea"
                style={{ minHeight: '220px', lineHeight: 1.5 }}
                placeholder="Paste the complete text of the recruiter email or job offer message here..."
                value={emailText}
                onChange={(e) => setEmailText(e.target.value)}
                required
              />
            </div>

            <Button type="submit" variant="primary" loading={analyzing} disabled={!emailText.trim()}>
              <ShieldAlert size={16} /> Scan & Analyze Message
            </Button>
          </form>
        </Card>

        {/* Right: Analysis Results */}
        <div>
          {analyzing ? (
            <LoadingSpinner text="Scanning message headers, URLs, and risk patterns..." />
          ) : analysis ? (
            <Card
              title="Automated Guardian Analysis"
              subtitle="Safety classification & extracted information"
              action={
                <Badge variant={analysis.riskLevel === 'Low Risk' ? 'success' : analysis.riskLevel === 'Medium Risk' ? 'warning' : 'danger'}>
                  {analysis.riskLevel} ({analysis.riskScore}/100)
                </Badge>
              }
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {/* Category & Risk Score */}
                <div style={{ padding: '1rem', backgroundColor: 'var(--bg-muted)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                      Communication Category
                    </span>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {analysis.category}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                      Authenticity Safety
                    </span>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: analysis.riskScore >= 50 ? 'var(--danger)' : 'var(--success)' }}>
                      {100 - analysis.riskScore}% Safe
                    </div>
                  </div>
                </div>

                {/* Risk Signals */}
                {analysis.signals?.length > 0 && (
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--danger)' }}>
                      <AlertTriangle size={16} /> Flagged Suspicious Signals:
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {analysis.signals.map((sig, idx) => (
                        <div
                          key={idx}
                          style={{
                            padding: '0.65rem 0.85rem',
                            borderRadius: 'var(--radius-md)',
                            backgroundColor: sig.type === 'danger' ? 'var(--danger-bg)' : 'var(--warning-bg)',
                            color: sig.type === 'danger' ? 'var(--danger)' : 'var(--warning)',
                            fontSize: '0.85rem',
                            lineHeight: 1.4
                          }}
                        >
                          ⚠️ {sig.message}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Extracted Dates & Links */}
                {(analysis.extractedDates?.length > 0 || analysis.extractedLinks?.length > 0) && (
                  <div style={{ backgroundColor: 'var(--bg-muted)', padding: '1rem', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>Extracted Metadata:</div>
                    {analysis.extractedDates?.length > 0 && (
                      <div style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Calendar size={15} style={{ color: 'var(--primary)' }} />
                        <span>Dates Detected: <strong>{analysis.extractedDates.join(', ')}</strong></span>
                      </div>
                    )}
                    {analysis.extractedLinks?.length > 0 && (
                      <div style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <ExternalLink size={15} style={{ color: 'var(--primary)' }} />
                        <span>Links Detected:</span>
                        {analysis.extractedLinks.map((link, idx) => (
                          <span key={idx} style={{ color: 'var(--primary)', wordBreak: 'break-all' }}>{link}</span>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Recommended Actions */}
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                    Recommended Next Actions:
                  </div>
                  <ul style={{ paddingLeft: '1.25rem', fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    {analysis.recommendations?.map((rec, idx) => (
                      <li key={idx}>{rec}</li>
                    ))}
                  </ul>
                </div>

                {/* Legal Disclaimer */}
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem', lineHeight: 1.4 }}>
                  {analysis.disclaimer}
                </div>
              </div>
            </Card>
          ) : (
            <Card style={{ textAlign: 'center', padding: '3.5rem 1.5rem', color: 'var(--text-muted)' }}>
              <ShieldCheck size={42} style={{ margin: '0 auto 1rem', opacity: 0.4 }} />
              <h4 style={{ fontWeight: 700, marginBottom: '0.25rem' }}>Awaiting Communication Text</h4>
              <p style={{ fontSize: '0.85rem' }}>Paste any job message or try our sample inputs above to scan for risks.</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
