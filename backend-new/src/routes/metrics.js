/**
 * Quality Metrics API Routes
 * 
 * This module handles all quality metrics-related API endpoints including:
 * - Individual response metric calculation
 * - Batch metric processing
 * - Metric comparison and analysis
 * - Quality trends and insights
 * - Statistical analysis of quality data
 * 
 * All metrics are calculated using mock algorithms that simulate real quality assessment.
 */

const express = require('express');
const router = express.Router();
const { findResponseById, mockResponses } = require('../data/mockResponses');

/**
 * GET /api/metrics/:responseId
 * Calculate and retrieve detailed quality metrics for a specific response
 */
router.get('/:responseId', (req, res) => {
  try {
    const { responseId } = req.params;
    const response = findResponseById(responseId);

    if (!response) {
      return res.status(404).json({
        success: false,
        error: {
          message: `Response with ID ${responseId} not found`,
          statusCode: 404,
          code: 'RESPONSE_NOT_FOUND'
        }
      });
    }

    // Use existing metrics from the response, but add detailed analysis
    const detailedAnalysis = generateDetailedAnalysis(response);

    res.json({
      success: true,
      data: {
        response_id: response.id,
        metrics: response.metrics,
        detailed_analysis: detailedAnalysis,
        calculated_at: new Date().toISOString()
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
        message: 'Failed to calculate metrics',
        statusCode: 500,
        code: 'INTERNAL_SERVER_ERROR',
        details: error.message
      }
    });
  }
});

/**
 * POST /api/metrics/batch
 * Calculate metrics for multiple responses in batch
 */
router.post('/batch', (req, res) => {
  try {
    const { responses } = req.body;

    if (!responses || !Array.isArray(responses) || responses.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Validation failed',
          statusCode: 400,
          code: 'VALIDATION_ERROR',
          details: 'responses array is required and must contain at least one response'
        }
      });
    }

    // Validate response structure
    for (const response of responses) {
      if (!response.id || !response.content || !response.prompt) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Validation failed',
            statusCode: 400,
            code: 'VALIDATION_ERROR',
            details: 'Each response must have id, content, and prompt fields'
          }
        });
      }
    }

    // Calculate metrics for each response
    const results = responses.map(response => {
      const metrics = calculateMetricsForContent(response.content, response.prompt);
      return {
        response_id: response.id,
        metrics: metrics,
        calculated_at: new Date().toISOString()
      };
    });

    // Calculate batch statistics
    const batchStats = calculateBatchStatistics(results);

    res.json({
      success: true,
      data: {
        results: results,
        batch_statistics: batchStats,
        total_processed: results.length
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
        message: 'Failed to calculate batch metrics',
        statusCode: 500,
        code: 'INTERNAL_SERVER_ERROR',
        details: error.message
      }
    });
  }
});

/**
 * POST /api/metrics/compare
 * Compare quality metrics across multiple responses
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

    // Perform comparative analysis
    const comparison = performMetricComparison(responses);

    res.json({
      success: true,
      data: {
        comparison: comparison
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
        message: 'Failed to compare metrics',
        statusCode: 500,
        code: 'INTERNAL_SERVER_ERROR',
        details: error.message
      }
    });
  }
});

/**
 * GET /api/metrics/trends
 * Get quality trends and insights over time
 */
router.get('/trends', (req, res) => {
  try {
    const {
      period = '30d',
      metric = 'overall_quality',
      experiment_type
    } = req.query;

    // Validate period
    const validPeriods = ['7d', '30d', '90d', '1y'];
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

    // Generate mock trend data
    const trendData = generateTrendData(period, metric, experiment_type);

    res.json({
      success: true,
      data: {
        trends: trendData
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
        message: 'Failed to get quality trends',
        statusCode: 500,
        code: 'INTERNAL_SERVER_ERROR',
        details: error.message
      }
    });
  }
});

/**
 * GET /api/metrics/distribution
 * Get quality score distribution across all responses
 */
router.get('/distribution', (req, res) => {
  try {
    const {
      metric = 'overall_quality',
      experiment_type,
      date_from,
      date_to
    } = req.query;

    // Filter responses based on criteria
    let filteredResponses = [...mockResponses];
    
    if (date_from) {
      filteredResponses = filteredResponses.filter(response =>
        new Date(response.created_at) >= new Date(date_from)
      );
    }
    
    if (date_to) {
      filteredResponses = filteredResponses.filter(response =>
        new Date(response.created_at) <= new Date(date_to)
      );
    }

    // Calculate distribution
    const distribution = calculateMetricDistribution(filteredResponses, metric);

    res.json({
      success: true,
      data: {
        metric: metric,
        distribution: distribution,
        total_responses: filteredResponses.length,
        filters_applied: {
          experiment_type: experiment_type || null,
          date_from: date_from || null,
          date_to: date_to || null
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
        message: 'Failed to calculate metric distribution',
        statusCode: 500,
        code: 'INTERNAL_SERVER_ERROR',
        details: error.message
      }
    });
  }
});

/**
 * POST /api/metrics/recalculate
 * Recalculate metrics for specified responses (useful for algorithm updates)
 */
router.post('/recalculate', (req, res) => {
  try {
    const { response_ids, algorithm_version = 'v2.0' } = req.body;

    if (!response_ids || !Array.isArray(response_ids)) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Validation failed',
          statusCode: 400,
          code: 'VALIDATION_ERROR',
          details: 'response_ids array is required'
        }
      });
    }

    // Find responses and recalculate metrics
    const results = [];
    let successCount = 0;
    let failCount = 0;

    response_ids.forEach(id => {
      const response = findResponseById(id);
      if (response) {
        // Simulate recalculation with slight variations
        const newMetrics = recalculateMetrics(response, algorithm_version);
        results.push({
          response_id: id,
          old_metrics: response.metrics,
          new_metrics: newMetrics,
          algorithm_version: algorithm_version,
          recalculated_at: new Date().toISOString()
        });
        successCount++;
      } else {
        results.push({
          response_id: id,
          error: 'Response not found'
        });
        failCount++;
      }
    });

    res.json({
      success: true,
      data: {
        recalculation_results: results,
        summary: {
          total_requested: response_ids.length,
          successful: successCount,
          failed: failCount
        },
        algorithm_version: algorithm_version
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
        message: 'Failed to recalculate metrics',
        statusCode: 500,
        code: 'INTERNAL_SERVER_ERROR',
        details: error.message
      }
    });
  }
});

/**
 * Helper function to generate detailed analysis for a response
 */
function generateDetailedAnalysis(response) {
  return {
    coherence: {
      score: response.metrics.coherence,
      factors: {
        logical_flow: Math.min(100, response.metrics.coherence + (Math.random() - 0.5) * 4),
        consistency: Math.min(100, response.metrics.coherence + (Math.random() - 0.5) * 4),
        transitions: Math.min(100, response.metrics.coherence + (Math.random() - 0.5) * 4)
      },
      feedback: generateFeedback('coherence', response.metrics.coherence)
    },
    creativity: {
      score: response.metrics.creativity,
      factors: {
        originality: Math.min(100, response.metrics.creativity + (Math.random() - 0.5) * 4),
        vocabulary_diversity: Math.min(100, response.metrics.creativity + (Math.random() - 0.5) * 4),
        narrative_innovation: Math.min(100, response.metrics.creativity + (Math.random() - 0.5) * 4)
      },
      feedback: generateFeedback('creativity', response.metrics.creativity)
    },
    readability: {
      score: response.metrics.readability,
      factors: {
        sentence_structure: Math.min(100, response.metrics.readability + (Math.random() - 0.5) * 4),
        vocabulary_level: Math.min(100, response.metrics.readability + (Math.random() - 0.5) * 4),
        flow: Math.min(100, response.metrics.readability + (Math.random() - 0.5) * 4)
      },
      feedback: generateFeedback('readability', response.metrics.readability)
    }
  };
}

/**
 * Helper function to generate feedback based on metric and score
 */
function generateFeedback(metric, score) {
  const feedbackTemplates = {
    coherence: {
      high: "Strong logical progression with smooth transitions between ideas",
      medium: "Good overall structure with minor coherence issues",
      low: "Some logical inconsistencies and unclear transitions"
    },
    creativity: {
      high: "Highly creative with unique perspective and rich vocabulary",
      medium: "Shows creativity with some original elements",
      low: "Limited creativity, tends toward conventional approaches"
    },
    readability: {
      high: "Excellent readability with clear, well-structured prose",
      medium: "Good readability with appropriate complexity",
      low: "Readability could be improved with simpler structure"
    }
  };

  const level = score >= 90 ? 'high' : score >= 70 ? 'medium' : 'low';
  return feedbackTemplates[metric][level];
}

/**
 * Helper function to calculate metrics for given content
 */
function calculateMetricsForContent(content, prompt) {
  // Mock calculation based on content characteristics
  const contentLength = content.length;
  const wordCount = content.split(/\s+/).length;
  const sentenceCount = content.split(/[.!?]+/).length;
  
  // Base quality calculation
  const baseQuality = 75 + (Math.random() * 20); // 75-95
  
  return {
    overall_quality: parseFloat(baseQuality.toFixed(1)),
    coherence: parseFloat((baseQuality + (Math.random() - 0.5) * 10).toFixed(1)),
    completeness: parseFloat((baseQuality + (Math.random() - 0.5) * 10).toFixed(1)),
    readability: parseFloat((baseQuality + (Math.random() - 0.5) * 10).toFixed(1)),
    creativity: parseFloat((baseQuality + (Math.random() - 0.5) * 15).toFixed(1)),
    specificity: parseFloat((baseQuality + (Math.random() - 0.5) * 10).toFixed(1)),
    length_appropriateness: parseFloat((Math.min(100, 100 - Math.abs(wordCount - 300) / 10)).toFixed(1))
  };
}

/**
 * Helper function to calculate batch statistics
 */
function calculateBatchStatistics(results) {
  const allQualities = results.map(r => r.metrics.overall_quality);
  const mean = allQualities.reduce((a, b) => a + b, 0) / allQualities.length;
  const sortedQualities = allQualities.sort((a, b) => a - b);
  const median = sortedQualities[Math.floor(sortedQualities.length / 2)];
  
  return {
    mean_quality: parseFloat(mean.toFixed(1)),
    median_quality: median,
    min_quality: Math.min(...allQualities),
    max_quality: Math.max(...allQualities),
    quality_std: parseFloat(Math.sqrt(allQualities.reduce((sum, q) => sum + Math.pow(q - mean, 2), 0) / allQualities.length).toFixed(2))
  };
}

/**
 * Helper function to perform metric comparison
 */
function performMetricComparison(responses) {
  const metrics = ['overall_quality', 'coherence', 'completeness', 'readability', 'creativity', 'specificity'];
  
  const comparison = {
    responses: responses.map(r => ({
      id: r.id,
      metrics: r.metrics
    })),
    comparative_analysis: {
      metric_ranges: {},
      rankings: {},
      statistical_significance: {
        quality_difference_significant: true,
        p_value: 0.023
      }
    }
  };

  // Calculate ranges and rankings for each metric
  metrics.forEach(metric => {
    const values = responses.map(r => r.metrics[metric]);
    comparison.comparative_analysis.metric_ranges[metric] = {
      min: Math.min(...values),
      max: Math.max(...values),
      variance: parseFloat((Math.max(...values) - Math.min(...values)).toFixed(1))
    };
    
    // Create ranking by this metric
    const ranked = responses
      .map((r, index) => ({ id: r.id, value: r.metrics[metric], index }))
      .sort((a, b) => b.value - a.value)
      .map(item => item.id);
    
    comparison.comparative_analysis.rankings[`by_${metric}`] = ranked;
  });

  return comparison;
}

/**
 * Helper function to generate trend data
 */
function generateTrendData(period, metric, experimentType) {
  const periods = {
    '7d': 7,
    '30d': 30,
    '90d': 90,
    '1y': 365
  };
  
  const days = periods[period];
  const dataPoints = [];
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    dataPoints.push({
      date: date.toISOString().split('T')[0],
      average_quality: parseFloat((80 + Math.random() * 15 + Math.sin(i / 10) * 5).toFixed(1)),
      experiment_count: Math.floor(Math.random() * 20) + 5,
      top_metric: ['creativity', 'coherence', 'readability'][Math.floor(Math.random() * 3)]
    });
  }
  
  // Calculate trend
  const firstHalf = dataPoints.slice(0, Math.floor(dataPoints.length / 2));
  const secondHalf = dataPoints.slice(Math.floor(dataPoints.length / 2));
  
  const firstAvg = firstHalf.reduce((sum, d) => sum + d.average_quality, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((sum, d) => sum + d.average_quality, 0) / secondHalf.length;
  
  const trendPercentage = ((secondAvg - firstAvg) / firstAvg * 100);
  
  return {
    period: period,
    data_points: dataPoints,
    summary: {
      overall_trend: trendPercentage > 2 ? 'improving' : trendPercentage < -2 ? 'declining' : 'stable',
      trend_percentage: parseFloat(trendPercentage.toFixed(1)),
      best_day: dataPoints.reduce((best, current) => 
        current.average_quality > best.average_quality ? current : best
      ).date,
      worst_day: dataPoints.reduce((worst, current) => 
        current.average_quality < worst.average_quality ? current : worst
      ).date
    }
  };
}

/**
 * Helper function to calculate metric distribution
 */
function calculateMetricDistribution(responses, metric) {
  const values = responses.map(r => r.metrics[metric]);
  const bins = [
    { range: '0-20', count: 0 },
    { range: '21-40', count: 0 },
    { range: '41-60', count: 0 },
    { range: '61-80', count: 0 },
    { range: '81-100', count: 0 }
  ];
  
  values.forEach(value => {
    if (value <= 20) bins[0].count++;
    else if (value <= 40) bins[1].count++;
    else if (value <= 60) bins[2].count++;
    else if (value <= 80) bins[3].count++;
    else bins[4].count++;
  });
  
  return {
    bins: bins,
    statistics: {
      mean: parseFloat((values.reduce((a, b) => a + b, 0) / values.length).toFixed(1)),
      median: values.sort((a, b) => a - b)[Math.floor(values.length / 2)],
      std: parseFloat(Math.sqrt(values.reduce((sum, v) => sum + Math.pow(v - (values.reduce((a, b) => a + b, 0) / values.length), 2), 0) / values.length).toFixed(2))
    }
  };
}

/**
 * Helper function to recalculate metrics with algorithm updates
 */
function recalculateMetrics(response, algorithmVersion) {
  // Simulate improved algorithm with slight variations
  const improvementFactor = algorithmVersion === 'v2.0' ? 1.02 : 1.0;
  
  return {
    overall_quality: Math.min(100, parseFloat((response.metrics.overall_quality * improvementFactor).toFixed(1))),
    coherence: Math.min(100, parseFloat((response.metrics.coherence * improvementFactor).toFixed(1))),
    completeness: Math.min(100, parseFloat((response.metrics.completeness * improvementFactor).toFixed(1))),
    readability: Math.min(100, parseFloat((response.metrics.readability * improvementFactor).toFixed(1))),
    creativity: Math.min(100, parseFloat((response.metrics.creativity * improvementFactor).toFixed(1))),
    specificity: Math.min(100, parseFloat((response.metrics.specificity * improvementFactor).toFixed(1))),
    length_appropriateness: Math.min(100, parseFloat((response.metrics.length_appropriateness * improvementFactor).toFixed(1)))
  };
}

module.exports = router;