/**
 * Mock Batch Experiments Data
 * 
 * This module provides mock data for batch experiments in the LLM-LAB system.
 * Batch experiments allow testing multiple parameter combinations simultaneously
 * to find optimal settings for specific use cases.
 */

const mockBatchExperiments = [
  {
    id: 42,
    name: "Response Quality Parameter Sweep",
    description: "Testing multiple parameter combinations for Response Quality with comprehensive analysis",
    prompt: "Write a compelling short story about AI discovering emotions for the first time. Focus on the moment of realization and the internal struggle between logic and feeling.",
    model: "gpt-4",
    parameter_grid: {
      temperature: {
        min: 0.2,
        max: 1.0,
        step: 0.2
      },
      top_p: {
        min: 0.7,
        max: 1.0,
        step: 0.1
      },
      max_tokens: 1000,
      frequency_penalty: 0.0,
      presence_penalty: 0.0
    },
    responses_per_combination: 3,
    priority: "normal",
    status: "completed",
    total_combinations: 20,
    total_responses: 60,
    estimated_cost: 2.34,
    estimated_duration: "45m",
    actual_cost: 2.18,
    actual_duration: "42m",
    created_at: "2024-10-30T12:00:00Z",
    updated_at: "2024-10-30T12:42:00Z",
    completed_at: "2024-10-30T12:42:00Z",
    queue_position: null,
    progress: {
      completed_combinations: 20,
      total_combinations: 20,
      completed_responses: 60,
      total_responses: 60,
      percentage: 100,
      current_combination: null,
      eta_minutes: 0
    },
    results_preview: {
      best_quality: 96.7,
      average_quality: 87.3,
      best_combination: {
        temperature: 0.8,
        top_p: 0.9,
        quality: 96.7
      }
    },
    insights: [
      "Higher temperature (0.8-0.9) significantly improves creativity",
      "Top_p values above 0.85 show diminishing returns",
      "Sweet spot identified: temperature=0.8, top_p=0.9"
    ]
  },
  {
    id: 43,
    name: "Technical Writing Optimization",
    description: "Finding optimal parameters for technical documentation generation",
    prompt: "Generate comprehensive API documentation for a REST endpoint including parameters, response formats, and examples.",
    model: "gpt-3.5-turbo",
    parameter_grid: {
      temperature: {
        min: 0.1,
        max: 0.5,
        step: 0.1
      },
      top_p: {
        min: 0.6,
        max: 0.9,
        step: 0.1
      },
      max_tokens: 2000,
      frequency_penalty: 0.1,
      presence_penalty: 0.0
    },
    responses_per_combination: 2,
    priority: "high",
    status: "running",
    total_combinations: 20,
    total_responses: 40,
    estimated_cost: 1.56,
    estimated_duration: "30m",
    actual_cost: 0.89,
    actual_duration: null,
    created_at: "2024-10-30T13:15:00Z",
    updated_at: "2024-10-30T13:35:00Z",
    completed_at: null,
    queue_position: null,
    progress: {
      completed_combinations: 12,
      total_combinations: 20,
      completed_responses: 24,
      total_responses: 40,
      percentage: 60,
      current_combination: {
        temperature: 0.3,
        top_p: 0.8
      },
      eta_minutes: 12
    },
    results_preview: {
      best_quality: 92.1,
      average_quality: 85.7,
      best_combination: {
        temperature: 0.2,
        top_p: 0.8,
        quality: 92.1
      }
    },
    insights: [
      "Lower temperature values improve technical accuracy",
      "Top_p around 0.8 provides best balance",
      "Frequency penalty helps reduce repetition"
    ]
  },
  {
    id: 44,
    name: "Creative Writing Model Comparison",
    description: "Comparing different models across various creative writing tasks",
    prompt: "Write a poem about the intersection of technology and nature, exploring themes of harmony and conflict.",
    model: "claude-3-opus",
    parameter_grid: {
      temperature: {
        min: 0.7,
        max: 1.0,
        step: 0.1
      },
      top_p: {
        min: 0.85,
        max: 0.95,
        step: 0.05
      },
      max_tokens: 800,
      frequency_penalty: 0.2,
      presence_penalty: 0.1
    },
    responses_per_combination: 3,
    priority: "normal",
    status: "queued",
    total_combinations: 12,
    total_responses: 36,
    estimated_cost: 1.89,
    estimated_duration: "25m",
    actual_cost: 0.0,
    actual_duration: null,
    created_at: "2024-10-30T14:00:00Z",
    updated_at: "2024-10-30T14:00:00Z",
    completed_at: null,
    queue_position: 2,
    progress: {
      completed_combinations: 0,
      total_combinations: 12,
      completed_responses: 0,
      total_responses: 36,
      percentage: 0,
      current_combination: null,
      eta_minutes: 25
    },
    results_preview: {
      best_quality: null,
      average_quality: null,
      best_combination: null
    },
    insights: []
  },
  {
    id: 45,
    name: "Code Generation Benchmark",
    description: "Evaluating code generation quality across different programming languages",
    prompt: "Generate a Python function that implements a binary search algorithm with proper error handling and documentation.",
    model: "gpt-4",
    parameter_grid: {
      temperature: {
        min: 0.1,
        max: 0.4,
        step: 0.1
      },
      top_p: {
        min: 0.6,
        max: 0.8,
        step: 0.1
      },
      max_tokens: 1500,
      frequency_penalty: 0.0,
      presence_penalty: 0.0
    },
    responses_per_combination: 3,
    priority: "low",
    status: "failed",
    total_combinations: 12,
    total_responses: 36,
    estimated_cost: 2.1,
    estimated_duration: "35m",
    actual_cost: 0.67,
    actual_duration: "15m",
    created_at: "2024-10-29T16:30:00Z",
    updated_at: "2024-10-29T16:45:00Z",
    completed_at: null,
    queue_position: null,
    progress: {
      completed_combinations: 5,
      total_combinations: 12,
      completed_responses: 15,
      total_responses: 36,
      percentage: 42,
      current_combination: null,
      eta_minutes: 0
    },
    results_preview: {
      best_quality: 88.4,
      average_quality: 79.2,
      best_combination: {
        temperature: 0.2,
        top_p: 0.7,
        quality: 88.4
      }
    },
    insights: [
      "Lower temperature critical for code accuracy",
      "Model struggled with complex error handling",
      "Need to adjust prompt for better results"
    ],
    error_message: "Generation failed due to rate limiting. Please retry."
  }
];

/**
 * Mock batch experiment results data
 */
const mockBatchResults = {
  42: {
    batch_id: 42,
    summary: {
      total_combinations: 20,
      completed_combinations: 20,
      best_quality: 96.7,
      average_quality: 87.3,
      worst_quality: 72.1,
      total_cost: 2.18,
      total_duration: "42m"
    },
    results: [
      {
        combination_id: 1,
        parameters: {
          temperature: 0.8,
          top_p: 0.9,
          max_tokens: 1000
        },
        average_quality: 96.7,
        quality_std: 2.1,
        responses: [
          {
            iteration: 1,
            response_id: 445,
            quality: 96.2,
            cost: 0.023
          },
          {
            iteration: 2,
            response_id: 446,
            quality: 97.1,
            cost: 0.024
          },
          {
            iteration: 3,
            response_id: 447,
            quality: 96.8,
            cost: 0.023
          }
        ],
        metrics_breakdown: {
          coherence: 94.2,
          completeness: 96.1,
          readability: 89.7,
          creativity: 98.3,
          specificity: 87.9,
          length_appropriateness: 93.2
        },
        performance: {
          average_response_time: 3100,
          total_cost: 0.07
        }
      },
      {
        combination_id: 2,
        parameters: {
          temperature: 0.6,
          top_p: 0.9,
          max_tokens: 1000
        },
        average_quality: 89.4,
        quality_std: 3.2,
        responses: [
          {
            iteration: 1,
            response_id: 448,
            quality: 88.1,
            cost: 0.021
          },
          {
            iteration: 2,
            response_id: 449,
            quality: 91.2,
            cost: 0.022
          },
          {
            iteration: 3,
            response_id: 450,
            quality: 88.9,
            cost: 0.021
          }
        ],
        metrics_breakdown: {
          coherence: 91.7,
          completeness: 89.8,
          readability: 92.1,
          creativity: 85.6,
          specificity: 90.3,
          length_appropriateness: 90.1
        },
        performance: {
          average_response_time: 2850,
          total_cost: 0.064
        }
      }
    ],
    analysis: {
      best_parameters: {
        temperature: 0.8,
        top_p: 0.9
      },
      parameter_correlations: {
        temperature_vs_creativity: 0.87,
        top_p_vs_diversity: 0.64
      },
      insights: [
        "Temperature strongly correlates with creativity scores",
        "Optimal range: temperature 0.7-0.9, top_p 0.85-0.95"
      ]
    }
  }
};

/**
 * Get paginated batch experiments
 * @param {number} page - Page number
 * @param {number} limit - Items per page
 * @param {object} filters - Filter options
 * @returns {object} Paginated batch experiments
 */
function getPaginatedBatchExperiments(page = 1, limit = 20, filters = {}) {
  let filteredExperiments = [...mockBatchExperiments];
  
  // Apply filters
  if (filters.status) {
    filteredExperiments = filteredExperiments.filter(exp => exp.status === filters.status);
  }
  
  if (filters.priority) {
    filteredExperiments = filteredExperiments.filter(exp => exp.priority === filters.priority);
  }
  
  if (filters.model) {
    filteredExperiments = filteredExperiments.filter(exp => exp.model === filters.model);
  }
  
  // Apply sorting by created_at (newest first)
  filteredExperiments.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  
  // Calculate pagination
  const total = filteredExperiments.length;
  const totalPages = Math.ceil(total / limit);
  const startIndex = (page - 1) * limit;
  const batch_experiments = filteredExperiments.slice(startIndex, startIndex + limit);
  
  return {
    batch_experiments,
    pagination: {
      page,
      limit,
      total,
      total_pages: totalPages,
      has_next: page < totalPages,
      has_previous: page > 1
    }
  };
}

/**
 * Find batch experiment by ID
 * @param {number} id - Batch experiment ID
 * @returns {object|null} Batch experiment or null
 */
function findBatchExperimentById(id) {
  return mockBatchExperiments.find(exp => exp.id === parseInt(id));
}

/**
 * Add new batch experiment
 * @param {object} experimentData - Batch experiment data
 * @returns {object} Created batch experiment
 */
function addBatchExperiment(experimentData) {
  const newId = Math.max(...mockBatchExperiments.map(exp => exp.id)) + 1;
  
  // Calculate total combinations
  const tempRange = experimentData.parameter_grid.temperature;
  const topPRange = experimentData.parameter_grid.top_p;
  
  const tempCount = tempRange ? Math.floor((tempRange.max - tempRange.min) / tempRange.step) + 1 : 1;
  const topPCount = topPRange ? Math.floor((topPRange.max - topPRange.min) / topPRange.step) + 1 : 1;
  
  const totalCombinations = tempCount * topPCount;
  const totalResponses = totalCombinations * (experimentData.responses_per_combination || 1);
  
  const newExperiment = {
    id: newId,
    ...experimentData,
    status: 'queued',
    total_combinations: totalCombinations,
    total_responses: totalResponses,
    estimated_cost: totalResponses * 0.025, // Mock cost calculation
    estimated_duration: `${Math.ceil(totalResponses * 0.5)}m`, // Mock duration
    actual_cost: 0,
    actual_duration: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    completed_at: null,
    queue_position: mockBatchExperiments.filter(exp => exp.status === 'queued').length + 1,
    progress: {
      completed_combinations: 0,
      total_combinations: totalCombinations,
      completed_responses: 0,
      total_responses: totalResponses,
      percentage: 0,
      current_combination: null,
      eta_minutes: Math.ceil(totalResponses * 0.5)
    },
    results_preview: {
      best_quality: null,
      average_quality: null,
      best_combination: null
    },
    insights: []
  };
  
  mockBatchExperiments.push(newExperiment);
  return newExperiment;
}

/**
 * Get batch experiment results
 * @param {number} id - Batch experiment ID
 * @param {object} options - Query options
 * @returns {object|null} Batch results or null
 */
function getBatchExperimentResults(id, options = {}) {
  const { page = 1, limit = 20, sort_by = 'quality', min_quality, max_quality } = options;
  
  const results = mockBatchResults[id];
  if (!results) return null;
  
  let filteredResults = [...results.results];
  
  // Apply quality filters
  if (min_quality !== undefined) {
    filteredResults = filteredResults.filter(result => result.average_quality >= min_quality);
  }
  
  if (max_quality !== undefined) {
    filteredResults = filteredResults.filter(result => result.average_quality <= max_quality);
  }
  
  // Apply sorting
  if (sort_by === 'quality') {
    filteredResults.sort((a, b) => b.average_quality - a.average_quality);
  }
  
  // Calculate pagination
  const total = filteredResults.length;
  const totalPages = Math.ceil(total / limit);
  const startIndex = (page - 1) * limit;
  const paginatedResults = filteredResults.slice(startIndex, startIndex + limit);
  
  return {
    ...results,
    results: paginatedResults,
    pagination: {
      page,
      limit,
      total,
      total_pages: totalPages,
      has_next: page < totalPages,
      has_previous: page > 1
    }
  };
}

module.exports = {
  mockBatchExperiments,
  mockBatchResults,
  getPaginatedBatchExperiments,
  findBatchExperimentById,
  addBatchExperiment,
  getBatchExperimentResults
};
