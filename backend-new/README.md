# LLM Response Quality Analyzer - Backend API

A Node.js/Express backend API for the LLM Response Quality Analyzer application, providing comprehensive endpoints for experiment management, response analysis, quality metrics, and analytics.

## Features

- **Mock Data Architecture**: Uses file-based mock data instead of database for rapid development
- **Comprehensive API**: Full REST API with CRUD operations for experiments, responses, metrics
- **Security**: Helmet.js, CORS, rate limiting, and input validation
- **Analytics**: Dashboard analytics, model performance comparisons, parameter insights
- **Batch Processing**: Support for batch experiments and bulk operations
- **Export Functionality**: Data export in multiple formats (JSON, CSV, PDF)

## Quick Start

### Prerequisites
- Node.js >= 14.0.0
- npm >= 6.0.0

### Installation

```bash
# Clone the repository
cd backend-new

# Install dependencies
npm install

# Start the server
npm start
```

The server will start on `http://localhost:5000`

### Development Mode

```bash
npm run dev
```

## API Endpoints

### Health & Documentation
- `GET /api/health` - Health check and system status
- `GET /api/docs` - API documentation and endpoint listing

### Experiments
- `GET /api/experiments` - List all experiments with pagination and filtering
- `POST /api/experiments` - Create new experiment
- `GET /api/experiments/:id` - Get specific experiment
- `PUT /api/experiments/:id` - Update experiment
- `DELETE /api/experiments/:id` - Delete experiment
- `GET /api/experiments/:id/stats` - Get experiment statistics

### Responses
- `GET /api/responses/experiment/:id` - Get responses for specific experiment
- `POST /api/responses/generate` - Generate new response
- `GET /api/responses/:id` - Get specific response
- `POST /api/responses/compare` - Compare multiple responses

### Quality Metrics
- `POST /api/metrics/calculate` - Calculate quality metrics for response
- `POST /api/metrics/batch` - Batch calculate metrics for multiple responses
- `GET /api/metrics/trends/:experiment_id` - Get quality trends for experiment

### Analytics
- `GET /api/analytics/dashboard` - Dashboard overview data
- `GET /api/analytics/models/comparison` - Model performance comparison
- `GET /api/analytics/parameters/insights` - Parameter optimization insights
- `GET /api/analytics/cost` - Cost analysis and trends

### Batch Experiments
- `GET /api/batch-experiments` - List batch experiments
- `POST /api/batch-experiments` - Create batch experiment
- `GET /api/batch-experiments/:id` - Get batch experiment details
- `GET /api/batch-experiments/:id/progress` - Get execution progress
- `GET /api/batch-experiments/:id/results` - Get batch results

### Data Export
- `POST /api/export/experiments` - Export experiment data
- `POST /api/export/responses` - Export response data
- `POST /api/export/analytics` - Export analytics data

## Mock Data Structure

The API uses mock data stored in the following files:

- `src/data/mockExperiments.js` - Sample experiments with various use cases
- `src/data/mockResponses.js` - Mock LLM responses with quality metrics
- `src/data/mockBatchExperiments.js` - Batch experiment data
- `src/data/mockAnalytics.js` - Dashboard and analytics data

### Sample Experiment Types
1. **Creative Writing Analysis** - Testing parameters for creative content
2. **Technical Documentation** - Parameters for technical writing clarity
3. **Conversational AI Testing** - Dialogue quality evaluation
4. **Code Generation Analysis** - Code quality and documentation
5. **Marketing Copy Optimization** - Compelling content generation

## Quality Metrics

Each response includes comprehensive quality metrics:

- **Overall Quality** - Composite score (0-100)
- **Coherence Score** - Logical flow and consistency
- **Creativity Score** - Originality and innovation
- **Readability Score** - Clarity and accessibility
- **Completeness Score** - Thoroughness and detail
- **Factual Accuracy** - Correctness of information
- **Relevance Score** - Alignment with prompt
- **Engagement Score** - Interest and appeal
- **Technical Depth** - Complexity and expertise

## API Response Format

All endpoints return responses in the following format:

```json
{
  "success": true,
  "data": {
    // Response data
  },
  "message": "Optional message",
  "pagination": {
    // Pagination info for list endpoints
  }
}
```

Error responses:
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error description",
    "details": {}
  }
}
```

## Environment Variables

Create a `.env` file for configuration:

```
NODE_ENV=development
PORT=5000
API_VERSION=v1
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX_REQUESTS=100
LOG_LEVEL=info
```

## Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Test API endpoints
curl http://localhost:5000/api/health
curl http://localhost:5000/api/experiments
curl http://localhost:5000/api/analytics/dashboard
```

## Architecture

```
backend-new/
├── server.js                 # Main application entry point
├── package.json              # Dependencies and scripts
├── src/
│   ├── data/                 # Mock data files
│   │   ├── mockExperiments.js
│   │   ├── mockResponses.js
│   │   ├── mockBatchExperiments.js
│   │   └── mockAnalytics.js
│   └── routes/               # Route handlers
│       ├── experiments.js
│       ├── responses.js
│       ├── metrics.js
│       ├── analytics.js
│       ├── batchExperiments.js
│       └── export.js
└── README.md
```

## Production Considerations

For production deployment:

1. **Database Integration**: Replace mock data with proper database (PostgreSQL, MongoDB)
2. **Authentication**: Add JWT-based authentication and authorization
3. **Logging**: Implement structured logging with winston or similar
4. **Monitoring**: Add application monitoring and metrics
5. **Caching**: Implement Redis for caching frequently accessed data
6. **Load Balancing**: Use nginx or similar for load balancing
7. **Environment**: Configure production environment variables

## License

MIT License - see LICENSE file for details.
