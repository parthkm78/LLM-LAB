const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const { setupDatabase } = require('./config/database');
const llmService = require('./services/llmService');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.get('/api/health', async (req, res) => {
  try {
    // Test LLM service connection
    const llmStatus = await llmService.testConnection();
    
    res.json({ 
      status: 'OK', 
      message: 'LLM Response Quality Analyzer API is running',
      timestamp: new Date().toISOString(),
      services: {
        database: 'Connected',
        llm_service: llmStatus.success ? 'Connected' : 'Error',
        mock_mode: llmStatus.mock || false
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Health check failed',
      error: error.message
    });
  }
});

// API Routes
app.use('/api/experiments', require('./routes/experiments'));
app.use('/api/responses', require('./routes/responses'));
app.use('/api/metrics', require('./routes/metrics'));
app.use('/api/export', require('./routes/export'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('API Error:', err);
  res.status(err.status || 500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    path: req.originalUrl,
    method: req.method
  });
});

// Initialize database and start server
const startServer = async () => {
  try {
    // Setup database
    console.log('🔧 Setting up database...');
    await setupDatabase();
    console.log('✅ Database setup complete');
    
    // Test LLM service
    console.log('🤖 Testing LLM service...');
    const llmStatus = await llmService.testConnection();
    if (llmStatus.mock) {
      console.log('⚠️  Running in MOCK MODE - No OpenAI API key provided');
      console.log('   Add OPENAI_API_KEY to .env file for real LLM integration');
    } else if (llmStatus.success) {
      console.log('✅ OpenAI API connection successful');
    } else {
      console.log('⚠️  OpenAI API connection failed, falling back to mock mode');
    }
    
    // Start server
    app.listen(PORT, () => {
      console.log('\n🚀 Server Details:');
      console.log(`   Port: ${PORT}`);
      console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`   Health Check: http://localhost:${PORT}/api/health`);
      console.log(`   Documentation: http://localhost:${PORT}/api/docs`);
      console.log('\n📊 LLM Response Quality Analyzer API Ready!\n');
    });
    
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down gracefully...');
  process.exit(0);
});

startServer();
