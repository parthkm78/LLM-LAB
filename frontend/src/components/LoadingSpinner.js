import React from 'react';

const LoadingSpinner = ({ size = 'medium', color = 'blue', message = '' }) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8', 
    large: 'w-12 h-12'
  };

  const colorClasses = {
    blue: 'border-blue-600',
    gray: 'border-gray-600',
    white: 'border-white'
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <div className={`
        ${sizeClasses[size]} 
        border-4 border-gray-200 ${colorClasses[color]} 
        border-t-transparent rounded-full animate-spin
      `}></div>
      {message && (
        <p className="mt-2 text-sm text-gray-600">{message}</p>
      )}
    </div>
  );
};

export default LoadingSpinner;
