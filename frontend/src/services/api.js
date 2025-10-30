import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    console.error('API Error:', error);
    
    // Handle different error types
    if (error.code === 'ECONNABORTED') {
      // Timeout error
      return Promise.reject({
        message: 'Request timeout. Please try again.',
        type: 'timeout'
      });
    }
    
    if (!error.response) {
      // Network error
      return Promise.reject({
        message: 'Network error. Please check your connection.',
        type: 'network'
      });
    }
    
    const { status, data } = error.response;
    
    // Handle specific status codes
    switch (status) {
      case 400:
        return Promise.reject({
          message: data?.error || 'Invalid request',
          type: 'validation',
          details: data?.details
        });
      
      case 401:
        // Handle unauthorized
        localStorage.removeItem('authToken');
        return Promise.reject({
          message: 'Authentication required',
          type: 'auth'
        });
      
      case 403:
        return Promise.reject({
          message: 'Access denied',
          type: 'permission'
        });
      
      case 404:
        return Promise.reject({
          message: data?.error || 'Resource not found',
          type: 'not_found'
        });
      
      case 429:
        return Promise.reject({
          message: 'Too many requests. Please wait and try again.',
          type: 'rate_limit'
        });
      
      case 500:
      case 502:
      case 503:
      case 504:
        return Promise.reject({
          message: 'Server error. Please try again later.',
          type: 'server'
        });
      
      default:
        return Promise.reject({
          message: data?.error || 'An unexpected error occurred',
          type: 'unknown'
        });
    }
  }
);

// API endpoints
export const experimentsAPI = {
  // Get all experiments
  getAll: () => api.get('/experiments'),
  
  // Get experiment by ID
  getById: (id) => api.get(`/experiments/${id}`),
  
  // Create new experiment
  create: (data) => api.post('/experiments', data),
  
  // Update experiment
  update: (id, data) => api.put(`/experiments/${id}`, data),
  
  // Delete experiment
  delete: (id) => api.delete(`/experiments/${id}`),
};

export const responsesAPI = {
  // Generate responses for an experiment
  generate: (data) => api.post('/responses/generate', data),
  
  // Get responses for an experiment
  getByExperiment: (experimentId) => api.get(`/responses/${experimentId}`),
  
  // Get single response
  getById: (id) => api.get(`/responses/single/${id}`),
};

export const metricsAPI = {
  // Calculate metrics for a response
  calculate: (responseId) => api.get(`/metrics/${responseId}`),
  
  // Calculate metrics for multiple responses
  calculateBatch: (responses) => api.post('/metrics/batch', { responses }),
  
  // Get metrics comparison
  compare: (responseIds) => api.post('/metrics/compare', { responseIds }),
};

export const exportAPI = {
  // Export experiment data
  exportExperiment: (experimentId, format = 'json') => 
    api.get(`/export/${experimentId}`, { params: { format } }),
  
  // Export as CSV
  exportCSV: (experimentId) => 
    api.get(`/export/${experimentId}/csv`, { responseType: 'blob' }),
  
  // Export multiple experiments
  exportBatch: (experimentIds, format = 'json') => 
    api.post('/export/batch', { experimentIds, format }),
};

// Health check
export const healthCheck = () => api.get('/health');

export default api;
