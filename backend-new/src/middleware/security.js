/**
 * Security Middleware
 * 
 * Comprehensive security middleware for protecting the API endpoints.
 * Includes authentication, authorization, input sanitization, and security headers.
 */

const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss');
const config = require('../config');
const { UnauthorizedError, ForbiddenError, ValidationError, RateLimitError } = require('./errorHandler');

/**
 * JWT Authentication Middleware
 * Verifies JWT tokens and adds user information to request
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Access token required');
    }

    const token = authHeader.substring(7);
    
    if (!token) {
      throw new UnauthorizedError('Access token required');
    }

    // Verify JWT token
    const decoded = jwt.verify(token, config.security.jwtSecret);
    
    // In a real application, you would fetch user from database
    // For now, we'll use the decoded token data
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role || 'user',
      permissions: decoded.permissions || []
    };

    // Add token info
    req.token = token;
    req.tokenExpiry = new Date(decoded.exp * 1000);

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      next(new UnauthorizedError('Invalid token'));
    } else if (error.name === 'TokenExpiredError') {
      next(new UnauthorizedError('Token expired'));
    } else {
      next(error);
    }
  }
};

/**
 * Optional Authentication Middleware
 * Adds user info if token is present but doesn't require it
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      
      if (token) {
        const decoded = jwt.verify(token, config.security.jwtSecret);
        req.user = {
          id: decoded.id,
          email: decoded.email,
          role: decoded.role || 'user',
          permissions: decoded.permissions || []
        };
      }
    }
    
    next();
  } catch (error) {
    // For optional auth, we continue even if token is invalid
    next();
  }
};

/**
 * Role-based Authorization Middleware Factory
 * Checks if user has required role(s)
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required'));
    }

    if (!roles.includes(req.user.role)) {
      return next(new ForbiddenError(`Access denied. Required role: ${roles.join(' or ')}`));
    }

    next();
  };
};

/**
 * Permission-based Authorization Middleware Factory
 * Checks if user has required permission(s)
 */
const requirePermission = (...permissions) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required'));
    }

    const userPermissions = req.user.permissions || [];
    const hasPermission = permissions.some(permission => 
      userPermissions.includes(permission) || req.user.role === 'admin'
    );

    if (!hasPermission) {
      return next(new ForbiddenError(`Access denied. Required permission: ${permissions.join(' or ')}`));
    }

    next();
  };
};

/**
 * Resource Ownership Authorization
 * Checks if user owns the resource or has admin role
 */
const requireOwnership = (userIdField = 'userId') => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required'));
    }

    // Admin can access any resource
    if (req.user.role === 'admin') {
      return next();
    }

    // Check if user owns the resource
    const resourceUserId = req.params[userIdField] || req.body[userIdField];
    
    if (!resourceUserId || resourceUserId !== req.user.id) {
      return next(new ForbiddenError('Access denied. You can only access your own resources.'));
    }

    next();
  };
};

/**
 * API Key Authentication Middleware
 * For server-to-server communication
 */
const authenticateApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  
  if (!apiKey) {
    return next(new UnauthorizedError('API key required'));
  }

  // In production, validate against database or external service
  if (apiKey !== config.security.apiKey) {
    return next(new UnauthorizedError('Invalid API key'));
  }

  // Set system user for API key requests
  req.user = {
    id: 'system',
    email: 'system@api',
    role: 'system',
    permissions: ['*']
  };

  next();
};

/**
 * Input Sanitization Middleware
 * Sanitizes user input to prevent XSS and injection attacks
 */
const sanitizeInput = (req, res, next) => {
  // Sanitize request body
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeObject(req.body);
  }

  // Sanitize query parameters
  if (req.query && typeof req.query === 'object') {
    req.query = sanitizeObject(req.query);
  }

  next();
};

/**
 * Recursively sanitize object properties
 */
const sanitizeObject = (obj) => {
  if (Array.isArray(obj)) {
    return obj.map(item => 
      typeof item === 'object' && item !== null ? sanitizeObject(item) : sanitizeValue(item)
    );
  }

  if (typeof obj === 'object' && obj !== null) {
    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
      sanitized[key] = typeof value === 'object' && value !== null 
        ? sanitizeObject(value) 
        : sanitizeValue(value);
    }
    return sanitized;
  }

  return sanitizeValue(obj);
};

/**
 * Sanitize individual values
 */
const sanitizeValue = (value) => {
  if (typeof value === 'string') {
    // Remove XSS attempts
    return xss(value, {
      whiteList: {}, // No HTML tags allowed
      stripIgnoreTag: true,
      stripIgnoreTagBody: ['script']
    });
  }
  return value;
};

/**
 * MongoDB Injection Protection
 */
const mongoSanitization = mongoSanitize({
  replaceWith: '_',
  onSanitize: ({ req, key }) => {
    console.warn(`MongoSanitize: Potential injection attempt detected - Key: ${key}`);
  }
});

/**
 * Rate Limiting Configurations
 */
const createRateLimit = (windowMs, max, message, skipSuccessfulRequests = false) => {
  return rateLimit({
    windowMs,
    max,
    message: { error: message },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests,
    handler: (req, res, next) => {
      next(new RateLimitError(message));
    }
  });
};

// Different rate limits for different endpoints
const strictRateLimit = createRateLimit(
  15 * 60 * 1000, // 15 minutes
  5, // 5 requests per window
  'Too many requests from this IP, please try again later'
);

const authRateLimit = createRateLimit(
  15 * 60 * 1000, // 15 minutes
  10, // 10 login attempts per window
  'Too many authentication attempts, please try again later'
);

const apiRateLimit = createRateLimit(
  1 * 60 * 1000, // 1 minute
  100, // 100 requests per minute
  'API rate limit exceeded'
);

const uploadRateLimit = createRateLimit(
  60 * 60 * 1000, // 1 hour
  10, // 10 uploads per hour
  'Upload rate limit exceeded'
);

/**
 * Request ID Middleware
 * Adds unique request ID for tracking
 */
const addRequestId = (req, res, next) => {
  req.requestId = generateRequestId();
  res.setHeader('X-Request-ID', req.requestId);
  next();
};

/**
 * Generate unique request ID
 */
const generateRequestId = () => {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * CORS Security Headers
 */
const securityHeaders = (req, res, next) => {
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // XSS Protection
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Referrer Policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Content Security Policy
  res.setHeader('Content-Security-Policy', "default-src 'self'");
  
  next();
};

/**
 * IP Whitelisting Middleware
 */
const ipWhitelist = (allowedIPs = []) => {
  return (req, res, next) => {
    if (allowedIPs.length === 0) {
      return next(); // No restrictions if no IPs specified
    }

    const clientIP = req.ip || req.connection.remoteAddress;
    
    if (!allowedIPs.includes(clientIP)) {
      return next(new ForbiddenError(`Access denied from IP: ${clientIP}`));
    }

    next();
  };
};

module.exports = {
  // Authentication
  authenticate,
  optionalAuth,
  authenticateApiKey,
  
  // Authorization
  authorize,
  requirePermission,
  requireOwnership,
  
  // Security
  sanitizeInput,
  mongoSanitization,
  securityHeaders,
  addRequestId,
  ipWhitelist,
  
  // Rate Limiting
  strictRateLimit,
  authRateLimit,
  apiRateLimit,
  uploadRateLimit,
  createRateLimit,
  
  // Utilities
  generateRequestId
};
