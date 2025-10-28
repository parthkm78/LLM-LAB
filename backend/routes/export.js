const express = require('express');
const router = express.Router();
const ExperimentModel = require('../models/Experiment');
const ResponseModel = require('../models/Response');
const QualityMetricModel = require('../models/QualityMetric');

// GET /api/export/:experimentId - Export experiment data in JSON format
router.get('/:experimentId', async (req, res) => {
  try {
    const { experimentId } = req.params;
    const { format = 'json', include_content = 'true' } = req.query;
    
    if (!experimentId || isNaN(experimentId)) {
      return res.status(400).json({ error: 'Invalid experiment ID' });
    }
    
    // Get experiment details
    const experiment = await ExperimentModel.findById(parseInt(experimentId));
    if (!experiment) {
      return res.status(404).json({ error: 'Experiment not found' });
    }
    
    // Get responses with metrics
    const responses = await ResponseModel.findByExperiment(parseInt(experimentId));
    
    // Get parameter combinations
    const parameterCombinations = await ExperimentModel.getParameterCombinations(parseInt(experimentId));
    
    // Get statistics
    const stats = await ResponseModel.getStatsByExperiment(parseInt(experimentId));
    
    const exportData = {
      experiment: {
        id: experiment.id,
        name: experiment.name,
        description: experiment.description,
        prompt: experiment.prompt,
        parameters: {
          temperature: {
            min: experiment.temperature_min,
            max: experiment.temperature_max,
            step: experiment.temperature_step
          },
          top_p: {
            min: experiment.top_p_min,
            max: experiment.top_p_max,
            step: experiment.top_p_step
          },
          max_tokens: experiment.max_tokens,
          response_count: experiment.response_count
        },
        created_at: experiment.created_at,
        updated_at: experiment.updated_at
      },
      responses: responses.map(response => ({
        id: response.id,
        content: include_content === 'true' ? response.content : '[Content excluded]',
        parameters: {
          temperature: response.temperature,
          top_p: response.top_p,
          max_tokens: response.max_tokens
        },
        model: response.model,
        usage: {
          prompt_tokens: response.prompt_tokens,
          completion_tokens: response.completion_tokens,
          total_tokens: response.total_tokens
        },
        response_time: response.response_time,
        quality_metrics: {
          coherence_score: response.coherence_score,
          completeness_score: response.completeness_score,
          readability_score: response.readability_score,
          length_appropriateness_score: response.length_appropriateness_score,
          overall_score: response.overall_score
        },
        created_at: response.created_at
      })),
      parameter_combinations: parameterCombinations,
      statistics: stats,
      export_metadata: {
        exported_at: new Date().toISOString(),
        total_responses: responses.length,
        format: format,
        content_included: include_content === 'true'
      }
    };
    
    if (format === 'json') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename=experiment-${experimentId}.json`);
      res.json(exportData);
    } else {
      res.status(400).json({ error: 'Unsupported format. Use /csv endpoint for CSV export.' });
    }
    
  } catch (error) {
    console.error('Error exporting experiment:', error);
    res.status(500).json({ error: 'Failed to export experiment data' });
  }
});

// GET /api/export/:experimentId/csv - Export as CSV
router.get('/:experimentId/csv', async (req, res) => {
  try {
    const { experimentId } = req.params;
    const { include_content = 'false' } = req.query;
    
    if (!experimentId || isNaN(experimentId)) {
      return res.status(400).json({ error: 'Invalid experiment ID' });
    }
    
    // Get experiment and responses
    const experiment = await ExperimentModel.findById(parseInt(experimentId));
    if (!experiment) {
      return res.status(404).json({ error: 'Experiment not found' });
    }
    
    const responses = await ResponseModel.findByExperiment(parseInt(experimentId));
    
    // Build CSV headers
    let headers = [
      'response_id',
      'temperature',
      'top_p',
      'max_tokens',
      'model',
      'prompt_tokens',
      'completion_tokens',
      'total_tokens',
      'response_time',
      'coherence_score',
      'completeness_score',
      'readability_score',
      'length_appropriateness_score',
      'overall_score',
      'word_count',
      'sentence_count',
      'paragraph_count',
      'avg_sentence_length',
      'lexical_diversity',
      'created_at'
    ];
    
    if (include_content === 'true') {
      headers.push('content');
    }
    
    // Build CSV rows
    const csvRows = [headers.join(',')];
    
    responses.forEach(response => {
      const row = [
        response.id,
        response.temperature,
        response.top_p,
        response.max_tokens,
        `"${response.model}"`,
        response.prompt_tokens || 0,
        response.completion_tokens || 0,
        response.total_tokens || 0,
        response.response_time || 0,
        response.coherence_score || 0,
        response.completeness_score || 0,
        response.readability_score || 0,
        response.length_appropriateness_score || 0,
        response.overall_score || 0,
        0, // word_count - would need to be calculated from metrics
        0, // sentence_count
        0, // paragraph_count
        0, // avg_sentence_length
        0, // lexical_diversity
        `"${response.created_at}"`
      ];
      
      if (include_content === 'true') {
        // Escape quotes in content and wrap in quotes
        const escapedContent = response.content ? response.content.replace(/"/g, '""') : '';
        row.push(`"${escapedContent}"`);
      }
      
      csvRows.push(row.join(','));
    });
    
    const csvContent = csvRows.join('\n');
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=experiment-${experimentId}-responses.csv`);
    res.send(csvContent);
    
  } catch (error) {
    console.error('Error exporting CSV:', error);
    res.status(500).json({ error: 'Failed to export CSV data' });
  }
});

// GET /api/export/:experimentId/summary - Export summary statistics only
router.get('/:experimentId/summary', async (req, res) => {
  try {
    const { experimentId } = req.params;
    
    if (!experimentId || isNaN(experimentId)) {
      return res.status(400).json({ error: 'Invalid experiment ID' });
    }
    
    const experiment = await ExperimentModel.findById(parseInt(experimentId));
    if (!experiment) {
      return res.status(404).json({ error: 'Experiment not found' });
    }
    
    const stats = await ResponseModel.getStatsByExperiment(parseInt(experimentId));
    const averages = await QualityMetricModel.getAveragesByParameters(parseInt(experimentId));
    const parameterCombinations = await ExperimentModel.getParameterCombinations(parseInt(experimentId));
    
    const summaryData = {
      experiment: {
        id: experiment.id,
        name: experiment.name,
        description: experiment.description,
        created_at: experiment.created_at
      },
      statistics: stats,
      parameter_performance: averages,
      total_combinations: parameterCombinations.length,
      best_combination: averages.length > 0 ? 
        averages.reduce((best, current) => 
          (current.avg_overall > best.avg_overall) ? current : best
        ) : null,
      worst_combination: averages.length > 0 ? 
        averages.reduce((worst, current) => 
          (current.avg_overall < worst.avg_overall) ? current : worst
        ) : null,
      export_metadata: {
        exported_at: new Date().toISOString(),
        type: 'summary'
      }
    };
    
    res.json(summaryData);
    
  } catch (error) {
    console.error('Error exporting summary:', error);
    res.status(500).json({ error: 'Failed to export summary data' });
  }
});

// POST /api/export/batch - Export multiple experiments
router.post('/batch', async (req, res) => {
  try {
    const { experiment_ids, format = 'json', include_content = 'false' } = req.body;
    
    if (!experiment_ids || !Array.isArray(experiment_ids)) {
      return res.status(400).json({ error: 'experiment_ids array is required' });
    }
    
    const exports = [];
    
    for (const experimentId of experiment_ids) {
      try {
        const experiment = await ExperimentModel.findById(parseInt(experimentId));
        if (!experiment) {
          exports.push({
            experiment_id: experimentId,
            error: 'Experiment not found',
            success: false
          });
          continue;
        }
        
        const responses = await ResponseModel.findByExperiment(parseInt(experimentId));
        const stats = await ResponseModel.getStatsByExperiment(parseInt(experimentId));
        
        exports.push({
          experiment_id: experimentId,
          experiment: {
            id: experiment.id,
            name: experiment.name,
            description: experiment.description,
            prompt: experiment.prompt,
            created_at: experiment.created_at
          },
          responses: responses.map(r => ({
            id: r.id,
            content: include_content === 'true' ? r.content : '[Content excluded]',
            parameters: { temperature: r.temperature, top_p: r.top_p },
            quality_metrics: {
              coherence_score: r.coherence_score,
              completeness_score: r.completeness_score,
              readability_score: r.readability_score,
              length_appropriateness_score: r.length_appropriateness_score,
              overall_score: r.overall_score
            }
          })),
          statistics: stats,
          success: true
        });
        
      } catch (error) {
        exports.push({
          experiment_id: experimentId,
          error: error.message,
          success: false
        });
      }
    }
    
    const batchExport = {
      experiments: exports,
      export_metadata: {
        exported_at: new Date().toISOString(),
        total_experiments: experiment_ids.length,
        successful_exports: exports.filter(e => e.success).length,
        format: format,
        content_included: include_content === 'true'
      }
    };
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=batch-export-${Date.now()}.json`);
    res.json(batchExport);
    
  } catch (error) {
    console.error('Error in batch export:', error);
    res.status(500).json({ error: 'Failed to export batch data' });
  }
});

module.exports = router;
