import React from 'react';

const Card = ({ 
  children, 
  title, 
  subtitle,
  className = '',
  headerActions,
  padding = 'normal'
}) => {
  const paddingClasses = {
    none: '',
    small: 'p-3 sm:p-4',
    normal: 'p-4 sm:p-6',
    large: 'p-6 sm:p-8'
  };

  return (
    <div className={`
      bg-white rounded-xl shadow-lg border border-gray-100 
      hover:shadow-xl transition-all duration-300 
      ${paddingClasses[padding]}
      ${className}
    `}>
      {(title || subtitle || headerActions) && (
        <div className={`${padding !== 'none' ? 'mb-4' : 'p-6 pb-4'} ${title || subtitle ? 'border-b border-gray-200' : ''}`}>
          <div className="flex justify-between items-start">
            <div>
              {title && (
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="text-sm text-gray-600">
                  {subtitle}
                </p>
              )}
            </div>
            {headerActions && (
              <div className="flex space-x-2">
                {headerActions}
              </div>
            )}
          </div>
        </div>
      )}
      
      <div className={padding === 'none' && (title || subtitle || headerActions) ? 'px-6 pb-6' : ''}>
        {children}
      </div>
    </div>
  );
};

export default Card;
