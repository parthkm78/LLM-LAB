/**
 * Mock Analytics Data
 * 
 * This module provides mock data for analytics and insights in the LLM-LAB system.
 * It includes dashboard metrics, optimization insights, correlations, and trends.
 */

/**
 * Generate dashboard analytics data
 * @param {string} period - Time period (7d, 30d, 90d)
 * @param {Array} models - Filter by models
 * @param {Array} experimentTypes - Filter by experiment types
 * @returns {object} Dashboard analytics data
 */
function generateDashboardAnalytics(period = '30d', models = [], experimentTypes = []) {
  const periodDays = { '7d': 7, '30d': 30, '90d': 90 }[period] || 30;
  
  // Generate quality trends
  const qualityTrends = [];
  for (let i = periodDays - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    qualityTrends.push({
      date: date.toISOString().split('T')[0],
      average_quality: parseFloat((85 + Math.random() * 10 + Math.sin(i / 5) * 3).toFixed(1)),
      experiment_count: Math.floor(Math.random() * 15) + 5,
      top_model: ['gpt-4', 'gpt-3.5-turbo', 'claude-3-opus'][Math.floor(Math.random() * 3)]
    });
  }

  // Model performance data
  const modelPerformance = [
    {
      model: 'gpt-4',
      average_quality: 89.2,
      experiment_count: 567,
      total_cost: 123.45,
      avg_response_time: 2.8
    },
    {
      model: 'gpt-3.5-turbo',
      average_quality: 84.7,
      experiment_count: 892,
      total_cost: 67.89,
      avg_response_time: 1.9
    },
    {
      model: 'claude-3-opus',
      average_quality: 91.8,
      experiment_count: 234,
      total_cost: 89.12,
      avg_response_time: 3.2
    }
  ];

  // Recent activity
  const recentActivity = [
    {
      type: 'experiment_completed',
      experiment_id: 1247,
      name: 'Response Quality Test',
      quality: 94.2,
      timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString()
    },
    {
      type: 'batch_experiment_started',
      experiment_id: 45,
      name: 'Parameter Sweep Analysis',
      timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString()
    },
    {
      type: 'high_quality_response',
      response_id: 445,
      quality: 96.7,
      timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString()
    },
    {
      type: 'experiment_failed',
      experiment_id: 44,
      name: 'Code Generation Test',
      error: 'Rate limit exceeded',
      timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString()
    }
  ];

  return {
    overview: {
      total_experiments: 1247,
      total_responses: 5640,
      average_quality: 87.3,
      quality_trend: 5.2,
      active_models: 5,
      total_cost: 234.56,
      cost_trend: -12.3,
      success_rate: 98.7,
      experiments_today: 23
    },
    quality_trends: qualityTrends,
    model_performance: modelPerformance,
    parameter_insights: {
      optimal_ranges: {
        temperature: { min: 0.7, max: 0.9 },
        top_p: { min: 0.85, max: 0.95 }
      },
      correlations: [
        {
          parameter: 'temperature',
          metric: 'creativity',
          correlation: 0.87,
          strength: 'strong'
        },
        {
          parameter: 'top_p',
          metric: 'diversity',
          correlation: 0.64,
          strength: 'moderate'
        }
      ]
    },
    recent_activity: recentActivity
  };
}

/**
 * Generate parameter optimization insights
 * @param {string} objective - Optimization objective
 * @param {object} constraints - Parameter constraints
 * @returns {object} Optimization recommendations
 */
function generateOptimizationInsights(objective = 'quality', constraints = {}) {
  const recommendations = {
    maximize_quality: {
      recommended_parameters: {
        temperature: 0.8,
        top_p: 0.9,
        max_tokens: 1000
      },
      expected_quality: 94.5,
      confidence: 0.87,
      based_on_experiments: 156
    },
    minimize_cost: {
      recommended_parameters: {
        temperature: 0.6,
        top_p: 0.8,
        max_tokens: 800
      },
      expected_cost: 0.018,
      confidence: 0.92,
      based_on_experiments: 203
    },
    maximize_speed: {
      recommended_parameters: {
        temperature: 0.5,
        top_p: 0.7,
        max_tokens: 500
      },
      expected_time: 1.8,
      confidence: 0.89,
      based_on_experiments: 178
    },
    maximize_creativity: {
      recommended_parameters: {
        temperature: 0.9,
        top_p: 0.95,
        max_tokens: 1200
      },
      expected_creativity: 95.8,
      confidence: 0.84,
      based_on_experiments: 142
    }
  };

  const parameterSensitivity = {
    temperature: {
      impact_on_quality: 0.73,
      optimal_range: [0.7, 0.9],
      sensitivity: 'high'
    },
    top_p: {
      impact_on_quality: 0.54,
      optimal_range: [0.8, 0.95],
      sensitivity: 'medium'
    },
    max_tokens: {
      impact_on_quality: 0.31,
      optimal_range: [800, 1200],
      sensitivity: 'low'
    }
  };

  const paretoFrontier = [
    {
      parameters: { temperature: 0.8, top_p: 0.9, max_tokens: 1000 },
      quality: 94.2,
      cost: 0.023,
      speed: 3.2
    },
    {
      parameters: { temperature: 0.7, top_p: 0.85, max_tokens: 800 },
      quality: 89.7,
      cost: 0.019,
      speed: 2.8
    },
    {
      parameters: { temperature: 0.6, top_p: 0.8, max_tokens: 600 },
      quality: 85.3,
      cost: 0.015,
      speed: 2.1
    }
  ];

  return {
    recommendations: [recommendations[`maximize_${objective}`] || recommendations.maximize_quality],
    parameter_sensitivity: parameterSensitivity,
    pareto_frontier: paretoFrontier
  };
}

/**
 * Generate correlation analysis data
 * @returns {object} Correlation analysis results
 */
function generateCorrelationAnalysis() {
  return {
    correlations: {
      parameter_quality: [
        {
          parameter: 'temperature',
          quality_metric: 'creativity',
          correlation: 0.87,
          p_value: 0.001,
          significance: 'highly_significant'
        },
        {
          parameter: 'temperature',
          quality_metric: 'coherence',
          correlation: -0.23,
          p_value: 0.045,
          significance: 'significant'
        },
        {
          parameter: 'top_p',
          quality_metric: 'diversity',
          correlation: 0.64,
          p_value: 0.003,
          significance: 'highly_significant'
        },
        {
          parameter: 'max_tokens',
          quality_metric: 'completeness',
          correlation: 0.41,
          p_value: 0.021,
          significance: 'significant'
        }
      ],
      cross_metrics: [
        {
          metric_a: 'coherence',
          metric_b: 'readability',
          correlation: 0.76,
          interpretation: 'strong_positive'
        },
        {
          metric_a: 'creativity',
          metric_b: 'specificity',
          correlation: -0.34,
          interpretation: 'weak_negative'
        },
        {
          metric_a: 'completeness',
          metric_b: 'length_appropriateness',
          correlation: 0.58,
          interpretation: 'moderate_positive'
        }
      ]
    },
    insights: [
      'Higher temperature strongly correlates with creativity scores',
      'Coherence and readability show strong positive correlation',
      'Temperature has negative correlation with coherence',
      'Top_p values affect response diversity significantly'
    ]
  };
}

/**
 * Generate model comparison data
 * @param {Array} models - Models to compare
 * @returns {object} Model comparison results
 */
function generateModelComparison(models = ['gpt-4', 'gpt-3.5-turbo', 'claude-3-opus']) {
  const comparison = {
    models: models.map(model => ({
      model: model,
      performance: {
        average_quality: 85 + Math.random() * 10,
        consistency: 0.8 + Math.random() * 0.15,
        speed: 2 + Math.random() * 2,
        cost_efficiency: 0.7 + Math.random() * 0.25
      },
      strengths: getModelStrengths(model),
      weaknesses: getModelWeaknesses(model),
      best_use_cases: getModelUseCases(model)
    })),
    overall_ranking: {
      by_quality: models.sort(() => Math.random() - 0.5),
      by_speed: models.sort(() => Math.random() - 0.5),
      by_cost: models.sort(() => Math.random() - 0.5)
    },
    recommendations: generateModelRecommendations(models)
  };

  return comparison;
}

/**
 * Helper function to get model strengths
 */
function getModelStrengths(model) {
  const strengths = {
    'gpt-4': ['High creativity', 'Complex reasoning', 'Code generation'],
    'gpt-3.5-turbo': ['Fast response', 'Cost effective', 'General purpose'],
    'claude-3-opus': ['Long context', 'Analytical thinking', 'Safety']
  };
  return strengths[model] || ['General capabilities'];
}

/**
 * Helper function to get model weaknesses
 */
function getModelWeaknesses(model) {
  const weaknesses = {
    'gpt-4': ['Higher cost', 'Slower response'],
    'gpt-3.5-turbo': ['Limited creativity', 'Shorter context'],
    'claude-3-opus': ['Higher latency', 'Limited availability']
  };
  return weaknesses[model] || ['None identified'];
}

/**
 * Helper function to get model use cases
 */
function getModelUseCases(model) {
  const useCases = {
    'gpt-4': ['Creative writing', 'Complex analysis', 'Code review'],
    'gpt-3.5-turbo': ['Quick responses', 'Simple tasks', 'High volume'],
    'claude-3-opus': ['Research analysis', 'Long documents', 'Safety-critical']
  };
  return useCases[model] || ['General purpose'];
}

/**
 * Helper function to generate model recommendations
 */
function generateModelRecommendations(models) {
  return [
    'GPT-4 recommended for high-quality creative tasks',
    'GPT-3.5-Turbo ideal for cost-sensitive applications',
    'Claude-3-Opus best for analytical and research tasks'
  ];
}

/**
 * Generate experiment insights data
 * @param {string} timeframe - Analysis timeframe
 * @returns {object} Experiment insights
 */
function generateExperimentInsights(timeframe = '30d') {
  return {
    success_patterns: {
      high_performing_parameters: [
        { temperature: 0.8, top_p: 0.9, success_rate: 0.94 },
        { temperature: 0.7, top_p: 0.85, success_rate: 0.91 }
      ],
      optimal_timing: {
        best_hours: [9, 10, 11, 14, 15],
        worst_hours: [22, 23, 0, 1, 2],
        explanation: 'API performance varies by time of day'
      },
      successful_prompts: [
        'Specific, detailed instructions',
        'Clear context and examples',
        'Well-defined output format'
      ]
    },
    failure_analysis: {
      common_causes: [
        { cause: 'Rate limiting', frequency: 0.34 },
        { cause: 'Parameter misconfiguration', frequency: 0.28 },
        { cause: 'Prompt ambiguity', frequency: 0.23 },
        { cause: 'Model timeout', frequency: 0.15 }
      ],
      prevention_tips: [
        'Implement proper rate limiting',
        'Validate parameters before submission',
        'Use clear, unambiguous prompts',
        'Set appropriate timeout values'
      ]
    },
    quality_factors: {
      most_impactful: [
        { factor: 'Prompt clarity', impact: 0.78 },
        { factor: 'Parameter tuning', impact: 0.65 },
        { factor: 'Model selection', impact: 0.52 }
      ],
      optimization_opportunities: [
        'Improve prompt engineering practices',
        'Implement automated parameter optimization',
        'Develop model selection guidelines'
      ]
    }
  };
}

module.exports = {
  generateDashboardAnalytics,
  generateOptimizationInsights,
  generateCorrelationAnalysis,
  generateModelComparison,
  generateExperimentInsights
};
