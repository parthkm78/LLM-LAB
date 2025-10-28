import React from 'react';

const Input = ({ 
  label, 
  type = 'text', 
  error,
  helpText,
  required = false,
  className = '',
  labelClassName = '',
  inputClassName = '',
  ...props 
}) => {
  const inputClasses = `
    block w-full px-3 py-2 border rounded-md shadow-sm 
    focus:outline-none focus:ring-1 focus:border-transparent
    ${error 
      ? 'border-red-300 focus:ring-red-500 bg-red-50' 
      : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
    }
    ${inputClassName}
  `;

  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <label className={`block text-sm font-medium text-gray-700 ${labelClassName}`}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <input
        type={type}
        className={inputClasses}
        {...props}
      />
      
      {error && (
        <p className="text-sm text-red-600">
          {error}
        </p>
      )}
      
      {helpText && !error && (
        <p className="text-sm text-gray-500">
          {helpText}
        </p>
      )}
    </div>
  );
};

export const Textarea = ({ 
  label, 
  error,
  helpText,
  required = false,
  rows = 4,
  className = '',
  labelClassName = '',
  textareaClassName = '',
  ...props 
}) => {
  const textareaClasses = `
    block w-full px-3 py-2 border rounded-md shadow-sm 
    focus:outline-none focus:ring-1 focus:border-transparent resize-vertical
    ${error 
      ? 'border-red-300 focus:ring-red-500 bg-red-50' 
      : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
    }
    ${textareaClassName}
  `;

  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <label className={`block text-sm font-medium text-gray-700 ${labelClassName}`}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <textarea
        rows={rows}
        className={textareaClasses}
        {...props}
      />
      
      {error && (
        <p className="text-sm text-red-600">
          {error}
        </p>
      )}
      
      {helpText && !error && (
        <p className="text-sm text-gray-500">
          {helpText}
        </p>
      )}
    </div>
  );
};

export const Select = ({ 
  label, 
  options = [],
  error,
  helpText,
  required = false,
  placeholder = 'Select an option...',
  className = '',
  labelClassName = '',
  selectClassName = '',
  ...props 
}) => {
  const selectClasses = `
    block w-full px-3 py-2 border rounded-md shadow-sm 
    focus:outline-none focus:ring-1 focus:border-transparent
    ${error 
      ? 'border-red-300 focus:ring-red-500 bg-red-50' 
      : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
    }
    ${selectClassName}
  `;

  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <label className={`block text-sm font-medium text-gray-700 ${labelClassName}`}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <select
        className={selectClasses}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option, index) => (
          <option key={index} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      
      {error && (
        <p className="text-sm text-red-600">
          {error}
        </p>
      )}
      
      {helpText && !error && (
        <p className="text-sm text-gray-500">
          {helpText}
        </p>
      )}
    </div>
  );
};

export const Checkbox = ({ 
  label, 
  description,
  error,
  className = '',
  ...props 
}) => {
  return (
    <div className={`space-y-1 ${className}`}>
      <div className="flex items-start">
        <input
          type="checkbox"
          className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          {...props}
        />
        <div className="ml-3">
          {label && (
            <label className="block text-sm font-medium text-gray-700">
              {label}
            </label>
          )}
          {description && (
            <p className="text-sm text-gray-500">
              {description}
            </p>
          )}
        </div>
      </div>
      
      {error && (
        <p className="text-sm text-red-600 ml-7">
          {error}
        </p>
      )}
    </div>
  );
};

export default Input;
