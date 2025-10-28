/**
 * @fileoverview Request Logging Middleware
 * @description Middleware for comprehensive request/response logging and monitoring
 * 
 * @author LLM-LAB Team
 * @version 1.0.0
 * @since 2025-10-28
 */

const logger = require('../utils/logger');
const crypto = require('crypto');

// Simple UUID v4 generator (alternative to uuid package)
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Generate unique request ID for tracking
 * @returns {Function} Express middleware function
 */
function requestId() {
  return (req, res, next) => {
    req.id = req.get('X-Request-ID') || generateUUID();
    res.set('X-Request-ID', req.id);
    next();
  };
}

/**
 * Log incoming requests with comprehensive details
 * @param {Object} options - Logging options
 * @returns {Function} Express middleware function
 */
function requestLogger(options = {}) {
  const {
    logBody = false,
    logQuery = true,
    logHeaders = false,
    excludePaths = ['/health', '/ping'],
    excludeHeaders = ['authorization', 'cookie', 'x-api-key']
  } = options;

  return (req, res, next) => {
    // Skip logging for excluded paths
    if (excludePaths.some(path => req.path.startsWith(path))) {
      return next();
    }

    const startTime = Date.now();

    // Prepare request data
    const requestData = {
      requestId: req.id,
      method: req.method,
      url: req.originalUrl,
      path: req.path,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      referer: req.get('Referer'),
      timestamp: new Date().toISOString()
    };

    // Add query parameters if enabled
    if (logQuery && Object.keys(req.query).length > 0) {
      requestData.query = req.query;
    }

    // Add request body if enabled (be careful with sensitive data)
    if (logBody && req.body && Object.keys(req.body).length > 0) {
      requestData.body = sanitizeBody(req.body);
    }

    // Add filtered headers if enabled
    if (logHeaders) {
      requestData.headers = sanitizeHeaders(req.headers, excludeHeaders);
    }

    // Log the incoming request
    logger.info('Incoming request', requestData);

    // Capture the original res.end to log response
    const originalEnd = res.end;
    const originalJson = res.json;

    let responseBody = null;

    // Override res.json to capture response body
    res.json = function(data) {
      responseBody = data;
      return originalJson.call(this, data);
    };

    // Override res.end to log when response completes
    res.end = function(chunk, encoding) {
      const duration = Date.now() - startTime;
      
      const responseData = {
        requestId: req.id,
        method: req.method,
        url: req.originalUrl,
        statusCode: res.statusCode,
        duration: `${duration}ms`,
        contentLength: res.get('Content-Length') || 0,
        timestamp: new Date().toISOString()
      };

      // Add response body for errors or if explicitly enabled
      if (responseBody && (res.statusCode >= 400 || options.logResponseBody)) {
        responseData.responseBody = sanitizeResponseBody(responseBody);
      }

      // Log based on status code
      if (res.statusCode >= 500) {
        logger.error('Request completed with server error', responseData);
      } else if (res.statusCode >= 400) {
        logger.warn('Request completed with client error', responseData);
      } else {
        logger.info('Request completed successfully', responseData);
      }

      originalEnd.call(this, chunk, encoding);
    };

    next();
  };
}

/**
 * Performance monitoring middleware
 * @param {Object} options - Performance monitoring options
 * @returns {Function} Express middleware function
 */
function performanceMonitor(options = {}) {
  const {
    slowRequestThreshold = 1000, // 1 second
    logSlowRequests = true,
    trackMemoryUsage = false
  } = options;

  return (req, res, next) => {
    const startTime = process.hrtime.bigint();
    const startMemory = trackMemoryUsage ? process.memoryUsage() : null;

    res.on('finish', () => {
      const endTime = process.hrtime.bigint();
      const duration = Number(endTime - startTime) / 1000000; // Convert to milliseconds

      const performanceData = {
        requestId: req.id,
        method: req.method,
        url: req.originalUrl,
        statusCode: res.statusCode,
        duration: `${duration.toFixed(2)}ms`,
        timestamp: new Date().toISOString()
      };

      // Add memory usage if tracking is enabled
      if (trackMemoryUsage && startMemory) {
        const endMemory = process.memoryUsage();
        performanceData.memoryUsage = {
          heapUsed: `${(endMemory.heapUsed / 1024 / 1024).toFixed(2)}MB`,
          heapDelta: `${((endMemory.heapUsed - startMemory.heapUsed) / 1024 / 1024).toFixed(2)}MB`,
          external: `${(endMemory.external / 1024 / 1024).toFixed(2)}MB`
        };
      }

      // Log slow requests
      if (logSlowRequests && duration > slowRequestThreshold) {
        logger.warn('Slow request detected', {
          ...performanceData,
          threshold: `${slowRequestThreshold}ms`
        });
      }

      // Log performance metrics
      logger.debug('Request performance metrics', performanceData);
    });

    next();
  };
}

/**
 * Security logging middleware
 * @returns {Function} Express middleware function
 */
function securityLogger() {
  return (req, res, next) => {
    const securityData = {
      requestId: req.id,
      ip: req.ip,
      method: req.method,
      url: req.originalUrl,
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString()
    };

    // Check for suspicious patterns
    const suspiciousPatterns = [
      /script/i,
      /union.*select/i,
      /drop.*table/i,
      /<.*>/,
      /javascript:/i,
      /on\w+=/i
    ];

    const requestString = JSON.stringify({
      url: req.originalUrl,
      query: req.query,
      body: req.body
    });

    const suspiciousActivity = suspiciousPatterns.some(pattern => 
      pattern.test(requestString)
    );

    if (suspiciousActivity) {
      logger.warn('Suspicious request detected', {
        ...securityData,
        reason: 'Pattern match',
        patterns: suspiciousPatterns.map(p => p.toString())
      });
    }

    // Check for unusual request sizes
    const contentLength = parseInt(req.get('Content-Length') || '0', 10);
    if (contentLength > 10 * 1024 * 1024) { // 10MB
      logger.warn('Large request detected', {
        ...securityData,
        contentLength: `${(contentLength / 1024 / 1024).toFixed(2)}MB`
      });
    }

    // Check for rapid requests from same IP
    if (!securityLogger.ipTracker) {
      securityLogger.ipTracker = new Map();
    }

    const now = Date.now();
    const ipHistory = securityLogger.ipTracker.get(req.ip) || [];
    const recentRequests = ipHistory.filter(timestamp => now - timestamp < 60000); // Last minute

    if (recentRequests.length > 100) { // More than 100 requests per minute
      logger.warn('High frequency requests detected', {
        ...securityData,
        requestCount: recentRequests.length,
        timeWindow: '1 minute'
      });
    }

    // Update IP tracker
    recentRequests.push(now);
    securityLogger.ipTracker.set(req.ip, recentRequests);

    // Cleanup old entries periodically
    if (Math.random() < 0.01) { // 1% chance
      for (const [ip, timestamps] of securityLogger.ipTracker.entries()) {
        const validTimestamps = timestamps.filter(t => now - t < 60000);
        if (validTimestamps.length === 0) {
          securityLogger.ipTracker.delete(ip);
        } else {
          securityLogger.ipTracker.set(ip, validTimestamps);
        }
      }
    }

    next();
  };
}

/**
 * API usage analytics middleware
 * @returns {Function} Express middleware function
 */
function analyticsLogger() {
  if (!analyticsLogger.stats) {
    analyticsLogger.stats = {
      endpoints: new Map(),
      methods: new Map(),
      statusCodes: new Map(),
      startTime: Date.now()
    };
  }

  return (req, res, next) => {
    res.on('finish', () => {
      const { stats } = analyticsLogger;
      
      // Track endpoint usage
      const endpoint = `${req.method} ${req.route?.path || req.path}`;
      stats.endpoints.set(endpoint, (stats.endpoints.get(endpoint) || 0) + 1);
      
      // Track HTTP methods
      stats.methods.set(req.method, (stats.methods.get(req.method) || 0) + 1);
      
      // Track status codes
      stats.statusCodes.set(res.statusCode, (stats.statusCodes.get(res.statusCode) || 0) + 1);
      
      // Log analytics periodically (every 1000 requests)
      const totalRequests = Array.from(stats.methods.values()).reduce((sum, count) => sum + count, 0);
      
      if (totalRequests % 1000 === 0) {
        const uptime = Date.now() - stats.startTime;
        
        logger.info('API usage analytics', {
          uptime: `${Math.floor(uptime / 1000)}s`,
          totalRequests,
          topEndpoints: Array.from(stats.endpoints.entries())
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10),
          methodDistribution: Object.fromEntries(stats.methods),
          statusCodeDistribution: Object.fromEntries(stats.statusCodes),
          requestsPerSecond: (totalRequests / (uptime / 1000)).toFixed(2)
        });
      }
    });

    next();
  };
}

/**
 * Sanitize request body for logging (remove sensitive data)
 * @param {Object} body - Request body
 * @returns {Object} Sanitized body
 */
function sanitizeBody(body) {
  const sensitiveFields = ['password', 'token', 'secret', 'key', 'authorization'];
  
  if (typeof body !== 'object' || body === null) {
    return body;
  }

  const sanitized = { ...body };
  
  for (const key in sanitized) {
    if (sensitiveFields.some(field => key.toLowerCase().includes(field))) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof sanitized[key] === 'object') {
      sanitized[key] = sanitizeBody(sanitized[key]);
    }
  }
  
  return sanitized;
}

/**
 * Sanitize headers for logging
 * @param {Object} headers - Request headers
 * @param {Array} excludeHeaders - Headers to exclude
 * @returns {Object} Sanitized headers
 */
function sanitizeHeaders(headers, excludeHeaders = []) {
  const sanitized = {};
  
  for (const [key, value] of Object.entries(headers)) {
    if (excludeHeaders.some(excluded => key.toLowerCase().includes(excluded.toLowerCase()))) {
      sanitized[key] = '[REDACTED]';
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
}

/**
 * Sanitize response body for logging
 * @param {any} body - Response body
 * @returns {any} Sanitized body
 */
function sanitizeResponseBody(body) {
  if (typeof body !== 'object' || body === null) {
    return body;
  }

  // Limit response body size for logging
  const bodyString = JSON.stringify(body);
  if (bodyString.length > 10000) { // 10KB limit
    return {
      message: 'Response body too large for logging',
      size: `${bodyString.length} characters`,
      preview: bodyString.substring(0, 1000) + '...'
    };
  }

  return body;
}

module.exports = {
  requestId,
  requestLogger,
  performanceMonitor,
  securityLogger,
  analyticsLogger
};
