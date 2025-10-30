const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const compression = require('compression');

// Import routes
const experimentsRouter = require('./src/routes/experiments');
const responsesRouter = require('./src/routes/responses');
const metricsRouter = require('./src/routes/metrics');
const batchExperimentsRouter = require('./src/routes/batchExperiments');
const analyticsRouter = require('./src/routes/analytics');
const exportRouter = require('./src/routes/export');

// Import mock data for health checks
const mockExperiments = require('./src/data/mockExperiments');
const mockResponses = require('./src/data/mockResponses');

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression middleware
app.use(compression());

// Logging middleware
app.use(morgan('combined'));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests from this IP, please try again later.',
      retry_after: '15 minutes'
    }
  },
  standardHeaders: true,
  legacyHeaders: false
});

app.use('/api/', limiter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  try {
    const systemStats = {
      status: 'OK',
      message: 'LLM Response Quality Analyzer API is running',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      services: {
        api: 'Connected',
        mock_data: 'Loaded'
      },
      statistics: {
        total_experiments: mockExperiments.length,
        total_responses: mockResponses.length,
        avg_quality_score: mockResponses.length > 0 ? 
          Math.round((mockResponses.reduce((sum, r) => sum + r.quality_metrics.overall_quality, 0) / mockResponses.length) * 10) / 10 : 0,
        uptime: process.uptime()
      },
      environment: process.env.NODE_ENV || 'development'
    };

    res.json(systemStats);
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Health check failed',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// API Documentation endpoint
app.get('/api/docs', (req, res) => {
  res.json({
    title: 'LLM Response Quality Analyzer API',
    version: '1.0.0',
    description: 'Mock API for LLM response quality analysis with comprehensive endpoints',
    base_url: `${req.protocol}://${req.get('host')}/api`,
    endpoints: {
      health: {
        'GET /api/health': 'System health check and statistics'
      },
      experiments: {
        'GET /api/experiments': 'List experiments with pagination and filtering',
        'GET /api/experiments/:id': 'Get experiment by ID with responses',
        'POST /api/experiments': 'Create new experiment',
        'PUT /api/experiments/:id': 'Update experiment',
        'DELETE /api/experiments/:id': 'Delete experiment',
        'GET /api/experiments/:id/stats': 'Get experiment statistics'
      },
      responses: {
        'POST /api/responses/generate': 'Generate responses for experiment',
        'GET /api/responses/:id': 'Get response by ID',
        'GET /api/responses/experiment/:experimentId': 'Get responses for experiment',
        'POST /api/responses/compare': 'Compare multiple responses'
      },
      metrics: {
        'GET /api/metrics/:responseId': 'Get quality metrics for response',
        'POST /api/metrics/batch': 'Calculate batch metrics',
        'POST /api/metrics/compare': 'Compare metrics across responses',
        'GET /api/metrics/trends': 'Get quality trends over time'
      },
      batch_experiments: {
        'POST /api/batch-experiments': 'Create batch experiment',
        'GET /api/batch-experiments': 'List batch experiments',
        'GET /api/batch-experiments/:id': 'Get batch experiment details',
        'POST /api/batch-experiments/:id/control': 'Control batch execution',
        'GET /api/batch-experiments/:id/results': 'Get batch results',
        'PUT /api/batch-experiments/:id': 'Update batch experiment',
        'DELETE /api/batch-experiments/:id': 'Delete batch experiment'
      },
      analytics: {
        'GET /api/analytics/dashboard': 'Get dashboard analytics',
        'GET /api/analytics/parameter-analysis': 'Analyze parameter impact',
        'GET /api/analytics/model-comparison': 'Compare model performance',
        'GET /api/analytics/experiment-performance': 'Analyze experiment performance',
        'GET /api/analytics/cost-analysis': 'Analyze cost trends'
      },
      export: {
        'GET /api/export/experiment/:id': 'Export experiment data',
        'POST /api/export/batch': 'Export multiple experiments',
        'GET /api/export/batch-experiment/:id': 'Export batch experiment',
        'GET /api/export/templates': 'Get export templates',
        'POST /api/export/custom': 'Create custom export'
      }
    },
    features: [
      'Mock data for rapid development',
      'Comprehensive quality metrics calculation',
      'Parameter testing and optimization',
      'Batch experiment management',
      'Real-time analytics and insights',
      'Flexible data export options',
      'Response comparison tools',
      'Cost analysis and optimization',
      'RESTful API design',
      'Error handling and validation'
    ],
    data_models: {
      experiment: 'Individual LLM testing experiment',
      response: 'Generated LLM response with metrics',
      batch_experiment: 'Parameter sweep testing',
      quality_metrics: 'Response quality analysis scores'
    }
  });
});

// API Routes
app.use('/api/experiments', experimentsRouter);
app.use('/api/responses', responsesRouter);
app.use('/api/metrics', metricsRouter);
app.use('/api/batch-experiments', batchExperimentsRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/export', exportRouter);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'LLM Response Quality Analyzer API',
    version: '1.0.0',
    documentation: '/api/docs',
    health: '/api/health',
    timestamp: new Date().toISOString()
  });
});

// 404 handler for unknown routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'API endpoint not found',
      details: `The requested endpoint ${req.originalUrl} does not exist`,
      available_endpoints: '/api/docs'
    }
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global error handler:', error);
  
  res.status(error.status || 500).json({
    success: false,
    error: {
      code: error.code || 'INTERNAL_ERROR',
      message: error.message || 'An unexpected error occurred',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      timestamp: new Date().toISOString(),
      request_id: req.id || 'unknown'
    }
  });
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Process terminated');
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  server.close(() => {
    console.log('Process terminated');
  });
});

// Start server
const server = app.listen(PORT, () => {
  console.log('🚀 LLM Response Quality Analyzer API');
  console.log(`📡 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/api/docs`);
  console.log(`💚 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`📊 Mock Data Loaded:`);
  console.log(`   - ${mockExperiments.length} experiments`);
  console.log(`   - ${mockResponses.length} responses`);
  console.log('✅ Ready to accept requests');
});

module.exports = app;
