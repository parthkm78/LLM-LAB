import { useState, useEffect, useCallback } from 'react';
// Removed API imports - using mock data instead
// import { experimentsAPI, responsesAPI, metricsAPI } from '../services/api';

/**
 * Custom hook for managing experiments with MOCK DATA
 * API calls replaced with mock responses to prevent localhost:5000 calls
 * Handles CRUD operations, caching, and error states
 */
export const useExperiments = () => {
  const [experiments, setExperiments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedExperiment, setSelectedExperiment] = useState(null);

  // Mock experiments data
  const mockExperiments = [
    {
      id: 1,
      name: "GPT-4 vs Claude Comparison",
      status: "completed",
      created_at: "2024-10-30T10:00:00Z",
      parameters: { temperature: 0.7, max_tokens: 1000 },
      models: ["gpt-4", "claude-3.5-sonnet"],
      responses_count: 50,
      quality_score: 8.5
    },
    {
      id: 2,
      name: "Temperature Testing",
      status: "running",
      created_at: "2024-10-30T12:00:00Z",
      parameters: { temperature: 0.3, max_tokens: 500 },
      models: ["gpt-4"],
      responses_count: 25,
      quality_score: 7.8
    }
  ];

  // Load all experiments (MOCK - no API call)
  const loadExperiments = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      setExperiments(mockExperiments);
    } catch (err) {
      setError(err.message || 'Failed to load experiments');
      console.error('Load experiments error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load specific experiment by ID (MOCK - no API call)
  const loadExperiment = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));
      const experiment = mockExperiments.find(exp => exp.id === parseInt(id));
      if (experiment) {
        setSelectedExperiment(experiment);
        return experiment;
      } else {
        throw new Error('Experiment not found');
      }
    } catch (err) {
      setError(err.message || 'Failed to load experiment');
      console.error('Load experiment error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Create new experiment (MOCK - no API call)
  const createExperiment = useCallback(async (experimentData) => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const newExperiment = {
        id: Date.now(), // Mock ID
        name: experimentData.name || "New Experiment",
        status: "created",
        created_at: new Date().toISOString(),
        parameters: experimentData.parameters || {},
        models: experimentData.models || ["gpt-4"],
        responses_count: 0,
        quality_score: 0
      };
      
      setExperiments(prev => [newExperiment, ...prev]);
      return newExperiment;
    } catch (err) {
      setError(err.message || 'Failed to create experiment');
      console.error('Create experiment error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update experiment (MOCK - no API call)
  const updateExperiment = useCallback(async (id, updates) => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const updatedExperiment = { 
        ...mockExperiments.find(exp => exp.id === id),
        ...updates,
        updated_at: new Date().toISOString()
      };
      
      setExperiments(prev => 
        prev.map(exp => exp.id === id ? updatedExperiment : exp)
      );
      if (selectedExperiment?.id === id) {
        setSelectedExperiment(updatedExperiment);
      }
      return updatedExperiment;
    } catch (err) {
      setError(err.message || 'Failed to update experiment');
      console.error('Update experiment error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [selectedExperiment]);

  // Delete experiment (MOCK - no API call)
  const deleteExperiment = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setExperiments(prev => prev.filter(exp => exp.id !== id));
      if (selectedExperiment?.id === id) {
        setSelectedExperiment(null);
      }
    } catch (err) {
      setError(err.message || 'Failed to delete experiment');
      console.error('Delete experiment error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [selectedExperiment]);

  // Generate responses for experiment (MOCK - no API call)
  const generateResponses = useCallback(async (experimentId, config) => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockResponse = {
        id: Date.now(),
        experiment_id: experimentId,
        status: "completed",
        responses: [
          {
            id: 1,
            text: "This is a mock response from GPT-4",
            model: "gpt-4",
            quality_score: 8.5,
            parameters: config
          },
          {
            id: 2,
            text: "This is a mock response from Claude",
            model: "claude-3.5-sonnet",
            quality_score: 8.2,
            parameters: config
          }
        ],
        metrics: {
          average_quality: 8.35,
          response_count: 2,
          completion_time: "2.5s"
        }
      };
      
      // Reload experiment to get updated data
      if (selectedExperiment?.id === experimentId) {
        await loadExperiment(experimentId);
      }
      
      return mockResponse;
    } catch (err) {
      setError(err.message || 'Failed to generate responses');
      console.error('Generate responses error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [selectedExperiment, loadExperiment]);

  // Get experiment statistics (MOCK - no API call)
  const getExperimentStats = useCallback(async (id) => {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const mockStats = {
        id: id,
        total_responses: 50,
        average_quality: 8.2,
        completion_rate: 95,
        models_tested: ["gpt-4", "claude-3.5-sonnet"],
        response_times: {
          average: "1.2s",
          fastest: "0.8s", 
          slowest: "2.1s"
        },
        quality_breakdown: {
          excellent: 25,
          good: 20,
          average: 5,
          poor: 0
        }
      };
      
      return mockStats;
    } catch (err) {
      console.error('Get experiment stats error:', err);
      return null;
    }
  }, []);

  // Load experiments on mount
  useEffect(() => {
    loadExperiments();
  }, [loadExperiments]);

  // Clear errors after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  return {
    // State
    experiments,
    loading,
    error,
    selectedExperiment,
    
    // Actions
    loadExperiments,
    loadExperiment,
    createExperiment,
    updateExperiment,
    deleteExperiment,
    generateResponses,
    getExperimentStats,
    setSelectedExperiment,
    
    // Utility
    clearError: () => setError(null)
  };
};

/**
 * Hook for managing batch experiments (MOCK VERSION)
 */
export const useBatchExperiments = () => {
  const [batchJobs, setBatchJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Create batch experiment (MOCK - no API call)
  const createBatchExperiment = useCallback(async (config) => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockBatchResponse = {
        id: Date.now(),
        type: 'batch',
        status: 'running',
        created_at: new Date().toISOString(),
        config: config,
        progress: 0,
        estimated_completion: new Date(Date.now() + 300000).toISOString(), // 5 mins from now
        experiments_count: config.experiments?.length || 5
      };
      
      setBatchJobs(prev => [mockBatchResponse, ...prev]);
      return mockBatchResponse;
    } catch (err) {
      setError(err.message || 'Failed to create batch experiment');
      console.error('Create batch experiment error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get batch job status (MOCK - no API call)
  const getBatchStatus = useCallback(async (jobId) => {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const mockStatus = {
        id: jobId,
        status: 'completed',
        progress: 100,
        completed_experiments: 5,
        failed_experiments: 0,
        results_summary: {
          best_model: 'gpt-4',
          average_quality: 8.4,
          total_responses: 250
        }
      };
      
      return mockStatus;
    } catch (err) {
      console.error('Get batch status error:', err);
      return null;
    }
  }, []);

  return {
    batchJobs,
    loading,
    error,
    createBatchExperiment,
    getBatchStatus,
    clearError: () => setError(null)
  };
};

/**
 * Hook for managing quality metrics (MOCK VERSION)
 */
export const useQualityMetrics = () => {
  const [metrics, setMetrics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Calculate metrics for response (MOCK - no API call)
  const calculateMetrics = useCallback(async (responseId) => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const mockMetrics = {
        id: responseId,
        quality_score: Math.random() * 2 + 8, // 8-10 range
        readability: Math.random() * 2 + 8,
        coherence: Math.random() * 2 + 7.5,
        relevance: Math.random() * 2 + 8.5,
        creativity: Math.random() * 2 + 7,
        word_count: Math.floor(Math.random() * 200) + 100,
        sentiment_score: Math.random() * 2 - 1, // -1 to 1
        complexity_level: Math.floor(Math.random() * 5) + 1 // 1-5
      };
      
      return mockMetrics;
    } catch (err) {
      setError(err.message || 'Failed to calculate metrics');
      console.error('Calculate metrics error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Calculate metrics for batch (MOCK - no API call)
  const calculateBatchMetrics = useCallback(async (responses) => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const mockBatchResults = responses.map((response, index) => ({
        id: response.id || index,
        response_id: response.id,
        quality_score: Math.random() * 2 + 8,
        readability: Math.random() * 2 + 8,
        coherence: Math.random() * 2 + 7.5,
        relevance: Math.random() * 2 + 8.5,
        creativity: Math.random() * 2 + 7,
        word_count: Math.floor(Math.random() * 200) + 100,
        calculated_at: new Date().toISOString()
      }));
      
      setMetrics(mockBatchResults);
      return mockBatchResults;
    } catch (err) {
      setError(err.message || 'Failed to calculate batch metrics');
      console.error('Calculate batch metrics error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Compare responses (MOCK - no API call)
  const compareResponses = useCallback(async (responseIds) => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 600));
      
      const mockComparison = {
        comparison_id: Date.now(),
        responses: responseIds.map(id => ({
          id: id,
          quality_score: Math.random() * 2 + 8,
          strengths: ["Clear structure", "Good vocabulary", "Engaging tone"],
          weaknesses: ["Could be more concise", "Minor grammatical issues"],
          rank: Math.floor(Math.random() * responseIds.length) + 1
        })),
        summary: {
          best_response: responseIds[0],
          average_quality: 8.3,
          quality_variance: 0.5,
          recommendation: "Response A shows the highest overall quality with excellent coherence and readability."
        }
      };
      
      return mockComparison;
    } catch (err) {
      setError(err.message || 'Failed to compare responses');
      console.error('Compare responses error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    metrics,
    loading,
    error,
    calculateMetrics,
    calculateBatchMetrics,
    compareResponses,
    clearError: () => setError(null)
  };
};
