/**
 * Batch Experiments API Routes
 * 
 * This module handles all batch experiment-related API endpoints including:
 * - Creating and managing batch experiments
 * - Monitoring progress and status
 * - Retrieving comprehensive results and analysis
 * - Queue management and priority handling
 * 
 * Batch experiments allow testing multiple parameter combinations simultaneously
 * to find optimal settings for specific use cases.
 */

const express = require('express');
const router = express.Router();
const {
  mockBatchExperiments,
  getPaginatedBatchExperiments,
  findBatchExperimentById,
  addBatchExperiment,
  getBatchExperimentResults
} = require('../data/mockBatchExperiments');

/**
 * POST /api/batch-experiments
 * Create a new batch experiment with parameter grid
 */
router.post('/', (req, res) => {
  try {
    const {
      name,
      description,
      prompt,
      model = 'gpt-4',
      parameter_grid,
      responses_per_combination = 1,
      priority = 'normal'
    } = req.body;

    // Validate required fields
    if (!name || !prompt || !parameter_grid) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Validation failed',
          statusCode: 400,
          code: 'VALIDATION_ERROR',
          details: {
            name: !name ? 'Name is required' : null,
            prompt: !prompt ? 'Prompt is required' : null,
            parameter_grid: !parameter_grid ? 'Parameter grid is required' : null
          }
        }
      });
    }

    // Validate parameter grid structure
    if (!parameter_grid.temperature && !parameter_grid.top_p) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Validation failed',
          statusCode: 400,
          code: 'VALIDATION_ERROR',
          details: 'At least one parameter range (temperature or top_p) must be specified'
        }
      });
    }

    // Validate temperature range if provided
    if (parameter_grid.temperature) {
      const temp = parameter_grid.temperature;
      if (temp.min < 0 || temp.max > 2 || temp.min >= temp.max) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Validation failed',
            statusCode: 400,
            code: 'VALIDATION_ERROR',
            details: 'Temperature range must be between 0-2 with min < max'
          }
        });
      }
    }

    // Validate priority
    const validPriorities = ['low', 'normal', 'high'];
    if (!validPriorities.includes(priority)) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Validation failed',
          statusCode: 400,
          code: 'VALIDATION_ERROR',
          details: `Priority must be one of: ${validPriorities.join(', ')}`
        }
      });
    }

    const batchExperimentData = {
      name,
      description,
      prompt,
      model,
      parameter_grid,
      responses_per_combination,
      priority
    };

    const newBatchExperiment = addBatchExperiment(batchExperimentData);

    res.status(201).json({
      success: true,
      data: {
        batch_experiment: {
          id: newBatchExperiment.id,
          name: newBatchExperiment.name,
          status: newBatchExperiment.status,
          total_combinations: newBatchExperiment.total_combinations,
          total_responses: newBatchExperiment.total_responses,
          estimated_cost: newBatchExperiment.estimated_cost,
          estimated_duration: newBatchExperiment.estimated_duration,
          created_at: newBatchExperiment.created_at,
          queue_position: newBatchExperiment.queue_position
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
        message: 'Failed to create batch experiment',
        statusCode: 500,
        code: 'INTERNAL_SERVER_ERROR',
        details: error.message
      }
    });
  }
});

/**
 * GET /api/batch-experiments
 * List all batch experiments with filtering and pagination
 */
router.get('/', (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      priority,
      model
    } = req.query;

    const filters = { status, priority, model };
    const result = getPaginatedBatchExperiments(
      parseInt(page),
      parseInt(limit),
      filters
    );

    // Format response for list view
    const formattedExperiments = result.batch_experiments.map(exp => ({
      id: exp.id,
      name: exp.name,
      status: exp.status,
      progress: exp.progress.percentage,
      total_combinations: exp.total_combinations,
      best_quality: exp.results_preview.best_quality,
      created_at: exp.created_at,
      completed_at: exp.completed_at
    }));

    res.json({
      success: true,
      data: {
        batch_experiments: formattedExperiments
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
        message: 'Failed to retrieve batch experiments',
        statusCode: 500,
        code: 'INTERNAL_SERVER_ERROR',
        details: error.message
      }
    });
  }
});

/**
 * GET /api/batch-experiments/:id
 * Get detailed status and progress of a specific batch experiment
 */
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const batchExperiment = findBatchExperimentById(id);

    if (!batchExperiment) {
      return res.status(404).json({
        success: false,
        error: {
          message: `Batch experiment with ID ${id} not found`,
          statusCode: 404,
          code: 'BATCH_EXPERIMENT_NOT_FOUND'
        }
      });
    }

    // Calculate estimated completion time for running experiments
    let estimatedCompletion = null;
    if (batchExperiment.status === 'running' && batchExperiment.progress.eta_minutes > 0) {
      const now = new Date();
      estimatedCompletion = new Date(now.getTime() + batchExperiment.progress.eta_minutes * 60000).toISOString();
    }

    res.json({
      success: true,
      data: {
        batch_experiment: {
          id: batchExperiment.id,
          name: batchExperiment.name,
          description: batchExperiment.description,
          status: batchExperiment.status,
          progress: batchExperiment.progress,
          results_preview: batchExperiment.results_preview,
          insights: batchExperiment.insights,
          estimated_completion: estimatedCompletion,
          total_combinations: batchExperiment.total_combinations,
          total_responses: batchExperiment.total_responses,
          estimated_cost: batchExperiment.estimated_cost,
          actual_cost: batchExperiment.actual_cost,
          queue_position: batchExperiment.queue_position,
          created_at: batchExperiment.created_at,
          error_message: batchExperiment.error_message || null
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
        message: 'Failed to retrieve batch experiment',
        statusCode: 500,
        code: 'INTERNAL_SERVER_ERROR',
        details: error.message
      }
    });
  }
});

/**
 * GET /api/batch-experiments/:id/results
 * Get comprehensive results and analysis for a completed batch experiment
 */
router.get('/:id/results', (req, res) => {
  try {
    const { id } = req.params;
    const {
      page = 1,
      limit = 20,
      sort_by = 'quality',
      min_quality,
      max_quality
    } = req.query;

    const batchExperiment = findBatchExperimentById(id);
    if (!batchExperiment) {
      return res.status(404).json({
        success: false,
        error: {
          message: `Batch experiment with ID ${id} not found`,
          statusCode: 404,
          code: 'BATCH_EXPERIMENT_NOT_FOUND'
        }
      });
    }

    // Check if experiment is completed
    if (batchExperiment.status !== 'completed') {
      return res.status(409).json({
        success: false,
        error: {
          message: 'Batch experiment is not completed yet',
          statusCode: 409,
          code: 'EXPERIMENT_NOT_COMPLETED',
          details: `Current status: ${batchExperiment.status}`
        }
      });
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort_by,
      min_quality: min_quality ? parseFloat(min_quality) : undefined,
      max_quality: max_quality ? parseFloat(max_quality) : undefined
    };

    const results = getBatchExperimentResults(id, options);
    
    if (!results) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Results not found for this batch experiment',
          statusCode: 404,
          code: 'RESULTS_NOT_FOUND'
        }
      });
    }

    res.json({
      success: true,
      data: results,
      meta: {
        pagination: results.pagination,
        timestamp: new Date().toISOString(),
        request_id: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to retrieve batch experiment results',
        statusCode: 500,
        code: 'INTERNAL_SERVER_ERROR',
        details: error.message
      }
    });
  }
});

/**
 * PUT /api/batch-experiments/:id
 * Update batch experiment (mainly for status changes like pause/resume)
 */
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body;

    const batchExperiment = findBatchExperimentById(id);
    if (!batchExperiment) {
      return res.status(404).json({
        success: false,
        error: {
          message: `Batch experiment with ID ${id} not found`,
          statusCode: 404,
          code: 'BATCH_EXPERIMENT_NOT_FOUND'
        }
      });
    }

    const validActions = ['pause', 'resume', 'cancel'];
    if (!validActions.includes(action)) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Invalid action',
          statusCode: 400,
          code: 'INVALID_ACTION',
          details: `Action must be one of: ${validActions.join(', ')}`
        }
      });
    }

    // Validate action based on current status
    const currentStatus = batchExperiment.status;
    let newStatus = currentStatus;

    switch (action) {
      case 'pause':
        if (currentStatus !== 'running') {
          return res.status(409).json({
            success: false,
            error: {
              message: 'Can only pause running experiments',
              statusCode: 409,
              code: 'INVALID_STATUS_TRANSITION'
            }
          });
        }
        newStatus = 'paused';
        break;
      case 'resume':
        if (currentStatus !== 'paused') {
          return res.status(409).json({
            success: false,
            error: {
              message: 'Can only resume paused experiments',
              statusCode: 409,
              code: 'INVALID_STATUS_TRANSITION'
            }
          });
        }
        newStatus = 'running';
        break;
      case 'cancel':
        if (!['queued', 'running', 'paused'].includes(currentStatus)) {
          return res.status(409).json({
            success: false,
            error: {
              message: 'Cannot cancel completed or failed experiments',
              statusCode: 409,
              code: 'INVALID_STATUS_TRANSITION'
            }
          });
        }
        newStatus = 'cancelled';
        break;
    }

    // Update the experiment status (in a real implementation, this would update the database)
    batchExperiment.status = newStatus;
    batchExperiment.updated_at = new Date().toISOString();

    res.json({
      success: true,
      data: {
        batch_experiment: {
          id: batchExperiment.id,
          name: batchExperiment.name,
          status: batchExperiment.status,
          updated_at: batchExperiment.updated_at
        },
        action_performed: action
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
        message: 'Failed to update batch experiment',
        statusCode: 500,
        code: 'INTERNAL_SERVER_ERROR',
        details: error.message
      }
    });
  }
});

/**
 * DELETE /api/batch-experiments/:id
 * Delete a batch experiment
 */
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const batchExperiment = findBatchExperimentById(id);

    if (!batchExperiment) {
      return res.status(404).json({
        success: false,
        error: {
          message: `Batch experiment with ID ${id} not found`,
          statusCode: 404,
          code: 'BATCH_EXPERIMENT_NOT_FOUND'
        }
      });
    }

    // Check if experiment can be deleted
    if (batchExperiment.status === 'running') {
      return res.status(409).json({
        success: false,
        error: {
          message: 'Cannot delete running batch experiment. Please cancel it first.',
          statusCode: 409,
          code: 'EXPERIMENT_RUNNING'
        }
      });
    }

    // Remove from mock data (in a real implementation, this would delete from database)
    const index = mockBatchExperiments.findIndex(exp => exp.id === parseInt(id));
    if (index !== -1) {
      mockBatchExperiments.splice(index, 1);
    }

    res.json({
      success: true,
      data: {
        message: 'Batch experiment deleted successfully',
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
        message: 'Failed to delete batch experiment',
        statusCode: 500,
        code: 'INTERNAL_SERVER_ERROR',
        details: error.message
      }
    });
  }
});

/**
 * GET /api/batch-experiments/:id/progress
 * Get real-time progress updates for a running batch experiment
 * This endpoint supports polling for progress updates
 */
router.get('/:id/progress', (req, res) => {
  try {
    const { id } = req.params;
    const batchExperiment = findBatchExperimentById(id);

    if (!batchExperiment) {
      return res.status(404).json({
        success: false,
        error: {
          message: `Batch experiment with ID ${id} not found`,
          statusCode: 404,
          code: 'BATCH_EXPERIMENT_NOT_FOUND'
        }
      });
    }

    // Simulate progress updates for running experiments
    let updatedProgress = { ...batchExperiment.progress };
    
    if (batchExperiment.status === 'running') {
      // Simulate some progress (in real implementation, this would come from the actual processing)
      const currentTime = Date.now();
      const mockProgressIncrement = Math.floor(Math.random() * 5); // Random progress increment
      
      if (updatedProgress.percentage < 100) {
        updatedProgress.percentage = Math.min(100, updatedProgress.percentage + mockProgressIncrement);
        updatedProgress.completed_combinations = Math.floor(
          (updatedProgress.percentage / 100) * updatedProgress.total_combinations
        );
        updatedProgress.completed_responses = Math.floor(
          (updatedProgress.percentage / 100) * updatedProgress.total_responses
        );
        updatedProgress.eta_minutes = Math.max(0, 
          Math.floor((100 - updatedProgress.percentage) * 0.5)
        );
      }
    }

    res.json({
      success: true,
      data: {
        batch_id: batchExperiment.id,
        status: batchExperiment.status,
        progress: updatedProgress,
        last_updated: new Date().toISOString()
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
        message: 'Failed to get batch experiment progress',
        statusCode: 500,
        code: 'INTERNAL_SERVER_ERROR',
        details: error.message
      }
    });
  }
});

module.exports = router;