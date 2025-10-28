/**
 * @fileoverview Bridge Routes for Export API
 * @description Routes that bridge the existing frontend export API calls to the new architecture
 */

const express = require('express');
const { asyncHandler } = require('../middleware/errorHandler');
const ExperimentModel = require('../models/Experiment');
const ResponseModel = require('../models/Response');
const QualityMetricModel = require('../models/QualityMetric');
const logger = require('../utils/logger');

const router = express.Router();

/**
 * Frontend-compatible export routes
 */

// GET /api/export/experiment/:id - Export experiment data
router.get('/experiment/:id', asyncHandler(async (req, res, next) => {
  logger.info('Frontend API call: GET /export/experiment/:id', { experimentId: req.params.id });
  
  try {
    const experimentId = parseInt(req.params.id, 10);
    const experiment = await ExperimentModel.findById(experimentId);
    
    if (!experiment) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Experiment not found',
          statusCode: 404
        }
      });
    }
    
    // Get all responses for the experiment
    const responses = await ResponseModel.findByExperimentId(experimentId);
    
    // Get all metrics for the responses
    const responseIds = responses.map(r => r.id);
    const allMetrics = [];
    
    for (const responseId of responseIds) {
      const metrics = await QualityMetricModel.findByResponseId(responseId);
      if (metrics && metrics.length > 0) {
        allMetrics.push(...metrics);
      }
    }
    
    // Build comprehensive export data
    const exportData = {
      experiment: {
        id: experiment.id,
        name: experiment.name,
        description: experiment.description,
        prompt: experiment.prompt,
        parameters: {
          temperature: experiment.temperature,
          top_p: experiment.top_p,
          frequency_penalty: experiment.frequency_penalty,
          presence_penalty: experiment.presence_penalty,
          max_tokens: experiment.max_tokens,
          model: experiment.model
        },
        created_at: experiment.created_at,
        updated_at: experiment.updated_at
      },
      responses: responses.map(response => ({
        id: response.id,
        content: response.content,
        parameters_used: {
          temperature: response.temperature,
          top_p: response.top_p,
          frequency_penalty: response.frequency_penalty,
          presence_penalty: response.presence_penalty,
          max_tokens: response.max_tokens,
          model: response.model
        },
        created_at: response.created_at,
        metrics: allMetrics.filter(m => m.response_id === response.id).map(metric => ({
          coherence: metric.coherence,
          completeness: metric.completeness,
          readability: metric.readability,
          creativity: metric.creativity,
          specificity: metric.specificity,
          length_appropriateness: metric.length_appropriateness,
          calculated_at: metric.created_at
        }))
      })),
      summary: {
        total_responses: responses.length,
        export_timestamp: new Date().toISOString(),
        metrics_coverage: allMetrics.length
      }
    };
    
    // Set appropriate headers for download
    const filename = `experiment_${experimentId}_${new Date().toISOString().split('T')[0]}.json`;
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    
    res.json({
      success: true,
      data: exportData
    });
  } catch (error) {
    logger.error('Error exporting experiment:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to export experiment',
        statusCode: 500
      }
    });
  }
}));

// GET /api/export/all - Export all experiments and data
router.get('/all', asyncHandler(async (req, res, next) => {
  logger.info('Frontend API call: GET /export/all');
  
  try {
    const experiments = await ExperimentModel.findAll();
    const allData = [];
    
    for (const experiment of experiments) {
      const responses = await ResponseModel.findByExperimentId(experiment.id);
      const responseIds = responses.map(r => r.id);
      const allMetrics = [];
      
      for (const responseId of responseIds) {
        const metrics = await QualityMetricModel.findByResponseId(responseId);
        if (metrics && metrics.length > 0) {
          allMetrics.push(...metrics);
        }
      }
      
      allData.push({
        experiment: {
          id: experiment.id,
          name: experiment.name,
          description: experiment.description,
          prompt: experiment.prompt,
          parameters: {
            temperature: experiment.temperature,
            top_p: experiment.top_p,
            frequency_penalty: experiment.frequency_penalty,
            presence_penalty: experiment.presence_penalty,
            max_tokens: experiment.max_tokens,
            model: experiment.model
          },
          created_at: experiment.created_at,
          updated_at: experiment.updated_at
        },
        responses: responses.map(response => ({
          id: response.id,
          content: response.content,
          parameters_used: {
            temperature: response.temperature,
            top_p: response.top_p,
            frequency_penalty: response.frequency_penalty,
            presence_penalty: response.presence_penalty,
            max_tokens: response.max_tokens,
            model: response.model
          },
          created_at: response.created_at,
          metrics: allMetrics.filter(m => m.response_id === response.id).map(metric => ({
            coherence: metric.coherence,
            completeness: metric.completeness,
            readability: metric.readability,
            creativity: metric.creativity,
            specificity: metric.specificity,
            length_appropriateness: metric.length_appropriateness,
            calculated_at: metric.created_at
          }))
        }))
      });
    }
    
    const exportData = {
      experiments: allData,
      summary: {
        total_experiments: experiments.length,
        total_responses: allData.reduce((sum, exp) => sum + exp.responses.length, 0),
        export_timestamp: new Date().toISOString()
      }
    };
    
    // Set appropriate headers for download
    const filename = `all_experiments_${new Date().toISOString().split('T')[0]}.json`;
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    
    res.json({
      success: true,
      data: exportData
    });
  } catch (error) {
    logger.error('Error exporting all data:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to export all data',
        statusCode: 500
      }
    });
  }
}));

// POST /api/export/csv - Export data in CSV format
router.post('/csv', asyncHandler(async (req, res, next) => {
  logger.info('Frontend API call: POST /export/csv', { body: req.body });
  
  try {
    const { experimentIds, format = 'responses' } = req.body;
    
    if (!experimentIds || !Array.isArray(experimentIds)) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Experiment IDs array is required',
          statusCode: 400
        }
      });
    }
    
    let csvData = '';
    
    if (format === 'responses') {
      // CSV format for responses with metrics
      csvData = 'Experiment ID,Experiment Name,Response ID,Content,Temperature,Top P,Frequency Penalty,Presence Penalty,Max Tokens,Model,Coherence,Completeness,Readability,Creativity,Specificity,Length Appropriateness,Created At\n';
      
      for (const experimentId of experimentIds) {
        const experiment = await ExperimentModel.findById(experimentId);
        if (!experiment) continue;
        
        const responses = await ResponseModel.findByExperimentId(experimentId);
        
        for (const response of responses) {
          const metrics = await QualityMetricModel.findByResponseId(response.id);
          const metric = metrics && metrics.length > 0 ? metrics[0] : {};
          
          // Escape CSV content
          const escapeCsv = (text) => `"${String(text || '').replace(/"/g, '""')}"`;
          
          csvData += [
            experimentId,
            escapeCsv(experiment.name),
            response.id,
            escapeCsv(response.content),
            response.temperature,
            response.top_p,
            response.frequency_penalty,
            response.presence_penalty,
            response.max_tokens,
            response.model,
            metric.coherence || '',
            metric.completeness || '',
            metric.readability || '',
            metric.creativity || '',
            metric.specificity || '',
            metric.length_appropriateness || '',
            response.created_at
          ].join(',') + '\n';
        }
      }
    } else if (format === 'experiments') {
      // CSV format for experiments summary
      csvData = 'ID,Name,Description,Prompt,Temperature,Top P,Frequency Penalty,Presence Penalty,Max Tokens,Model,Response Count,Created At\n';
      
      for (const experimentId of experimentIds) {
        const experiment = await ExperimentModel.findById(experimentId);
        if (!experiment) continue;
        
        const responses = await ResponseModel.findByExperimentId(experimentId);
        
        const escapeCsv = (text) => `"${String(text || '').replace(/"/g, '""')}"`;
        
        csvData += [
          experiment.id,
          escapeCsv(experiment.name),
          escapeCsv(experiment.description),
          escapeCsv(experiment.prompt),
          experiment.temperature,
          experiment.top_p,
          experiment.frequency_penalty,
          experiment.presence_penalty,
          experiment.max_tokens,
          experiment.model,
          responses.length,
          experiment.created_at
        ].join(',') + '\n';
      }
    }
    
    // Set appropriate headers for CSV download
    const filename = `export_${format}_${new Date().toISOString().split('T')[0]}.csv`;
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    
    res.send(csvData);
  } catch (error) {
    logger.error('Error exporting CSV:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to export CSV',
        statusCode: 500
      }
    });
  }
}));

module.exports = router;
