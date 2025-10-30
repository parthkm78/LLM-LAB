/**
 * Experiments API Routes
 * 
 * This module handles all experiment-related API endpoints including:
 * - CRUD operations for experiments
 * - Experiment statistics and analytics
 * - Bulk operations
 * - Search and filtering
 * 
 * All responses follow the standard API format with proper error handling.
 */

const express = require('express');
const router = express.Router();
const {
  mockExperiments,
  getPaginatedExperiments,
  findExperimentById,
  addExperiment,
  updateExperiment,
  deleteExperiment
} = require('../data/mockExperiments');
const { getResponsesByExperiment, mockResponses } = require('../data/mockResponses');

/**
 * GET /api/experiments
 * List all experiments with pagination and filtering
 */
router.get('/', (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      type,
      status,
      model,
      date_from,
      date_to,
      sort_by = 'created_at',
      sort_order = 'desc'
    } = req.query;

    const filters = {
      search,
      type,
      status,
      model,
      date_from,
      date_to,
      sort_by,
      sort_order
    };

    const result = getPaginatedExperiments(
      parseInt(page),
      parseInt(limit),
      filters
    );

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
        message: 'Failed to retrieve experiments',
        statusCode: 500,
        code: 'INTERNAL_SERVER_ERROR',
        details: error.message
      }
    });
  }
});

/**
 * GET /api/experiments/:id
 * Get a specific experiment by ID with detailed information
 */
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const experiment = findExperimentById(id);

    if (!experiment) {
      return res.status(404).json({
        success: false,
        error: {
          message: `Experiment with ID ${id} not found`,
          statusCode: 404,
          code: 'EXPERIMENT_NOT_FOUND'
        }
      });
    }

    // Get associated responses for this experiment
    const responsesResult = getResponsesByExperiment(experiment.id, { limit: 100 });
    const responses = responsesResult.responses;

    // Add responses to experiment object
    const experimentWithResponses = {
      ...experiment,
      responses: responses.map(response => ({
        id: response.id,
        content: response.content,
        quality_metrics: response.metrics,
        response_time: response.performance.response_time,
        token_count: response.performance.token_count,
        cost: response.performance.cost
      }))
    };

    res.json({
      success: true,
      data: {
        experiment: experimentWithResponses
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
        message: 'Failed to retrieve experiment',
        statusCode: 500,
        code: 'INTERNAL_SERVER_ERROR',
        details: error.message
      }
    });
  }
});

/**
 * POST /api/experiments
 * Create a new experiment
 */
router.post('/', (req, res) => {
  try {
    const {
      name,
      description,
      type = 'single',
      model = 'gpt-4',
      prompt,
      parameters = {},
      parameter_ranges = {},
      response_count = 1,
      tags = []
    } = req.body;

    // Validate required fields
    if (!name || !prompt) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Validation failed',
          statusCode: 400,
          code: 'VALIDATION_ERROR',
          details: {
            name: !name ? 'Name is required' : null,
            prompt: !prompt ? 'Prompt is required' : null
          }
        }
      });
    }

    // Validate parameter values
    if (parameters.temperature && (parameters.temperature < 0 || parameters.temperature > 2)) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Validation failed',
          statusCode: 400,
          code: 'VALIDATION_ERROR',
          details: {
            field: 'temperature',
            value: parameters.temperature,
            constraint: 'must be between 0 and 2'
          }
        }
      });
    }

    const experimentData = {
      name,
      description,
      type,
      model,
      prompt,
      parameters: {
        temperature: 0.7,
        top_p: 0.9,
        max_tokens: 1000,
        frequency_penalty: 0.0,
        presence_penalty: 0.0,
        ...parameters
      },
      parameter_ranges,
      response_count,
      tags
    };

    const newExperiment = addExperiment(experimentData);

    res.status(201).json({
      success: true,
      data: {
        experiment: newExperiment
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
        message: 'Failed to create experiment',
        statusCode: 500,
        code: 'INTERNAL_SERVER_ERROR',
        details: error.message
      }
    });
  }
});

/**
 * PUT /api/experiments/:id
 * Update an existing experiment
 */
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Validate parameter values if provided
    if (updateData.parameters && updateData.parameters.temperature) {
      if (updateData.parameters.temperature < 0 || updateData.parameters.temperature > 2) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Validation failed',
            statusCode: 400,
            code: 'VALIDATION_ERROR',
            details: {
              field: 'temperature',
              value: updateData.parameters.temperature,
              constraint: 'must be between 0 and 2'
            }
          }
        });
      }
    }

    const updatedExperiment = updateExperiment(id, updateData);

    if (!updatedExperiment) {
      return res.status(404).json({
        success: false,
        error: {
          message: `Experiment with ID ${id} not found`,
          statusCode: 404,
          code: 'EXPERIMENT_NOT_FOUND'
        }
      });
    }

    res.json({
      success: true,
      data: {
        experiment: updatedExperiment
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
        message: 'Failed to update experiment',
        statusCode: 500,
        code: 'INTERNAL_SERVER_ERROR',
        details: error.message
      }
    });
  }
});

/**
 * DELETE /api/experiments/:id
 * Delete an experiment
 */
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const deleted = deleteExperiment(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: {
          message: `Experiment with ID ${id} not found`,
          statusCode: 404,
          code: 'EXPERIMENT_NOT_FOUND'
        }
      });
    }

    res.json({
      success: true,
      data: {
        message: 'Experiment deleted successfully',
        deleted_id: parseInt(id)
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
        message: 'Failed to delete experiment',
        statusCode: 500,
        code: 'INTERNAL_SERVER_ERROR',
        details: error.message
      }
    });
  }
});

/**
 * GET /api/experiments/:id/stats
 * Get detailed statistics for a specific experiment
 */
router.get('/:id/stats', (req, res) => {
  try {
    const { id } = req.params;
    const experiment = findExperimentById(id);

    if (!experiment) {
      return res.status(404).json({
        success: false,
        error: {
          message: `Experiment with ID ${id} not found`,
          statusCode: 404,
          code: 'EXPERIMENT_NOT_FOUND'
        }
      });
    }

    // Get responses for this experiment
    const responsesResult = getResponsesByExperiment(experiment.id, { limit: 100 });
    const responses = responsesResult.responses;

    if (responses.length === 0) {
      return res.json({
        success: true,
        data: {
          experiment_id: experiment.id,
          overview: {
            total_responses: 0,
            average_quality: null,
            best_quality: null,
            worst_quality: null,
            total_cost: 0,
            total_duration: '0s',
            success_rate: 0
          },
          quality_breakdown: {},
          parameter_performance: []
        }
      });
    }

    // Calculate statistics
    const qualities = responses.map(r => r.metrics.overall_quality);
    const costs = responses.map(r => r.performance.cost);
    const durations = responses.map(r => r.performance.response_time);

    const averageQuality = qualities.reduce((a, b) => a + b, 0) / qualities.length;
    const bestQuality = Math.max(...qualities);
    const worstQuality = Math.min(...qualities);
    const totalCost = costs.reduce((a, b) => a + b, 0);
    const totalDuration = durations.reduce((a, b) => a + b, 0);

    // Calculate quality breakdown
    const qualityMetrics = ['coherence', 'completeness', 'readability', 'creativity', 'specificity', 'length_appropriateness'];
    const qualityBreakdown = {};

    qualityMetrics.forEach(metric => {
      const values = responses.map(r => r.metrics[metric]);
      qualityBreakdown[metric] = {
        average: values.reduce((a, b) => a + b, 0) / values.length,
        best: Math.max(...values),
        worst: Math.min(...values)
      };
    });

    // Parameter performance analysis
    const parameterPerformance = responses.map(response => ({
      parameters: response.parameters,
      average_quality: response.metrics.overall_quality,
      response_count: 1
    }));

    res.json({
      success: true,
      data: {
        experiment_id: experiment.id,
        overview: {
          total_responses: responses.length,
          average_quality: parseFloat(averageQuality.toFixed(1)),
          best_quality: bestQuality,
          worst_quality: worstQuality,
          total_cost: parseFloat(totalCost.toFixed(3)),
          total_duration: `${(totalDuration / 1000).toFixed(1)}s`,
          success_rate: 100 // Mock: assume all successful
        },
        quality_breakdown: qualityBreakdown,
        parameter_performance: parameterPerformance
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
        message: 'Failed to get experiment statistics',
        statusCode: 500,
        code: 'INTERNAL_SERVER_ERROR',
        details: error.message
      }
    });
  }
});

/**
 * GET /api/experiments/history
 * Get experiment history with various view modes and filters
 */
router.get('/history', (req, res) => {
  try {
    const {
      search,
      type,
      status,
      date_from,
      date_to,
      favorited,
      archived,
      sort_by = 'created_at',
      view_mode = 'list',
      page = 1,
      limit = 20
    } = req.query;

    const filters = {
      search,
      type,
      status,
      date_from,
      date_to,
      sort_by
    };

    // Apply favorited filter
    if (favorited !== undefined) {
      filters.favorited = favorited === 'true';
    }

    // Apply archived filter
    if (archived !== undefined) {
      filters.archived = archived === 'true';
    }

    const result = getPaginatedExperiments(
      parseInt(page),
      parseInt(limit),
      filters
    );

    // Generate timeline data if requested
    let timelineData = [];
    if (view_mode === 'timeline') {
      const experimentsByDate = {};
      result.experiments.forEach(exp => {
        const date = exp.created_at.split('T')[0];
        if (!experimentsByDate[date]) {
          experimentsByDate[date] = [];
        }
        experimentsByDate[date].push(exp.id);
      });

      timelineData = Object.entries(experimentsByDate).map(([date, experimentIds]) => {
        const dayExperiments = result.experiments.filter(exp => experimentIds.includes(exp.id));
        const totalQuality = dayExperiments.reduce((sum, exp) => sum + (exp.quality_score || 0), 0);
        
        return {
          date,
          experiments: experimentIds,
          total_quality: experimentIds.length > 0 ? totalQuality / experimentIds.length : 0,
          experiment_count: experimentIds.length
        };
      });
    }

    res.json({
      success: true,
      data: {
        experiments: result.experiments.map(exp => ({
          id: exp.id,
          name: exp.name,
          type: exp.type,
          status: exp.status,
          model: exp.model,
          quality_score: exp.quality_score,
          created_at: exp.created_at,
          tags: exp.tags,
          favorited: exp.favorited,
          archived: exp.archived,
          summary: {
            response_count: exp.response_count,
            total_cost: exp.total_cost,
            duration: exp.duration
          }
        })),
        timeline_data: timelineData
      },
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
        message: 'Failed to retrieve experiment history',
        statusCode: 500,
        code: 'INTERNAL_SERVER_ERROR',
        details: error.message
      }
    });
  }
});

/**
 * POST /api/experiments/bulk
 * Perform bulk operations on experiments
 */
router.post('/bulk', (req, res) => {
  try {
    const { action, experiment_ids, params } = req.body;

    if (!action || !experiment_ids || !Array.isArray(experiment_ids)) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Validation failed',
          statusCode: 400,
          code: 'VALIDATION_ERROR',
          details: 'action and experiment_ids array are required'
        }
      });
    }

    const results = [];
    let successCount = 0;
    let failCount = 0;

    experiment_ids.forEach(id => {
      try {
        let result;
        switch (action) {
          case 'favorite':
            result = updateExperiment(id, { favorited: params.favorited });
            break;
          case 'archive':
            result = updateExperiment(id, { archived: params.archived });
            break;
          case 'delete':
            result = deleteExperiment(id);
            break;
          default:
            throw new Error(`Unknown action: ${action}`);
        }

        if (result || result === true) {
          successCount++;
          results.push({ id, status: 'success' });
        } else {
          failCount++;
          results.push({ id, status: 'failed', error: 'Not found' });
        }
      } catch (error) {
        failCount++;
        results.push({ id, status: 'failed', error: error.message });
      }
    });

    res.json({
      success: true,
      data: {
        action,
        total_processed: experiment_ids.length,
        success_count: successCount,
        fail_count: failCount,
        results
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
        message: 'Failed to perform bulk operation',
        statusCode: 500,
        code: 'INTERNAL_SERVER_ERROR',
        details: error.message
      }
    });
  }
});

module.exports = router;