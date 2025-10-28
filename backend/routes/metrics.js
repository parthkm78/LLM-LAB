const express = require('express');
const router = express.Router();
const QualityMetricModel = require('../models/QualityMetric');
const ResponseModel = require('../models/Response');
const ExperimentModel = require('../models/Experiment');
const qualityMetricsService = require('../services/qualityMetricsService');

// GET /api/metrics/:responseId - Get quality metrics for a response
router.get('/:responseId', async (req, res) => {
  try {
    const { responseId } = req.params;
    
    if (!responseId || isNaN(responseId)) {
      return res.status(400).json({ error: 'Invalid response ID' });
    }
    
    const metrics = await QualityMetricModel.findByResponse(parseInt(responseId));
    
    if (!metrics) {
      return res.status(404).json({ error: 'Metrics not found for this response' });
    }
    
    res.json({
      response_id: parseInt(responseId),
      metrics
    });
  } catch (error) {
    console.error('Error fetching metrics:', error);
    res.status(500).json({ error: 'Failed to fetch quality metrics' });
  }
});

// POST /api/metrics/calculate - Calculate and store metrics for a response
router.post('/calculate', async (req, res) => {
  try {
    const { response_id, recalculate = false } = req.body;
    
    if (!response_id) {
      return res.status(400).json({ error: 'Response ID is required' });
    }
    
    // Check if metrics already exist
    const existingMetrics = await QualityMetricModel.findByResponse(response_id);
    
    if (existingMetrics && !recalculate) {
      return res.json({
        response_id,
        metrics: existingMetrics,
        message: 'Metrics already exist. Use recalculate=true to recalculate.'
      });
    }
    
    // Get the response content
    const response = await ResponseModel.findById(response_id);
    if (!response) {
      return res.status(404).json({ error: 'Response not found' });
    }
    
    // Get the original prompt
    const experiment = await ExperimentModel.findById(response.experiment_id);
    if (!experiment) {
      return res.status(404).json({ error: 'Associated experiment not found' });
    }
    
    // Calculate metrics
    const metrics = qualityMetricsService.calculateMetrics(response.content, experiment.prompt);
    
    if (existingMetrics) {
      // Update existing metrics
      await QualityMetricModel.update(response_id, metrics);
    } else {
      // Create new metrics
      await QualityMetricModel.create({
        response_id,
        ...metrics
      });
    }
    
    res.json({
      response_id,
      metrics,
      recalculated: !!existingMetrics
    });
    
  } catch (error) {
    console.error('Error calculating metrics:', error);
    res.status(500).json({ error: 'Failed to calculate quality metrics' });
  }
});

// POST /api/metrics/batch - Calculate metrics for multiple responses
router.post('/batch', async (req, res) => {
  try {
    const { response_ids, recalculate = false } = req.body;
    
    if (!response_ids || !Array.isArray(response_ids)) {
      return res.status(400).json({ error: 'response_ids array is required' });
    }
    
    const results = [];
    let processed = 0;
    let errors = 0;
    
    for (const responseId of response_ids) {
      try {
        // Check if metrics already exist
        const existingMetrics = await QualityMetricModel.findByResponse(responseId);
        
        if (existingMetrics && !recalculate) {
          results.push({
            response_id: responseId,
            metrics: existingMetrics,
            action: 'skipped',
            success: true
          });
          processed++;
          continue;
        }
        
        // Get response and experiment
        const response = await ResponseModel.findById(responseId);
        if (!response) {
          results.push({
            response_id: responseId,
            error: 'Response not found',
            success: false
          });
          errors++;
          continue;
        }
        
        const experiment = await ExperimentModel.findById(response.experiment_id);
        if (!experiment) {
          results.push({
            response_id: responseId,
            error: 'Associated experiment not found',
            success: false
          });
          errors++;
          continue;
        }
        
        // Calculate metrics
        const metrics = qualityMetricsService.calculateMetrics(response.content, experiment.prompt);
        
        if (existingMetrics) {
          await QualityMetricModel.update(responseId, metrics);
        } else {
          await QualityMetricModel.create({
            response_id: responseId,
            ...metrics
          });
        }
        
        results.push({
          response_id: responseId,
          metrics,
          action: existingMetrics ? 'updated' : 'created',
          success: true
        });
        processed++;
        
      } catch (error) {
        console.error(`Error processing response ${responseId}:`, error);
        results.push({
          response_id: responseId,
          error: error.message,
          success: false
        });
        errors++;
      }
    }
    
    res.json({
      results,
      summary: {
        total_requested: response_ids.length,
        processed,
        errors,
        success_rate: processed / response_ids.length
      }
    });
    
  } catch (error) {
    console.error('Error in batch metrics calculation:', error);
    res.status(500).json({ error: 'Failed to calculate batch metrics' });
  }
});

// GET /api/metrics/experiment/:experimentId - Get all metrics for an experiment
router.get('/experiment/:experimentId', async (req, res) => {
  try {
    const { experimentId } = req.params;
    
    if (!experimentId || isNaN(experimentId)) {
      return res.status(400).json({ error: 'Invalid experiment ID' });
    }
    
    const metrics = await QualityMetricModel.findByExperiment(parseInt(experimentId));
    
    res.json({
      experiment_id: parseInt(experimentId),
      metrics,
      total: metrics.length
    });
  } catch (error) {
    console.error('Error fetching experiment metrics:', error);
    res.status(500).json({ error: 'Failed to fetch experiment metrics' });
  }
});

// GET /api/metrics/experiment/:experimentId/averages - Get average metrics by parameters
router.get('/experiment/:experimentId/averages', async (req, res) => {
  try {
    const { experimentId } = req.params;
    
    if (!experimentId || isNaN(experimentId)) {
      return res.status(400).json({ error: 'Invalid experiment ID' });
    }
    
    const averages = await QualityMetricModel.getAveragesByParameters(parseInt(experimentId));
    
    res.json({
      experiment_id: parseInt(experimentId),
      parameter_averages: averages,
      total_combinations: averages.length
    });
  } catch (error) {
    console.error('Error fetching metric averages:', error);
    res.status(500).json({ error: 'Failed to fetch metric averages' });
  }
});

// POST /api/metrics/compare - Compare metrics across multiple responses
router.post('/compare', async (req, res) => {
  try {
    const { response_ids } = req.body;
    
    if (!response_ids || !Array.isArray(response_ids) || response_ids.length < 2) {
      return res.status(400).json({ 
        error: 'At least 2 response IDs are required for comparison' 
      });
    }
    
    const comparisons = [];
    
    for (const responseId of response_ids) {
      const response = await ResponseModel.findById(responseId);
      const metrics = await QualityMetricModel.findByResponse(responseId);
      
      if (response && metrics) {
        comparisons.push({
          response_id: responseId,
          parameters: {
            temperature: response.temperature,
            top_p: response.top_p
          },
          metrics: {
            coherence_score: metrics.coherence_score,
            completeness_score: metrics.completeness_score,
            readability_score: metrics.readability_score,
            length_appropriateness_score: metrics.length_appropriateness_score,
            overall_score: metrics.overall_score
          },
          content_preview: response.content.substring(0, 200) + '...'
        });
      }
    }
    
    // Calculate comparison statistics
    const metricKeys = ['coherence_score', 'completeness_score', 'readability_score', 'length_appropriateness_score', 'overall_score'];
    const statistics = {};
    
    metricKeys.forEach(metric => {
      const values = comparisons.map(c => c.metrics[metric]).filter(v => v !== null);
      if (values.length > 0) {
        statistics[metric] = {
          min: Math.min(...values),
          max: Math.max(...values),
          avg: values.reduce((a, b) => a + b, 0) / values.length,
          range: Math.max(...values) - Math.min(...values)
        };
      }
    });
    
    res.json({
      comparisons,
      statistics,
      total_compared: comparisons.length
    });
    
  } catch (error) {
    console.error('Error comparing metrics:', error);
    res.status(500).json({ error: 'Failed to compare metrics' });
  }
});

module.exports = router;
