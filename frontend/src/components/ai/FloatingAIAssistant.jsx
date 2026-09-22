import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, X, Send, Bot, User, Loader2, Maximize2, Minimize2 } from 'lucide-react';
import { api } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.jsx';

export const FloatingAIAssistant = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: `Hello ${user?.name ? user.name.split(' ')[0] : 'there'}! I am your Career Flow AI Assistant. I can help analyze your job matches, prepare you for upcoming interviews, optimize your resume for ATS, or recommend high-value skills to master next. What would you like to explore?`
    }
  ]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const quickPrompts = [
    'How can I improve my resume ATS score?',
    'What skills am I missing for my target role?',
    'Prepare me for an upcoming technical interview',
    'Which jobs should I prioritize applying to?'
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend) => {
    const query = textToSend || inputMessage;
    if (!query || !query.trim() || loading) return;

    const userMsg = { id: Date.now(), sender: 'user', text: query.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setLoading(true);

    try {
      const history = messages.slice(-5).map(m => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text
      }));

      const res = await api.ai.chat(query.trim(), history);
      if (res.success && res.reply) {
        setMessages(prev => [
          ...prev,
          { id: Date.now() + 1, sender: 'ai', text: res.reply }
        ]);
      }
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'ai',
          text: `I encountered a momentary issue: ${err.message}. Please try asking again.`
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            backgroundColor: 'var(--primary)',
            color: '#ffffff',
            padding: '0.8rem 1.25rem',
            borderRadius: 'var(--radius-full)',
            boxShadow: 'var(--shadow-glow)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            fontWeight: 700,
            fontSize: '0.925rem',
            zIndex: 900,
            border: '2px solid rgba(255, 255, 255, 0.2)',
            transition: 'transform var(--transition-fast)'
          }}
          className="ai-launcher-btn"
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          aria-label="Open AI Career Assistant"
        >
          <Sparkles size={19} />
          <span>AI Assistant</span>
        </button>
      )}

      {/* Slide-out AI Assistant Drawer */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            width: isExpanded ? '540px' : '380px',
            maxWidth: 'calc(100vw - 32px)',
            height: isExpanded ? '80vh' : '580px',
            maxHeight: 'calc(100vh - 40px)',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-medium)',
            borderRadius: 'var(--radius-xl)',
            boxShadow: 'var(--shadow-lg)',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 1000,
            overflow: 'hidden',
            animation: 'fadeIn 200ms ease-out'
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '1rem 1.25rem',
              backgroundColor: 'var(--bg-card)',
              borderBottom: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: 'var(--radius-md)',
                  background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff'
                }}
              >
                <Sparkles size={16} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Career Flow AI</div>
                <div style={{ fontSize: '0.725rem', color: 'var(--success)' }}>● Active Copilot</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <button
                onClick={() => setIsExpanded(prev => !prev)}
                style={{ padding: '0.35rem', color: 'var(--text-secondary)' }}
                title={isExpanded ? 'Collapse' : 'Expand'}
              >
                {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                style={{ padding: '0.35rem', color: 'var(--text-secondary)' }}
                aria-label="Close Assistant"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Messages Body */}
          <div
            style={{
              flex: 1,
              padding: '1.25rem',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}
          >
            {messages.map(msg => (
              <div
                key={msg.id}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.65rem',
                  alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '92%'
                }}
              >
                {msg.sender === 'ai' && (
                  <div
                    style={{
                      width: '26px',
                      height: '26px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--primary-light)',
                      color: 'var(--primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: '2px'
                    }}
                  >
                    <Bot size={15} />
                  </div>
                )}

                <div
                  style={{
                    backgroundColor: msg.sender === 'user' ? 'var(--primary)' : 'var(--bg-muted)',
                    color: msg.sender === 'user' ? '#ffffff' : 'var(--text-primary)',
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius-lg)',
                    borderBottomRightRadius: msg.sender === 'user' ? '4px' : 'var(--radius-lg)',
                    borderBottomLeftRadius: msg.sender === 'ai' ? '4px' : 'var(--radius-lg)',
                    fontSize: '0.875rem',
                    lineHeight: 1.45,
                    whiteSpace: 'pre-line'
                  }}
                >
                  {msg.text}
                </div>

                {msg.sender === 'user' && (
                  <div
                    style={{
                      width: '26px',
                      height: '26px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--border-medium)',
                      color: 'var(--text-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: '2px'
                    }}
                  >
                    <User size={15} />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                <Loader2 size={16} className="animate-spin" style={{ color: 'var(--primary)' }} />
                <span>Career Flow is formulating advice...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestion Pills */}
          {messages.length < 4 && (
            <div
              style={{
                padding: '0.5rem 1.25rem',
                display: 'flex',
                gap: '0.4rem',
                overflowX: 'auto',
                borderTop: '1px solid var(--border-subtle)'
              }}
            >
              {quickPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(prompt)}
                  style={{
                    padding: '0.35rem 0.65rem',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: 'var(--bg-muted)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-secondary)',
                    fontSize: '0.75rem',
                    whiteSpace: 'nowrap',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--primary)';
                    e.currentTarget.style.color = 'var(--primary)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-subtle)';
                    e.currentTarget.style.color = 'var(--text-secondary)';
                  }}
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}

          {/* Input Footer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            style={{
              padding: '0.85rem 1rem',
              backgroundColor: 'var(--bg-card)',
              borderTop: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <input
              type="text"
              placeholder="Ask anything about your career journey..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              disabled={loading}
              style={{
                flex: 1,
                padding: '0.65rem 0.9rem',
                backgroundColor: 'var(--bg-input)',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-primary)',
                fontSize: '0.875rem',
                outline: 'none'
              }}
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || loading}
              style={{
                width: '38px',
                height: '38px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--primary)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: !inputMessage.trim() || loading ? 'not-allowed' : 'pointer',
                opacity: !inputMessage.trim() || loading ? 0.6 : 1
              }}
              aria-label="Send message"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
