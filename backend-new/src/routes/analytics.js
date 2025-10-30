/**
 * Analytics API Routes
 * 
 * This module handles all analytics and insights-related API endpoints including:
 * - Dashboard analytics with comprehensive metrics
 * - Parameter optimization recommendations
 * - Correlation analysis and statistical insights
 * - Model performance comparisons
 * - Experiment success patterns and failure analysis
 * 
 * All analytics are generated from mock data to demonstrate the API structure
 * and response formats without requiring a real database or ML models.
 */

const express = require('express');
const router = express.Router();
const {
  generateDashboardAnalytics,
  generateOptimizationInsights,
  generateCorrelationAnalysis,
  generateModelComparison,
  generateExperimentInsights
} = require('../data/mockAnalytics');

/**
 * GET /api/analytics/dashboard
 * Get comprehensive dashboard analytics including overview metrics,
 * quality trends, model performance, and recent activity
 */
router.get('/dashboard', (req, res) => {
  try {
    const {
      period = '30d',
      models,
      experiment_types
    } = req.query;

    // Validate period
    const validPeriods = ['7d', '30d', '90d'];
    if (!validPeriods.includes(period)) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Invalid period',
          statusCode: 400,
          code: 'VALIDATION_ERROR',
          details: `Period must be one of: ${validPeriods.join(', ')}`
        }
      });
    }

    // Parse filter arrays
    const modelFilter = models ? models.split(',') : [];
    const experimentTypeFilter = experiment_types ? experiment_types.split(',') : [];

    // Generate analytics data
    const analyticsData = generateDashboardAnalytics(period, modelFilter, experimentTypeFilter);

    res.json({
      success: true,
      data: analyticsData,
      meta: {
        period: period,
        filters_applied: {
          models: modelFilter,
          experiment_types: experimentTypeFilter
        },
        timestamp: new Date().toISOString(),
        request_id: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to retrieve dashboard analytics',
        statusCode: 500,
        code: 'INTERNAL_SERVER_ERROR',
        details: error.message
      }
    });
  }
});

/**
 * GET /api/analytics/optimization
 * Get parameter optimization recommendations based on specified objectives
 */
router.get('/optimization', (req, res) => {
  try {
    const {
      objective = 'quality',
      constraints
    } = req.query;

    // Validate objective
    const validObjectives = ['quality', 'cost', 'speed', 'creativity'];
    if (!validObjectives.includes(objective)) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Invalid objective',
          statusCode: 400,
          code: 'VALIDATION_ERROR',
          details: `Objective must be one of: ${validObjectives.join(', ')}`
        }
      });
    }

    // Parse constraints if provided
    let parsedConstraints = {};
    if (constraints) {
      try {
        parsedConstraints = JSON.parse(constraints);
      } catch (error) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Invalid constraints format',
            statusCode: 400,
            code: 'VALIDATION_ERROR',
            details: 'Constraints must be a valid JSON object'
          }
        });
      }
    }

    // Generate optimization insights
    const optimizationData = generateOptimizationInsights(objective, parsedConstraints);

    res.json({
      success: true,
      data: optimizationData,
      meta: {
        objective: objective,
        constraints: parsedConstraints,
        timestamp: new Date().toISOString(),
        request_id: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to generate optimization insights',
        statusCode: 500,
        code: 'INTERNAL_SERVER_ERROR',
        details: error.message
      }
    });
  }
});

/**
 * GET /api/analytics/correlations
 * Get correlation analysis between parameters, metrics, and outcomes
 */
router.get('/correlations', (req, res) => {
  try {
    const {
      include_parameters = true,
      include_metrics = true,
      significance_threshold = 0.05
    } = req.query;

    // Generate correlation analysis
    const correlationData = generateCorrelationAnalysis();

    // Filter by significance threshold if specified
    if (parseFloat(significance_threshold) !== 0.05) {
      const threshold = parseFloat(significance_threshold);
      correlationData.correlations.parameter_quality = correlationData.correlations.parameter_quality.filter(
        corr => corr.p_value <= threshold
      );
    }

    // Filter by inclusion flags
    const filteredData = { ...correlationData };
    if (include_parameters === 'false') {
      delete filteredData.correlations.parameter_quality;
    }
    if (include_metrics === 'false') {
      delete filteredData.correlations.cross_metrics;
    }

    res.json({
      success: true,
      data: filteredData,
      meta: {
        significance_threshold: parseFloat(significance_threshold),
        include_parameters: include_parameters !== 'false',
        include_metrics: include_metrics !== 'false',
        timestamp: new Date().toISOString(),
        request_id: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to generate correlation analysis',
        statusCode: 500,
        code: 'INTERNAL_SERVER_ERROR',
        details: error.message
      }
    });
  }
});

/**
 * GET /api/analytics/models/comparison
 * Compare performance across different models
 */
router.get('/models/comparison', (req, res) => {
  try {
    const {
      models,
      metrics = 'quality,speed,cost',
      timeframe = '30d'
    } = req.query;

    // Parse models list
    const modelList = models ? models.split(',') : ['gpt-4', 'gpt-3.5-turbo', 'claude-3-opus'];
    
    // Validate models
    const validModels = ['gpt-4', 'gpt-3.5-turbo', 'claude-3-opus', 'gpt-4-turbo'];
    const invalidModels = modelList.filter(model => !validModels.includes(model));
    
    if (invalidModels.length > 0) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Invalid models specified',
          statusCode: 400,
          code: 'VALIDATION_ERROR',
          details: `Invalid models: ${invalidModels.join(', ')}. Valid models: ${validModels.join(', ')}`
        }
      });
    }

    // Generate model comparison data
    const comparisonData = generateModelComparison(modelList);

    res.json({
      success: true,
      data: comparisonData,
      meta: {
        models_compared: modelList,
        metrics_included: metrics.split(','),
        timeframe: timeframe,
        timestamp: new Date().toISOString(),
        request_id: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to generate model comparison',
        statusCode: 500,
        code: 'INTERNAL_SERVER_ERROR',
        details: error.message
      }
    });
  }
});

/**
 * GET /api/analytics/experiments/insights
 * Get insights about experiment success patterns and failure analysis
 */
router.get('/experiments/insights', (req, res) => {
  try {
    const {
      timeframe = '30d',
      include_failures = true,
      include_patterns = true
    } = req.query;

    // Validate timeframe
    const validTimeframes = ['7d', '30d', '90d', '1y'];
    if (!validTimeframes.includes(timeframe)) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Invalid timeframe',
          statusCode: 400,
          code: 'VALIDATION_ERROR',
          details: `Timeframe must be one of: ${validTimeframes.join(', ')}`
        }
      });
    }

    // Generate experiment insights
    const insightsData = generateExperimentInsights(timeframe);

    // Filter data based on inclusion flags
    const filteredData = { ...insightsData };
    if (include_failures === 'false') {
      delete filteredData.failure_analysis;
    }
    if (include_patterns === 'false') {
      delete filteredData.success_patterns;
    }

    res.json({
      success: true,
      data: filteredData,
      meta: {
        timeframe: timeframe,
        include_failures: include_failures !== 'false',
        include_patterns: include_patterns !== 'false',
        timestamp: new Date().toISOString(),
        request_id: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to generate experiment insights',
        statusCode: 500,
        code: 'INTERNAL_SERVER_ERROR',
        details: error.message
      }
    });
  }
});

/**
 * GET /api/analytics/quality/trends
 * Get detailed quality trends and patterns over time
 */
router.get('/quality/trends', (req, res) => {
  try {
    const {
      period = '30d',
      granularity = 'daily',
      metrics = 'overall_quality',
      models,
      experiment_types
    } = req.query;

    // Validate inputs
    const validPeriods = ['7d', '30d', '90d', '1y'];
    const validGranularities = ['hourly', 'daily', 'weekly', 'monthly'];
    
    if (!validPeriods.includes(period)) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Invalid period',
          statusCode: 400,
          code: 'VALIDATION_ERROR',
          details: `Period must be one of: ${validPeriods.join(', ')}`
        }
      });
    }

    if (!validGranularities.includes(granularity)) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Invalid granularity',
          statusCode: 400,
          code: 'VALIDATION_ERROR',
          details: `Granularity must be one of: ${validGranularities.join(', ')}`
        }
      });
    }

    // Generate quality trends data
    const trendsData = generateQualityTrends(period, granularity, metrics.split(','));

    res.json({
      success: true,
      data: trendsData,
      meta: {
        period: period,
        granularity: granularity,
        metrics: metrics.split(','),
        models: models ? models.split(',') : null,
        experiment_types: experiment_types ? experiment_types.split(',') : null,
        timestamp: new Date().toISOString(),
        request_id: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to generate quality trends',
        statusCode: 500,
        code: 'INTERNAL_SERVER_ERROR',
        details: error.message
      }
    });
  }
});

/**
 * POST /api/analytics/custom
 * Generate custom analytics based on user-defined criteria
 */
router.post('/custom', (req, res) => {
  try {
    const {
      analysis_type,
      parameters,
      filters,
      aggregations
    } = req.body;

    // Validate required fields
    if (!analysis_type) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Validation failed',
          statusCode: 400,
          code: 'VALIDATION_ERROR',
          details: 'analysis_type is required'
        }
      });
    }

    // Validate analysis type
    const validAnalysisTypes = ['correlation', 'regression', 'clustering', 'trend_analysis', 'comparison'];
    if (!validAnalysisTypes.includes(analysis_type)) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Invalid analysis type',
          statusCode: 400,
          code: 'VALIDATION_ERROR',
          details: `Analysis type must be one of: ${validAnalysisTypes.join(', ')}`
        }
      });
    }

    // Generate custom analysis (mock implementation)
    const customAnalysis = generateCustomAnalysis(analysis_type, parameters, filters, aggregations);

    res.json({
      success: true,
      data: customAnalysis,
      meta: {
        analysis_type: analysis_type,
        parameters_used: parameters || {},
        filters_applied: filters || {},
        aggregations_applied: aggregations || {},
        timestamp: new Date().toISOString(),
        request_id: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to generate custom analytics',
        statusCode: 500,
        code: 'INTERNAL_SERVER_ERROR',
        details: error.message
      }
    });
  }
});

/**
 * Helper function to generate quality trends data
 */
function generateQualityTrends(period, granularity, metrics) {
  const periodDays = { '7d': 7, '30d': 30, '90d': 90, '1y': 365 }[period];
  const dataPoints = [];
  
  // Adjust data point count based on granularity
  let pointCount = periodDays;
  if (granularity === 'weekly') pointCount = Math.ceil(periodDays / 7);
  if (granularity === 'monthly') pointCount = Math.ceil(periodDays / 30);
  
  for (let i = pointCount - 1; i >= 0; i--) {
    const date = new Date();
    if (granularity === 'daily') date.setDate(date.getDate() - i);
    if (granularity === 'weekly') date.setDate(date.getDate() - i * 7);
    if (granularity === 'monthly') date.setMonth(date.getMonth() - i);
    
    const dataPoint = {
      timestamp: date.toISOString(),
      date: date.toISOString().split('T')[0]
    };
    
    // Generate data for each requested metric
    metrics.forEach(metric => {
      dataPoint[metric] = parseFloat((80 + Math.random() * 15 + Math.sin(i / 5) * 5).toFixed(1));
    });
    
    dataPoint.experiment_count = Math.floor(Math.random() * 20) + 5;
    dataPoint.model_distribution = {
      'gpt-4': Math.random() * 0.4 + 0.3,
      'gpt-3.5-turbo': Math.random() * 0.4 + 0.3,
      'claude-3-opus': Math.random() * 0.3 + 0.1
    };
    
    dataPoints.push(dataPoint);
  }
  
  return {
    period: period,
    granularity: granularity,
    metrics: metrics,
    data_points: dataPoints,
    summary: {
      trend_direction: Math.random() > 0.5 ? 'improving' : 'stable',
      trend_strength: parseFloat((Math.random() * 10).toFixed(1)),
      total_data_points: dataPoints.length,
      coverage: '100%'
    }
  };
}

/**
 * Helper function to generate custom analysis
 */
function generateCustomAnalysis(analysisType, parameters, filters, aggregations) {
  const baseResult = {
    analysis_type: analysisType,
    status: 'completed',
    execution_time: `${(Math.random() * 5 + 1).toFixed(1)}s`,
    data_points_analyzed: Math.floor(Math.random() * 1000) + 500
  };

  switch (analysisType) {
    case 'correlation':
      return {
        ...baseResult,
        correlations: [
          { variables: ['temperature', 'creativity'], coefficient: 0.87, p_value: 0.001 },
          { variables: ['top_p', 'diversity'], coefficient: 0.64, p_value: 0.003 }
        ],
        insights: ['Strong positive correlation between temperature and creativity']
      };
      
    case 'regression':
      return {
        ...baseResult,
        model: {
          r_squared: 0.78,
          coefficients: {
            temperature: 12.5,
            top_p: 8.3,
            intercept: 45.2
          },
          prediction_accuracy: 0.84
        },
        insights: ['Temperature is the strongest predictor of quality']
      };
      
    case 'clustering':
      return {
        ...baseResult,
        clusters: [
          { id: 1, size: 156, centroid: { temperature: 0.8, top_p: 0.9 }, quality: 92.1 },
          { id: 2, size: 203, centroid: { temperature: 0.6, top_p: 0.8 }, quality: 87.4 },
          { id: 3, size: 98, centroid: { temperature: 0.4, top_p: 0.7 }, quality: 82.7 }
        ],
        insights: ['Three distinct parameter clusters identified']
      };
      
    default:
      return {
        ...baseResult,
        results: { message: 'Analysis completed successfully' },
        insights: ['Custom analysis provides valuable insights']
      };
  }
}

module.exports = router;