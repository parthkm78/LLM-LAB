import React from 'react';

const MetricsCard = ({ title, value, description, icon, color = 'blue' }) => {
  const colorClasses = {
    blue: 'from-blue-50 to-blue-100 border-blue-200 text-blue-700',
    green: 'from-green-50 to-green-100 border-green-200 text-green-700',
    purple: 'from-purple-50 to-purple-100 border-purple-200 text-purple-700',
    orange: 'from-orange-50 to-orange-100 border-orange-200 text-orange-700',
    red: 'from-red-50 to-red-100 border-red-200 text-red-700'
  };

  return (
    <div className={`bg-gradient-to-r ${colorClasses[color]} border rounded-lg p-6 transition-all duration-200 hover:shadow-md`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {icon && (
          <div className="text-2xl">
            {icon}
          </div>
        )}
      </div>
      
      <div className="text-3xl font-bold text-gray-900 mb-2">
        {typeof value === 'number' ? value.toFixed(2) : value}
      </div>
      
      {description && (
        <p className="text-sm text-gray-600">
          {description}
        </p>
      )}
    </div>
  );
};

export default MetricsCard;
