import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingSpinner = ({ text = 'Loading data...', fullScreen = false }) => {
  const content = (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem 1rem',
        gap: '0.75rem',
        color: 'var(--text-secondary)'
      }}
    >
      <Loader2 className="animate-spin" size={32} style={{ color: 'var(--primary)' }} />
      <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{text}</span>
    </div>
  );

  if (fullScreen) {
    return (
      <div
        style={{
          minHeight: '80vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {content}
      </div>
    );
  }

  return content;
};
