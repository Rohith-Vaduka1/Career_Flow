import React from 'react';

export const Badge = ({
  children,
  variant = 'primary',
  className = '',
  icon: Icon,
  ...props
}) => {
  return (
    <span className={`badge badge-${variant} ${className}`} {...props}>
      {Icon && <Icon size={12} />}
      {children}
    </span>
  );
};
