/**
 * Mock Experiments Data
 * 
 * This module provides mock data for experiments in the LLM-LAB system.
 * It includes comprehensive experiment objects with all required fields
 * as specified in the API documentation.
 */

const mockExperiments = [
  {
    id: 1,
    name: "Response Quality Optimization",
    description: "Testing parameters for creative content generation with various temperature and top_p settings",
    type: "single",
    status: "completed",
    model: "gpt-4",
    prompt: "Write a compelling short story about AI discovering emotions for the first time. Focus on the moment of realization and the internal struggle between logic and feeling.",
    parameters: {
      temperature: 0.8,
      top_p: 0.9,
      max_tokens: 1000,
      frequency_penalty: 0.0,
      presence_penalty: 0.0
    },
    parameter_ranges: {
      temperature_min: 0.8,
      temperature_max: 0.8,
      temperature_step: 0.1,
      top_p_min: 0.9,
      top_p_max: 0.9,
      top_p_step: 0.1
    },
    quality_score: 94.2,
    response_count: 1,
    total_cost: 0.023,
    duration: "3.2s",
    created_at: "2024-10-30T10:15:00Z",
    updated_at: "2024-10-30T10:18:00Z",
    tags: ["creative", "storytelling", "emotions"],
    favorited: true,
    archived: false
  },
  {
    id: 2,
    name: "Technical Documentation Analysis",
    description: "Evaluating model performance on technical documentation generation",
    type: "batch",
    status: "running",
    model: "gpt-3.5-turbo",
    prompt: "Generate comprehensive API documentation for a REST endpoint including parameters, response formats, and examples.",
    parameters: {
      temperature: 0.3,
      top_p: 0.8,
      max_tokens: 2000,
      frequency_penalty: 0.1,
      presence_penalty: 0.0
    },
    parameter_ranges: {
      temperature_min: 0.1,
      temperature_max: 0.5,
      temperature_step: 0.1,
      top_p_min: 0.7,
      top_p_max: 0.9,
      top_p_step: 0.1
    },
    quality_score: 87.5,
    response_count: 15,
    total_cost: 0.245,
    duration: "45.8s",
    created_at: "2024-10-30T09:30:00Z",
    updated_at: "2024-10-30T10:45:00Z",
    tags: ["technical", "documentation", "api"],
    favorited: false,
    archived: false
  },
  {
    id: 3,
    name: "Creative Writing Comparison",
    description: "Comparing different models for creative writing tasks",
    type: "single",
    status: "completed",
    model: "claude-3-opus",
    prompt: "Write a poem about the intersection of technology and nature, exploring themes of harmony and conflict.",
    parameters: {
      temperature: 0.9,
      top_p: 0.95,
      max_tokens: 800,
      frequency_penalty: 0.2,
      presence_penalty: 0.1
    },
    parameter_ranges: {
      temperature_min: 0.9,
      temperature_max: 0.9,
      temperature_step: 0.1,
      top_p_min: 0.95,
      top_p_max: 0.95,
      top_p_step: 0.1
    },
    quality_score: 91.8,
    response_count: 1,
    total_cost: 0.018,
    duration: "2.7s",
    created_at: "2024-10-29T16:20:00Z",
    updated_at: "2024-10-29T16:23:00Z",
    tags: ["creative", "poetry", "nature"],
    favorited: true,
    archived: false
  },
  {
    id: 4,
    name: "Code Generation Test",
    description: "Testing code generation capabilities across different programming languages",
    type: "batch",
    status: "failed",
    model: "gpt-4",
    prompt: "Generate a Python function that implements a binary search algorithm with proper error handling and documentation.",
    parameters: {
      temperature: 0.2,
      top_p: 0.7,
      max_tokens: 1500,
      frequency_penalty: 0.0,
      presence_penalty: 0.0
    },
    parameter_ranges: {
      temperature_min: 0.1,
      temperature_max: 0.3,
      temperature_step: 0.1,
      top_p_min: 0.6,
      top_p_max: 0.8,
      top_p_step: 0.1
    },
    quality_score: 76.3,
    response_count: 8,
    total_cost: 0.156,
    duration: "28.4s",
    created_at: "2024-10-29T14:10:00Z",
    updated_at: "2024-10-29T14:38:00Z",
    tags: ["coding", "python", "algorithms"],
    favorited: false,
    archived: false
  },
  {
    id: 5,
    name: "Conversational AI Evaluation",
    description: "Evaluating conversational abilities and context retention",
    type: "single",
    status: "draft",
    model: "gpt-4",
    prompt: "You are a helpful AI assistant. Engage in a natural conversation about planning a vacation to Japan, asking relevant follow-up questions.",
    parameters: {
      temperature: 0.7,
      top_p: 0.9,
      max_tokens: 1200,
      frequency_penalty: 0.1,
      presence_penalty: 0.1
    },
    parameter_ranges: {
      temperature_min: 0.7,
      temperature_max: 0.7,
      temperature_step: 0.1,
      top_p_min: 0.9,
      top_p_max: 0.9,
      top_p_step: 0.1
    },
    quality_score: null,
    response_count: 0,
    total_cost: 0.0,
    duration: null,
    created_at: "2024-10-30T11:00:00Z",
    updated_at: "2024-10-30T11:00:00Z",
    tags: ["conversation", "travel", "japan"],
    favorited: false,
    archived: false
  }
];

/**
 * Helper function to get paginated experiments
 * @param {number} page - Page number (1-based)
 * @param {number} limit - Number of items per page
 * @param {object} filters - Filter options
 * @returns {object} Paginated experiments with metadata
 */
function getPaginatedExperiments(page = 1, limit = 20, filters = {}) {
  let filteredExperiments = [...mockExperiments];
  
  // Apply filters
  if (filters.search) {
    const searchTerm = filters.search.toLowerCase();
    filteredExperiments = filteredExperiments.filter(exp => 
      exp.name.toLowerCase().includes(searchTerm) ||
      exp.description.toLowerCase().includes(searchTerm)
    );
  }
  
  if (filters.type) {
    filteredExperiments = filteredExperiments.filter(exp => exp.type === filters.type);
  }
  
  if (filters.status) {
    filteredExperiments = filteredExperiments.filter(exp => exp.status === filters.status);
  }
  
  if (filters.model) {
    filteredExperiments = filteredExperiments.filter(exp => exp.model === filters.model);
  }
  
  if (filters.date_from) {
    filteredExperiments = filteredExperiments.filter(exp => 
      new Date(exp.created_at) >= new Date(filters.date_from)
    );
  }
  
  if (filters.date_to) {
    filteredExperiments = filteredExperiments.filter(exp => 
      new Date(exp.created_at) <= new Date(filters.date_to)
    );
  }
  
  // Apply sorting
  if (filters.sort_by) {
    const sortField = filters.sort_by;
    const sortOrder = filters.sort_order === 'desc' ? -1 : 1;
    
    filteredExperiments.sort((a, b) => {
      if (sortField === 'created_at') {
        return sortOrder * (new Date(a.created_at) - new Date(b.created_at));
      } else if (sortField === 'quality') {
        return sortOrder * ((a.quality_score || 0) - (b.quality_score || 0));
      } else if (sortField === 'name') {
        return sortOrder * a.name.localeCompare(b.name);
      }
      return 0;
    });
  }
  
  // Calculate pagination
  const total = filteredExperiments.length;
  const totalPages = Math.ceil(total / limit);
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const experiments = filteredExperiments.slice(startIndex, endIndex);
  
  return {
    experiments,
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
 * Find experiment by ID
 * @param {number} id - Experiment ID
 * @returns {object|null} Experiment object or null if not found
 */
function findExperimentById(id) {
  return mockExperiments.find(exp => exp.id === parseInt(id));
}

/**
 * Generate a new experiment ID
 * @returns {number} New unique ID
 */
function generateNewId() {
  return Math.max(...mockExperiments.map(exp => exp.id)) + 1;
}

/**
 * Add a new experiment to the mock data
 * @param {object} experimentData - New experiment data
 * @returns {object} Created experiment
 */
function addExperiment(experimentData) {
  const newExperiment = {
    id: generateNewId(),
    ...experimentData,
    status: 'draft',
    quality_score: null,
    response_count: 0,
    total_cost: 0.0,
    duration: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    favorited: false,
    archived: false
  };
  
  mockExperiments.push(newExperiment);
  return newExperiment;
}

/**
 * Update an existing experiment
 * @param {number} id - Experiment ID
 * @param {object} updateData - Data to update
 * @returns {object|null} Updated experiment or null if not found
 */
function updateExperiment(id, updateData) {
  const index = mockExperiments.findIndex(exp => exp.id === parseInt(id));
  if (index === -1) return null;
  
  mockExperiments[index] = {
    ...mockExperiments[index],
    ...updateData,
    updated_at: new Date().toISOString()
  };
  
  return mockExperiments[index];
}

/**
 * Delete an experiment
 * @param {number} id - Experiment ID
 * @returns {boolean} True if deleted, false if not found
 */
function deleteExperiment(id) {
  const index = mockExperiments.findIndex(exp => exp.id === parseInt(id));
  if (index === -1) return false;
  
  mockExperiments.splice(index, 1);
  return true;
}

module.exports = {
  mockExperiments,
  getPaginatedExperiments,
  findExperimentById,
  generateNewId,
  addExperiment,
  updateExperiment,
  deleteExperiment
};
