/**
 * @fileoverview Error Handling Middleware
 * @description Centralized error handling middleware for Express applications
 * 
 * @author LLM-LAB Team
 * @version 1.0.0
 * @since 2025-10-28
 */

const { CustomError } = require('../utils/errors');
const logger = require('../utils/logger');

/**
 * Global error handling middleware
 * Handles all errors thrown in the application and formats them consistently
 * 
 * @param {Error} error - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
function errorHandler(error, req, res, next) {
  // Log the error
  logger.error('Request error occurred', {
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack,
      statusCode: error.statusCode
    },
    request: {
      method: req.method,
      url: req.url,
      params: req.params,
      query: req.query,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    },
    timestamp: new Date().toISOString()
  });

  // Don't send error response if headers already sent
  if (res.headersSent) {
    return next(error);
  }

  // Handle custom errors
  if (error instanceof CustomError) {
    return res.status(error.statusCode).json({
      success: false,
      error: {
        name: error.name,
        message: error.message,
        details: error.details,
        statusCode: error.statusCode
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: req.id || 'unknown'
      }
    });
  }

  // Handle validation errors from express-validator
  if (error.name === 'ValidationError' && error.array) {
    return res.status(400).json({
      success: false,
      error: {
        name: 'ValidationError',
        message: 'Request validation failed',
        details: error.array(),
        statusCode: 400
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: req.id || 'unknown'
      }
    });
  }

  // Handle MongoDB/Mongoose errors
  if (error.name === 'MongoError' || error.name === 'MongooseError') {
    return res.status(500).json({
      success: false,
      error: {
        name: 'DatabaseError',
        message: 'Database operation failed',
        statusCode: 500
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: req.id || 'unknown'
      }
    });
  }

  // Handle JWT errors
  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      error: {
        name: 'AuthenticationError',
        message: 'Invalid authentication token',
        statusCode: 401
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: req.id || 'unknown'
      }
    });
  }

  // Handle multer errors (file upload)
  if (error.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      success: false,
      error: {
        name: 'FileUploadError',
        message: 'File size exceeds limit',
        statusCode: 413
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: req.id || 'unknown'
      }
    });
  }

  // Handle syntax errors in JSON
  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    return res.status(400).json({
      success: false,
      error: {
        name: 'SyntaxError',
        message: 'Invalid JSON in request body',
        statusCode: 400
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: req.id || 'unknown'
      }
    });
  }

  // Default error response for unknown errors
  const statusCode = error.statusCode || 500;
  const message = process.env.NODE_ENV === 'production' 
    ? 'Internal server error' 
    : error.message;

  res.status(statusCode).json({
    success: false,
    error: {
      name: 'InternalServerError',
      message,
      statusCode,
      ...(process.env.NODE_ENV !== 'production' && { stack: error.stack })
    },
    meta: {
      timestamp: new Date().toISOString(),
      requestId: req.id || 'unknown'
    }
  });
}

/**
 * Handle 404 Not Found errors
 * This middleware should be placed after all route handlers
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
function notFoundHandler(req, res, next) {
  const error = {
    success: false,
    error: {
      name: 'NotFoundError',
      message: `Route ${req.method} ${req.originalUrl} not found`,
      statusCode: 404
    },
    meta: {
      timestamp: new Date().toISOString(),
      requestId: req.id || 'unknown'
    }
  };

  logger.warn('Route not found', {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  res.status(404).json(error);
}

/**
 * Async error wrapper for route handlers
 * Automatically catches async errors and passes them to error handler
 * 
 * @param {Function} fn - Async route handler function
 * @returns {Function} Wrapped route handler
 */
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Rate limiting error handler
 * Custom handler for rate limiting middleware errors
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
function rateLimitHandler(req, res, next) {
  logger.warn('Rate limit exceeded', {
    ip: req.ip,
    method: req.method,
    url: req.originalUrl,
    userAgent: req.get('User-Agent')
  });

  res.status(429).json({
    success: false,
    error: {
      name: 'RateLimitError',
      message: 'Too many requests, please try again later',
      statusCode: 429,
      retryAfter: 60 // seconds
    },
    meta: {
      timestamp: new Date().toISOString(),
      requestId: req.id || 'unknown'
    }
  });
}

/**
 * Request timeout handler
 * Handles request timeout errors
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
function timeoutHandler(req, res, next) {
  if (!res.headersSent) {
    logger.error('Request timeout', {
      method: req.method,
      url: req.originalUrl,
      ip: req.ip
    });

    res.status(408).json({
      success: false,
      error: {
        name: 'TimeoutError',
        message: 'Request timeout',
        statusCode: 408
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: req.id || 'unknown'
      }
    });
  }
}

/**
 * Process error exit handlers
 * Handle uncaught exceptions and unhandled rejections
 */
function setupProcessErrorHandlers() {
  // Handle uncaught exceptions
  process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception', {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      }
    });

    // Give time to log the error before exiting
    setTimeout(() => {
      process.exit(1);
    }, 1000);
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Promise Rejection', {
      reason: reason,
      promise: promise
    });

    // Give time to log the error before exiting
    setTimeout(() => {
      process.exit(1);
    }, 1000);
  });

  // Handle SIGTERM gracefully
  process.on('SIGTERM', () => {
    logger.info('SIGTERM received, shutting down gracefully');
    process.exit(0);
  });

  // Handle SIGINT gracefully (Ctrl+C)
  process.on('SIGINT', () => {
    logger.info('SIGINT received, shutting down gracefully');
    process.exit(0);
  });
}

module.exports = {
  errorHandler,
  notFoundHandler,
  asyncHandler,
  rateLimitHandler,
  timeoutHandler,
  setupProcessErrorHandlers
};
