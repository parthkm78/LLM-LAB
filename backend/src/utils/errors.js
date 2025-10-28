/**
 * @fileoverview Custom Error Classes
 * @description Defines custom error types for better error handling and debugging
 * 
 * @author LLM-LAB Team
 * @version 1.0.0
 * @since 2025-10-28
 */

/**
 * Base custom error class
 */
class CustomError extends Error {
  constructor(message, statusCode = 500, details = null) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.details = details;
    this.timestamp = new Date().toISOString();
    
    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      statusCode: this.statusCode,
      details: this.details,
      timestamp: this.timestamp,
      stack: this.stack
    };
  }
}

/**
 * Validation Error - for request validation failures
 */
class ValidationError extends CustomError {
  constructor(message, details = null) {
    super(message, 400, details);
  }
}

/**
 * Not Found Error - for resource not found scenarios
 */
class NotFoundError extends CustomError {
  constructor(message, details = null) {
    super(message, 404, details);
  }
}

/**
 * Database Error - for database operation failures
 */
class DatabaseError extends CustomError {
  constructor(message, originalError = null) {
    super(message, 500, originalError ? originalError.message : null);
    this.originalError = originalError;
  }
}

/**
 * External API Error - for third-party service failures
 */
class ExternalAPIError extends CustomError {
  constructor(message, statusCode = 502, details = null) {
    super(message, statusCode, details);
  }
}

/**
 * Authentication Error - for authentication failures
 */
class AuthenticationError extends CustomError {
  constructor(message, details = null) {
    super(message, 401, details);
  }
}

/**
 * Authorization Error - for authorization failures
 */
class AuthorizationError extends CustomError {
  constructor(message, details = null) {
    super(message, 403, details);
  }
}

/**
 * Rate Limit Error - for rate limiting scenarios
 */
class RateLimitError extends CustomError {
  constructor(message, retryAfter = null) {
    super(message, 429, { retryAfter });
  }
}

/**
 * Configuration Error - for configuration-related issues
 */
class ConfigurationError extends CustomError {
  constructor(message, details = null) {
    super(message, 500, details);
  }
}

module.exports = {
  CustomError,
  ValidationError,
  NotFoundError,
  DatabaseError,
  ExternalAPIError,
  AuthenticationError,
  AuthorizationError,
  RateLimitError,
  ConfigurationError
};
