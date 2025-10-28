/**
 * @fileoverview Request Validation Middleware
 * @description Middleware for validating request parameters, query strings, and body data
 * 
 * @author LLM-LAB Team
 * @version 1.0.0
 * @since 2025-10-28
 */

const { ValidationError } = require('../utils/errors');
const { 
  validateExperimentData, 
  validateResponseData, 
  validatePaginationParams,
  validateExperimentFilters 
} = require('../utils/validators');

/**
 * Validate experiment data in request body
 * @param {boolean} isUpdate - Whether this is an update operation
 * @returns {Function} Express middleware function
 */
function validateExperiment(isUpdate = false) {
  return (req, res, next) => {
    const validation = validateExperimentData(req.body, isUpdate);
    
    if (!validation.isValid) {
      return next(new ValidationError('Experiment validation failed', validation.errors));
    }
    
    next();
  };
}

/**
 * Validate response data in request body
 * @returns {Function} Express middleware function
 */
function validateResponse() {
  return (req, res, next) => {
    const validation = validateResponseData(req.body);
    
    if (!validation.isValid) {
      return next(new ValidationError('Response validation failed', validation.errors));
    }
    
    next();
  };
}

/**
 * Validate and sanitize pagination parameters
 * @returns {Function} Express middleware function
 */
function validatePagination() {
  return (req, res, next) => {
    const validation = validatePaginationParams(req.query);
    
    if (!validation.isValid) {
      return next(new ValidationError('Pagination validation failed', validation.errors));
    }
    
    // Replace query parameters with sanitized values
    req.query = { ...req.query, ...validation.sanitized };
    
    next();
  };
}

/**
 * Validate experiment filter parameters
 * @returns {Function} Express middleware function
 */
function validateFilters() {
  return (req, res, next) => {
    const validation = validateExperimentFilters(req.query);
    
    if (!validation.isValid) {
      return next(new ValidationError('Filter validation failed', validation.errors));
    }
    
    // Add sanitized filters to request
    req.filters = validation.sanitized;
    
    next();
  };
}

/**
 * Validate numeric ID parameter
 * @param {string} paramName - Name of the parameter to validate
 * @returns {Function} Express middleware function
 */
function validateIdParam(paramName = 'id') {
  return (req, res, next) => {
    const id = req.params[paramName];
    
    if (!id) {
      return next(new ValidationError(`${paramName} parameter is required`));
    }
    
    const numericId = parseInt(id, 10);
    
    if (isNaN(numericId) || numericId < 1) {
      return next(new ValidationError(`${paramName} must be a positive integer`));
    }
    
    // Add parsed ID to request for convenience
    req.parsedId = numericId;
    
    next();
  };
}

/**
 * Validate array of IDs in request body
 * @param {string} fieldName - Name of the field containing IDs
 * @param {Object} options - Validation options
 * @returns {Function} Express middleware function
 */
function validateIdArray(fieldName = 'ids', options = {}) {
  const { minLength = 1, maxLength = 100 } = options;
  
  return (req, res, next) => {
    const ids = req.body[fieldName];
    
    if (!ids) {
      return next(new ValidationError(`${fieldName} is required`));
    }
    
    if (!Array.isArray(ids)) {
      return next(new ValidationError(`${fieldName} must be an array`));
    }
    
    if (ids.length < minLength || ids.length > maxLength) {
      return next(new ValidationError(
        `${fieldName} must contain between ${minLength} and ${maxLength} items`
      ));
    }
    
    // Validate each ID
    const validIds = [];
    for (let i = 0; i < ids.length; i++) {
      const id = parseInt(ids[i], 10);
      if (isNaN(id) || id < 1) {
        return next(new ValidationError(
          `${fieldName}[${i}] must be a positive integer`
        ));
      }
      validIds.push(id);
    }
    
    // Check for duplicates
    const uniqueIds = [...new Set(validIds)];
    if (uniqueIds.length !== validIds.length) {
      return next(new ValidationError(`${fieldName} contains duplicate values`));
    }
    
    // Replace with validated IDs
    req.body[fieldName] = validIds;
    
    next();
  };
}

/**
 * Validate content type for specific routes
 * @param {string|Array} allowedTypes - Allowed content types
 * @returns {Function} Express middleware function
 */
function validateContentType(allowedTypes) {
  const types = Array.isArray(allowedTypes) ? allowedTypes : [allowedTypes];
  
  return (req, res, next) => {
    const contentType = req.get('Content-Type');
    
    if (!contentType) {
      return next(new ValidationError('Content-Type header is required'));
    }
    
    const isAllowed = types.some(type => contentType.includes(type));
    
    if (!isAllowed) {
      return next(new ValidationError(
        `Content-Type must be one of: ${types.join(', ')}`
      ));
    }
    
    next();
  };
}

/**
 * Validate request size limits
 * @param {Object} options - Size limit options
 * @returns {Function} Express middleware function
 */
function validateRequestSize(options = {}) {
  const { 
    maxBodySize = 1024 * 1024, // 1MB default
    maxQueryParams = 100,
    maxUrlLength = 2048
  } = options;
  
  return (req, res, next) => {
    // Check URL length
    if (req.url.length > maxUrlLength) {
      return next(new ValidationError('URL length exceeds maximum allowed'));
    }
    
    // Check query parameter count
    const queryParamCount = Object.keys(req.query).length;
    if (queryParamCount > maxQueryParams) {
      return next(new ValidationError('Too many query parameters'));
    }
    
    // Check body size (if body exists)
    const contentLength = req.get('Content-Length');
    if (contentLength && parseInt(contentLength, 10) > maxBodySize) {
      return next(new ValidationError('Request body size exceeds limit'));
    }
    
    next();
  };
}

/**
 * Sanitize request data to prevent XSS and injection attacks
 * @returns {Function} Express middleware function
 */
function sanitizeRequest() {
  return (req, res, next) => {
    // Recursively sanitize object
    function sanitizeObject(obj) {
      if (typeof obj === 'string') {
        // Basic XSS prevention - remove script tags and javascript: protocols
        return obj
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/javascript:/gi, '')
          .replace(/on\w+\s*=/gi, ''); // Remove inline event handlers
      }
      
      if (Array.isArray(obj)) {
        return obj.map(sanitizeObject);
      }
      
      if (obj && typeof obj === 'object') {
        const sanitized = {};
        for (const [key, value] of Object.entries(obj)) {
          sanitized[key] = sanitizeObject(value);
        }
        return sanitized;
      }
      
      return obj;
    }
    
    // Sanitize body, query, and params
    if (req.body) {
      req.body = sanitizeObject(req.body);
    }
    
    if (req.query) {
      req.query = sanitizeObject(req.query);
    }
    
    if (req.params) {
      req.params = sanitizeObject(req.params);
    }
    
    next();
  };
}

/**
 * Validate API version compatibility
 * @param {string} supportedVersion - Supported API version
 * @returns {Function} Express middleware function
 */
function validateApiVersion(supportedVersion = '1.0.0') {
  return (req, res, next) => {
    const requestedVersion = req.get('API-Version') || req.query.version;
    
    if (requestedVersion && requestedVersion !== supportedVersion) {
      return next(new ValidationError(
        `API version ${requestedVersion} is not supported. Supported version: ${supportedVersion}`
      ));
    }
    
    // Add version to request for tracking
    req.apiVersion = supportedVersion;
    
    next();
  };
}

/**
 * Rate limiting validation based on user or IP
 * @param {Object} options - Rate limiting options
 * @returns {Function} Express middleware function
 */
function validateRateLimit(options = {}) {
  const {
    windowMs = 15 * 60 * 1000, // 15 minutes
    maxRequests = 100,
    skipSuccessfulRequests = false
  } = options;
  
  const requests = new Map();
  
  return (req, res, next) => {
    const identifier = req.ip || 'unknown';
    const now = Date.now();
    const windowStart = now - windowMs;
    
    // Clean old entries
    const userRequests = requests.get(identifier) || [];
    const validRequests = userRequests.filter(timestamp => timestamp > windowStart);
    
    if (validRequests.length >= maxRequests) {
      return next(new ValidationError(
        'Rate limit exceeded',
        { retryAfter: Math.ceil(windowMs / 1000) }
      ));
    }
    
    // Add current request
    validRequests.push(now);
    requests.set(identifier, validRequests);
    
    // Cleanup old entries periodically
    if (Math.random() < 0.01) { // 1% chance to cleanup
      for (const [key, timestamps] of requests.entries()) {
        const validTimestamps = timestamps.filter(t => t > windowStart);
        if (validTimestamps.length === 0) {
          requests.delete(key);
        } else {
          requests.set(key, validTimestamps);
        }
      }
    }
    
    next();
  };
}

module.exports = {
  validateExperiment,
  validateResponse,
  validatePagination,
  validateFilters,
  validateIdParam,
  validateIdArray,
  validateContentType,
  validateRequestSize,
  sanitizeRequest,
  validateApiVersion,
  validateRateLimit
};
