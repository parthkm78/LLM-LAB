/**
 * Logging Middleware
 * 
 * Comprehensive logging middleware for request/response tracking,
 * performance monitoring, and audit trails.
 */

const morgan = require('morgan');
const config = require('../config');

/**
 * Custom Morgan tokens for enhanced logging
 */
morgan.token('request-id', (req) => req.requestId);
morgan.token('user-id', (req) => req.user ? req.user.id : 'anonymous');
morgan.token('user-role', (req) => req.user ? req.user.role : 'none');
morgan.token('response-size', (req, res) => res.get('Content-Length') || '0');
morgan.token('response-time-ms', (req, res) => {
  const responseTime = res.getHeader('X-Response-Time');
  return responseTime ? `${responseTime}ms` : '0ms';
});

/**
 * Enhanced request logging format
 */
const requestLogFormat = [
  ':request-id',
  ':remote-addr',
  ':user-id',
  ':user-role',
  ':method',
  ':url',
  'HTTP/:http-version',
  ':status',
  ':response-size',
  ':response-time ms',
  '":user-agent"'
].join(' ');

/**
 * Development logging format (more verbose)
 */
const devLogFormat = [
  '🔍 :request-id',
  '👤 :user-id (:user-role)',
  ':method :url',
  ':status :response-time ms',
  ':res[content-length] bytes'
].join(' | ');

/**
 * Production logging format (structured)
 */
const productionLogFormat = JSON.stringify({
  timestamp: ':date[iso]',
  requestId: ':request-id',
  method: ':method',
  url: ':url',
  status: ':status',
  responseTime: ':response-time',
  responseSize: ':response-size',
  userAgent: ':user-agent',
  remoteAddr: ':remote-addr',
  userId: ':user-id',
  userRole: ':user-role'
});

/**
 * Request logging middleware
 */
const requestLogger = morgan(
  config.server.environment === 'development' ? devLogFormat : productionLogFormat,
  {
    stream: {
      write: (message) => {
        if (config.server.environment === 'development') {
          console.log(message.trim());
        } else {
          // In production, you might want to send logs to a logging service
          console.log(JSON.parse(message.trim()));
        }
      }
    },
    skip: (req, res) => {
      // Skip logging for health checks and static assets
      return req.url === '/health' || req.url === '/favicon.ico' || req.url.startsWith('/static');
    }
  }
);

/**
 * Error logging middleware
 */
const errorLogger = (error, req, res, next) => {
  const errorLog = {
    timestamp: new Date().toISOString(),
    requestId: req.requestId,
    error: {
      message: error.message,
      name: error.name,
      statusCode: error.statusCode || 500,
      code: error.code,
      stack: config.server.environment === 'development' ? error.stack : undefined
    },
    request: {
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      body: req.method !== 'GET' ? sanitizeRequestBody(req.body) : undefined,
      query: req.query,
      params: req.params
    },
    user: req.user ? {
      id: req.user.id,
      email: req.user.email,
      role: req.user.role
    } : null
  };

  // Log based on environment
  if (config.server.environment === 'development') {
    console.error('❌ Error Details:', JSON.stringify(errorLog, null, 2));
  } else {
    console.error('Error:', errorLog);
  }

  next(error);
};

/**
 * Performance logging middleware
 */
const performanceLogger = (req, res, next) => {
  const startTime = Date.now();

  // Override res.end to capture response time
  const originalEnd = res.end;
  res.end = function(...args) {
    const responseTime = Date.now() - startTime;
    res.setHeader('X-Response-Time', responseTime);

    // Log slow requests
    if (responseTime > config.server.slowRequestThreshold) {
      const slowRequestLog = {
        timestamp: new Date().toISOString(),
        requestId: req.requestId,
        type: 'SLOW_REQUEST',
        responseTime: `${responseTime}ms`,
        method: req.method,
        url: req.originalUrl,
        userId: req.user ? req.user.id : null,
        threshold: `${config.server.slowRequestThreshold}ms`
      };

      console.warn('🐌 Slow Request:', slowRequestLog);
    }

    originalEnd.apply(this, args);
  };

  next();
};

/**
 * API usage analytics logging
 */
const analyticsLogger = (req, res, next) => {
  // Only log API endpoints (exclude health checks, static files)
  if (req.url.startsWith('/api/')) {
    const originalSend = res.send;
    
    res.send = function(data) {
      const analyticsLog = {
        timestamp: new Date().toISOString(),
        requestId: req.requestId,
        type: 'API_USAGE',
        endpoint: req.route ? req.route.path : req.url,
        method: req.method,
        statusCode: res.statusCode,
        userId: req.user ? req.user.id : null,
        userRole: req.user ? req.user.role : null,
        responseSize: Buffer.byteLength(data, 'utf8'),
        ip: req.ip,
        userAgent: req.get('User-Agent')
      };

      // In production, send to analytics service
      if (config.server.environment === 'development') {
        console.log('📊 API Analytics:', analyticsLog);
      }

      originalSend.call(this, data);
    };
  }

  next();
};

/**
 * Security event logging
 */
const securityLogger = {
  logAuthAttempt: (req, success, userId = null, reason = null) => {
    const securityLog = {
      timestamp: new Date().toISOString(),
      requestId: req.requestId,
      type: 'AUTH_ATTEMPT',
      success,
      userId,
      reason,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      endpoint: req.originalUrl
    };

    if (success) {
      console.log('🔐 Auth Success:', securityLog);
    } else {
      console.warn('⚠️ Auth Failed:', securityLog);
    }
  },

  logSuspiciousActivity: (req, activity, details = {}) => {
    const securityLog = {
      timestamp: new Date().toISOString(),
      requestId: req.requestId,
      type: 'SUSPICIOUS_ACTIVITY',
      activity,
      details,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      userId: req.user ? req.user.id : null,
      endpoint: req.originalUrl
    };

    console.warn('🚨 Security Alert:', securityLog);
  },

  logAccessDenied: (req, resource, reason) => {
    const securityLog = {
      timestamp: new Date().toISOString(),
      requestId: req.requestId,
      type: 'ACCESS_DENIED',
      resource,
      reason,
      ip: req.ip,
      userId: req.user ? req.user.id : null,
      endpoint: req.originalUrl
    };

    console.warn('🚫 Access Denied:', securityLog);
  }
};

/**
 * Audit logging for data changes
 */
const auditLogger = {
  logDataChange: (req, action, resource, resourceId, oldData = null, newData = null) => {
    const auditLog = {
      timestamp: new Date().toISOString(),
      requestId: req.requestId,
      type: 'DATA_CHANGE',
      action, // CREATE, UPDATE, DELETE
      resource,
      resourceId,
      userId: req.user ? req.user.id : null,
      userRole: req.user ? req.user.role : null,
      changes: {
        old: sanitizeAuditData(oldData),
        new: sanitizeAuditData(newData)
      },
      ip: req.ip
    };

    console.log('📝 Audit Log:', auditLog);
  },

  logSystemEvent: (event, details = {}) => {
    const auditLog = {
      timestamp: new Date().toISOString(),
      type: 'SYSTEM_EVENT',
      event,
      details
    };

    console.log('⚙️ System Event:', auditLog);
  }
};

/**
 * Sanitize sensitive data from request body for logging
 */
const sanitizeRequestBody = (body) => {
  if (!body || typeof body !== 'object') return body;

  const sensitiveFields = ['password', 'token', 'secret', 'key', 'credential'];
  const sanitized = { ...body };

  sensitiveFields.forEach(field => {
    if (sanitized[field]) {
      sanitized[field] = '[REDACTED]';
    }
  });

  return sanitized;
};

/**
 * Sanitize sensitive data for audit logs
 */
const sanitizeAuditData = (data) => {
  if (!data || typeof data !== 'object') return data;

  const sensitiveFields = ['password', 'token', 'secret', 'key', 'credential', 'ssn', 'creditCard'];
  const sanitized = JSON.parse(JSON.stringify(data));

  const sanitizeObject = (obj) => {
    Object.keys(obj).forEach(key => {
      if (sensitiveFields.some(field => key.toLowerCase().includes(field.toLowerCase()))) {
        obj[key] = '[REDACTED]';
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        sanitizeObject(obj[key]);
      }
    });
  };

  sanitizeObject(sanitized);
  return sanitized;
};

/**
 * Request correlation middleware
 * Adds correlation ID for tracking requests across services
 */
const correlationMiddleware = (req, res, next) => {
  // Use existing correlation ID from headers or generate new one
  const correlationId = req.headers['x-correlation-id'] || 
                       req.headers['x-request-id'] || 
                       req.requestId;
  
  req.correlationId = correlationId;
  res.setHeader('X-Correlation-ID', correlationId);
  
  next();
};

module.exports = {
  requestLogger,
  errorLogger,
  performanceLogger,
  analyticsLogger,
  securityLogger,
  auditLogger,
  correlationMiddleware,
  
  // Utility functions
  sanitizeRequestBody,
  sanitizeAuditData
};
