/**
 * @fileoverview Data Validation Utilities
 * @description Comprehensive validation functions for request data
 * 
 * @author LLM-LAB Team
 * @version 1.0.0
 * @since 2025-10-28
 */

/**
 * Validate experiment data for creation and updates
 * @param {Object} data - Experiment data to validate
 * @param {boolean} isUpdate - Whether this is an update operation (allows partial data)
 * @returns {Object} Validation result with isValid flag and errors array
 */
function validateExperimentData(data, isUpdate = false) {
  const errors = [];
  const result = { isValid: true, errors: [] };

  // Required fields for creation
  if (!isUpdate) {
    if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
      errors.push('Name is required and must be a non-empty string');
    }

    if (!data.prompt || typeof data.prompt !== 'string' || data.prompt.trim().length === 0) {
      errors.push('Prompt is required and must be a non-empty string');
    }
  }

  // Validate name if provided
  if (data.name !== undefined) {
    if (typeof data.name !== 'string' || data.name.trim().length === 0) {
      errors.push('Name must be a non-empty string');
    } else if (data.name.trim().length > 255) {
      errors.push('Name must be less than 255 characters');
    }
  }

  // Validate description if provided
  if (data.description !== undefined) {
    if (typeof data.description !== 'string') {
      errors.push('Description must be a string');
    } else if (data.description.length > 1000) {
      errors.push('Description must be less than 1000 characters');
    }
  }

  // Validate prompt if provided
  if (data.prompt !== undefined) {
    if (typeof data.prompt !== 'string' || data.prompt.trim().length === 0) {
      errors.push('Prompt must be a non-empty string');
    } else if (data.prompt.length > 5000) {
      errors.push('Prompt must be less than 5000 characters');
    }
  }

  // Validate temperature parameters
  if (data.temperature_min !== undefined) {
    if (!isValidNumber(data.temperature_min, 0, 2)) {
      errors.push('Temperature min must be a number between 0 and 2');
    }
  }

  if (data.temperature_max !== undefined) {
    if (!isValidNumber(data.temperature_max, 0, 2)) {
      errors.push('Temperature max must be a number between 0 and 2');
    }
  }

  if (data.temperature_step !== undefined) {
    if (!isValidNumber(data.temperature_step, 0.01, 1)) {
      errors.push('Temperature step must be a number between 0.01 and 1');
    }
  }

  // Validate temperature range consistency
  if (data.temperature_min !== undefined && data.temperature_max !== undefined) {
    if (data.temperature_min > data.temperature_max) {
      errors.push('Temperature min cannot be greater than temperature max');
    }
  }

  // Validate top_p parameters
  if (data.top_p_min !== undefined) {
    if (!isValidNumber(data.top_p_min, 0, 1)) {
      errors.push('Top P min must be a number between 0 and 1');
    }
  }

  if (data.top_p_max !== undefined) {
    if (!isValidNumber(data.top_p_max, 0, 1)) {
      errors.push('Top P max must be a number between 0 and 1');
    }
  }

  if (data.top_p_step !== undefined) {
    if (!isValidNumber(data.top_p_step, 0.01, 1)) {
      errors.push('Top P step must be a number between 0.01 and 1');
    }
  }

  // Validate top_p range consistency
  if (data.top_p_min !== undefined && data.top_p_max !== undefined) {
    if (data.top_p_min > data.top_p_max) {
      errors.push('Top P min cannot be greater than top P max');
    }
  }

  // Validate frequency penalty parameters
  if (data.frequency_penalty_min !== undefined) {
    if (!isValidNumber(data.frequency_penalty_min, -2, 2)) {
      errors.push('Frequency penalty min must be a number between -2 and 2');
    }
  }

  if (data.frequency_penalty_max !== undefined) {
    if (!isValidNumber(data.frequency_penalty_max, -2, 2)) {
      errors.push('Frequency penalty max must be a number between -2 and 2');
    }
  }

  // Validate presence penalty parameters
  if (data.presence_penalty_min !== undefined) {
    if (!isValidNumber(data.presence_penalty_min, -2, 2)) {
      errors.push('Presence penalty min must be a number between -2 and 2');
    }
  }

  if (data.presence_penalty_max !== undefined) {
    if (!isValidNumber(data.presence_penalty_max, -2, 2)) {
      errors.push('Presence penalty max must be a number between -2 and 2');
    }
  }

  // Validate max_tokens
  if (data.max_tokens !== undefined) {
    if (!Number.isInteger(data.max_tokens) || data.max_tokens < 1 || data.max_tokens > 8192) {
      errors.push('Max tokens must be an integer between 1 and 8192');
    }
  }

  // Validate response_count
  if (data.response_count !== undefined) {
    if (!Number.isInteger(data.response_count) || data.response_count < 1 || data.response_count > 50) {
      errors.push('Response count must be an integer between 1 and 50');
    }
  }

  // Validate model
  if (data.model !== undefined) {
    const validModels = [
      'gpt-3.5-turbo',
      'gpt-3.5-turbo-16k',
      'gpt-4',
      'gpt-4-turbo-preview',
      'gpt-4-1106-preview'
    ];
    
    if (typeof data.model !== 'string' || !validModels.includes(data.model)) {
      errors.push(`Model must be one of: ${validModels.join(', ')}`);
    }
  }

  // Validate status if provided (for updates)
  if (data.status !== undefined) {
    const validStatuses = ['pending', 'running', 'completed', 'failed', 'cancelled'];
    if (!validStatuses.includes(data.status)) {
      errors.push(`Status must be one of: ${validStatuses.join(', ')}`);
    }
  }

  result.errors = errors;
  result.isValid = errors.length === 0;

  return result;
}

/**
 * Validate response data
 * @param {Object} data - Response data to validate
 * @returns {Object} Validation result
 */
function validateResponseData(data) {
  const errors = [];
  const result = { isValid: true, errors: [] };

  // Required fields
  if (!data.experiment_id || !Number.isInteger(data.experiment_id) || data.experiment_id < 1) {
    errors.push('Experiment ID is required and must be a positive integer');
  }

  if (!data.content || typeof data.content !== 'string' || data.content.trim().length === 0) {
    errors.push('Content is required and must be a non-empty string');
  }

  if (!data.prompt || typeof data.prompt !== 'string' || data.prompt.trim().length === 0) {
    errors.push('Prompt is required and must be a non-empty string');
  }

  // Validate parameters
  if (data.temperature !== undefined && !isValidNumber(data.temperature, 0, 2)) {
    errors.push('Temperature must be a number between 0 and 2');
  }

  if (data.top_p !== undefined && !isValidNumber(data.top_p, 0, 1)) {
    errors.push('Top P must be a number between 0 and 1');
  }

  if (data.frequency_penalty !== undefined && !isValidNumber(data.frequency_penalty, -2, 2)) {
    errors.push('Frequency penalty must be a number between -2 and 2');
  }

  if (data.presence_penalty !== undefined && !isValidNumber(data.presence_penalty, -2, 2)) {
    errors.push('Presence penalty must be a number between -2 and 2');
  }

  if (data.max_tokens !== undefined) {
    if (!Number.isInteger(data.max_tokens) || data.max_tokens < 1 || data.max_tokens > 8192) {
      errors.push('Max tokens must be an integer between 1 and 8192');
    }
  }

  if (data.model !== undefined) {
    const validModels = [
      'gpt-3.5-turbo',
      'gpt-3.5-turbo-16k',
      'gpt-4',
      'gpt-4-turbo-preview',
      'gpt-4-1106-preview'
    ];
    
    if (typeof data.model !== 'string' || !validModels.includes(data.model)) {
      errors.push(`Model must be one of: ${validModels.join(', ')}`);
    }
  }

  // Validate quality scores if provided
  const qualityFields = [
    'coherence_score',
    'completeness_score',
    'readability_score',
    'creativity_score',
    'specificity_score',
    'length_appropriateness_score'
  ];

  qualityFields.forEach(field => {
    if (data[field] !== undefined && !isValidNumber(data[field], 0, 1)) {
      errors.push(`${field} must be a number between 0 and 1`);
    }
  });

  // Validate response time
  if (data.response_time !== undefined && (!Number.isFinite(data.response_time) || data.response_time < 0)) {
    errors.push('Response time must be a non-negative number');
  }

  // Validate token count
  if (data.token_count !== undefined && (!Number.isInteger(data.token_count) || data.token_count < 0)) {
    errors.push('Token count must be a non-negative integer');
  }

  result.errors = errors;
  result.isValid = errors.length === 0;

  return result;
}

/**
 * Validate pagination parameters
 * @param {Object} query - Query parameters
 * @returns {Object} Validation result with sanitized values
 */
function validatePaginationParams(query) {
  const result = {
    isValid: true,
    errors: [],
    sanitized: {}
  };

  // Validate page
  const page = parseInt(query.page, 10);
  if (isNaN(page) || page < 1) {
    result.sanitized.page = 1;
  } else if (page > 10000) {
    result.errors.push('Page number cannot exceed 10000');
    result.isValid = false;
  } else {
    result.sanitized.page = page;
  }

  // Validate limit
  const limit = parseInt(query.limit, 10);
  if (isNaN(limit) || limit < 1) {
    result.sanitized.limit = 10;
  } else if (limit > 100) {
    result.errors.push('Limit cannot exceed 100');
    result.isValid = false;
  } else {
    result.sanitized.limit = limit;
  }

  // Validate sort order
  const validSortOrders = ['ASC', 'DESC'];
  if (query.sortOrder && !validSortOrders.includes(query.sortOrder.toUpperCase())) {
    result.errors.push('Sort order must be ASC or DESC');
    result.isValid = false;
  } else {
    result.sanitized.sortOrder = query.sortOrder ? query.sortOrder.toUpperCase() : 'DESC';
  }

  return result;
}

/**
 * Validate filter parameters for experiments
 * @param {Object} filters - Filter parameters
 * @returns {Object} Validation result
 */
function validateExperimentFilters(filters) {
  const result = {
    isValid: true,
    errors: [],
    sanitized: {}
  };

  // Validate status filter
  if (filters.status) {
    const validStatuses = ['pending', 'running', 'completed', 'failed', 'cancelled'];
    if (!validStatuses.includes(filters.status)) {
      result.errors.push(`Status filter must be one of: ${validStatuses.join(', ')}`);
      result.isValid = false;
    } else {
      result.sanitized.status = filters.status;
    }
  }

  // Validate search term
  if (filters.search) {
    if (typeof filters.search !== 'string') {
      result.errors.push('Search term must be a string');
      result.isValid = false;
    } else if (filters.search.length > 100) {
      result.errors.push('Search term cannot exceed 100 characters');
      result.isValid = false;
    } else {
      result.sanitized.search = filters.search.trim();
    }
  }

  // Validate date range filters
  if (filters.startDate) {
    const startDate = new Date(filters.startDate);
    if (isNaN(startDate.getTime())) {
      result.errors.push('Start date must be a valid date');
      result.isValid = false;
    } else {
      result.sanitized.startDate = startDate.toISOString();
    }
  }

  if (filters.endDate) {
    const endDate = new Date(filters.endDate);
    if (isNaN(endDate.getTime())) {
      result.errors.push('End date must be a valid date');
      result.isValid = false;
    } else {
      result.sanitized.endDate = endDate.toISOString();
    }
  }

  return result;
}

/**
 * Helper function to validate if a value is a valid number within range
 * @param {any} value - Value to validate
 * @param {number} min - Minimum allowed value
 * @param {number} max - Maximum allowed value
 * @returns {boolean} Whether the value is valid
 */
function isValidNumber(value, min, max) {
  return typeof value === 'number' && 
         Number.isFinite(value) && 
         value >= min && 
         value <= max;
}

/**
 * Sanitize string input by trimming whitespace and limiting length
 * @param {string} input - Input string
 * @param {number} maxLength - Maximum allowed length
 * @returns {string} Sanitized string
 */
function sanitizeString(input, maxLength = 1000) {
  if (typeof input !== 'string') {
    return '';
  }
  
  return input.trim().slice(0, maxLength);
}

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} Whether email is valid
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return typeof email === 'string' && emailRegex.test(email);
}

/**
 * Validate URL format
 * @param {string} url - URL to validate
 * @returns {boolean} Whether URL is valid
 */
function isValidURL(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

module.exports = {
  validateExperimentData,
  validateResponseData,
  validatePaginationParams,
  validateExperimentFilters,
  isValidNumber,
  sanitizeString,
  isValidEmail,
  isValidURL
};
