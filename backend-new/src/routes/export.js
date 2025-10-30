const express = require('express');
const router = express.Router();
const mockExperiments = require('../data/mockExperiments');
const mockResponses = require('../data/mockResponses');
const { mockBatchExperiments, mockBatchResults } = require('../data/mockBatchExperiments');

// Helper function to format data for export
const formatDataForExport = (data, format) => {
  if (format === 'csv') {
    // Convert to CSV format
    if (Array.isArray(data) && data.length > 0) {
      const headers = Object.keys(data[0]);
      const csvContent = [
        headers.join(','),
        ...data.map(row => 
          headers.map(header => {
            const value = row[header];
            // Handle nested objects and arrays
            if (typeof value === 'object' && value !== null) {
              return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
            }
            return `"${String(value).replace(/"/g, '""')}"`;
          }).join(',')
        )
      ].join('\n');
      return csvContent;
    }
  }
  
  return data; // Return JSON for other formats
};

// GET /api/export/experiment/:id - Export experiment data
router.get('/experiment/:id', (req, res) => {
  try {
    const experimentId = parseInt(req.params.id);
    const {
      format = 'json',
      include_responses = 'true',
      include_metrics = 'true',
      date_range
    } = req.query;
    
    const experiment = mockExperiments.find(exp => exp.id === experimentId);
    
    if (!experiment) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Experiment not found',
          details: `No experiment found with ID ${experimentId}`
        }
      });
    }
    
    let responses = mockResponses.filter(r => r.experiment_id === experimentId);
    
    // Apply date range filter if provided
    if (date_range) {
      try {
        const { start, end } = JSON.parse(date_range);
        responses = responses.filter(r => {
          const responseDate = new Date(r.created_at);
          return responseDate >= new Date(start) && responseDate <= new Date(end);
        });
      } catch (e) {
        // Invalid date range format, ignore filter
      }
    }
    
    // Prepare export data
    const exportData = {
      experiment: {
        ...experiment,
        export_timestamp: new Date().toISOString(),
        export_format: format,
        filters_applied: {
          include_responses: include_responses === 'true',
          include_metrics: include_metrics === 'true',
          date_range: date_range || 'all'
        }
      }
    };
    
    if (include_responses === 'true') {
      exportData.responses = responses.map(response => {
        const exportResponse = {
          id: response.id,
          content: response.content,
          model: response.model,
          parameters: response.parameters,
          response_time: response.response_time,
          cost: response.cost,
          token_count: response.token_count,
          status: response.status,
          created_at: response.created_at
        };
        
        if (include_metrics === 'true') {
          exportResponse.quality_metrics = response.quality_metrics;
        }
        
        return exportResponse;
      });
    }
    
    // Add summary statistics
    if (responses.length > 0) {
      const totalCost = responses.reduce((sum, r) => sum + r.cost, 0);
      const totalTokens = responses.reduce((sum, r) => sum + r.token_count, 0);
      const avgQuality = responses.reduce((sum, r) => sum + r.quality_metrics.overall_quality, 0) / responses.length;
      
      exportData.summary = {
        total_responses: responses.length,
        total_cost: Math.round(totalCost * 1000) / 1000,
        total_tokens: totalTokens,
        average_quality: Math.round(avgQuality * 10) / 10,
        best_quality: Math.max(...responses.map(r => r.quality_metrics.overall_quality)),
        worst_quality: Math.min(...responses.map(r => r.quality_metrics.overall_quality))
      };
    }
    
    // Handle different export formats
    if (format === 'csv') {
      if (include_responses === 'true' && responses.length > 0) {
        // Flatten response data for CSV
        const flattenedResponses = responses.map(response => ({
          response_id: response.id,
          experiment_id: response.experiment_id,
          experiment_name: experiment.name,
          content_preview: response.content.substring(0, 100) + '...',
          content_length: response.content.length,
          model: response.model,
          temperature: response.parameters.temperature,
          top_p: response.parameters.top_p,
          max_tokens: response.parameters.max_tokens,
          frequency_penalty: response.parameters.frequency_penalty,
          presence_penalty: response.parameters.presence_penalty,
          overall_quality: response.quality_metrics.overall_quality,
          coherence_score: response.quality_metrics.coherence_score,
          creativity_score: response.quality_metrics.creativity_score,
          readability_score: response.quality_metrics.readability_score,
          completeness_score: response.quality_metrics.completeness_score,
          response_time: response.response_time,
          cost: response.cost,
          token_count: response.token_count,
          created_at: response.created_at
        }));
        
        const csvContent = formatDataForExport(flattenedResponses, 'csv');
        
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="experiment_${experimentId}_export.csv"`);
        return res.send(csvContent);
      } else {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'CSV export requires responses to be included'
          }
        });
      }
    }
    
    // JSON export (default)
    res.json({
      success: true,
      data: exportData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to export experiment data',
        details: error.message
      }
    });
  }
});

// POST /api/export/batch - Export multiple experiments
router.post('/batch', (req, res) => {
  try {
    const {
      experiment_ids,
      format = 'json',
      include_analysis = true,
      compression = 'none'
    } = req.body;
    
    if (!experiment_ids || !Array.isArray(experiment_ids)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'experiment_ids array is required'
        }
      });
    }
    
    const experiments = mockExperiments.filter(exp => 
      experiment_ids.includes(exp.id)
    );
    
    if (experiments.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'No experiments found with provided IDs'
        }
      });
    }
    
    const batchExportData = {
      export_metadata: {
        timestamp: new Date().toISOString(),
        format,
        total_experiments: experiments.length,
        requested_ids: experiment_ids,
        found_experiments: experiments.map(e => e.id),
        include_analysis
      },
      experiments: []
    };
    
    // Process each experiment
    experiments.forEach(experiment => {
      const experimentResponses = mockResponses.filter(r => r.experiment_id === experiment.id);
      
      const experimentData = {
        experiment: experiment,
        responses: experimentResponses,
        statistics: {
          response_count: experimentResponses.length,
          average_quality: experimentResponses.length > 0 ? 
            experimentResponses.reduce((sum, r) => sum + r.quality_metrics.overall_quality, 0) / experimentResponses.length : 0,
          total_cost: experimentResponses.reduce((sum, r) => sum + r.cost, 0),
          total_tokens: experimentResponses.reduce((sum, r) => sum + r.token_count, 0)
        }
      };
      
      batchExportData.experiments.push(experimentData);
    });
    
    // Add cross-experiment analysis if requested
    if (include_analysis) {
      const allResponses = batchExportData.experiments.flatMap(exp => exp.responses);
      
      if (allResponses.length > 0) {
        // Model performance comparison
        const modelPerformance = {};
        allResponses.forEach(response => {
          if (!modelPerformance[response.model]) {
            modelPerformance[response.model] = {
              response_count: 0,
              total_quality: 0,
              total_cost: 0,
              total_tokens: 0
            };
          }
          
          modelPerformance[response.model].response_count++;
          modelPerformance[response.model].total_quality += response.quality_metrics.overall_quality;
          modelPerformance[response.model].total_cost += response.cost;
          modelPerformance[response.model].total_tokens += response.token_count;
        });
        
        // Calculate averages
        Object.keys(modelPerformance).forEach(model => {
          const perf = modelPerformance[model];
          perf.average_quality = perf.total_quality / perf.response_count;
          perf.average_cost = perf.total_cost / perf.response_count;
          perf.cost_per_quality = perf.total_cost / perf.total_quality;
        });
        
        // Parameter analysis
        const parameterImpact = {
          temperature: {},
          top_p: {},
          max_tokens: {}
        };
        
        allResponses.forEach(response => {
          ['temperature', 'top_p', 'max_tokens'].forEach(param => {
            const value = response.parameters[param];
            const roundedValue = param === 'max_tokens' ? value : Math.round(value * 10) / 10;
            
            if (!parameterImpact[param][roundedValue]) {
              parameterImpact[param][roundedValue] = {
                qualities: [],
                count: 0
              };
            }
            
            parameterImpact[param][roundedValue].qualities.push(response.quality_metrics.overall_quality);
            parameterImpact[param][roundedValue].count++;
          });
        });
        
        // Calculate parameter impact averages
        Object.keys(parameterImpact).forEach(param => {
          Object.keys(parameterImpact[param]).forEach(value => {
            const data = parameterImpact[param][value];
            data.average_quality = data.qualities.reduce((sum, q) => sum + q, 0) / data.qualities.length;
            delete data.qualities; // Remove raw data to reduce export size
          });
        });
        
        batchExportData.analysis = {
          model_performance: modelPerformance,
          parameter_impact: parameterImpact,
          overall_statistics: {
            total_responses: allResponses.length,
            average_quality: allResponses.reduce((sum, r) => sum + r.quality_metrics.overall_quality, 0) / allResponses.length,
            total_cost: allResponses.reduce((sum, r) => sum + r.cost, 0),
            quality_range: {
              min: Math.min(...allResponses.map(r => r.quality_metrics.overall_quality)),
              max: Math.max(...allResponses.map(r => r.quality_metrics.overall_quality))
            }
          }
        };
      }
    }
    
    res.json({
      success: true,
      data: batchExportData,
      message: `Successfully exported ${experiments.length} experiments`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to export batch data',
        details: error.message
      }
    });
  }
});

// GET /api/export/batch-experiment/:id - Export batch experiment results
router.get('/batch-experiment/:id', (req, res) => {
  try {
    const batchId = parseInt(req.params.id);
    const { format = 'json', include_raw_data = 'true' } = req.query;
    
    const batchExperiment = mockBatchExperiments.find(exp => exp.id === batchId);
    
    if (!batchExperiment) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Batch experiment not found'
        }
      });
    }
    
    const results = mockBatchResults[batchId] || [];
    
    const exportData = {
      batch_experiment: batchExperiment,
      export_metadata: {
        timestamp: new Date().toISOString(),
        format,
        include_raw_data: include_raw_data === 'true'
      }
    };
    
    if (include_raw_data === 'true') {
      exportData.results = results;
    }
    
    // Add analysis summary
    if (results.length > 0) {
      const qualities = results.map(r => r.average_quality);
      
      exportData.analysis_summary = {
        total_combinations: results.length,
        quality_statistics: {
          min: Math.min(...qualities),
          max: Math.max(...qualities),
          average: qualities.reduce((sum, q) => sum + q, 0) / qualities.length,
          median: qualities.sort((a, b) => a - b)[Math.floor(qualities.length / 2)]
        },
        best_parameters: results[0]?.parameters || null, // Assuming results are sorted by quality
        parameter_correlations: batchExperiment.insights || []
      };
    }
    
    // Handle CSV format for batch results
    if (format === 'csv' && results.length > 0) {
      const flattenedResults = results.map(result => ({
        combination_id: result.combination_id,
        temperature: result.parameters.temperature,
        top_p: result.parameters.top_p,
        max_tokens: result.parameters.max_tokens,
        average_quality: result.average_quality,
        coherence: result.metrics_breakdown.coherence,
        creativity: result.metrics_breakdown.creativity,
        readability: result.metrics_breakdown.readability,
        completeness: result.metrics_breakdown.completeness,
        iterations: result.iterations,
        best_iteration_quality: Math.max(...result.responses.map(r => r.quality)),
        worst_iteration_quality: Math.min(...result.responses.map(r => r.quality)),
        avg_response_time: result.responses.reduce((sum, r) => sum + r.response_time, 0) / result.responses.length,
        avg_cost: result.responses.reduce((sum, r) => sum + r.cost, 0) / result.responses.length
      }));
      
      const csvContent = formatDataForExport(flattenedResults, 'csv');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="batch_experiment_${batchId}_results.csv"`);
      return res.send(csvContent);
    }
    
    res.json({
      success: true,
      data: exportData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to export batch experiment data',
        details: error.message
      }
    });
  }
});

// GET /api/export/templates - Get available export templates
router.get('/templates', (req, res) => {
  try {
    const templates = [
      {
        id: 'basic',
        name: 'Basic Export',
        description: 'Experiment overview with key metrics and summary statistics',
        fields: ['id', 'name', 'model', 'average_quality', 'response_count', 'total_cost', 'created_at'],
        format_support: ['json', 'csv'],
        use_cases: ['Quick overview', 'Simple reporting', 'Dashboard integration']
      },
      {
        id: 'detailed',
        name: 'Detailed Analysis',
        description: 'Complete data with all metrics, responses, and parameter analysis',
        fields: ['*'],
        format_support: ['json'],
        use_cases: ['Deep analysis', 'Research', 'Complete backup']
      },
      {
        id: 'quality-focused',
        name: 'Quality Metrics Export',
        description: 'Focus on quality metrics and analysis across all responses',
        fields: ['id', 'name', 'quality_metrics', 'parameter_correlation', 'quality_trends'],
        format_support: ['json', 'csv'],
        use_cases: ['Quality analysis', 'Model comparison', 'Performance optimization']
      },
      {
        id: 'cost-analysis',
        name: 'Cost Analysis Export',
        description: 'Cost-focused data with efficiency metrics and recommendations',
        fields: ['id', 'name', 'total_cost', 'cost_per_response', 'cost_efficiency', 'model_costs'],
        format_support: ['json', 'csv'],
        use_cases: ['Budget planning', 'Cost optimization', 'ROI analysis']
      },
      {
        id: 'parameter-study',
        name: 'Parameter Study Export',
        description: 'Parameter combinations with performance correlations',
        fields: ['parameters', 'quality_impact', 'correlations', 'optimal_ranges'],
        format_support: ['json', 'csv'],
        use_cases: ['Parameter optimization', 'A/B testing', 'Research studies']
      }
    ];
    
    res.json({
      success: true,
      data: {
        templates,
        supported_formats: ['json', 'csv'],
        compression_options: ['none', 'zip', 'gzip'],
        custom_template_support: true
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch export templates',
        details: error.message
      }
    });
  }
});

// POST /api/export/custom - Create custom export with specific parameters
router.post('/custom', (req, res) => {
  try {
    const {
      experiment_ids,
      fields,
      filters,
      format = 'json',
      template_name = 'custom'
    } = req.body;
    
    if (!experiment_ids || !Array.isArray(experiment_ids)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'experiment_ids array is required'
        }
      });
    }
    
    let experiments = mockExperiments.filter(exp => 
      experiment_ids.includes(exp.id)
    );
    
    // Apply filters if provided
    if (filters) {
      if (filters.date_range) {
        const { start, end } = filters.date_range;
        experiments = experiments.filter(exp => {
          const expDate = new Date(exp.created_at);
          return expDate >= new Date(start) && expDate <= new Date(end);
        });
      }
      
      if (filters.model) {
        experiments = experiments.filter(exp => exp.model === filters.model);
      }
      
      if (filters.min_quality) {
        experiments = experiments.filter(exp => exp.average_quality >= filters.min_quality);
      }
    }
    
    // Build custom export based on specified fields
    const customExportData = experiments.map(experiment => {
      let exportItem = {};
      
      if (!fields || fields.includes('*')) {
        // Include all fields
        exportItem = { ...experiment };
        
        // Add responses if requested
        const responses = mockResponses.filter(r => r.experiment_id === experiment.id);
        if (responses.length > 0) {
          exportItem.responses = responses;
        }
      } else {
        // Include only specified fields
        fields.forEach(field => {
          if (experiment.hasOwnProperty(field)) {
            exportItem[field] = experiment[field];
          }
          
          // Handle special computed fields
          if (field === 'response_summary') {
            const responses = mockResponses.filter(r => r.experiment_id === experiment.id);
            exportItem.response_summary = {
              count: responses.length,
              avg_quality: responses.length > 0 ? 
                responses.reduce((sum, r) => sum + r.quality_metrics.overall_quality, 0) / responses.length : 0
            };
          }
        });
      }
      
      return exportItem;
    });
    
    res.json({
      success: true,
      data: {
        custom_export: customExportData,
        metadata: {
          template_name,
          export_timestamp: new Date().toISOString(),
          total_experiments: customExportData.length,
          fields_included: fields || ['*'],
          filters_applied: filters || 'none',
          format
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to create custom export',
        details: error.message
      }
    });
  }
});

module.exports = router;
