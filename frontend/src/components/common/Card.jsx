import React from 'react';

export const Card = ({
  children,
  title,
  subtitle,
  action,
  interactive = false,
  className = '',
  style = {},
  ...props
}) => {
  return (
    <div
      className={`cf-card ${interactive ? 'cf-card-interactive' : ''} ${className}`}
      style={style}
      {...props}
    >
      {(title || action) && (
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            marginBottom: '1.25rem',
            gap: '1rem'
          }}
        >
          <div>
            {title && (
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {title}
              </h3>
            )}
            {subtitle && (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                {subtitle}
              </p>
            )}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
};
