const express = require('express');
const router = express.Router();
const { mockBatchExperiments, mockBatchResults, generateBatchResults } = require('../data/mockBatchExperiments');

// Helper function to paginate results
const paginate = (array, page = 1, limit = 10) => {
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const items = array.slice(startIndex, endIndex);
  
  return {
    items,
    pagination: {
      current_page: parseInt(page),
      total_pages: Math.ceil(array.length / limit),
      total_items: array.length,
      per_page: parseInt(limit),
      has_next: endIndex < array.length,
      has_prev: startIndex > 0
    }
  };
};

// POST /api/batch-experiments - Create batch experiment
router.post('/', (req, res) => {
  try {
    const {
      name,
      description,
      prompt,
      model = 'gpt-4',
      parameter_ranges,
      iterations_per_combination = 3,
      priority = 'normal',
      user_id = 1
    } = req.body;
    
    // Validation
    if (!name || !prompt || !parameter_ranges) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Missing required fields',
          details: 'Name, prompt, and parameter_ranges are required'
        }
      });
    }
    
    // Calculate total combinations
    let totalCombinations = 1;
    const combinations = [];
    
    // Generate parameter combinations
    const generateCombinations = (ranges) => {
      const keys = Object.keys(ranges);
      const combinations = [{}];
      
      for (const key of keys) {
        const range = ranges[key];
        const newCombinations = [];
        
        let values = [];
        if (range.values) {
          values = range.values;
        } else if (range.min !== undefined && range.max !== undefined && range.step) {
          for (let val = range.min; val <= range.max; val += range.step) {
            values.push(Math.round(val * 100) / 100); // Round to 2 decimal places
          }
        }
        
        for (const combination of combinations) {
          for (const value of values) {
            newCombinations.push({
              ...combination,
              [key]: value
            });
          }
        }
        
        combinations.splice(0, combinations.length, ...newCombinations);
      }
      
      return combinations;
    };
    
    const parameterCombinations = generateCombinations(parameter_ranges);
    totalCombinations = parameterCombinations.length;
    
    // Estimate cost and duration
    const estimatedCostPerResponse = model === 'gpt-4' ? 0.01 : model === 'claude-3.5-sonnet' ? 0.008 : 0.003;
    const estimatedCost = totalCombinations * iterations_per_combination * estimatedCostPerResponse;
    const estimatedDuration = Math.ceil(totalCombinations * iterations_per_combination * 1.5); // 1.5 seconds per response
    
    // Create new batch experiment
    const newBatchExperiment = {
      id: Math.max(...mockBatchExperiments.map(e => e.id)) + 1,
      name,
      description: description || '',
      prompt,
      model,
      parameter_ranges,
      status: 'queued',
      progress: 0,
      total_combinations: totalCombinations,
      completed_combinations: 0,
      failed_combinations: 0,
      priority,
      user_id,
      results_summary: null,
      insights: [],
      start_time: null,
      end_time: null,
      estimated_completion: new Date(Date.now() + estimatedDuration * 1000).toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // Add to mock data
    mockBatchExperiments.push(newBatchExperiment);
    mockBatchResults[newBatchExperiment.id] = [];
    
    res.status(201).json({
      success: true,
      data: {
        batch_experiment: {
          ...newBatchExperiment,
          estimated_cost: Math.round(estimatedCost * 100) / 100,
          estimated_duration: `${Math.ceil(estimatedDuration / 60)} minutes`,
          parameter_combinations: parameterCombinations.slice(0, 5) // Show first 5 combinations as preview
        }
      },
      message: 'Batch experiment queued for processing'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to create batch experiment',
        details: error.message
      }
    });
  }
});

// GET /api/batch-experiments - List all batch experiments
router.get('/', (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      model,
      user_id,
      sort = 'created_at',
      order = 'desc'
    } = req.query;
    
    let filtered = [...mockBatchExperiments];
    
    // Apply filters
    if (status) {
      filtered = filtered.filter(exp => exp.status === status);
    }
    
    if (model) {
      filtered = filtered.filter(exp => exp.model === model);
    }
    
    if (user_id) {
      filtered = filtered.filter(exp => exp.user_id === parseInt(user_id));
    }
    
    // Sort
    filtered.sort((a, b) => {
      let aVal = a[sort];
      let bVal = b[sort];
      
      if (sort === 'created_at' || sort === 'updated_at') {
        aVal = new Date(aVal);
        bVal = new Date(bVal);
      }
      
      if (order === 'desc') {
        return bVal > aVal ? 1 : -1;
      } else {
        return aVal > bVal ? 1 : -1;
      }
    });
    
    const result = paginate(filtered, page, limit);
    
    res.json({
      success: true,
      data: {
        batch_experiments: result.items,
        pagination: result.pagination
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch batch experiments',
        details: error.message
      }
    });
  }
});

// GET /api/batch-experiments/:id - Get batch experiment details
router.get('/:id', (req, res) => {
  try {
    const batchId = parseInt(req.params.id);
    const batchExperiment = mockBatchExperiments.find(exp => exp.id === batchId);
    
    if (!batchExperiment) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Batch experiment not found',
          details: `No batch experiment found with ID ${batchId}`
        }
      });
    }
    
    // Simulate progress for running experiments
    let updatedExperiment = { ...batchExperiment };
    
    if (batchExperiment.status === 'running') {
      // Simulate progress increase
      const elapsed = Date.now() - new Date(batchExperiment.start_time || batchExperiment.created_at).getTime();
      const estimatedTotal = batchExperiment.total_combinations * 2000; // 2 seconds per combination
      const newProgress = Math.min(100, Math.floor((elapsed / estimatedTotal) * 100));
      
      updatedExperiment.progress = newProgress;
      updatedExperiment.completed_combinations = Math.floor((newProgress / 100) * batchExperiment.total_combinations);
      
      // Update current combination
      if (newProgress < 100) {
        updatedExperiment.current_combination = {
          temperature: 0.1 + (newProgress / 100) * 0.9,
          top_p: 0.7 + (newProgress / 100) * 0.3,
          max_tokens: 500 + Math.floor((newProgress / 100) * 1500)
        };
      }
      
      // Generate results summary if progress > 20%
      if (newProgress > 20 && !updatedExperiment.results_summary) {
        updatedExperiment.results_summary = {
          best_quality: 85 + Math.random() * 15,
          average_quality: 75 + Math.random() * 10,
          optimal_parameters: {
            temperature: 0.8,
            top_p: 0.9,
            max_tokens: 1500
          }
        };
        
        updatedExperiment.insights = [
          "Initial results show promising quality scores",
          "Higher temperature values trending toward better creativity",
          "Optimal parameter range emerging"
        ];
      }
      
      // Update the mock data
      const experimentIndex = mockBatchExperiments.findIndex(exp => exp.id === batchId);
      if (experimentIndex !== -1) {
        mockBatchExperiments[experimentIndex] = updatedExperiment;
      }
    }
    
    res.json({
      success: true,
      data: {
        batch_experiment: updatedExperiment
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch batch experiment',
        details: error.message
      }
    });
  }
});

// POST /api/batch-experiments/:id/control - Control batch experiment execution
router.post('/:id/control', (req, res) => {
  try {
    const batchId = parseInt(req.params.id);
    const { action } = req.body;
    
    if (!['pause', 'resume', 'stop'].includes(action)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid action',
          details: 'Action must be one of: pause, resume, stop'
        }
      });
    }
    
    const experimentIndex = mockBatchExperiments.findIndex(exp => exp.id === batchId);
    
    if (experimentIndex === -1) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Batch experiment not found'
        }
      });
    }
    
    const experiment = mockBatchExperiments[experimentIndex];
    
    // Validate state transitions
    if (action === 'pause' && experiment.status !== 'running') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_STATE',
          message: 'Cannot pause experiment that is not running'
        }
      });
    }
    
    if (action === 'resume' && experiment.status !== 'paused') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_STATE',
          message: 'Cannot resume experiment that is not paused'
        }
      });
    }
    
    // Update status
    let newStatus;
    switch (action) {
      case 'pause':
        newStatus = 'paused';
        break;
      case 'resume':
        newStatus = 'running';
        break;
      case 'stop':
        newStatus = 'failed'; // Stopped experiments are marked as failed
        experiment.end_time = new Date().toISOString();
        break;
    }
    
    mockBatchExperiments[experimentIndex].status = newStatus;
    mockBatchExperiments[experimentIndex].updated_at = new Date().toISOString();
    
    res.json({
      success: true,
      data: {
        batch_experiment_id: batchId,
        action: action,
        new_status: newStatus
      },
      message: `Batch experiment ${action}d successfully`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: `Failed to ${req.body.action} batch experiment`,
        details: error.message
      }
    });
  }
});

// GET /api/batch-experiments/:id/results - Get detailed results from batch experiment
router.get('/:id/results', (req, res) => {
  try {
    const batchId = parseInt(req.params.id);
    const {
      page = 1,
      limit = 20,
      sort_by = 'average_quality',
      order = 'desc',
      min_quality,
      max_quality
    } = req.query;
    
    const batchExperiment = mockBatchExperiments.find(exp => exp.id === batchId);
    
    if (!batchExperiment) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Batch experiment not found'
        }
      });
    }
    
    // Get or generate results
    let results = mockBatchResults[batchId] || [];
    
    // Generate results if they don't exist and experiment is completed
    if (results.length === 0 && batchExperiment.status === 'completed') {
      results = generateBatchResults(batchId, batchExperiment.total_combinations);
      mockBatchResults[batchId] = results;
    }
    
    // Apply quality filters
    if (min_quality) {
      results = results.filter(r => r.average_quality >= parseFloat(min_quality));
    }
    
    if (max_quality) {
      results = results.filter(r => r.average_quality <= parseFloat(max_quality));
    }
    
    // Sort results
    results.sort((a, b) => {
      let aVal = a[sort_by] || a.average_quality;
      let bVal = b[sort_by] || b.average_quality;
      
      if (order === 'desc') {
        return bVal - aVal;
      } else {
        return aVal - bVal;
      }
    });
    
    const paginatedResults = paginate(results, page, limit);
    
    // Calculate parameter correlations
    const parameterCorrelations = {};
    if (results.length > 0) {
      const parameters = ['temperature', 'top_p', 'max_tokens'];
      
      parameters.forEach(param => {
        const paramValues = results.map(r => r.parameters[param]);
        const qualityValues = results.map(r => r.average_quality);
        
        // Simple correlation calculation
        const n = paramValues.length;
        const sumX = paramValues.reduce((sum, val) => sum + val, 0);
        const sumY = qualityValues.reduce((sum, val) => sum + val, 0);
        const sumXY = paramValues.reduce((sum, val, i) => sum + val * qualityValues[i], 0);
        const sumXX = paramValues.reduce((sum, val) => sum + val * val, 0);
        const sumYY = qualityValues.reduce((sum, val) => sum + val * val, 0);
        
        const correlation = (n * sumXY - sumX * sumY) / 
          Math.sqrt((n * sumXX - sumX * sumX) * (n * sumYY - sumY * sumY));
        
        parameterCorrelations[`${param}_quality`] = isNaN(correlation) ? 0 : Math.round(correlation * 100) / 100;
      });
    }
    
    // Find optimal ranges
    const optimalRanges = {};
    if (results.length > 0) {
      const topResults = results.slice(0, Math.ceil(results.length * 0.1)); // Top 10%
      
      ['temperature', 'top_p', 'max_tokens'].forEach(param => {
        const topValues = topResults.map(r => r.parameters[param]);
        optimalRanges[param] = [
          Math.min(...topValues),
          Math.max(...topValues)
        ];
      });
    }
    
    res.json({
      success: true,
      data: {
        batch_id: batchId,
        results: paginatedResults.items,
        pagination: paginatedResults.pagination,
        analysis: {
          parameter_correlations: parameterCorrelations,
          optimal_ranges: optimalRanges,
          summary: {
            total_combinations: results.length,
            best_quality: results.length > 0 ? Math.max(...results.map(r => r.average_quality)) : 0,
            average_quality: results.length > 0 ? 
              results.reduce((sum, r) => sum + r.average_quality, 0) / results.length : 0,
            quality_variance: results.length > 0 ? 
              Math.max(...results.map(r => r.average_quality)) - Math.min(...results.map(r => r.average_quality)) : 0
          }
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch batch experiment results',
        details: error.message
      }
    });
  }
});

// PUT /api/batch-experiments/:id - Update batch experiment
router.put('/:id', (req, res) => {
  try {
    const batchId = parseInt(req.params.id);
    const experimentIndex = mockBatchExperiments.findIndex(exp => exp.id === batchId);
    
    if (experimentIndex === -1) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Batch experiment not found'
        }
      });
    }
    
    // Update experiment
    const updatedFields = req.body;
    mockBatchExperiments[experimentIndex] = {
      ...mockBatchExperiments[experimentIndex],
      ...updatedFields,
      updated_at: new Date().toISOString()
    };
    
    res.json({
      success: true,
      data: {
        batch_experiment: mockBatchExperiments[experimentIndex]
      },
      message: 'Batch experiment updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to update batch experiment',
        details: error.message
      }
    });
  }
});

// DELETE /api/batch-experiments/:id - Delete batch experiment
router.delete('/:id', (req, res) => {
  try {
    const batchId = parseInt(req.params.id);
    const experimentIndex = mockBatchExperiments.findIndex(exp => exp.id === batchId);
    
    if (experimentIndex === -1) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Batch experiment not found'
        }
      });
    }
    
    // Remove experiment and results
    mockBatchExperiments.splice(experimentIndex, 1);
    delete mockBatchResults[batchId];
    
    res.json({
      success: true,
      message: 'Batch experiment deleted successfully',
      data: {
        deleted_batch_experiment_id: batchId
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to delete batch experiment',
        details: error.message
      }
    });
  }
});

module.exports = router;
