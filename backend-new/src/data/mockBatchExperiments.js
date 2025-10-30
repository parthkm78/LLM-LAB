// Mock batch experiments data
const mockBatchExperiments = [
  {
    id: 1,
    name: "Creative Writing Parameter Sweep",
    description: "Testing multiple parameter combinations for creative writing across different temperature and top_p values to identify optimal settings",
    prompt: "Write a creative short story about artificial intelligence discovering emotions for the first time. The story should be engaging, original, and thought-provoking.",
    model: "gpt-4",
    parameter_ranges: {
      temperature: { min: 0.1, max: 1.0, step: 0.1 },
      top_p: { min: 0.7, max: 1.0, step: 0.1 },
      max_tokens: { values: [500, 1000, 1500, 2000] }
    },
    status: "completed",
    progress: 100,
    total_combinations: 120,
    completed_combinations: 120,
    failed_combinations: 0,
    priority: "normal",
    user_id: 1,
    results_summary: {
      best_quality: 96.2,
      average_quality: 87.5,
      optimal_parameters: {
        temperature: 0.8,
        top_p: 0.9,
        max_tokens: 1500
      },
      total_cost: 0.54,
      total_tokens: 65000,
      average_response_time: 2.3
    },
    insights: [
      "Higher temperature (0.8-0.9) significantly improves creativity scores while maintaining coherence",
      "Top_p values above 0.85 show diminishing returns on overall quality metrics",
      "Sweet spot identified: temperature=0.8, top_p=0.9 for creative writing tasks",
      "Max tokens between 1000-1500 provide optimal completeness without unnecessary verbosity"
    ],
    start_time: "2024-10-29T08:00:00.000Z",
    end_time: "2024-10-29T10:30:00.000Z",
    estimated_completion: null,
    created_at: "2024-10-29T07:45:00.000Z",
    updated_at: "2024-10-29T10:30:00.000Z"
  },
  {
    id: 2,
    name: "Technical Documentation Analysis",
    description: "Evaluating parameter effectiveness for technical explanation tasks with focus on clarity and accuracy",
    prompt: "Explain the concept of neural networks in simple terms that a beginner can understand, including key components and how they work.",
    model: "gpt-4",
    parameter_ranges: {
      temperature: { min: 0.1, max: 0.7, step: 0.1 },
      top_p: { min: 0.7, max: 0.95, step: 0.05 },
      max_tokens: { values: [600, 800, 1000, 1200] }
    },
    status: "running",
    progress: 65,
    total_combinations: 96,
    completed_combinations: 62,
    failed_combinations: 1,
    priority: "high",
    user_id: 1,
    results_summary: {
      best_quality: 95.1,
      average_quality: 89.2,
      optimal_parameters: {
        temperature: 0.3,
        top_p: 0.8,
        max_tokens: 800
      },
      total_cost: 0.31,
      total_tokens: 38500,
      average_response_time: 1.8
    },
    insights: [
      "Lower temperature values (0.2-0.4) produce more consistent technical explanations",
      "Top_p around 0.8 provides optimal balance between creativity and accuracy",
      "Technical content benefits from moderate token limits (600-1000 tokens)"
    ],
    start_time: "2024-10-30T09:00:00.000Z",
    end_time: null,
    estimated_completion: "2024-10-30T12:15:00.000Z",
    created_at: "2024-10-30T08:45:00.000Z",
    updated_at: "2024-10-30T11:30:00.000Z"
  },
  {
    id: 3,
    name: "Conversational AI Optimization",
    description: "Testing parameters for supportive and helpful conversational responses across different scenarios",
    prompt: "You are a helpful AI assistant. A user asks for advice about managing work stress and time management. Provide a supportive and practical response.",
    model: "claude-3.5-sonnet",
    parameter_ranges: {
      temperature: { min: 0.5, max: 0.9, step: 0.1 },
      top_p: { min: 0.85, max: 1.0, step: 0.05 },
      max_tokens: { values: [400, 600, 800] }
    },
    status: "queued",
    progress: 0,
    total_combinations: 45,
    completed_combinations: 0,
    failed_combinations: 0,
    priority: "normal",
    user_id: 1,
    results_summary: null,
    insights: [],
    start_time: null,
    end_time: null,
    estimated_completion: "2024-10-30T16:00:00.000Z",
    created_at: "2024-10-30T11:00:00.000Z",
    updated_at: "2024-10-30T11:00:00.000Z"
  }
];

// Generate mock results for batch experiments
const generateBatchResults = (batchId, totalCombinations) => {
  const results = [];
  const temperatureValues = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0];
  const topPValues = [0.7, 0.75, 0.8, 0.85, 0.9, 0.95, 1.0];
  const maxTokensValues = [500, 1000, 1500, 2000];
  
  for (let i = 0; i < totalCombinations; i++) {
    const temperature = temperatureValues[i % temperatureValues.length];
    const top_p = topPValues[Math.floor(i / temperatureValues.length) % topPValues.length];
    const max_tokens = maxTokensValues[Math.floor(i / (temperatureValues.length * topPValues.length)) % maxTokensValues.length];
    
    // Generate quality scores with some correlation to parameters
    const creativityBonus = temperature > 0.7 ? 10 : 0;
    const coherenceBonus = temperature < 0.5 ? 8 : 0;
    const readabilityBonus = top_p > 0.8 && top_p < 0.95 ? 5 : 0;
    
    const baseQuality = 70 + Math.random() * 20;
    const overall_quality = Math.min(100, baseQuality + creativityBonus + coherenceBonus + readabilityBonus);
    
    results.push({
      combination_id: i + 1,
      batch_experiment_id: batchId,
      parameters: {
        temperature,
        top_p,
        max_tokens
      },
      average_quality: Math.round(overall_quality * 10) / 10,
      iterations: 3,
      responses: [
        {
          iteration: 1,
          quality: Math.round((overall_quality + (Math.random() - 0.5) * 4) * 10) / 10,
          response_id: i * 3 + 1,
          response_time: 1.5 + Math.random() * 2,
          cost: 0.008 + Math.random() * 0.004
        },
        {
          iteration: 2,
          quality: Math.round((overall_quality + (Math.random() - 0.5) * 4) * 10) / 10,
          response_id: i * 3 + 2,
          response_time: 1.5 + Math.random() * 2,
          cost: 0.008 + Math.random() * 0.004
        },
        {
          iteration: 3,
          quality: Math.round((overall_quality + (Math.random() - 0.5) * 4) * 10) / 10,
          response_id: i * 3 + 3,
          response_time: 1.5 + Math.random() * 2,
          cost: 0.008 + Math.random() * 0.004
        }
      ],
      metrics_breakdown: {
        coherence: Math.round((overall_quality - 5 + Math.random() * 10) * 10) / 10,
        creativity: Math.round((overall_quality + creativityBonus - 3 + Math.random() * 6) * 10) / 10,
        readability: Math.round((overall_quality + readabilityBonus - 2 + Math.random() * 4) * 10) / 10,
        completeness: Math.round((overall_quality - 3 + Math.random() * 6) * 10) / 10
      },
      created_at: new Date(Date.now() - (totalCombinations - i) * 60000).toISOString()
    });
  }
  
  return results.sort((a, b) => b.average_quality - a.average_quality);
};

const mockBatchResults = {
  1: generateBatchResults(1, 120),
  2: generateBatchResults(2, 62),
  3: []
};

module.exports = {
  mockBatchExperiments,
  mockBatchResults,
  generateBatchResults
};
