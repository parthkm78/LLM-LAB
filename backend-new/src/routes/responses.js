/**
 * Responses API Routes
 * 
 * This module handles all response-related API endpoints including:
 * - Response generation with streaming support
 * - Response retrieval and filtering
 * - Response comparison and analysis
 * - Quality metrics calculation
 * 
 * All responses follow the standard API format with comprehensive error handling.
 */

const express = require('express');
const router = express.Router();
const {
  mockResponses,
  getResponsesByExperiment,
  findResponseById,
  addResponse,
  getResponsesForComparison
} = require('../data/mockResponses');
const { findExperimentById } = require('../data/mockExperiments');

/**
 * POST /api/responses/generate
 * Generate new responses for an experiment
 * Supports both single generation and batch generation with streaming
 */
router.post('/generate', (req, res) => {
  try {
    const {
      experiment_id,
      specific_parameters,
      generate_all = false,
      count = 1
    } = req.body;

    if (!experiment_id) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Validation failed',
          statusCode: 400,
          code: 'VALIDATION_ERROR',
          details: 'experiment_id is required'
        }
      });
    }

    const experiment = findExperimentById(experiment_id);
    if (!experiment) {
      return res.status(404).json({
        success: false,
        error: {
          message: `Experiment with ID ${experiment_id} not found`,
          statusCode: 404,
          code: 'EXPERIMENT_NOT_FOUND'
        }
      });
    }

    // Check if streaming is requested
    const acceptHeader = req.headers.accept;
    const isStreaming = acceptHeader && acceptHeader.includes('text/event-stream');

    if (isStreaming) {
      // Set up Server-Sent Events (SSE) headers
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Cache-Control'
      });

      // Send initial progress
      res.write(`data: ${JSON.stringify({
        progress: 0,
        status: 'starting',
        experiment_id: experiment_id
      })}\n\n`);

      // Simulate progressive generation
      let currentResponse = 0;
      const totalResponses = generate_all ? 4 : count;

      const interval = setInterval(() => {
        currentResponse++;
        const progress = Math.floor((currentResponse / totalResponses) * 100);
        
        if (currentResponse <= totalResponses) {
          res.write(`data: ${JSON.stringify({
            progress: Math.min(progress, 95),
            status: 'generating',
            current_response: currentResponse,
            total: totalResponses
          })}\n\n`);
        }

        if (currentResponse >= totalResponses) {
          clearInterval(interval);
          
          // Generate mock results
          const results = generateMockResponses(experiment, specific_parameters || experiment.parameters, totalResponses);
          
          res.write(`data: ${JSON.stringify({
            progress: 100,
            status: 'completed',
            results: results
          })}\n\n`);
          
          res.end();
        }
      }, 1000); // Send progress every second

      // Handle client disconnect
      req.on('close', () => {
        clearInterval(interval);
      });

    } else {
      // Non-streaming response
      const totalResponses = generate_all ? 4 : count;
      const results = generateMockResponses(experiment, specific_parameters || experiment.parameters, totalResponses);

      res.json({
        success: true,
        data: {
          experiment_id: experiment_id,
          results: results,
          summary: {
            total_generated: results.length,
            average_quality: results.reduce((sum, r) => sum + r.metrics.overall_quality, 0) / results.length,
            total_cost: results.reduce((sum, r) => sum + r.performance.cost, 0),
            total_time: `${(results.reduce((sum, r) => sum + r.performance.response_time, 0) / 1000).toFixed(1)}s`
          }
        },
        meta: {
          timestamp: new Date().toISOString(),
          request_id: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        }
      });
    }

  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to generate responses',
        statusCode: 500,
        code: 'INTERNAL_SERVER_ERROR',
        details: error.message
      }
    });
  }
});

/**
 * GET /api/responses/:experimentId
 * Get all responses for a specific experiment with filtering and pagination
 */
router.get('/:experimentId', (req, res) => {
  try {
    const { experimentId } = req.params;
    const {
      page = 1,
      limit = 20,
      min_quality,
      max_quality,
      sort_by = 'created_at'
    } = req.query;

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      min_quality: min_quality ? parseFloat(min_quality) : undefined,
      max_quality: max_quality ? parseFloat(max_quality) : undefined,
      sort_by
    };

    const result = getResponsesByExperiment(experimentId, options);

    res.json({
      success: true,
      data: result,
      meta: {
        pagination: result.pagination,
        timestamp: new Date().toISOString(),
        request_id: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to retrieve responses',
        statusCode: 500,
        code: 'INTERNAL_SERVER_ERROR',
        details: error.message
      }
    });
  }
});

/**
 * GET /api/responses/single/:id
 * Get a single response by ID with detailed information
 */
router.get('/single/:id', (req, res) => {
  try {
    const { id } = req.params;
    const response = findResponseById(id);

    if (!response) {
      return res.status(404).json({
        success: false,
        error: {
          message: `Response with ID ${id} not found`,
          statusCode: 404,
          code: 'RESPONSE_NOT_FOUND'
        }
      });
    }

    res.json({
      success: true,
      data: {
        response: {
          ...response,
          performance: response.performance
        }
      },
      meta: {
        timestamp: new Date().toISOString(),
        request_id: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to retrieve response',
        statusCode: 500,
        code: 'INTERNAL_SERVER_ERROR',
        details: error.message
      }
    });
  }
});

/**
 * POST /api/responses/compare
 * Compare multiple responses and provide analysis
 */
router.post('/compare', (req, res) => {
  try {
    const { response_ids } = req.body;

    if (!response_ids || !Array.isArray(response_ids) || response_ids.length < 2) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Validation failed',
          statusCode: 400,
          code: 'VALIDATION_ERROR',
          details: 'At least 2 response IDs are required for comparison'
        }
      });
    }

    // Find all responses
    const responses = response_ids.map(id => findResponseById(id)).filter(Boolean);
    
    if (responses.length !== response_ids.length) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'One or more responses not found',
          statusCode: 404,
          code: 'RESPONSES_NOT_FOUND'
        }
      });
    }

    // Perform comparison analysis
    const analysis = performComparisonAnalysis(responses);

    res.json({
      success: true,
      data: {
        comparison: {
          responses: responses.map(response => ({
            id: response.id,
            content: response.content,
            metrics: response.metrics,
            parameters: response.parameters
          })),
          analysis
        }
      },
      meta: {
        timestamp: new Date().toISOString(),
        request_id: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to compare responses',
        statusCode: 500,
        code: 'INTERNAL_SERVER_ERROR',
        details: error.message
      }
    });
  }
});

/**
 * GET /api/responses/comparison
 * Get all responses formatted for comparison view with advanced filtering
 */
router.get('/comparison', (req, res) => {
  try {
    const filters = {
      search: req.query.search,
      models: req.query.models ? req.query.models.split(',') : undefined,
      quality_min: req.query.quality_min ? parseFloat(req.query.quality_min) : undefined,
      quality_max: req.query.quality_max ? parseFloat(req.query.quality_max) : undefined,
      date_from: req.query.date_from,
      date_to: req.query.date_to,
      tags: req.query.tags ? req.query.tags.split(',') : undefined,
      sort_by: req.query.sort_by || 'created_at',
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 20
    };

    const result = getResponsesForComparison(filters);

    res.json({
      success: true,
      data: result,
      meta: {
        pagination: result.pagination,
        filters_applied: result.filters_applied,
        timestamp: new Date().toISOString(),
        request_id: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to retrieve responses for comparison',
        statusCode: 500,
        code: 'INTERNAL_SERVER_ERROR',
        details: error.message
      }
    });
  }
});

/**
 * POST /api/responses/comparison/analyze
 * Perform advanced comparison analysis on selected responses
 */
router.post('/comparison/analyze', (req, res) => {
  try {
    const {
      response_ids,
      analysis_type = 'comprehensive',
      include_recommendations = true
    } = req.body;

    if (!response_ids || !Array.isArray(response_ids) || response_ids.length < 2) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Validation failed',
          statusCode: 400,
          code: 'VALIDATION_ERROR',
          details: 'At least 2 response IDs are required for analysis'
        }
      });
    }

    // Find all responses
    const responses = response_ids.map(id => findResponseById(id)).filter(Boolean);
    
    if (responses.length !== response_ids.length) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'One or more responses not found',
          statusCode: 404,
          code: 'RESPONSES_NOT_FOUND'
        }
      });
    }

    // Perform comprehensive analysis
    const comparisonAnalysis = performAdvancedComparison(responses, analysis_type, include_recommendations);

    res.json({
      success: true,
      data: {
        comparison_analysis: comparisonAnalysis
      },
      meta: {
        timestamp: new Date().toISOString(),
        request_id: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to perform comparison analysis',
        statusCode: 500,
        code: 'INTERNAL_SERVER_ERROR',
        details: error.message
      }
    });
  }
});

/**
 * Helper function to generate mock responses
 */
function generateMockResponses(experiment, parameters, count) {
  const results = [];
  
  for (let i = 0; i < count; i++) {
    // Generate quality based on parameters
    const baseQuality = 85;
    const temperatureBonus = (parameters.temperature - 0.5) * 10; // Higher temp = more creative
    const qualityVariation = (Math.random() - 0.5) * 10;
    const overallQuality = Math.max(60, Math.min(100, baseQuality + temperatureBonus + qualityVariation));
    
    const mockResponse = {
      id: Date.now() + i,
      content: generateMockContent(experiment.prompt, parameters),
      parameters: parameters,
      metrics: {
        overall_quality: parseFloat(overallQuality.toFixed(1)),
        coherence: parseFloat((overallQuality + (Math.random() - 0.5) * 5).toFixed(1)),
        completeness: parseFloat((overallQuality + (Math.random() - 0.5) * 5).toFixed(1)),
        readability: parseFloat((overallQuality + (Math.random() - 0.5) * 5).toFixed(1)),
        creativity: parseFloat((overallQuality + temperatureBonus + (Math.random() - 0.5) * 5).toFixed(1)),
        specificity: parseFloat((overallQuality + (Math.random() - 0.5) * 5).toFixed(1)),
        length_appropriateness: parseFloat((overallQuality + (Math.random() - 0.5) * 5).toFixed(1))
      },
      performance: {
        response_time: Math.floor(2000 + Math.random() * 3000),
        token_count: Math.floor(300 + Math.random() * 400),
        cost: parseFloat((0.015 + Math.random() * 0.02).toFixed(3))
      },
      created_at: new Date().toISOString()
    };
    
    results.push(mockResponse);
  }
  
  return results;
}

/**
 * Helper function to generate mock content based on prompt
 */
function generateMockContent(prompt, parameters) {
  const templates = [
    "This is a generated response based on the provided prompt. The content demonstrates the specified parameters in action.",
    "Here's a creative interpretation of your prompt, showcasing the model's capabilities with the given configuration.",
    "A thoughtful response that addresses the prompt while incorporating the parameter settings for optimal results."
  ];
  
  const template = templates[Math.floor(Math.random() * templates.length)];
  return `${template}\n\nPrompt: ${prompt.substring(0, 100)}...\nParameters: Temperature ${parameters.temperature}, Top-p ${parameters.top_p}`;
}

/**
 * Helper function to perform comparison analysis
 */
function performComparisonAnalysis(responses) {
  const qualities = responses.map(r => r.metrics.overall_quality);
  const maxDiff = Math.max(...qualities) - Math.min(...qualities);
  const avgDiff = qualities.reduce((sum, q, i, arr) => {
    return sum + Math.abs(q - arr[0]);
  }, 0) / qualities.length;

  // Find most varied metric
  const metricVariances = {};
  const metrics = ['coherence', 'completeness', 'readability', 'creativity', 'specificity', 'length_appropriateness'];
  
  metrics.forEach(metric => {
    const values = responses.map(r => r.metrics[metric]);
    const variance = Math.max(...values) - Math.min(...values);
    metricVariances[metric] = variance;
  });
  
  const mostVariedMetric = Object.keys(metricVariances).reduce((a, b) => 
    metricVariances[a] > metricVariances[b] ? a : b
  );

  return {
    quality_differences: {
      max_difference: parseFloat(maxDiff.toFixed(1)),
      average_difference: parseFloat(avgDiff.toFixed(1)),
      most_varied_metric: mostVariedMetric
    },
    parameter_impact: {
      temperature: {
        correlation_with_quality: 0.73,
        impact_score: "high"
      }
    },
    recommendations: [
      `Response ${responses[0].id} shows optimal balance of creativity and coherence`,
      "Consider temperature around 0.8 for similar tasks"
    ]
  };
}

/**
 * Helper function to perform advanced comparison analysis
 */
function performAdvancedComparison(responses, analysisType, includeRecommendations) {
  const qualities = responses.map(r => r.metrics.overall_quality);
  const bestResponse = responses.reduce((best, current) => 
    current.metrics.overall_quality > best.metrics.overall_quality ? current : best
  );

  const analysis = {
    responses: responses.map(r => ({
      id: r.id,
      metrics: r.metrics,
      parameters: r.parameters
    })),
    quality_analysis: {
      best_overall: bestResponse.id,
      metric_leaders: {
        creativity: responses.reduce((best, current) => 
          current.metrics.creativity > best.metrics.creativity ? current : best
        ).id,
        coherence: responses.reduce((best, current) => 
          current.metrics.coherence > best.metrics.coherence ? current : best
        ).id,
        readability: responses.reduce((best, current) => 
          current.metrics.readability > best.metrics.readability ? current : best
        ).id
      },
      quality_distribution: {
        mean: qualities.reduce((a, b) => a + b, 0) / qualities.length,
        std: Math.sqrt(qualities.reduce((sum, q) => sum + Math.pow(q - (qualities.reduce((a, b) => a + b, 0) / qualities.length), 2), 0) / qualities.length),
        range: [Math.min(...qualities), Math.max(...qualities)]
      }
    },
    parameter_impact: {
      temperature_effect: {
        high_temp_responses: responses.filter(r => r.parameters.temperature > 0.7).map(r => r.id),
        low_temp_responses: responses.filter(r => r.parameters.temperature <= 0.7).map(r => r.id),
        impact_on_creativity: "significant_positive"
      }
    },
    content_analysis: {
      length_comparison: responses.map(r => r.performance.token_count),
      vocabulary_diversity: responses.map(() => parseFloat((0.7 + Math.random() * 0.3).toFixed(2))),
      sentiment_analysis: responses.map(() => parseFloat((0.6 + Math.random() * 0.3).toFixed(2)))
    }
  };

  if (includeRecommendations) {
    analysis.recommendations = [
      `Response ${bestResponse.id} shows optimal balance for creative tasks`,
      "Consider temperature around 0.8 for similar prompts",
      "Higher top_p values may improve response diversity"
    ];
  }

  return analysis;
}

module.exports = router;