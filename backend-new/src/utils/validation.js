/**
 * Validation Utilities
 * 
 * Common validation functions used across the application.
 * Provides reusable validation logic for parameters, data types, and business rules.
 */

/**
 * Validate experiment parameters
 * @param {Object} parameters - Experiment parameters
 * @returns {Object} Validation result
 */
const validateExperimentParameters = (parameters) => {
  const errors = {};

  if (parameters.temperature !== undefined) {
    if (typeof parameters.temperature !== 'number') {
      errors.temperature = 'Temperature must be a number';
    } else if (parameters.temperature < 0 || parameters.temperature > 2) {
      errors.temperature = 'Temperature must be between 0 and 2';
    }
  }

  if (parameters.top_p !== undefined) {
    if (typeof parameters.top_p !== 'number') {
      errors.top_p = 'Top_p must be a number';
    } else if (parameters.top_p < 0 || parameters.top_p > 1) {
      errors.top_p = 'Top_p must be between 0 and 1';
    }
  }

  if (parameters.max_tokens !== undefined) {
    if (!Number.isInteger(parameters.max_tokens)) {
      errors.max_tokens = 'Max_tokens must be an integer';
    } else if (parameters.max_tokens < 1 || parameters.max_tokens > 8192) {
      errors.max_tokens = 'Max_tokens must be between 1 and 8192';
    }
  }

  if (parameters.frequency_penalty !== undefined) {
    if (typeof parameters.frequency_penalty !== 'number') {
      errors.frequency_penalty = 'Frequency_penalty must be a number';
    } else if (parameters.frequency_penalty < -2 || parameters.frequency_penalty > 2) {
      errors.frequency_penalty = 'Frequency_penalty must be between -2 and 2';
    }
  }

  if (parameters.presence_penalty !== undefined) {
    if (typeof parameters.presence_penalty !== 'number') {
      errors.presence_penalty = 'Presence_penalty must be a number';
    } else if (parameters.presence_penalty < -2 || parameters.presence_penalty > 2) {
      errors.presence_penalty = 'Presence_penalty must be between -2 and 2';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validate parameter grid for batch experiments
 * @param {Object} parameterGrid - Parameter grid configuration
 * @returns {Object} Validation result
 */
const validateParameterGrid = (parameterGrid) => {
  const errors = {};

  if (!parameterGrid || typeof parameterGrid !== 'object') {
    return {
      isValid: false,
      errors: { parameter_grid: 'Parameter grid is required and must be an object' }
    };
  }

  // Validate temperature range
  if (parameterGrid.temperature) {
    const temp = parameterGrid.temperature;
    if (typeof temp !== 'object' || temp.min === undefined || temp.max === undefined || temp.step === undefined) {
      errors.temperature = 'Temperature range must include min, max, and step values';
    } else if (temp.min < 0 || temp.max > 2 || temp.min >= temp.max) {
      errors.temperature = 'Temperature range must be between 0-2 with min < max';
    } else if (temp.step <= 0 || temp.step > (temp.max - temp.min)) {
      errors.temperature = 'Temperature step must be positive and less than range';
    }
  }

  // Validate top_p range
  if (parameterGrid.top_p) {
    const topP = parameterGrid.top_p;
    if (typeof topP !== 'object' || topP.min === undefined || topP.max === undefined || topP.step === undefined) {
      errors.top_p = 'Top_p range must include min, max, and step values';
    } else if (topP.min < 0 || topP.max > 1 || topP.min >= topP.max) {
      errors.top_p = 'Top_p range must be between 0-1 with min < max';
    } else if (topP.step <= 0 || topP.step > (topP.max - topP.min)) {
      errors.top_p = 'Top_p step must be positive and less than range';
    }
  }

  // At least one parameter range must be specified
  if (!parameterGrid.temperature && !parameterGrid.top_p) {
    errors.parameter_grid = 'At least one parameter range (temperature or top_p) must be specified';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validate model name
 * @param {string} model - Model name
 * @returns {Object} Validation result
 */
const validateModel = (model) => {
  const validModels = [
    'gpt-4',
    'gpt-4-turbo',
    'gpt-3.5-turbo',
    'claude-3-opus',
    'claude-3-sonnet',
    'claude-3-haiku'
  ];

  const isValid = validModels.includes(model);
  
  return {
    isValid,
    errors: isValid ? {} : { model: `Model must be one of: ${validModels.join(', ')}` }
  };
};

/**
 * Validate experiment type
 * @param {string} type - Experiment type
 * @returns {Object} Validation result
 */
const validateExperimentType = (type) => {
  const validTypes = ['single', 'batch'];
  const isValid = validTypes.includes(type);
  
  return {
    isValid,
    errors: isValid ? {} : { type: `Type must be one of: ${validTypes.join(', ')}` }
  };
};

/**
 * Validate experiment status
 * @param {string} status - Experiment status
 * @returns {Object} Validation result
 */
const validateExperimentStatus = (status) => {
  const validStatuses = ['draft', 'running', 'completed', 'failed', 'cancelled', 'paused'];
  const isValid = validStatuses.includes(status);
  
  return {
    isValid,
    errors: isValid ? {} : { status: `Status must be one of: ${validStatuses.join(', ')}` }
  };
};

/**
 * Validate priority level
 * @param {string} priority - Priority level
 * @returns {Object} Validation result
 */
const validatePriority = (priority) => {
  const validPriorities = ['low', 'normal', 'high'];
  const isValid = validPriorities.includes(priority);
  
  return {
    isValid,
    errors: isValid ? {} : { priority: `Priority must be one of: ${validPriorities.join(', ')}` }
  };
};

/**
 * Validate export format
 * @param {string} format - Export format
 * @param {Array} [allowedFormats] - Allowed formats for this context
 * @returns {Object} Validation result
 */
const validateExportFormat = (format, allowedFormats = ['json', 'csv', 'xlsx', 'pdf']) => {
  const isValid = allowedFormats.includes(format);
  
  return {
    isValid,
    errors: isValid ? {} : { format: `Format must be one of: ${allowedFormats.join(', ')}` }
  };
};

/**
 * Validate date range
 * @param {string} dateFrom - Start date
 * @param {string} dateTo - End date
 * @returns {Object} Validation result
 */
const validateDateRange = (dateFrom, dateTo) => {
  const errors = {};

  if (dateFrom && !isValidDate(dateFrom)) {
    errors.date_from = 'Invalid date format for date_from (use ISO 8601)';
  }

  if (dateTo && !isValidDate(dateTo)) {
    errors.date_to = 'Invalid date format for date_to (use ISO 8601)';
  }

  if (dateFrom && dateTo && new Date(dateFrom) > new Date(dateTo)) {
    errors.date_range = 'date_from must be earlier than date_to';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validate quality range
 * @param {number} minQuality - Minimum quality
 * @param {number} maxQuality - Maximum quality
 * @returns {Object} Validation result
 */
const validateQualityRange = (minQuality, maxQuality) => {
  const errors = {};

  if (minQuality !== undefined) {
    const min = parseFloat(minQuality);
    if (isNaN(min) || min < 0 || min > 100) {
      errors.min_quality = 'min_quality must be a number between 0 and 100';
    }
  }

  if (maxQuality !== undefined) {
    const max = parseFloat(maxQuality);
    if (isNaN(max) || max < 0 || max > 100) {
      errors.max_quality = 'max_quality must be a number between 0 and 100';
    }
  }

  if (minQuality !== undefined && maxQuality !== undefined) {
    const min = parseFloat(minQuality);
    const max = parseFloat(maxQuality);
    if (!isNaN(min) && !isNaN(max) && min > max) {
      errors.quality_range = 'min_quality must be less than or equal to max_quality';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Check if a string is a valid date
 * @param {string} dateString - Date string to validate
 * @returns {boolean} True if valid date
 */
const isValidDate = (dateString) => {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date);
};

/**
 * Sanitize string input
 * @param {string} input - Input string
 * @param {number} [maxLength=1000] - Maximum allowed length
 * @returns {string} Sanitized string
 */
const sanitizeString = (input, maxLength = 1000) => {
  if (typeof input !== 'string') {
    return '';
  }
  
  return input
    .trim()
    .substring(0, maxLength)
    .replace(/[<>]/g, ''); // Basic XSS prevention
};

/**
 * Validate required fields
 * @param {Object} data - Data object
 * @param {Array} requiredFields - Array of required field names
 * @returns {Object} Validation result
 */
const validateRequiredFields = (data, requiredFields) => {
  const errors = {};

  requiredFields.forEach(field => {
    if (data[field] === undefined || data[field] === null || data[field] === '') {
      errors[field] = `${field} is required`;
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validate array of IDs
 * @param {Array} ids - Array of IDs
 * @param {string} [fieldName='ids'] - Field name for error messages
 * @returns {Object} Validation result
 */
const validateIdArray = (ids, fieldName = 'ids') => {
  if (!Array.isArray(ids)) {
    return {
      isValid: false,
      errors: { [fieldName]: `${fieldName} must be an array` }
    };
  }

  if (ids.length === 0) {
    return {
      isValid: false,
      errors: { [fieldName]: `${fieldName} array cannot be empty` }
    };
  }

  const invalidIds = ids.filter(id => !Number.isInteger(Number(id)) || Number(id) <= 0);
  if (invalidIds.length > 0) {
    return {
      isValid: false,
      errors: { [fieldName]: `All ${fieldName} must be positive integers` }
    };
  }

  return {
    isValid: true,
    errors: {}
  };
};

module.exports = {
  validateExperimentParameters,
  validateParameterGrid,
  validateModel,
  validateExperimentType,
  validateExperimentStatus,
  validatePriority,
  validateExportFormat,
  validateDateRange,
  validateQualityRange,
  validateRequiredFields,
  validateIdArray,
  sanitizeString,
  isValidDate
};
