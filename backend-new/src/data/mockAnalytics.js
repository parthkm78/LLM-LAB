// Mock analytics and dashboard data
const mockAnalytics = {
  dashboard: {
    overview: {
      total_experiments: 1247,
      total_responses: 5640,
      average_quality: 87.3,
      quality_trend: 5.2,
      active_models: 5,
      total_cost: 234.56,
      cost_trend: -12.3,
      experiments_today: 23,
      responses_analyzed: 5640,
      avg_response_time: 1.8,
      top_model: "GPT-4",
      success_rate: 94.2,
      best_quality: 96.8,
      improvement_rate: 12.5,
      avg_tokens: 420
    },
    quality_trends: [
      { date: "2024-10-24", average_quality: 85.2, experiment_count: 45, coherence: 82, creativity: 78, readability: 88 },
      { date: "2024-10-25", average_quality: 86.1, experiment_count: 52, coherence: 84, creativity: 81, readability: 89 },
      { date: "2024-10-26", average_quality: 87.0, experiment_count: 48, coherence: 85, creativity: 83, readability: 90 },
      { date: "2024-10-27", average_quality: 88.2, experiment_count: 61, coherence: 87, creativity: 85, readability: 91 },
      { date: "2024-10-28", average_quality: 89.1, experiment_count: 58, coherence: 88, creativity: 87, readability: 92 },
      { date: "2024-10-29", average_quality: 88.5, experiment_count: 35, coherence: 89, creativity: 86, readability: 90 },
      { date: "2024-10-30", average_quality: 87.3, experiment_count: 41, coherence: 87, creativity: 84, readability: 91 }
    ],
    model_performance: [
      {
        model: "gpt-4",
        average_quality: 89.2,
        response_count: 2340,
        cost_per_response: 0.009,
        consistency: 0.92,
        cost_efficiency: 0.85,
        response_time: 2.3,
        strengths: ["High creativity", "Excellent coherence", "Complex reasoning"],
        weaknesses: ["Higher cost", "Slower response time"]
      },
      {
        model: "claude-3.5-sonnet",
        average_quality: 86.7,
        response_count: 1890,
        cost_per_response: 0.007,
        consistency: 0.89,
        cost_efficiency: 0.91,
        response_time: 1.9,
        strengths: ["Good balance", "Cost effective", "Reliable"],
        weaknesses: ["Lower creativity peaks", "Less technical depth"]
      },
      {
        model: "gpt-3.5-turbo",
        average_quality: 82.4,
        response_count: 1410,
        cost_per_response: 0.003,
        consistency: 0.85,
        cost_efficiency: 0.95,
        response_time: 1.2,
        strengths: ["Very fast", "Low cost", "Good for simple tasks"],
        weaknesses: ["Lower quality ceiling", "Less creative"]
      }
    ],
    top_experiments: [
      {
        id: 1,
        name: "Creative Writing Analysis",
        average_quality: 94.2,
        response_count: 5,
        model: "gpt-4",
        created_at: "2024-10-29T10:00:00.000Z"
      },
      {
        id: 4,
        name: "Code Generation Analysis",
        average_quality: 92.8,
        response_count: 4,
        model: "gpt-4",
        created_at: "2024-10-27T16:30:00.000Z"
      },
      {
        id: 2,
        name: "Technical Documentation Test",
        average_quality: 91.2,
        response_count: 3,
        model: "gpt-4",
        created_at: "2024-10-28T14:20:00.000Z"
      }
    ],
    parameter_insights: [
      {
        parameter: "temperature",
        optimal_value: 0.8,
        correlation_with_quality: 0.75,
        insight: "Higher temperature significantly improves creativity while maintaining coherence"
      },
      {
        parameter: "top_p",
        optimal_value: 0.9,
        correlation_with_quality: 0.45,
        insight: "Values above 0.85 show diminishing returns on overall quality"
      },
      {
        parameter: "max_tokens",
        optimal_value: 1500,
        correlation_with_quality: 0.32,
        insight: "Sweet spot between 1000-1500 tokens for balanced completeness and conciseness"
      }
    ],
    recent_activity: [
      { 
        time: '2m ago', 
        action: 'Batch experiment completed', 
        quality: 94, 
        type: 'success',
        experiment_id: 1,
        model: 'gpt-4'
      },
      { 
        time: '5m ago', 
        action: 'Parameter optimization started', 
        quality: null, 
        type: 'info',
        experiment_id: 2,
        model: 'gpt-4'
      },
      { 
        time: '12m ago', 
        action: 'Quality analysis finished', 
        quality: 89, 
        type: 'success',
        experiment_id: 3,
        model: 'claude-3.5-sonnet'
      },
      { 
        time: '18m ago', 
        action: 'New experiment created', 
        quality: null, 
        type: 'info',
        experiment_id: 5,
        model: 'claude-3.5-sonnet'
      },
      { 
        time: '25m ago', 
        action: 'Response comparison completed', 
        quality: 92, 
        type: 'success',
        experiment_id: 4,
        model: 'gpt-4'
      }
    ]
  },
  
  parameter_analysis: {
    temperature: {
      optimal: 0.8,
      range: [0.1, 1.0],
      correlation: 0.75,
      insight: "Higher temperature significantly improves creativity while maintaining coherence",
      data_points: [
        { value: 0.1, avg_quality: 82.3, creativity: 65, coherence: 95 },
        { value: 0.3, avg_quality: 84.7, creativity: 72, coherence: 92 },
        { value: 0.5, avg_quality: 86.1, creativity: 78, coherence: 89 },
        { value: 0.7, avg_quality: 88.5, creativity: 84, coherence: 86 },
        { value: 0.9, avg_quality: 87.2, creativity: 89, coherence: 83 },
        { value: 1.0, avg_quality: 84.8, creativity: 92, coherence: 80 }
      ]
    },
    top_p: {
      optimal: 0.9,
      range: [0.7, 1.0],
      correlation: 0.45,
      insight: "Values above 0.85 show diminishing returns on overall quality",
      data_points: [
        { value: 0.7, avg_quality: 85.1, diversity: 72, coherence: 88 },
        { value: 0.8, avg_quality: 87.3, diversity: 79, coherence: 87 },
        { value: 0.85, avg_quality: 88.9, diversity: 83, coherence: 86 },
        { value: 0.9, avg_quality: 89.2, diversity: 86, coherence: 85 },
        { value: 0.95, avg_quality: 88.7, diversity: 89, coherence: 83 },
        { value: 1.0, avg_quality: 87.1, diversity: 91, coherence: 81 }
      ]
    }
  },
  
  model_comparison: {
    recommendation: {
      best_overall: "gpt-4",
      best_value: "claude-3.5-sonnet",
      best_speed: "gpt-3.5-turbo",
      best_creativity: "gpt-4",
      best_technical: "gpt-4"
    },
    detailed_comparison: [
      {
        model: "gpt-4",
        metrics: {
          average_quality: 89.2,
          consistency: 0.92,
          cost_efficiency: 0.85,
          response_time: 2.3,
          creativity_score: 88.5,
          technical_depth: 92.1,
          coherence: 90.8
        },
        use_cases: ["Creative writing", "Complex analysis", "Technical documentation"],
        cost_per_1k_tokens: 0.03
      },
      {
        model: "claude-3.5-sonnet",
        metrics: {
          average_quality: 86.7,
          consistency: 0.89,
          cost_efficiency: 0.91,
          response_time: 1.9,
          creativity_score: 84.2,
          technical_depth: 86.8,
          coherence: 88.9
        },
        use_cases: ["Conversational AI", "General tasks", "Balanced performance"],
        cost_per_1k_tokens: 0.025
      },
      {
        model: "gpt-3.5-turbo",
        metrics: {
          average_quality: 82.4,
          consistency: 0.85,
          cost_efficiency: 0.95,
          response_time: 1.2,
          creativity_score: 78.3,
          technical_depth: 79.5,
          coherence: 84.7
        },
        use_cases: ["Simple tasks", "High volume processing", "Cost-sensitive applications"],
        cost_per_1k_tokens: 0.002
      }
    ]
  }
};

// Quality metrics trends
const generateQualityTrends = (period = '7d') => {
  const trends = [];
  const days = period === '24h' ? 1 : period === '7d' ? 7 : period === '30d' ? 30 : 90;
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    trends.push({
      date: date.toISOString().split('T')[0],
      overall_quality: 80 + Math.random() * 15,
      coherence: 78 + Math.random() * 17,
      creativity: 75 + Math.random() * 20,
      readability: 82 + Math.random() * 13,
      completeness: 79 + Math.random() * 16,
      response_count: Math.floor(20 + Math.random() * 40)
    });
  }
  
  return trends;
};

module.exports = {
  mockAnalytics,
  generateQualityTrends
};
