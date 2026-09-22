import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart3,
  TrendingUp,
  Award,
  Layers,
  Calendar,
  CheckCircle,
  Clock,
  ArrowRight,
  Briefcase,
  FileText
} from 'lucide-react';
import { api } from '../services/api.js';
import { Card } from '../components/common/Card.jsx';
import { Badge } from '../components/common/Badge.jsx';
import { Button } from '../components/common/Button.jsx';
import { LoadingSpinner } from '../components/common/LoadingSpinner.jsx';
import { EmptyState } from '../components/common/EmptyState.jsx';

export const AnalyticsPage = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const res = await api.analytics.get();
        if (res.success) {
          setAnalytics(res.data);
        }
      } catch (err) {
        console.error('Analytics error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return <LoadingSpinner text="Aggregating your career telemetry..." fullScreen />;
  }

  const hasData = analytics?.hasData;
  const statusCounts = analytics?.statusCounts || {};
  const total = analytics?.totalApplications || 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>
          Job Search Analytics & Insights
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem' }}>
          Real-time metrics on conversion funnels, interview progression, and resume ATS readiness.
        </p>
      </div>

      {!hasData ? (
        <EmptyState
          icon={BarChart3}
          title="No analytics recorded yet"
          description="Submit job applications or track active opportunities in your pipeline to generate data-driven funnel insights and conversion benchmarks."
          action={
            <Link to="/jobs" className="btn btn-primary">
              <Briefcase size={16} /> Discover & Apply to Jobs
            </Link>
          }
        />
      ) : (
        <>
          {/* Top Metric Cards */}
          <div className="grid-4">
            <Card style={{ padding: '1.25rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Total Submissions</span>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.35rem' }}>
                {analytics.totalApplications}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                {analytics.activeSubmissions} active in pipeline
              </div>
            </Card>

            <Card style={{ padding: '1.25rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Interview Conversion</span>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary)', marginTop: '0.35rem' }}>
                {analytics.conversionRates?.interviewRate || 0}%
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                Industry avg: ~15-20%
              </div>
            </Card>

            <Card style={{ padding: '1.25rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Offer Conversion</span>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--success)', marginTop: '0.35rem' }}>
                {analytics.conversionRates?.offerRate || 0}%
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                {statusCounts.Offer || 0} offers received
              </div>
            </Card>

            <Card style={{ padding: '1.25rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>ATS Resume Score</span>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--warning)', marginTop: '0.35rem' }}>
                {analytics.resumeScore || 85}/100
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                Optimal range: 80+
              </div>
            </Card>
          </div>

          {/* Conversion Funnel & Stage Breakdown */}
          <div className="grid-2">
            {/* Stage Distribution Visual Bars */}
            <Card
              title="Pipeline Stage Distribution"
              subtitle="Where your applications currently reside"
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {[
                  { label: 'Saved Opportunities', count: statusCounts.Saved || 0, color: 'var(--border-medium)' },
                  { label: 'Applied (Submitted)', count: statusCounts.Applied || 0, color: 'var(--primary)' },
                  { label: 'Screening Round', count: statusCounts.Screening || 0, color: 'var(--info)' },
                  { label: 'Active Interviews', count: statusCounts.Interview || 0, color: 'var(--warning)' },
                  { label: 'Job Offers', count: statusCounts.Offer || 0, color: 'var(--success)' },
                  { label: 'Archived / Rejected', count: statusCounts.Rejected || 0, color: 'var(--danger)' }
                ].map((item, idx) => {
                  const pct = total > 0 ? Math.round((item.count / total) * 100) : 0;
                  return (
                    <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                        <span style={{ fontWeight: 600 }}>{item.label}</span>
                        <span style={{ color: 'var(--text-muted)' }}>{item.count} ({pct}%)</span>
                      </div>
                      <div style={{ height: '8px', backgroundColor: 'var(--bg-muted)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                        <div style={{ width: `${pct}%`, height: '100%', backgroundColor: item.color, borderRadius: 'var(--radius-full)', transition: 'width 400ms ease' }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Application Velocity Timeline */}
            <Card
              title="Application Volume History"
              subtitle="Monthly submission velocity"
            >
              <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '220px', padding: '1rem 0 0.5rem' }}>
                {analytics.timeline?.map((item, idx) => {
                  const maxApps = Math.max(...(analytics.timeline.map(t => t.applications) || [1]), 1);
                  const barHeight = Math.max((item.applications / maxApps) * 160, 12);

                  return (
                    <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {item.applications}
                      </span>
                      <div
                        style={{
                          width: '28px',
                          height: `${barHeight}px`,
                          backgroundColor: 'var(--primary)',
                          borderRadius: '4px',
                          transition: 'height 400ms ease'
                        }}
                      />
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                        {item.month.split(' ')[0]}
                      </span>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  );
};
