/**
 * LLM-LAB Backend API Server
 * 
 * This is the main server file that sets up the Express.js application
 * and configures all the middleware and routes for the LLM-LAB API.
 * 
 * Features:
 * - RESTful API endpoints for experiment management
 * - Quality metrics and analytics
 * - Mock data responses (no database implementation)
 * - Comprehensive error handling
 * - CORS support for frontend integration
 * - Security middleware (helmet, rate limiting)
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
require('dotenv').config();

// Import route modules
const experimentsRoutes = require('./src/routes/experiments');
const responsesRoutes = require('./src/routes/responses');
const batchExperimentsRoutes = require('./src/routes/batchExperiments');
const metricsRoutes = require('./src/routes/metrics');
const analyticsRoutes = require('./src/routes/analytics');
const exportRoutes = require('./src/routes/export');

// Initialize Express application
const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// Rate limiting middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per windowMs
  message: {
    success: false,
    error: {
      message: 'Too many requests from this IP, please try again later.',
      statusCode: 429,
      code: 'RATE_LIMIT_EXCEEDED'
    }
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

app.use(limiter);

// Compression middleware
app.use(compression());

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// API health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      services: {
        database: 'healthy', // Mock - no actual DB
        llm_service: 'healthy',
        metrics_engine: 'healthy'
      }
    }
  });
});

// API routes
app.use('/api/experiments', experimentsRoutes);
app.use('/api/responses', responsesRoutes);
app.use('/api/batch-experiments', batchExperimentsRoutes);
app.use('/api/metrics', metricsRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/export', exportRoutes);

// System stats endpoint
app.get('/api/system/stats', (req, res) => {
  res.json({
    success: true,
    data: {
      usage: {
        total_experiments: 1247,
        total_responses: 5640,
        total_cost: 234.56,
        active_users: 15
      },
      performance: {
        average_response_time: 2800,
        success_rate: 98.7,
        uptime: '99.9%'
      }
    }
  });
});

// Model management endpoints
app.get('/api/models', (req, res) => {
  res.json({
    success: true,
    data: {
      models: [
        {
          id: 'gpt-4',
          name: 'GPT-4',
          provider: 'openai',
          status: 'active',
          capabilities: ['text-generation', 'analysis'],
          cost_per_token: 0.00003,
          max_tokens: 4096,
          context_window: 8192
        },
        {
          id: 'gpt-3.5-turbo',
          name: 'GPT-3.5 Turbo',
          provider: 'openai',
          status: 'active',
          capabilities: ['text-generation'],
          cost_per_token: 0.000002,
          max_tokens: 4096,
          context_window: 4096
        },
        {
          id: 'claude-3-opus',
          name: 'Claude 3 Opus',
          provider: 'anthropic',
          status: 'active',
          capabilities: ['text-generation', 'analysis'],
          cost_per_token: 0.000015,
          max_tokens: 4096,
          context_window: 200000
        }
      ]
    }
  });
});

app.get('/api/models/:id/stats', (req, res) => {
  const { id } = req.params;
  
  res.json({
    success: true,
    data: {
      model_id: id,
      statistics: {
        total_requests: 1247,
        average_quality: 89.2,
        average_response_time: 2800,
        total_cost: 156.78,
        success_rate: 99.2
      }
    }
  });
});

// Catch-all route for undefined endpoints
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      message: `Route ${req.originalUrl} not found`,
      statusCode: 404,
      code: 'ROUTE_NOT_FOUND'
    }
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  
  // Default error response
  const errorResponse = {
    success: false,
    error: {
      message: err.message || 'Internal Server Error',
      statusCode: err.statusCode || 500,
      code: err.code || 'INTERNAL_SERVER_ERROR'
    }
  };

  // Add error details in development
  if (process.env.NODE_ENV === 'development') {
    errorResponse.error.stack = err.stack;
  }

  res.status(err.statusCode || 500).json(errorResponse);
});

// Start the server
app.listen(PORT, () => {
  console.log(`
🚀 LLM-LAB Backend API Server is running!
📍 Port: ${PORT}
🌍 Environment: ${process.env.NODE_ENV || 'development'}
📊 API Documentation: See BACKEND_API_SPECIFICATION.md
🏥 Health Check: http://localhost:${PORT}/api/health
  `);
});

module.exports = app;
