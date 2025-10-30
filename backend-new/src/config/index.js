/**
 * Application Configuration
 * 
 * Centralized configuration management for the LLM-LAB backend.
 * Manages environment variables, API settings, and application constants.
 */

require('dotenv').config();

const config = {
  // Server Configuration
  server: {
    port: process.env.PORT || 5000,
    host: process.env.HOST || 'localhost',
    environment: process.env.NODE_ENV || 'development',
    apiVersion: process.env.API_VERSION || 'v1'
  },

  // CORS Configuration
  cors: {
    origin: process.env.FRONTEND_URL ? 
      process.env.FRONTEND_URL.split(',') : 
      ['http://localhost:3000', 'http://localhost:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  },

  // Rate Limiting Configuration
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX) || 1000, // limit each IP to 1000 requests per windowMs
    message: {
      success: false,
      error: {
        message: 'Too many requests from this IP, please try again later.',
        statusCode: 429,
        code: 'RATE_LIMIT_EXCEEDED'
      }
    }
  },

  // Request Configuration
  request: {
    bodyLimit: process.env.BODY_LIMIT || '10mb',
    timeout: parseInt(process.env.REQUEST_TIMEOUT) || 30000 // 30 seconds
  },

  // Logging Configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.NODE_ENV === 'production' ? 'combined' : 'dev'
  },

  // Security Configuration
  security: {
    jwtSecret: process.env.JWT_SECRET || 'your-super-secret-jwt-key',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS) || 12
  },

  // Database Configuration (for future use)
  database: {
    url: process.env.DATABASE_URL || 'mongodb://localhost:27017/llm-lab',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true
    }
  },

  // External Services Configuration
  services: {
    openai: {
      apiKey: process.env.OPENAI_API_KEY,
      baseUrl: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1'
    },
    anthropic: {
      apiKey: process.env.ANTHROPIC_API_KEY,
      baseUrl: process.env.ANTHROPIC_BASE_URL || 'https://api.anthropic.com'
    }
  },

  // Export Configuration
  export: {
    baseUrl: process.env.EXPORT_BASE_URL || 'https://api.llm-lab.com/downloads',
    expiryHours: parseInt(process.env.EXPORT_EXPIRY_HOURS) || 24,
    maxFileSize: process.env.MAX_EXPORT_SIZE || '100MB'
  },

  // Pagination Defaults
  pagination: {
    defaultLimit: parseInt(process.env.DEFAULT_PAGE_LIMIT) || 20,
    maxLimit: parseInt(process.env.MAX_PAGE_LIMIT) || 100
  },

  // Mock Data Configuration
  mock: {
    enableMockData: process.env.ENABLE_MOCK_DATA !== 'false',
    mockDelay: parseInt(process.env.MOCK_DELAY) || 0 // milliseconds
  }
};

/**
 * Validate required configuration
 */
const validateConfig = () => {
  const requiredEnvVars = [];
  
  if (config.server.environment === 'production') {
    requiredEnvVars.push(
      'JWT_SECRET',
      'DATABASE_URL'
    );
  }

  const missing = requiredEnvVars.filter(envVar => !process.env[envVar]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
};

// Validate configuration on module load
validateConfig();

module.exports = config;
