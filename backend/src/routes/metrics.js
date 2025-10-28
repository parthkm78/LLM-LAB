/**
 * @fileoverview Bridge Routes for Metrics API
 * @description Routes that bridge the existing frontend metrics API calls to the new architecture
 */

const express = require('express');
const { asyncHandler } = require('../middleware/errorHandler');
const qualityMetricsService = require('../services/qualityMetricsService');
const ResponseModel = require('../models/Response');
const logger = require('../utils/logger');

const router = express.Router();

/**
 * Frontend-compatible metrics routes
 */

// GET /api/metrics/:responseId - Calculate metrics for response
router.get('/:responseId', asyncHandler(async (req, res, next) => {
  logger.info('Frontend API call: GET /metrics/:responseId', { responseId: req.params.responseId });
  
  try {
    const responseId = parseInt(req.params.responseId, 10);
    const response = await ResponseModel.findById(responseId);
    
    if (!response) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Response not found',
          statusCode: 404
        }
      });
    }
    
    const metrics = await qualityMetricsService.calculateMetrics(response.content, response.prompt);
    
    res.json({
      success: true,
      data: {
        response_id: responseId,
        metrics,
        calculated_at: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('Error calculating metrics:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to calculate metrics',
        statusCode: 500
      }
    });
  }
}));

// POST /api/metrics/batch - Calculate metrics for multiple responses
router.post('/batch', asyncHandler(async (req, res, next) => {
  logger.info('Frontend API call: POST /metrics/batch', { body: req.body });
  
  try {
    const { responses } = req.body;
    
    if (!responses || !Array.isArray(responses)) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Responses array is required',
          statusCode: 400
        }
      });
    }
    
    const results = [];
    
    for (const response of responses) {
      if (!response.content || !response.prompt) {
        results.push({
          error: 'Response content and prompt are required'
        });
        continue;
      }
      
      try {
        const metrics = await qualityMetricsService.calculateMetrics(response.content, response.prompt);
        results.push({
          response_id: response.id,
          metrics,
          calculated_at: new Date().toISOString()
        });
      } catch (error) {
        results.push({
          response_id: response.id,
          error: error.message
        });
      }
    }
    
    res.json({
      success: true,
      data: results
    });
  } catch (error) {
    logger.error('Error calculating batch metrics:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to calculate batch metrics',
        statusCode: 500
      }
    });
  }
}));

// POST /api/metrics/compare - Compare metrics between responses
router.post('/compare', asyncHandler(async (req, res, next) => {
  logger.info('Frontend API call: POST /metrics/compare', { body: req.body });
  
  try {
    const { responseIds } = req.body;
    
    if (!responseIds || !Array.isArray(responseIds) || responseIds.length < 2) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'At least 2 response IDs are required for comparison',
          statusCode: 400
        }
      });
    }
    
    const responses = [];
    const metrics = [];
    
    for (const responseId of responseIds) {
      const response = await ResponseModel.findById(parseInt(responseId, 10));
      if (response) {
        responses.push(response);
        const responseMetrics = await qualityMetricsService.calculateMetrics(response.content, response.prompt);
        metrics.push({
          response_id: responseId,
          metrics: responseMetrics
        });
      }
    }
    
    if (responses.length < 2) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Not enough valid responses found for comparison',
          statusCode: 400
        }
      });
    }
    
    // Calculate comparison statistics
    const metricNames = ['coherence', 'completeness', 'readability', 'creativity', 'specificity', 'length_appropriateness'];
    const comparison = {};
    
    metricNames.forEach(metricName => {
      const values = metrics.map(m => m.metrics[metricName]);
      comparison[metricName] = {
        min: Math.min(...values),
        max: Math.max(...values),
        avg: values.reduce((sum, val) => sum + val, 0) / values.length,
        variance: values.reduce((sum, val) => sum + Math.pow(val - (values.reduce((s, v) => s + v, 0) / values.length), 2), 0) / values.length
      };
    });
    
    res.json({
      success: true,
      data: {
        responses: metrics,
        comparison,
        summary: {
          total_responses: responses.length,
          best_overall: metrics.reduce((best, current) => {
            const currentAvg = metricNames.reduce((sum, metric) => sum + current.metrics[metric], 0) / metricNames.length;
            const bestAvg = metricNames.reduce((sum, metric) => sum + best.metrics[metric], 0) / metricNames.length;
            return currentAvg > bestAvg ? current : best;
          }).response_id
        }
      }
    });
  } catch (error) {
    logger.error('Error comparing metrics:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to compare metrics',
        statusCode: 500
      }
    });
  }
}));

module.exports = router;
