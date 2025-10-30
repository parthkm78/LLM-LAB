/**
 * Error Handling Middleware
 * 
 * Centralized error handling for the application.
 * Catches and formats errors, provides logging, and ensures consistent error responses.
 */

const { errorResponse } = require('../utils/responses');
const config = require('../config');

/**
 * Custom error class for application-specific errors
 */
class AppError extends Error {
  constructor(message, statusCode = 500, code = null, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Custom error class for validation errors
 */
class ValidationError extends AppError {
  constructor(errors, message = 'Validation failed') {
    super(message, 400, 'VALIDATION_ERROR', errors);
  }
}

/**
 * Custom error class for not found errors
 */
class NotFoundError extends AppError {
  constructor(resource, id = null) {
    const message = id ? `${resource} with ID ${id} not found` : `${resource} not found`;
    super(message, 404, 'NOT_FOUND');
  }
}

/**
 * Custom error class for unauthorized access
 */
class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized access') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

/**
 * Custom error class for forbidden access
 */
class ForbiddenError extends AppError {
  constructor(message = 'Forbidden access') {
    super(message, 403, 'FORBIDDEN');
  }
}

/**
 * Custom error class for conflict errors
 */
class ConflictError extends AppError {
  constructor(message) {
    super(message, 409, 'CONFLICT');
  }
}

/**
 * Custom error class for rate limiting
 */
class RateLimitError extends AppError {
  constructor(message = 'Too many requests') {
    super(message, 429, 'RATE_LIMIT_EXCEEDED');
  }
}

/**
 * Async error handler wrapper
 * Wraps async route handlers to catch errors automatically
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Handle Mongoose validation errors
 */
const handleValidationError = (error) => {
  const errors = {};
  
  if (error.errors) {
    Object.keys(error.errors).forEach(key => {
      errors[key] = error.errors[key].message;
    });
  }
  
  return new ValidationError(errors);
};

/**
 * Handle Mongoose cast errors (invalid ObjectId, etc.)
 */
const handleCastError = (error) => {
  return new AppError(`Invalid ${error.path}: ${error.value}`, 400, 'INVALID_DATA');
};

/**
 * Handle Mongoose duplicate key errors
 */
const handleDuplicateKeyError = (error) => {
  const field = Object.keys(error.keyValue)[0];
  const value = error.keyValue[field];
  
  return new ConflictError(`${field} '${value}' already exists`);
};

/**
 * Handle JWT errors
 */
const handleJWTError = (error) => {
  if (error.name === 'JsonWebTokenError') {
    return new UnauthorizedError('Invalid token');
  }
  if (error.name === 'TokenExpiredError') {
    return new UnauthorizedError('Token expired');
  }
  return new UnauthorizedError('Token validation failed');
};

/**
 * Log error for monitoring and debugging
 */
const logError = (error, req) => {
  const errorLog = {
    timestamp: new Date().toISOString(),
    error: {
      message: error.message,
      stack: error.stack,
      statusCode: error.statusCode || 500,
      code: error.code
    },
    request: {
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      body: req.method !== 'GET' ? req.body : undefined
    },
    user: req.user ? { id: req.user.id, email: req.user.email } : null
  };

  // In production, this would go to a logging service
  if (config.server.environment === 'development') {
    console.error('Error Details:', JSON.stringify(errorLog, null, 2));
  } else {
    console.error('Error:', error.message, { requestId: req.requestId });
  }
};

/**
 * Main error handling middleware
 */
const errorHandler = (error, req, res, next) => {
  let err = error;

  // Log the error
  logError(err, req);

  // Handle known error types
  if (err.name === 'ValidationError') {
    err = handleValidationError(err);
  } else if (err.name === 'CastError') {
    err = handleCastError(err);
  } else if (err.code === 11000) {
    err = handleDuplicateKeyError(err);
  } else if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    err = handleJWTError(err);
  } else if (!err.isOperational) {
    // Unknown error - don't leak error details in production
    if (config.server.environment === 'production') {
      err = new AppError('Something went wrong');
    }
  }

  // Create error response
  const { statusCode, response } = errorResponse(
    err.message,
    err.statusCode || 500,
    err.code,
    err.details
  );

  // Add stack trace in development
  if (config.server.environment === 'development') {
    response.error.stack = err.stack;
  }

  // Send response
  res.status(statusCode).json(response);
};

/**
 * Handle 404 errors for unmatched routes
 */
const notFoundHandler = (req, res, next) => {
  const error = new NotFoundError('Route');
  next(error);
};

/**
 * Validation middleware factory
 * Creates middleware to validate request data against a schema
 */
const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    try {
      const data = req[source];
      const validationResult = schema(data);
      
      if (!validationResult.isValid) {
        throw new ValidationError(validationResult.errors);
      }
      
      // Optionally sanitize and set validated data
      if (validationResult.sanitized) {
        req[source] = validationResult.sanitized;
      }
      
      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Request timeout middleware
 */
const requestTimeout = (timeout = 30000) => {
  return (req, res, next) => {
    const timer = setTimeout(() => {
      const error = new AppError('Request timeout', 408, 'REQUEST_TIMEOUT');
      next(error);
    }, timeout);

    // Clear timeout when response is sent
    res.on('finish', () => {
      clearTimeout(timer);
    });

    next();
  };
};

/**
 * Request size limit middleware
 */
const requestSizeLimit = (limit = '10mb') => {
  return (req, res, next) => {
    const contentLength = req.get('Content-Length');
    
    if (contentLength) {
      const sizeInMB = parseInt(contentLength) / (1024 * 1024);
      const limitInMB = parseInt(limit.replace('mb', ''));
      
      if (sizeInMB > limitInMB) {
        const error = new AppError(`Request size exceeds limit of ${limit}`, 413, 'REQUEST_TOO_LARGE');
        return next(error);
      }
    }
    
    next();
  };
};

module.exports = {
  // Error classes
  AppError,
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  ConflictError,
  RateLimitError,
  
  // Middleware
  asyncHandler,
  errorHandler,
  notFoundHandler,
  validate,
  requestTimeout,
  requestSizeLimit
};
