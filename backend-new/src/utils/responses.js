/**
 * API Response Utilities
 * 
 * Standardized response formatting utilities for consistent API responses.
 * Provides methods for success responses, error responses, and pagination.
 */

/**
 * Standard API response format interface
 * @typedef {Object} APIResponse
 * @property {boolean} success - Indicates if the request was successful
 * @property {any} [data] - Response data
 * @property {Object} [error] - Error information
 * @property {Object} [meta] - Metadata including pagination, timestamp, etc.
 */

/**
 * Generate a standardized success response
 * @param {any} data - Response data
 * @param {Object} [meta] - Additional metadata
 * @param {number} [statusCode=200] - HTTP status code
 * @returns {Object} Formatted success response
 */
const successResponse = (data, meta = {}, statusCode = 200) => {
  const response = {
    success: true,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      request_id: generateRequestId(),
      ...meta
    }
  };

  return {
    statusCode,
    response
  };
};

/**
 * Generate a standardized error response
 * @param {string} message - Error message
 * @param {number} [statusCode=500] - HTTP status code
 * @param {string} [code] - Error code
 * @param {any} [details] - Additional error details
 * @returns {Object} Formatted error response
 */
const errorResponse = (message, statusCode = 500, code = null, details = null) => {
  const response = {
    success: false,
    error: {
      message,
      statusCode,
      code: code || getDefaultErrorCode(statusCode),
      ...(details && { details })
    },
    meta: {
      timestamp: new Date().toISOString(),
      request_id: generateRequestId()
    }
  };

  return {
    statusCode,
    response
  };
};

/**
 * Generate a paginated response
 * @param {Array} items - Array of items
 * @param {Object} pagination - Pagination metadata
 * @param {Object} [additionalMeta] - Additional metadata
 * @returns {Object} Formatted paginated response
 */
const paginatedResponse = (items, pagination, additionalMeta = {}) => {
  return successResponse(
    { [getItemsKey(items)]: items },
    {
      pagination,
      ...additionalMeta
    }
  );
};

/**
 * Generate a streaming response headers
 * @returns {Object} SSE headers
 */
const streamingHeaders = () => ({
  'Content-Type': 'text/event-stream',
  'Cache-Control': 'no-cache',
  'Connection': 'keep-alive',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Cache-Control'
});

/**
 * Format SSE data
 * @param {any} data - Data to send
 * @returns {string} Formatted SSE data
 */
const formatSSEData = (data) => {
  return `data: ${JSON.stringify(data)}\n\n`;
};

/**
 * Generate a unique request ID
 * @returns {string} Request ID
 */
const generateRequestId = () => {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Get default error code based on status code
 * @param {number} statusCode - HTTP status code
 * @returns {string} Error code
 */
const getDefaultErrorCode = (statusCode) => {
  const errorCodes = {
    400: 'BAD_REQUEST',
    401: 'UNAUTHORIZED',
    403: 'FORBIDDEN',
    404: 'NOT_FOUND',
    409: 'CONFLICT',
    422: 'UNPROCESSABLE_ENTITY',
    429: 'TOO_MANY_REQUESTS',
    500: 'INTERNAL_SERVER_ERROR',
    503: 'SERVICE_UNAVAILABLE'
  };

  return errorCodes[statusCode] || 'UNKNOWN_ERROR';
};

/**
 * Get appropriate items key based on data type
 * @param {Array} items - Array of items
 * @returns {string} Items key
 */
const getItemsKey = (items) => {
  if (!Array.isArray(items) || items.length === 0) {
    return 'items';
  }

  // Try to infer the key from the first item
  const firstItem = items[0];
  if (firstItem.id && firstItem.name) {
    return 'experiments';
  }
  if (firstItem.content && firstItem.metrics) {
    return 'responses';
  }
  if (firstItem.batch_id || firstItem.total_combinations) {
    return 'batch_experiments';
  }

  return 'items';
};

/**
 * Validate pagination parameters
 * @param {number} page - Page number
 * @param {number} limit - Items per page
 * @param {number} [maxLimit=100] - Maximum allowed limit
 * @returns {Object} Validated pagination parameters
 */
const validatePagination = (page = 1, limit = 20, maxLimit = 100) => {
  const validatedPage = Math.max(1, parseInt(page) || 1);
  const validatedLimit = Math.min(maxLimit, Math.max(1, parseInt(limit) || 20));

  return {
    page: validatedPage,
    limit: validatedLimit
  };
};

/**
 * Calculate pagination metadata
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 * @param {number} total - Total number of items
 * @returns {Object} Pagination metadata
 */
const calculatePagination = (page, limit, total) => {
  const totalPages = Math.ceil(total / limit);
  
  return {
    page,
    limit,
    total,
    total_pages: totalPages,
    has_next: page < totalPages,
    has_previous: page > 1
  };
};

module.exports = {
  successResponse,
  errorResponse,
  paginatedResponse,
  streamingHeaders,
  formatSSEData,
  generateRequestId,
  validatePagination,
  calculatePagination
};
