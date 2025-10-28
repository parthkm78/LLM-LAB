const express = require('express');
const router = express.Router();
const ExperimentModel = require('../models/Experiment');
const ResponseModel = require('../models/Response');
const QualityMetricModel = require('../models/QualityMetric');
const llmService = require('../services/llmService');
const qualityMetricsService = require('../services/qualityMetricsService');

// POST /api/responses/generate - Generate multiple LLM responses for an experiment
router.post('/generate', async (req, res) => {
  try {
    const { experiment_id, generate_all = false, specific_parameters = null } = req.body;
    
    if (!experiment_id) {
      return res.status(400).json({ error: 'Experiment ID is required' });
    }
    
    // Get experiment details
    const experiment = await ExperimentModel.findById(experiment_id);
    if (!experiment) {
      return res.status(404).json({ error: 'Experiment not found' });
    }
    
    let parameterCombinations;
    
    if (specific_parameters) {
      // Generate for specific parameter combination
      parameterCombinations = [specific_parameters];
    } else if (generate_all) {
      // Generate for all parameter combinations
      parameterCombinations = await ExperimentModel.getParameterCombinations(experiment_id);
    } else {
      return res.status(400).json({ error: 'Either generate_all=true or specific_parameters must be provided' });
    }
    
    const results = [];
    let totalGenerated = 0;
    let totalErrors = 0;
    
    // Process each parameter combination
    for (const params of parameterCombinations) {
      for (let i = 0; i < experiment.response_count; i++) {
        try {
          // Generate response using LLM service
          const llmResponse = await llmService.generateResponse(experiment.prompt, {
            temperature: params.temperature,
            top_p: params.top_p,
            frequency_penalty: params.frequency_penalty || 0.0,
            presence_penalty: params.presence_penalty || 0.0,
            max_tokens: experiment.max_tokens
          });
          
          // Save response to database
          const responseData = {
            experiment_id: experiment.id,
            content: llmResponse.content,
            temperature: params.temperature,
            top_p: params.top_p,
            frequency_penalty: llmResponse.frequency_penalty || 0.0,
            presence_penalty: llmResponse.presence_penalty || 0.0,
            max_tokens: experiment.max_tokens,
            model: llmResponse.model,
            prompt_tokens: llmResponse.usage.prompt_tokens,
            completion_tokens: llmResponse.usage.completion_tokens,
            total_tokens: llmResponse.usage.total_tokens,
            response_time: llmResponse.response_time
          };
          
          const savedResponse = await ResponseModel.create(responseData);
          
          // Calculate quality metrics
          const metrics = qualityMetricsService.calculateMetrics(
            llmResponse.content, 
            experiment.prompt
          );
          
          // Save metrics to database
          await QualityMetricModel.create({
            response_id: savedResponse.id,
            ...metrics
          });
          
          results.push({
            id: savedResponse.id,
            content: llmResponse.content,
            parameters: {
              temperature: params.temperature,
              top_p: params.top_p
            },
            metrics,
            usage: llmResponse.usage,
            response_time: llmResponse.response_time,
            success: true
          });
          
          totalGenerated++;
          
        } catch (error) {
          console.error('Error generating response:', error);
          totalErrors++;
          
          results.push({
            parameters: {
              temperature: params.temperature,
              top_p: params.top_p
            },
            error: error.message,
            success: false
          });
        }
      }
    }
    
    res.json({
      experiment_id,
      results,
      summary: {
        total_requested: parameterCombinations.length * experiment.response_count,
        total_generated: totalGenerated,
        total_errors: totalErrors,
        parameter_combinations: parameterCombinations.length
      },
      mock_mode: llmService.isUsingMockMode()
    });
    
  } catch (error) {
    console.error('Error in response generation:', error);
    res.status(500).json({ error: 'Failed to generate responses' });
  }
});

// GET /api/responses/:experimentId - Get responses for an experiment
router.get('/:experimentId', async (req, res) => {
  try {
    const { experimentId } = req.params;
    
    if (!experimentId || isNaN(experimentId)) {
      return res.status(400).json({ error: 'Invalid experiment ID' });
    }
    
    const responses = await ResponseModel.findByExperiment(parseInt(experimentId));
    const stats = await ResponseModel.getStatsByExperiment(parseInt(experimentId));
    
    res.json({
      experiment_id: parseInt(experimentId),
      responses,
      stats,
      total: responses.length
    });
  } catch (error) {
    console.error('Error fetching responses:', error);
    res.status(500).json({ error: 'Failed to fetch responses' });
  }
});

// GET /api/responses/single/:id - Get single response by ID
router.get('/single/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id || isNaN(id)) {
      return res.status(400).json({ error: 'Invalid response ID' });
    }
    
    const response = await ResponseModel.findById(parseInt(id));
    
    if (!response) {
      return res.status(404).json({ error: 'Response not found' });
    }
    
    res.json({ response });
  } catch (error) {
    console.error('Error fetching response:', error);
    res.status(500).json({ error: 'Failed to fetch response' });
  }
});

// POST /api/responses/batch-generate - Generate responses for multiple parameter combinations
router.post('/batch-generate', async (req, res) => {
  try {
    const { experiment_id, parameter_combinations } = req.body;
    
    if (!experiment_id || !parameter_combinations || !Array.isArray(parameter_combinations)) {
      return res.status(400).json({ 
        error: 'Experiment ID and parameter_combinations array are required' 
      });
    }
    
    // Start generation in background and return immediately with job info
    // For now, we'll process synchronously but could be enhanced with job queue
    
    const jobId = Date.now().toString();
    
    // Process asynchronously (don't await)
    setImmediate(async () => {
      try {
        const experiment = await ExperimentModel.findById(experiment_id);
        if (!experiment) return;
        
        for (const params of parameter_combinations) {
          const llmResponse = await llmService.generateResponse(experiment.prompt, params);
          
          const responseData = {
            experiment_id: experiment.id,
            content: llmResponse.content,
            temperature: params.temperature,
            top_p: params.top_p,
            max_tokens: experiment.max_tokens,
            model: llmResponse.model,
            prompt_tokens: llmResponse.usage.prompt_tokens,
            completion_tokens: llmResponse.usage.completion_tokens,
            total_tokens: llmResponse.usage.total_tokens,
            response_time: llmResponse.response_time
          };
          
          const savedResponse = await ResponseModel.create(responseData);
          
          const metrics = qualityMetricsService.calculateMetrics(
            llmResponse.content, 
            experiment.prompt
          );
          
          await QualityMetricModel.create({
            response_id: savedResponse.id,
            ...metrics
          });
        }
      } catch (error) {
        console.error('Background generation error:', error);
      }
    });
    
    res.json({
      job_id: jobId,
      message: 'Response generation started',
      estimated_time: parameter_combinations.length * 2, // seconds
      status: 'processing'
    });
    
  } catch (error) {
    console.error('Error starting batch generation:', error);
    res.status(500).json({ error: 'Failed to start response generation' });
  }
});

// DELETE /api/responses/:id - Delete a response
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id || isNaN(id)) {
      return res.status(400).json({ error: 'Invalid response ID' });
    }
    
    // Delete quality metrics first (cascade should handle this, but explicit is safer)
    await QualityMetricModel.delete(parseInt(id));
    
    const result = await ResponseModel.delete(parseInt(id));
    
    if (!result.deleted) {
      return res.status(404).json({ error: 'Response not found' });
    }
    
    res.json({ message: 'Response deleted successfully', id: parseInt(id) });
  } catch (error) {
    console.error('Error deleting response:', error);
    res.status(500).json({ error: 'Failed to delete response' });
  }
});

module.exports = router;
