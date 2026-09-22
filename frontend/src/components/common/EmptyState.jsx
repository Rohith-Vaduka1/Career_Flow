import React from 'react';
import { Sparkles } from 'lucide-react';

export const EmptyState = ({
  icon: Icon = Sparkles,
  title,
  description,
  action,
  className = ''
}) => {
  return (
    <div
      className={`cf-card ${className}`}
      style={{
        textAlign: 'center',
        padding: '3rem 1.5rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <div
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          backgroundColor: 'var(--primary-light)',
          color: 'var(--primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1rem'
        }}
      >
        <Icon size={28} />
      </div>
      <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--text-primary)' }}>
        {title}
      </h3>
      <p style={{ maxWidth: '420px', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: action ? '1.5rem' : '0' }}>
        {description}
      </p>
      {action && <div>{action}</div>}
    </div>
  );
};
