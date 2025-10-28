import React from 'react';

const Badge = ({ 
  children, 
  variant = 'default', 
  size = 'medium',
  className = '' 
}) => {
  const baseClasses = 'inline-flex items-center font-medium rounded-full';
  
  const variantClasses = {
    default: 'bg-gray-100 text-gray-800',
    primary: 'bg-blue-100 text-blue-800',
    secondary: 'bg-gray-100 text-gray-600',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800',
    info: 'bg-cyan-100 text-cyan-800'
  };
  
  const sizeClasses = {
    small: 'px-2 py-0.5 text-xs',
    medium: 'px-2.5 py-1 text-sm',
    large: 'px-3 py-1.5 text-base'
  };

  return (
    <span className={`
      ${baseClasses}
      ${variantClasses[variant]}
      ${sizeClasses[size]}
      ${className}
    `}>
      {children}
    </span>
  );
};

export const StatusBadge = ({ status, ...props }) => {
  const statusVariants = {
    draft: { variant: 'secondary', text: 'Draft' },
    processing: { variant: 'warning', text: 'Processing' },
    completed: { variant: 'success', text: 'Completed' },
    error: { variant: 'danger', text: 'Error' },
    pending: { variant: 'info', text: 'Pending' }
  };

  const config = statusVariants[status] || statusVariants.draft;

  return (
    <Badge variant={config.variant} {...props}>
      {config.text}
    </Badge>
  );
};

export const MetricBadge = ({ score, label, ...props }) => {
  const getVariant = (score) => {
    if (score >= 0.8) return 'success';
    if (score >= 0.6) return 'warning';
    if (score >= 0.4) return 'info';
    return 'danger';
  };

  return (
    <Badge variant={getVariant(score)} {...props}>
      {label}: {(score * 100).toFixed(1)}%
    </Badge>
  );
};

export default Badge;
