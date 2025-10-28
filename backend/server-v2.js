const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

// Import production-ready modules
const { requestId, requestLogger, performanceMonitor, securityLogger } = require('./src/middleware/logging');
const { errorHandler, notFoundHandler, setupProcessErrorHandlers } = require('./src/middleware/errorHandler');
const { validateApiVersion } = require('./src/middleware/validation');
const Database = require('./src/config/database');
const logger = require('./src/utils/logger');

// Import controllers
const ExperimentController = require('./src/controllers/ExperimentController');
const ResponseController = require('./src/controllers/ResponseController');

// Import legacy routes for compatibility
const legacyExperimentsRoute = require('./src/routes/experiments');
const legacyResponsesRoute = require('./src/routes/responses');
const legacyMetricsRoute = require('./src/routes/metrics');
const legacyExportRoute = require('./src/routes/export');

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize controllers
const experimentController = new ExperimentController();
const responseController = new ResponseController();

// Setup process error handlers
setupProcessErrorHandlers();

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
  crossOriginEmbedderPolicy: false
}));

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID', 'API-Version']
}));

// Basic middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Production middleware stack
app.use(requestId());
app.use(requestLogger({
  logBody: process.env.NODE_ENV !== 'production',
  logQuery: true,
  logHeaders: false
}));
app.use(performanceMonitor({
  slowRequestThreshold: 2000,
  trackMemoryUsage: process.env.NODE_ENV !== 'production'
}));
app.use(securityLogger());
app.use(validateApiVersion('1.0.0'));

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    const dbStats = await Database.getStats();
    const llmService = require('./src/services/llmService');
    const llmStatus = llmService.getStatus();
    
    res.json({ 
      status: 'OK', 
      message: 'LLM Response Quality Analyzer API is running',
      timestamp: new Date().toISOString(),
      version: '2.0.0',
      services: {
        database: Database.isInitialized ? 'Connected' : 'Disconnected',
        llm_service: llmStatus.initialized ? 'Connected' : 'Error',
        mock_mode: llmStatus.mock_mode
      },
      statistics: dbStats,
      environment: process.env.NODE_ENV || 'development'
    });
  } catch (error) {
    logger.error('Health check failed:', error);
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
    version: '2.0.0',
    description: 'Production-ready API for LLM response quality analysis',
    endpoints: {
      experiments: {
        'GET /api/experiments': 'List experiments with pagination',
        'GET /api/experiments/:id': 'Get experiment by ID',
        'POST /api/experiments': 'Create new experiment',
        'PUT /api/experiments/:id': 'Update experiment',
        'DELETE /api/experiments/:id': 'Delete experiment',
        'GET /api/experiments/:id/stats': 'Get experiment statistics'
      },
      responses: {
        'GET /api/experiments/:id/responses': 'Get responses for experiment',
        'POST /api/experiments/:id/generate': 'Generate responses (SSE)',
        'GET /api/responses/:id': 'Get response by ID',
        'POST /api/responses/compare': 'Compare multiple responses'
      },
      metrics: {
        'GET /api/metrics/:responseId': 'Get quality metrics',
        'POST /api/metrics/batch': 'Calculate batch metrics',
        'POST /api/metrics/compare': 'Compare metrics'
      },
      export: {
        'GET /api/export/:experimentId': 'Export experiment data',
        'GET /api/export/:experimentId/csv': 'Export as CSV',
        'POST /api/export/batch': 'Export multiple experiments'
      }
    },
    features: [
      'Real-time response generation with Server-Sent Events',
      '6 comprehensive quality metrics',
      'Parameter range testing',
      'Response comparison tools',
      'Data export functionality',
      'Production-ready error handling',
      'Performance monitoring',
      'Security middleware'
    ]
  });
});

// Production API Routes using new controllers
const apiRouter = express.Router();

// Experiments routes
apiRouter.get('/experiments', experimentController.getAllExperiments.bind(experimentController));
apiRouter.get('/experiments/:id', experimentController.getExperimentById.bind(experimentController));
apiRouter.post('/experiments', experimentController.createExperiment.bind(experimentController));
apiRouter.put('/experiments/:id', experimentController.updateExperiment.bind(experimentController));
apiRouter.delete('/experiments/:id', experimentController.deleteExperiment.bind(experimentController));
apiRouter.get('/experiments/:id/stats', experimentController.getExperimentStats.bind(experimentController));

// Response routes
apiRouter.get('/experiments/:experimentId/responses', responseController.getResponsesByExperiment.bind(responseController));
apiRouter.post('/experiments/:experimentId/generate', responseController.generateResponses.bind(responseController));
apiRouter.get('/responses/:id', responseController.getResponseById.bind(responseController));
apiRouter.post('/responses/compare', responseController.compareResponses.bind(responseController));

// Mount API routes
app.use('/api/v2', apiRouter);

// Legacy API Routes (for backward compatibility)
app.use('/api/experiments', legacyExperimentsRoute);
app.use('/api/responses', legacyResponsesRoute);
app.use('/api/metrics', legacyMetricsRoute);
app.use('/api/export', legacyExportRoute);

// Static file serving for frontend (if needed)
if (process.env.NODE_ENV === 'production') {
  const path = require('path');
  app.use(express.static(path.join(__dirname, '../frontend/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
  });
}

// Error handling middleware (must be last)
app.use(notFoundHandler);
app.use(errorHandler);

// Initialize database and start server
const startServer = async () => {
  try {
    logger.info('Starting LLM Response Quality Analyzer API...');
    
    // Initialize database
    logger.info('Initializing database...');
    await Database.init();
    logger.info('Database initialized successfully');
    
    // Test LLM service
    logger.info('Testing LLM service...');
    const llmService = require('./src/services/llmService');
    const llmStatus = llmService.getStatus();
    
    if (llmStatus.mock_mode) {
      logger.warn('Running in MOCK MODE - No OpenAI API key provided');
      logger.warn('Add OPENAI_API_KEY to .env file for real LLM integration');
    } else if (llmStatus.initialized) {
      logger.info('OpenAI API connection ready');
    }
    
    // Start server
    const server = app.listen(PORT, () => {
      logger.info('Server started successfully', {
        port: PORT,
        environment: process.env.NODE_ENV || 'development',
        version: '2.0.0',
        healthCheck: `http://localhost:${PORT}/api/health`,
        documentation: `http://localhost:${PORT}/api/docs`,
        apiV2: `http://localhost:${PORT}/api/v2`,
        mockMode: llmStatus.mock_mode
      });
      
      console.log('\n🚀 LLM Response Quality Analyzer API v2.0.0');
      console.log(`   Port: ${PORT}`);
      console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`   Health Check: http://localhost:${PORT}/api/health`);
      console.log(`   API Documentation: http://localhost:${PORT}/api/docs`);
      console.log(`   New API (v2): http://localhost:${PORT}/api/v2`);
      console.log(`   Legacy API: http://localhost:${PORT}/api`);
      console.log(`   Mock Mode: ${llmStatus.mock_mode ? 'ON' : 'OFF'}`);
      console.log('\n📊 Production-Ready Backend is Live! 🎉\n');
    });
    
    // Graceful shutdown
    const gracefulShutdown = (signal) => {
      logger.info(`Received ${signal}, shutting down gracefully...`);
      
      server.close(async () => {
        try {
          await Database.close();
          logger.info('Database connection closed');
          logger.info('Server shut down complete');
          process.exit(0);
        } catch (error) {
          logger.error('Error during shutdown:', error);
          process.exit(1);
        }
      });
    };
    
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;
