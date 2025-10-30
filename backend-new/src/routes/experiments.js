const express = require('express');
const router = express.Router();
const mockExperiments = require('../data/mockExperiments');
const mockResponses = require('../data/mockResponses');

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

// Helper function to filter experiments
const filterExperiments = (experiments, filters) => {
  let filtered = [...experiments];
  
  if (filters.search) {
    const search = filters.search.toLowerCase();
    filtered = filtered.filter(exp => 
      exp.name.toLowerCase().includes(search) ||
      exp.description.toLowerCase().includes(search) ||
      exp.prompt.toLowerCase().includes(search)
    );
  }
  
  if (filters.model) {
    filtered = filtered.filter(exp => exp.model === filters.model);
  }
  
  if (filters.status) {
    filtered = filtered.filter(exp => exp.status === filters.status);
  }
  
  if (filters.date_from) {
    filtered = filtered.filter(exp => new Date(exp.created_at) >= new Date(filters.date_from));
  }
  
  if (filters.date_to) {
    filtered = filtered.filter(exp => new Date(exp.created_at) <= new Date(filters.date_to));
  }
  
  // Sort experiments
  const sortField = filters.sort || 'created_at';
  const sortOrder = filters.order || 'desc';
  
  filtered.sort((a, b) => {
    let aVal = a[sortField];
    let bVal = b[sortField];
    
    if (sortField === 'created_at' || sortField === 'updated_at') {
      aVal = new Date(aVal);
      bVal = new Date(bVal);
    }
    
    if (sortOrder === 'desc') {
      return bVal > aVal ? 1 : -1;
    } else {
      return aVal > bVal ? 1 : -1;
    }
  });
  
  return filtered;
};

// GET /api/experiments - List all experiments
router.get('/', (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      model,
      status,
      date_from,
      date_to,
      sort,
      order
    } = req.query;
    
    const filters = { search, model, status, date_from, date_to, sort, order };
    const filteredExperiments = filterExperiments(mockExperiments, filters);
    const result = paginate(filteredExperiments, page, limit);
    
    res.json({
      success: true,
      data: {
        experiments: result.items,
        pagination: result.pagination
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch experiments',
        details: error.message
      }
    });
  }
});

// GET /api/experiments/:id - Get experiment by ID
router.get('/:id', (req, res) => {
  try {
    const experimentId = parseInt(req.params.id);
    const experiment = mockExperiments.find(exp => exp.id === experimentId);
    
    if (!experiment) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Experiment not found',
          details: `No experiment found with ID ${experimentId}`
        }
      });
    }
    
    // Get responses for this experiment
    const responses = mockResponses.filter(resp => resp.experiment_id === experimentId);
    
    res.json({
      success: true,
      data: {
        experiment: {
          ...experiment,
          responses: responses
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch experiment',
        details: error.message
      }
    });
  }
});

// POST /api/experiments - Create new experiment
router.post('/', (req, res) => {
  try {
    const {
      name,
      description,
      prompt,
      model,
      parameters,
      tags = [],
      response_count = 1,
      user_id = 1
    } = req.body;
    
    // Validation
    if (!name || !prompt || !model || !parameters) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Missing required fields',
          details: 'Name, prompt, model, and parameters are required'
        }
      });
    }
    
    // Create new experiment
    const newExperiment = {
      id: Math.max(...mockExperiments.map(e => e.id)) + 1,
      name,
      description: description || '',
      prompt,
      model,
      parameters,
      status: 'pending',
      response_count: 0,
      average_quality: 0,
      best_quality: 0,
      worst_quality: 0,
      total_cost: 0,
      total_tokens: 0,
      average_response_time: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      tags,
      user_id
    };
    
    // Add to mock data (in real app, this would be saved to database)
    mockExperiments.push(newExperiment);
    
    res.status(201).json({
      success: true,
      data: {
        experiment: newExperiment
      },
      message: 'Experiment created successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to create experiment',
        details: error.message
      }
    });
  }
});

// PUT /api/experiments/:id - Update experiment
router.put('/:id', (req, res) => {
  try {
    const experimentId = parseInt(req.params.id);
    const experimentIndex = mockExperiments.findIndex(exp => exp.id === experimentId);
    
    if (experimentIndex === -1) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Experiment not found',
          details: `No experiment found with ID ${experimentId}`
        }
      });
    }
    
    // Update experiment
    const updatedFields = req.body;
    mockExperiments[experimentIndex] = {
      ...mockExperiments[experimentIndex],
      ...updatedFields,
      updated_at: new Date().toISOString()
    };
    
    res.json({
      success: true,
      data: {
        experiment: mockExperiments[experimentIndex]
      },
      message: 'Experiment updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to update experiment',
        details: error.message
      }
    });
  }
});

// DELETE /api/experiments/:id - Delete experiment
router.delete('/:id', (req, res) => {
  try {
    const experimentId = parseInt(req.params.id);
    const experimentIndex = mockExperiments.findIndex(exp => exp.id === experimentId);
    
    if (experimentIndex === -1) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Experiment not found',
          details: `No experiment found with ID ${experimentId}`
        }
      });
    }
    
    // Count associated responses
    const associatedResponses = mockResponses.filter(resp => resp.experiment_id === experimentId);
    
    // Remove experiment (in real app, would cascade delete from database)
    mockExperiments.splice(experimentIndex, 1);
    
    res.json({
      success: true,
      message: 'Experiment deleted successfully',
      data: {
        deleted_experiment_id: experimentId,
        deleted_responses_count: associatedResponses.length,
        deleted_metrics_count: associatedResponses.length * 6 // Assuming 6 metrics per response
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to delete experiment',
        details: error.message
      }
    });
  }
});

// GET /api/experiments/:id/stats - Get experiment statistics
router.get('/:id/stats', (req, res) => {
  try {
    const experimentId = parseInt(req.params.id);
    const experiment = mockExperiments.find(exp => exp.id === experimentId);
    
    if (!experiment) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Experiment not found'
        }
      });
    }
    
    const responses = mockResponses.filter(resp => resp.experiment_id === experimentId);
    
    if (responses.length === 0) {
      return res.json({
        success: true,
        data: {
          experiment_id: experimentId,
          overview: {
            total_responses: 0,
            average_quality: 0,
            best_quality: 0,
            worst_quality: 0,
            quality_trend: 0,
            total_cost: 0,
            total_tokens: 0,
            average_response_time: 0
          },
          quality_breakdown: {},
          parameter_performance: {},
          time_series: []
        }
      });
    }
    
    // Calculate statistics
    const qualities = responses.map(r => r.quality_metrics.overall_quality);
    const avgQuality = qualities.reduce((sum, q) => sum + q, 0) / qualities.length;
    const bestQuality = Math.max(...qualities);
    const worstQuality = Math.min(...qualities);
    
    const totalCost = responses.reduce((sum, r) => sum + r.cost, 0);
    const totalTokens = responses.reduce((sum, r) => sum + r.token_count, 0);
    const avgResponseTime = responses.reduce((sum, r) => sum + r.response_time, 0) / responses.length;
    
    // Quality breakdown
    const coherenceScores = responses.map(r => r.quality_metrics.coherence_score);
    const creativityScores = responses.map(r => r.quality_metrics.creativity_score);
    const readabilityScores = responses.map(r => r.quality_metrics.readability_score);
    const completenessScores = responses.map(r => r.quality_metrics.completeness_score);
    
    const qualityBreakdown = {
      coherence_score: coherenceScores.reduce((sum, s) => sum + s, 0) / coherenceScores.length,
      creativity_score: creativityScores.reduce((sum, s) => sum + s, 0) / creativityScores.length,
      readability_score: readabilityScores.reduce((sum, s) => sum + s, 0) / readabilityScores.length,
      completeness_score: completenessScores.reduce((sum, s) => sum + s, 0) / completenessScores.length
    };
    
    // Time series data
    const timeSeries = responses.map((response, index) => ({
      response_order: index + 1,
      quality: response.quality_metrics.overall_quality,
      timestamp: response.created_at
    }));
    
    res.json({
      success: true,
      data: {
        experiment_id: experimentId,
        overview: {
          total_responses: responses.length,
          average_quality: Math.round(avgQuality * 10) / 10,
          best_quality: bestQuality,
          worst_quality: worstQuality,
          quality_trend: responses.length > 1 ? 
            Math.round((qualities[qualities.length - 1] - qualities[0]) * 10) / 10 : 0,
          total_cost: Math.round(totalCost * 1000) / 1000,
          total_tokens: totalTokens,
          average_response_time: Math.round(avgResponseTime * 10) / 10
        },
        quality_breakdown: qualityBreakdown,
        parameter_performance: {
          temperature_impact: 0.75,
          top_p_impact: 0.45,
          optimal_settings: experiment.parameters
        },
        time_series: timeSeries
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to get experiment statistics',
        details: error.message
      }
    });
  }
});

module.exports = router;
