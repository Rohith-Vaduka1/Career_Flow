import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  BrainCircuit,
  Sparkles,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Send,
  RefreshCw,
  Award,
  ChevronRight,
  BookOpen,
  UserCheck
} from 'lucide-react';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { Card } from '../components/common/Card.jsx';
import { Button } from '../components/common/Button.jsx';
import { Badge } from '../components/common/Badge.jsx';
import { LoadingSpinner } from '../components/common/LoadingSpinner.jsx';

export const InterviewPrepPage = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();

  const [company, setCompany] = useState(searchParams.get('company') || 'Apex Cloud Solutions');
  const [role, setRole] = useState(searchParams.get('role') || user?.targetRole || 'Senior Full Stack Engineer');
  const [jobDescription, setJobDescription] = useState('');

  const [activeTab, setActiveTab] = useState('curated'); // 'curated' | 'mock'
  const [questionsData, setQuestionsData] = useState(null);
  const [loadingQuestions, setLoadingQuestions] = useState(false);

  // Mock Interview Mode state
  const [currentMockIndex, setCurrentMockIndex] = useState(0);
  const [mockAnswer, setMockAnswer] = useState('');
  const [mockEvaluation, setMockEvaluation] = useState(null);
  const [evaluating, setEvaluating] = useState(false);

  const handleGenerateQuestions = async () => {
    try {
      setLoadingQuestions(true);
      const res = await api.ai.generateQuestions({
        company,
        role,
        jobDescription
      });

      if (res.success && res.data) {
        setQuestionsData(res.data);
        setCurrentMockIndex(0);
        setMockEvaluation(null);
        setMockAnswer('');
      }
    } catch (err) {
      alert(err.message || 'Failed to generate interview questions.');
    } finally {
      setLoadingQuestions(false);
    }
  };

  useEffect(() => {
    handleGenerateQuestions();
  }, []);

  const allMockQuestions = questionsData ? [
    ...(questionsData.technical || []).map(q => ({ ...q, type: 'Technical' })),
    ...(questionsData.behavioral || []).map(q => ({ ...q, type: 'Behavioral' })),
    ...(questionsData.hr || []).map(q => ({ ...q, type: 'HR' }))
  ] : [];

  const currentQuestion = allMockQuestions[currentMockIndex] || null;

  const handleEvaluateMockAnswer = async (e) => {
    e.preventDefault();
    if (!currentQuestion || !mockAnswer.trim()) return;

    try {
      setEvaluating(true);
      const res = await api.ai.evaluateMockAnswer({
        question: currentQuestion.question,
        userAnswer: mockAnswer,
        role
      });

      if (res.success && res.evaluation) {
        setMockEvaluation(res.evaluation);
      }
    } catch (err) {
      alert(err.message || 'Evaluation failed.');
    } finally {
      setEvaluating(false);
    }
  };

  const handleNextMockQuestion = () => {
    if (currentMockIndex < allMockQuestions.length - 1) {
      setCurrentMockIndex(prev => prev + 1);
      setMockAnswer('');
      setMockEvaluation(null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>
          AI Interview Preparation & Mock Lab
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem' }}>
          Simulate real technical and behavioral rounds tailored to your target company and role.
        </p>
      </div>

      {/* Target Parameters Card */}
      <Card>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', alignItems: 'flex-end' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Target Company</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Apex Cloud Solutions"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Target Role</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Senior Full Stack Engineer"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            />
          </div>

          <Button
            variant="primary"
            onClick={handleGenerateQuestions}
            loading={loadingQuestions}
            style={{ height: '42px' }}
          >
            <Sparkles size={16} /> Generate Questions & Prep
          </Button>
        </div>
      </Card>

      {/* Tab Switcher */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border-subtle)', gap: '1rem' }}>
        <button
          onClick={() => setActiveTab('curated')}
          style={{
            padding: '0.75rem 1rem',
            fontWeight: 600,
            fontSize: '0.95rem',
            color: activeTab === 'curated' ? 'var(--primary)' : 'var(--text-secondary)',
            borderBottom: activeTab === 'curated' ? '2px solid var(--primary)' : '2px solid transparent',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem'
          }}
        >
          <BookOpen size={17} /> Curated Question Bank
        </button>

        <button
          onClick={() => setActiveTab('mock')}
          style={{
            padding: '0.75rem 1rem',
            fontWeight: 600,
            fontSize: '0.95rem',
            color: activeTab === 'mock' ? 'var(--accent)' : 'var(--text-secondary)',
            borderBottom: activeTab === 'mock' ? '2px solid var(--accent)' : '2px solid transparent',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem'
          }}
        >
          <BrainCircuit size={17} /> Interactive Mock Interviewer
        </button>
      </div>

      {loadingQuestions ? (
        <LoadingSpinner text="Generating company-specific questions and STAR guidance..." />
      ) : questionsData ? (
        <>
          {/* TAB 1: CURATED QUESTION BANK */}
          {activeTab === 'curated' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {/* Technical Questions */}
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <BrainCircuit size={20} style={{ color: 'var(--primary)' }} /> Technical Architecture & Systems Questions
                </h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {questionsData.technical?.map((item, idx) => (
                    <Card key={idx}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', marginBottom: '0.75rem' }}>
                        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                          Q{idx + 1}. {item.question}
                        </h3>
                        <Badge variant="primary">Technical</Badge>
                      </div>

                      <div style={{ backgroundColor: 'var(--bg-muted)', padding: '1rem', borderRadius: 'var(--radius-md)', fontSize: '0.875rem', lineHeight: 1.5, marginBottom: '0.75rem' }}>
                        <strong style={{ color: 'var(--text-primary)' }}>Recommended Strategic Answer:</strong>
                        <div style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                          {item.suggestedAnswer}
                        </div>
                      </div>

                      {item.topics?.length > 0 && (
                        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', alignSelf: 'center' }}>Key Topics:</span>
                          {item.topics.map((t, tidx) => (
                            <span key={tidx} className="skill-pill" style={{ fontSize: '0.75rem' }}>
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              </div>

              {/* Behavioral STAR Questions */}
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <MessageSquare size={20} style={{ color: 'var(--accent)' }} /> Behavioral & Leadership Questions (STAR Method)
                </h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {questionsData.behavioral?.map((item, idx) => (
                    <Card key={idx}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', marginBottom: '0.75rem' }}>
                        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                          Q{idx + 1}. {item.question}
                        </h3>
                        <Badge variant="warning">Behavioral</Badge>
                      </div>

                      {item.starGuidance && (
                        <div style={{ backgroundColor: 'var(--primary-light)', border: '1px solid rgba(59, 130, 246, 0.25)', padding: '0.85rem', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', marginBottom: '0.75rem' }}>
                          <strong style={{ color: 'var(--primary)' }}>STAR Method Framework:</strong>
                          <div style={{ color: 'var(--text-primary)', marginTop: '0.25rem' }}>
                            {item.starGuidance}
                          </div>
                        </div>
                      )}

                      <div style={{ backgroundColor: 'var(--bg-muted)', padding: '1rem', borderRadius: 'var(--radius-md)', fontSize: '0.875rem', lineHeight: 1.5 }}>
                        <strong style={{ color: 'var(--text-primary)' }}>Sample Exemplary Response:</strong>
                        <div style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                          {item.suggestedAnswer}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Questions to Ask Interviewer */}
              <Card
                title="Questions to Ask Your Interviewer"
                subtitle="High-caliber reverse-interviewing questions that leave a memorable impression"
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  {questionsData.questionsToAskInterviewer?.map((q, idx) => (
                    <div key={idx} style={{ padding: '0.75rem', backgroundColor: 'var(--bg-muted)', borderRadius: 'var(--radius-md)', fontSize: '0.875rem' }}>
                      💬 "{q}"
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {/* TAB 2: INTERACTIVE MOCK INTERVIEW */}
          {activeTab === 'mock' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {currentQuestion ? (
                <Card>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                      Question {currentMockIndex + 1} of {allMockQuestions.length}
                    </span>
                    <Badge variant="primary">{currentQuestion.type}</Badge>
                  </div>

                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.5rem', lineHeight: 1.4 }}>
                    {currentQuestion.question}
                  </h3>

                  <form onSubmit={handleEvaluateMockAnswer} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <label className="form-label">Your Spoken or Written Response:</label>
                    <textarea
                      className="form-textarea"
                      style={{ minHeight: '160px', fontSize: '0.925rem', lineHeight: 1.6 }}
                      placeholder="Structure your answer clearly. Mention technical tools, architectural decisions, and measurable outcomes..."
                      value={mockAnswer}
                      onChange={(e) => setMockAnswer(e.target.value)}
                      required
                    />

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                      <Button
                        type="submit"
                        variant="primary"
                        loading={evaluating}
                        disabled={!mockAnswer.trim()}
                      >
                        <Sparkles size={16} /> Evaluate My Answer with AI
                      </Button>

                      {currentMockIndex < allMockQuestions.length - 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleNextMockQuestion}
                        >
                          Next Question <ChevronRight size={16} />
                        </Button>
                      )}
                    </div>
                  </form>

                  {/* AI Evaluation Results */}
                  {mockEvaluation && (
                    <div
                      style={{
                        marginTop: '2rem',
                        padding: '1.5rem',
                        backgroundColor: 'var(--bg-muted)',
                        borderRadius: 'var(--radius-lg)',
                        border: '1px solid var(--border-medium)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1.25rem'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                            AI Performance Score
                          </span>
                          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary)' }}>
                            {mockEvaluation.score}/100
                          </div>
                        </div>
                        <Badge variant={mockEvaluation.score >= 80 ? 'success' : mockEvaluation.score >= 60 ? 'warning' : 'danger'}>
                          {mockEvaluation.score >= 80 ? 'Interview Ready' : 'Needs Polish'}
                        </Badge>
                      </div>

                      <p style={{ fontSize: '0.925rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                        {mockEvaluation.overallAssessment}
                      </p>

                      <div className="grid-3" style={{ fontSize: '0.85rem' }}>
                        <div>Clarity: <strong>{mockEvaluation.feedback?.clarity}</strong></div>
                        <div>Technical Grasp: <strong>{mockEvaluation.feedback?.technicalCorrectness}</strong></div>
                        <div>Delivery: <strong>{mockEvaluation.feedback?.communication}</strong></div>
                      </div>

                      {mockEvaluation.feedback?.missingPoints?.length > 0 && (
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--warning)', marginBottom: '0.35rem' }}>
                            Missing Points to Mention:
                          </div>
                          <ul style={{ paddingLeft: '1.25rem', fontSize: '0.85rem' }}>
                            {mockEvaluation.feedback.missingPoints.map((pt, idx) => (
                              <li key={idx}>{pt}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {mockEvaluation.feedback?.improvementSuggestions?.length > 0 && (
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--primary)', marginBottom: '0.35rem' }}>
                            Specific Improvement Recommendations:
                          </div>
                          <ul style={{ paddingLeft: '1.25rem', fontSize: '0.85rem' }}>
                            {mockEvaluation.feedback.improvementSuggestions.map((sug, idx) => (
                              <li key={idx}>{sug}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </Card>
              ) : null}
            </div>
          )}
        </>
      ) : null}
    </div>
  );
};
