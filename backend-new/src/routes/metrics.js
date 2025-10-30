const express = require('express');
const router = express.Router();
const mockResponses = require('../data/mockResponses');
const { generateQualityTrends } = require('../data/mockAnalytics');

// Helper function to calculate metrics for content
const calculateMetricsForContent = (content, prompt) => {
  // Simulate metric calculation based on content characteristics
  const contentLength = content.length;
  const wordCount = content.split(' ').length;
  const sentenceCount = content.split(/[.!?]+/).length;
  
  // Base scores with some randomization
  const baseScore = 70 + Math.random() * 20;
  
  // Adjust based on content characteristics
  const lengthBonus = contentLength > 500 ? 5 : contentLength < 100 ? -5 : 0;
  const sentenceBonus = sentenceCount > 3 && sentenceCount < 20 ? 3 : 0;
  const wordBonus = wordCount > 50 && wordCount < 500 ? 2 : 0;
  
  const overall = Math.min(100, Math.max(0, baseScore + lengthBonus + sentenceBonus + wordBonus));
  
  return {
    overall_quality: Math.round(overall * 10) / 10,
    coherence_score: Math.round((overall - 3 + Math.random() * 6) * 10) / 10,
    creativity_score: Math.round((overall - 5 + Math.random() * 10) * 10) / 10,
    readability_score: Math.round((overall - 2 + Math.random() * 4) * 10) / 10,
    completeness_score: Math.round((overall - 4 + Math.random() * 8) * 10) / 10,
    factual_accuracy: Math.round((overall - 3 + Math.random() * 6) * 10) / 10,
    relevance_score: Math.round((overall - 1 + Math.random() * 2) * 10) / 10,
    engagement_score: Math.round((overall - 2 + Math.random() * 4) * 10) / 10,
    technical_depth: Math.round((overall - 6 + Math.random() * 12) * 10) / 10
  };
};

// GET /api/metrics/:responseId - Calculate and retrieve quality metrics for a response
router.get('/:responseId', (req, res) => {
  try {
    const responseId = parseInt(req.params.responseId);
    const response = mockResponses.find(r => r.id === responseId);
    
    if (!response) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Response not found',
          details: `No response found with ID ${responseId}`
        }
      });
    }
    
    // Get existing metrics or calculate new ones
    const metrics = response.quality_metrics || calculateMetricsForContent(response.content, "");
    
    // Generate detailed analysis
    const detailedAnalysis = {
      coherence: {
        score: metrics.coherence_score,
        explanation: metrics.coherence_score > 90 ? 
          "Excellent logical flow with clear connections between ideas" :
          metrics.coherence_score > 75 ?
          "Good structure with mostly clear connections" :
          "Some logical gaps that could be improved",
        suggestions: metrics.coherence_score < 85 ? 
          ["Consider adding more transitional phrases", "Improve paragraph structure"] :
          ["Maintain current coherence level"]
      },
      creativity: {
        score: metrics.creativity_score,
        explanation: metrics.creativity_score > 90 ?
          "Highly original content with creative metaphors and unique perspectives" :
          metrics.creativity_score > 75 ?
          "Good creative elements with original thinking" :
          "Room for more creative expression and original ideas",
        suggestions: metrics.creativity_score < 85 ?
          ["Explore more creative analogies", "Add unique perspectives"] :
          ["Excellent creative expression"]
      },
      readability: {
        score: metrics.readability_score,
        explanation: metrics.readability_score > 90 ?
          "Very easy to read with clear, accessible language" :
          metrics.readability_score > 75 ?
          "Generally readable with good language choices" :
          "Could benefit from simpler language and shorter sentences",
        suggestions: metrics.readability_score < 85 ?
          ["Simplify complex sentences", "Use more common vocabulary"] :
          ["Maintain current readability level"]
      },
      completeness: {
        score: metrics.completeness_score,
        explanation: metrics.completeness_score > 90 ?
          "Thoroughly addresses all aspects of the prompt" :
          metrics.completeness_score > 75 ?
          "Covers most important points adequately" :
          "Missing some key elements or insufficient detail",
        suggestions: metrics.completeness_score < 85 ?
          ["Address all parts of the prompt", "Add more supporting details"] :
          ["Comprehensive coverage achieved"]
      }
    };
    
    res.json({
      success: true,
      data: {
        response_id: responseId,
        metrics,
        detailed_analysis: detailedAnalysis,
        calculated_at: new Date().toISOString(),
        processing_time: 0.5 + Math.random() * 1.5 // Simulated processing time
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to calculate metrics',
        details: error.message
      }
    });
  }
});

// POST /api/metrics/batch - Calculate metrics for multiple responses
router.post('/batch', (req, res) => {
  try {
    const {
      responses,
      metrics_to_calculate = ['coherence', 'creativity', 'readability', 'completeness']
    } = req.body;
    
    if (!responses || !Array.isArray(responses)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Responses array is required',
          details: 'Request body must contain a responses array'
        }
      });
    }
    
    const batchMetrics = [];
    let qualitySum = 0;
    let excellentCount = 0;
    let goodCount = 0;
    let averageCount = 0;
    let poorCount = 0;
    
    for (const responseData of responses) {
      const metrics = calculateMetricsForContent(responseData.content || '', responseData.prompt || '');
      
      // Filter metrics based on requested calculations
      const filteredMetrics = {};
      metrics_to_calculate.forEach(metric => {
        if (metric === 'coherence') filteredMetrics.coherence_score = metrics.coherence_score;
        if (metric === 'creativity') filteredMetrics.creativity_score = metrics.creativity_score;
        if (metric === 'readability') filteredMetrics.readability_score = metrics.readability_score;
        if (metric === 'completeness') filteredMetrics.completeness_score = metrics.completeness_score;
      });
      
      batchMetrics.push({
        response_id: responseData.id,
        metrics: {
          overall_quality: metrics.overall_quality,
          ...filteredMetrics
        }
      });
      
      qualitySum += metrics.overall_quality;
      
      // Categorize quality
      if (metrics.overall_quality >= 90) excellentCount++;
      else if (metrics.overall_quality >= 75) goodCount++;
      else if (metrics.overall_quality >= 60) averageCount++;
      else poorCount++;
    }
    
    const averageQuality = responses.length > 0 ? qualitySum / responses.length : 0;
    
    res.json({
      success: true,
      data: {
        batch_metrics: batchMetrics,
        batch_summary: {
          total_responses: responses.length,
          average_quality: Math.round(averageQuality * 10) / 10,
          processing_time: 1.2 + Math.random() * 2, // Simulated processing time
          quality_distribution: {
            excellent: excellentCount,
            good: goodCount,
            average: averageCount,
            poor: poorCount
          }
        },
        calculated_at: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to calculate batch metrics',
        details: error.message
      }
    });
  }
});

// POST /api/metrics/compare - Compare metrics across responses
router.post('/compare', (req, res) => {
  try {
    const {
      response_ids,
      comparison_type = 'basic',
      focus_metrics = ['creativity', 'coherence']
    } = req.body;
    
    if (!response_ids || !Array.isArray(response_ids) || response_ids.length < 2) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'At least 2 response IDs are required for comparison',
          details: 'response_ids must be an array with minimum 2 elements'
        }
      });
    }
    
    // Get responses and their metrics
    const responsesWithMetrics = response_ids.map(id => {
      const response = mockResponses.find(r => r.id === parseInt(id));
      return response ? {
        id: response.id,
        metrics: response.quality_metrics,
        model: response.model,
        parameters: response.parameters
      } : null;
    }).filter(r => r !== null);
    
    if (responsesWithMetrics.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'No valid responses found for comparison'
        }
      });
    }
    
    // Calculate comparison statistics
    const comparisonStats = {};
    focus_metrics.forEach(metric => {
      const metricKey = `${metric}_score`;
      const values = responsesWithMetrics.map(r => r.metrics[metricKey]).filter(v => v !== undefined);
      
      if (values.length > 0) {
        comparisonStats[metric] = {
          highest: Math.max(...values),
          lowest: Math.min(...values),
          average: values.reduce((sum, v) => sum + v, 0) / values.length,
          range: Math.max(...values) - Math.min(...values),
          standard_deviation: Math.sqrt(
            values.reduce((sum, v) => sum + Math.pow(v - (values.reduce((s, val) => s + val, 0) / values.length), 2), 0) / values.length
          )
        };
      }
    });
    
    // Generate insights
    const insights = [];
    focus_metrics.forEach(metric => {
      if (comparisonStats[metric]) {
        const stats = comparisonStats[metric];
        if (stats.range > 15) {
          insights.push(`Significant variation in ${metric} scores (range: ${stats.range.toFixed(1)} points)`);
        }
        if (stats.standard_deviation > 10) {
          insights.push(`High variability in ${metric} across responses`);
        }
      }
    });
    
    // Find best and worst performers
    const overallQualityValues = responsesWithMetrics.map(r => r.metrics.overall_quality);
    const bestResponseIndex = overallQualityValues.indexOf(Math.max(...overallQualityValues));
    const worstResponseIndex = overallQualityValues.indexOf(Math.min(...overallQualityValues));
    
    const comparison = {
      responses: responsesWithMetrics,
      statistics: comparisonStats,
      insights,
      best_performer: {
        response_id: responsesWithMetrics[bestResponseIndex].id,
        overall_quality: responsesWithMetrics[bestResponseIndex].metrics.overall_quality,
        strengths: focus_metrics.filter(metric => {
          const metricKey = `${metric}_score`;
          return responsesWithMetrics[bestResponseIndex].metrics[metricKey] > 85;
        })
      },
      worst_performer: {
        response_id: responsesWithMetrics[worstResponseIndex].id,
        overall_quality: responsesWithMetrics[worstResponseIndex].metrics.overall_quality,
        improvement_areas: focus_metrics.filter(metric => {
          const metricKey = `${metric}_score`;
          return responsesWithMetrics[worstResponseIndex].metrics[metricKey] < 75;
        })
      }
    };
    
    if (comparison_type === 'detailed') {
      // Add detailed analysis for each response
      comparison.detailed_analysis = responsesWithMetrics.map(response => ({
        response_id: response.id,
        metric_breakdown: focus_metrics.reduce((breakdown, metric) => {
          const metricKey = `${metric}_score`;
          const value = response.metrics[metricKey];
          breakdown[metric] = {
            score: value,
            percentile: responsesWithMetrics.filter(r => r.metrics[metricKey] < value).length / responsesWithMetrics.length * 100,
            relative_performance: value > comparisonStats[metric]?.average ? 'above_average' : 'below_average'
          };
          return breakdown;
        }, {}),
        parameter_correlation: {
          temperature: response.parameters.temperature,
          top_p: response.parameters.top_p,
          quality_impact: response.metrics.overall_quality > 85 ? 'positive' : 'neutral'
        }
      }));
    }
    
    res.json({
      success: true,
      data: {
        comparison,
        comparison_type,
        calculated_at: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to compare metrics',
        details: error.message
      }
    });
  }
});

// GET /api/metrics/trends - Get quality metrics trends over time
router.get('/trends', (req, res) => {
  try {
    const {
      period = '7d',
      metric = 'overall_quality',
      model,
      experiment_ids
    } = req.query;
    
    // Generate trend data
    const trendData = generateQualityTrends(period);
    
    // Filter by model if specified
    let filteredResponses = [...mockResponses];
    if (model) {
      filteredResponses = filteredResponses.filter(r => r.model === model);
    }
    
    // Filter by experiment IDs if specified
    if (experiment_ids) {
      const expIds = experiment_ids.split(',').map(id => parseInt(id));
      filteredResponses = filteredResponses.filter(r => expIds.includes(r.experiment_id));
    }
    
    // Calculate actual trend from filtered responses
    const actualTrendData = [];
    const now = new Date();
    const days = period === '24h' ? 1 : period === '7d' ? 7 : period === '30d' ? 30 : 90;
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayResponses = filteredResponses.filter(r => {
        const responseDate = new Date(r.created_at).toISOString().split('T')[0];
        return responseDate === dateStr;
      });
      
      if (dayResponses.length > 0) {
        const avgQuality = dayResponses.reduce((sum, r) => sum + r.quality_metrics.overall_quality, 0) / dayResponses.length;
        actualTrendData.push({
          date: dateStr,
          average_quality: Math.round(avgQuality * 10) / 10,
          response_count: dayResponses.length
        });
      } else {
        // Use generated trend data for days with no actual responses
        const generatedDay = trendData.find(t => t.date === dateStr);
        if (generatedDay) {
          actualTrendData.push(generatedDay);
        }
      }
    }
    
    // Calculate trend analysis
    const qualityValues = actualTrendData.map(d => d.average_quality);
    const trendDirection = qualityValues.length > 1 ? 
      (qualityValues[qualityValues.length - 1] > qualityValues[0] ? 'improving' : 'declining') : 'stable';
    
    const changePercentage = qualityValues.length > 1 ?
      ((qualityValues[qualityValues.length - 1] - qualityValues[0]) / qualityValues[0] * 100) : 0;
    
    res.json({
      success: true,
      data: {
        trends: {
          period,
          metric,
          data_points: actualTrendData,
          trend_analysis: {
            direction: trendDirection,
            change_percentage: Math.round(changePercentage * 10) / 10,
            peak_quality: Math.max(...qualityValues),
            low_quality: Math.min(...qualityValues),
            average_quality: qualityValues.reduce((sum, q) => sum + q, 0) / qualityValues.length
          },
          filters_applied: {
            model: model || 'all',
            experiment_ids: experiment_ids || 'all',
            period
          }
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to get quality trends',
        details: error.message
      }
    });
  }
});

module.exports = router;
