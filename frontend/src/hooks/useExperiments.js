import { useState, useEffect, useCallback } from 'react';
import { experimentsAPI, responsesAPI, metricsAPI } from '../services/api';

/**
 * Custom hook for managing experiments with real API calls
 * Handles CRUD operations, caching, and error states
 */
export const useExperiments = () => {
  const [experiments, setExperiments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedExperiment, setSelectedExperiment] = useState(null);

  // Load all experiments
  const loadExperiments = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await experimentsAPI.getAll();
      setExperiments(data.experiments || []);
    } catch (err) {
      setError(err.message || 'Failed to load experiments');
      console.error('Load experiments error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load specific experiment by ID
  const loadExperiment = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await experimentsAPI.getById(id);
      setSelectedExperiment(data);
      return data;
    } catch (err) {
      setError(err.message || 'Failed to load experiment');
      console.error('Load experiment error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Create new experiment
  const createExperiment = useCallback(async (experimentData) => {
    setLoading(true);
    setError(null);
    
    try {
      const newExperiment = await experimentsAPI.create(experimentData);
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

  // Update experiment
  const updateExperiment = useCallback(async (id, updates) => {
    setLoading(true);
    setError(null);
    
    try {
      const updatedExperiment = await experimentsAPI.update(id, updates);
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

  // Delete experiment
  const deleteExperiment = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    
    try {
      await experimentsAPI.delete(id);
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

  // Generate responses for experiment
  const generateResponses = useCallback(async (experimentId, config) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await responsesAPI.generate({
        experiment_id: experimentId,
        ...config
      });
      
      // Reload experiment to get updated data
      if (selectedExperiment?.id === experimentId) {
        await loadExperiment(experimentId);
      }
      
      return response;
    } catch (err) {
      setError(err.message || 'Failed to generate responses');
      console.error('Generate responses error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [selectedExperiment, loadExperiment]);

  // Get experiment statistics
  const getExperimentStats = useCallback(async (id) => {
    try {
      const stats = await experimentsAPI.getById(`${id}/stats`);
      return stats;
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
 * Hook for managing batch experiments
 */
export const useBatchExperiments = () => {
  const [batchJobs, setBatchJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Create batch experiment
  const createBatchExperiment = useCallback(async (config) => {
    setLoading(true);
    setError(null);
    
    try {
      // This would call a batch experiment endpoint
      const response = await experimentsAPI.create({
        type: 'batch',
        ...config
      });
      
      setBatchJobs(prev => [response, ...prev]);
      return response;
    } catch (err) {
      setError(err.message || 'Failed to create batch experiment');
      console.error('Create batch experiment error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get batch job status
  const getBatchStatus = useCallback(async (jobId) => {
    try {
      const status = await experimentsAPI.getById(`${jobId}/status`);
      return status;
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
 * Hook for managing quality metrics
 */
export const useQualityMetrics = () => {
  const [metrics, setMetrics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Calculate metrics for response
  const calculateMetrics = useCallback(async (responseId) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await metricsAPI.calculate(responseId);
      return result;
    } catch (err) {
      setError(err.message || 'Failed to calculate metrics');
      console.error('Calculate metrics error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Calculate metrics for batch
  const calculateBatchMetrics = useCallback(async (responses) => {
    setLoading(true);
    setError(null);
    
    try {
      const results = await metricsAPI.calculateBatch(responses);
      setMetrics(results);
      return results;
    } catch (err) {
      setError(err.message || 'Failed to calculate batch metrics');
      console.error('Calculate batch metrics error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Compare responses
  const compareResponses = useCallback(async (responseIds) => {
    setLoading(true);
    setError(null);
    
    try {
      const comparison = await metricsAPI.compare(responseIds);
      return comparison;
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
