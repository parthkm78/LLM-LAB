const express = require('express');
const router = express.Router();
const { mockAnalytics, generateQualityTrends } = require('../data/mockAnalytics');
const mockExperiments = require('../data/mockExperiments');
const mockResponses = require('../data/mockResponses');

// GET /api/analytics/dashboard - Get dashboard analytics data
router.get('/dashboard', (req, res) => {
  try {
    const {
      period = '7d',
      models,
      experiment_types
    } = req.query;
    
    let dashboardData = { ...mockAnalytics.dashboard };
    
    // Filter by models if specified
    if (models) {
      const modelList = models.split(',');
      dashboardData.model_performance = dashboardData.model_performance.filter(m => 
        modelList.includes(m.model)
      );
    }
    
    // Update real-time statistics based on actual mock data
    dashboardData.overview.total_experiments = mockExperiments.length;
    dashboardData.overview.total_responses = mockResponses.length;
    
    // Calculate real average quality from mock responses
    if (mockResponses.length > 0) {
      const totalQuality = mockResponses.reduce((sum, r) => sum + r.quality_metrics.overall_quality, 0);
      dashboardData.overview.average_quality = Math.round((totalQuality / mockResponses.length) * 10) / 10;
    }
    
    // Update quality trends with period-specific data
    dashboardData.quality_trends = generateQualityTrends(period);
    
    res.json({
      success: true,
      data: dashboardData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch dashboard analytics',
        details: error.message
      }
    });
  }
});

// GET /api/analytics/parameter-analysis - Analyze parameter impact on quality
router.get('/parameter-analysis', (req, res) => {
  try {
    const {
      parameter = 'temperature',
      model,
      date_range
    } = req.query;
    
    let analysisData = mockAnalytics.parameter_analysis[parameter];
    
    if (!analysisData) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid parameter',
          details: `Parameter '${parameter}' is not supported. Available: temperature, top_p`
        }
      });
    }
    
    // Filter responses for analysis
    let filteredResponses = [...mockResponses];
    
    if (model) {
      filteredResponses = filteredResponses.filter(r => r.model === model);
    }
    
    if (date_range) {
      try {
        const { start, end } = JSON.parse(date_range);
        filteredResponses = filteredResponses.filter(r => {
          const responseDate = new Date(r.created_at);
          return responseDate >= new Date(start) && responseDate <= new Date(end);
        });
      } catch (e) {
        // Invalid date range format, use all responses
      }
    }
    
    // Calculate actual parameter impact from filtered responses
    const parameterImpact = {};
    if (filteredResponses.length > 0) {
      const parameterValues = filteredResponses.map(r => r.parameters[parameter]);
      const qualityValues = filteredResponses.map(r => r.quality_metrics.overall_quality);
      
      // Group by parameter value ranges
      const valueRanges = {};
      filteredResponses.forEach(response => {
        const paramValue = response.parameters[parameter];
        const roundedValue = Math.round(paramValue * 10) / 10; // Round to 1 decimal
        
        if (!valueRanges[roundedValue]) {
          valueRanges[roundedValue] = {
            qualities: [],
            count: 0
          };
        }
        
        valueRanges[roundedValue].qualities.push(response.quality_metrics.overall_quality);
        valueRanges[roundedValue].count++;
      });
      
      // Calculate averages for each value range
      const actualDataPoints = Object.keys(valueRanges).map(value => ({
        value: parseFloat(value),
        avg_quality: valueRanges[value].qualities.reduce((sum, q) => sum + q, 0) / valueRanges[value].qualities.length,
        sample_count: valueRanges[value].count
      })).sort((a, b) => a.value - b.value);
      
      if (actualDataPoints.length > 0) {
        analysisData = {
          ...analysisData,
          data_points: actualDataPoints,
          sample_size: filteredResponses.length
        };
      }
    }
    
    res.json({
      success: true,
      data: {
        parameter,
        analysis: analysisData,
        filters_applied: {
          model: model || 'all',
          date_range: date_range || 'all',
          sample_size: filteredResponses.length
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to analyze parameter impact',
        details: error.message
      }
    });
  }
});

// GET /api/analytics/model-comparison - Compare performance across different models
router.get('/model-comparison', (req, res) => {
  try {
    const {
      models,
      metric = 'overall_quality',
      period = '30d'
    } = req.query;
    
    let comparisonData = { ...mockAnalytics.model_comparison };
    
    // Filter by specific models if requested
    if (models) {
      const modelList = models.split(',');
      comparisonData.detailed_comparison = comparisonData.detailed_comparison.filter(m => 
        modelList.includes(m.model)
      );
    }
    
    // Calculate real model performance from mock data
    const modelPerformance = {};
    
    mockResponses.forEach(response => {
      if (!modelPerformance[response.model]) {
        modelPerformance[response.model] = {
          qualities: [],
          response_times: [],
          costs: [],
          response_count: 0
        };
      }
      
      modelPerformance[response.model].qualities.push(response.quality_metrics.overall_quality);
      modelPerformance[response.model].response_times.push(response.response_time);
      modelPerformance[response.model].costs.push(response.cost);
      modelPerformance[response.model].response_count++;
    });
    
    // Update detailed comparison with real data
    Object.keys(modelPerformance).forEach(model => {
      const perf = modelPerformance[model];
      const avgQuality = perf.qualities.reduce((sum, q) => sum + q, 0) / perf.qualities.length;
      const avgResponseTime = perf.response_times.reduce((sum, t) => sum + t, 0) / perf.response_times.length;
      const avgCost = perf.costs.reduce((sum, c) => sum + c, 0) / perf.costs.length;
      
      const existingModel = comparisonData.detailed_comparison.find(m => m.model === model);
      if (existingModel) {
        existingModel.metrics.average_quality = Math.round(avgQuality * 10) / 10;
        existingModel.metrics.response_time = Math.round(avgResponseTime * 10) / 10;
        existingModel.cost_per_1k_tokens = Math.round(avgCost * 1000 * 100) / 100;
      }
    });
    
    // Update recommendations based on real data
    const modelsByQuality = comparisonData.detailed_comparison.sort((a, b) => 
      b.metrics.average_quality - a.metrics.average_quality
    );
    
    const modelsBySpeed = comparisonData.detailed_comparison.sort((a, b) => 
      a.metrics.response_time - b.metrics.response_time
    );
    
    const modelsByCost = comparisonData.detailed_comparison.sort((a, b) => 
      a.cost_per_1k_tokens - b.cost_per_1k_tokens
    );
    
    comparisonData.recommendation = {
      best_overall: modelsByQuality[0]?.model || 'gpt-4',
      best_speed: modelsBySpeed[0]?.model || 'gpt-3.5-turbo',
      best_value: modelsByCost[0]?.model || 'gpt-3.5-turbo',
      best_creativity: modelsByQuality[0]?.model || 'gpt-4',
      best_technical: modelsByQuality[0]?.model || 'gpt-4'
    };
    
    res.json({
      success: true,
      data: comparisonData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to compare models',
        details: error.message
      }
    });
  }
});

// GET /api/analytics/experiment-performance - Analyze experiment performance trends
router.get('/experiment-performance', (req, res) => {
  try {
    const {
      period = '30d',
      experiment_ids,
      metric = 'overall_quality'
    } = req.query;
    
    let experiments = [...mockExperiments];
    
    // Filter by experiment IDs if specified
    if (experiment_ids) {
      const expIds = experiment_ids.split(',').map(id => parseInt(id));
      experiments = experiments.filter(exp => expIds.includes(exp.id));
    }
    
    // Calculate performance metrics for each experiment
    const experimentPerformance = experiments.map(experiment => {
      const experimentResponses = mockResponses.filter(r => r.experiment_id === experiment.id);
      
      if (experimentResponses.length === 0) {
        return {
          experiment_id: experiment.id,
          name: experiment.name,
          performance: {
            average_quality: 0,
            response_count: 0,
            cost_efficiency: 0,
            time_efficiency: 0
          }
        };
      }
      
      const avgQuality = experimentResponses.reduce((sum, r) => sum + r.quality_metrics.overall_quality, 0) / experimentResponses.length;
      const totalCost = experimentResponses.reduce((sum, r) => sum + r.cost, 0);
      const avgResponseTime = experimentResponses.reduce((sum, r) => sum + r.response_time, 0) / experimentResponses.length;
      
      return {
        experiment_id: experiment.id,
        name: experiment.name,
        model: experiment.model,
        created_at: experiment.created_at,
        performance: {
          average_quality: Math.round(avgQuality * 10) / 10,
          response_count: experimentResponses.length,
          total_cost: Math.round(totalCost * 1000) / 1000,
          average_response_time: Math.round(avgResponseTime * 10) / 10,
          cost_efficiency: Math.round((avgQuality / (totalCost * 1000)) * 10) / 10, // Quality per dollar
          time_efficiency: Math.round((avgQuality / avgResponseTime) * 10) / 10 // Quality per second
        },
        parameter_settings: experiment.parameters,
        tags: experiment.tags
      };
    });
    
    // Sort by the requested metric
    experimentPerformance.sort((a, b) => {
      const aVal = a.performance[metric] || a.performance.average_quality;
      const bVal = b.performance[metric] || b.performance.average_quality;
      return bVal - aVal;
    });
    
    // Calculate summary statistics
    const totalResponses = experimentPerformance.reduce((sum, exp) => sum + exp.performance.response_count, 0);
    const totalCost = experimentPerformance.reduce((sum, exp) => sum + exp.performance.total_cost, 0);
    const avgQualityAcrossExperiments = totalResponses > 0 ? 
      experimentPerformance.reduce((sum, exp) => sum + (exp.performance.average_quality * exp.performance.response_count), 0) / totalResponses : 0;
    
    res.json({
      success: true,
      data: {
        experiment_performance: experimentPerformance,
        summary: {
          total_experiments: experimentPerformance.length,
          total_responses: totalResponses,
          total_cost: Math.round(totalCost * 1000) / 1000,
          average_quality: Math.round(avgQualityAcrossExperiments * 10) / 10,
          best_performer: experimentPerformance[0] || null,
          period,
          metric_used: metric
        },
        insights: [
          experimentPerformance.length > 0 ? `Best performing experiment: "${experimentPerformance[0].name}" with ${experimentPerformance[0].performance.average_quality}% quality` : "No experiments found",
          totalCost > 0 ? `Total cost across all experiments: $${totalCost.toFixed(3)}` : "No cost data available",
          `Analysis based on ${totalResponses} total responses`
        ]
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to analyze experiment performance',
        details: error.message
      }
    });
  }
});

// GET /api/analytics/cost-analysis - Analyze cost trends and optimization opportunities
router.get('/cost-analysis', (req, res) => {
  try {
    const {
      period = '30d',
      model,
      breakdown_by = 'model' // 'model', 'experiment', 'date'
    } = req.query;
    
    let responses = [...mockResponses];
    
    // Filter by model if specified
    if (model) {
      responses = responses.filter(r => r.model === model);
    }
    
    // Calculate cost breakdown
    let costBreakdown = {};
    
    if (breakdown_by === 'model') {
      responses.forEach(response => {
        if (!costBreakdown[response.model]) {
          costBreakdown[response.model] = {
            total_cost: 0,
            response_count: 0,
            total_tokens: 0,
            avg_cost_per_response: 0,
            avg_quality: 0
          };
        }
        
        costBreakdown[response.model].total_cost += response.cost;
        costBreakdown[response.model].response_count += 1;
        costBreakdown[response.model].total_tokens += response.token_count;
        costBreakdown[response.model].avg_quality += response.quality_metrics.overall_quality;
      });
      
      // Calculate averages
      Object.keys(costBreakdown).forEach(model => {
        const data = costBreakdown[model];
        data.avg_cost_per_response = data.total_cost / data.response_count;
        data.avg_quality = data.avg_quality / data.response_count;
        data.cost_per_quality_point = data.total_cost / (data.avg_quality * data.response_count);
        
        // Round values
        data.total_cost = Math.round(data.total_cost * 1000) / 1000;
        data.avg_cost_per_response = Math.round(data.avg_cost_per_response * 1000) / 1000;
        data.avg_quality = Math.round(data.avg_quality * 10) / 10;
        data.cost_per_quality_point = Math.round(data.cost_per_quality_point * 10000) / 10000;
      });
    }
    
    // Calculate total costs and trends
    const totalCost = responses.reduce((sum, r) => sum + r.cost, 0);
    const totalTokens = responses.reduce((sum, r) => sum + r.token_count, 0);
    const avgCostPerToken = totalTokens > 0 ? totalCost / totalTokens : 0;
    
    // Cost optimization recommendations
    const recommendations = [
      "Consider using GPT-3.5 Turbo for simple tasks to reduce costs",
      "Optimize prompt length to reduce token usage",
      "Batch similar requests to improve efficiency",
      "Monitor cost per quality point to find optimal model usage"
    ];
    
    // Add model-specific recommendations based on cost analysis
    if (costBreakdown['gpt-4'] && costBreakdown['gpt-3.5-turbo']) {
      const gpt4CostEfficiency = costBreakdown['gpt-4'].cost_per_quality_point;
      const gpt35CostEfficiency = costBreakdown['gpt-3.5-turbo'].cost_per_quality_point;
      
      if (gpt35CostEfficiency < gpt4CostEfficiency) {
        recommendations.push("GPT-3.5 Turbo shows better cost efficiency for your use cases");
      } else {
        recommendations.push("GPT-4 provides better value despite higher cost");
      }
    }
    
    res.json({
      success: true,
      data: {
        cost_analysis: {
          total_cost: Math.round(totalCost * 1000) / 1000,
          total_tokens: totalTokens,
          avg_cost_per_token: Math.round(avgCostPerToken * 100000) / 100000,
          response_count: responses.length,
          breakdown: costBreakdown,
          breakdown_by
        },
        optimization: {
          recommendations,
          potential_savings: Math.round(totalCost * 0.15 * 100) / 100, // Assume 15% potential savings
          most_efficient_model: Object.keys(costBreakdown).reduce((best, model) => {
            if (!best || costBreakdown[model].cost_per_quality_point < costBreakdown[best].cost_per_quality_point) {
              return model;
            }
            return best;
          }, null)
        },
        period,
        filters_applied: {
          model: model || 'all'
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to analyze costs',
        details: error.message
      }
    });
  }
});

module.exports = router;
