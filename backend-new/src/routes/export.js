/**
 * Export API Routes
 * 
 * This module handles all data export-related API endpoints including:
 * - Individual experiment data export
 * - Batch experiment data export
 * - Custom report generation
 * - Multiple format support (JSON, CSV, XLSX, PDF)
 * - Secure download URL generation
 * 
 * All exports are generated as mock URLs since this is a demo implementation.
 */

const express = require('express');
const router = express.Router();
const { findExperimentById } = require('../data/mockExperiments');
const { findBatchExperimentById } = require('../data/mockBatchExperiments');

/**
 * GET /api/export/experiment/:id
 * Export data for a specific experiment
 */
router.get('/experiment/:id', (req, res) => {
  try {
    const { id } = req.params;
    const {
      format = 'json',
      include_responses = 'true',
      include_metrics = 'true',
      include_analysis = 'false'
    } = req.query;

    // Validate format
    const validFormats = ['json', 'csv', 'xlsx', 'pdf'];
    if (!validFormats.includes(format)) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Invalid export format',
          statusCode: 400,
          code: 'VALIDATION_ERROR',
          details: `Format must be one of: ${validFormats.join(', ')}`
        }
      });
    }

    // Find experiment
    const experiment = findExperimentById(id);
    if (!experiment) {
      return res.status(404).json({
        success: false,
        error: {
          message: `Experiment with ID ${id} not found`,
          statusCode: 404,
          code: 'EXPERIMENT_NOT_FOUND'
        }
      });
    }

    // Generate mock export data
    const exportData = generateExperimentExport(experiment, {
      format,
      include_responses: include_responses === 'true',
      include_metrics: include_metrics === 'true',
      include_analysis: include_analysis === 'true'
    });

    // Generate mock download URL
    const exportUrl = `https://api.llm-lab.com/downloads/experiment_${id}_${Date.now()}.${format}`;
    const expiryTime = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    res.json({
      success: true,
      data: {
        export_url: exportUrl,
        expires_at: expiryTime.toISOString(),
        file_size: calculateMockFileSize(exportData),
        format: format,
        export_id: `exp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        includes: {
          responses: include_responses === 'true',
          metrics: include_metrics === 'true',
          analysis: include_analysis === 'true'
        }
      },
      meta: {
        timestamp: new Date().toISOString(),
        request_id: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to export experiment data',
        statusCode: 500,
        code: 'INTERNAL_SERVER_ERROR',
        details: error.message
      }
    });
  }
});

/**
 * POST /api/export/batch
 * Export data for multiple experiments
 */
router.post('/batch', (req, res) => {
  try {
    const {
      experiment_ids,
      format = 'json',
      include_analysis = false,
      include_comparisons = false
    } = req.body;

    // Validate input
    if (!experiment_ids || !Array.isArray(experiment_ids) || experiment_ids.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Validation failed',
          statusCode: 400,
          code: 'VALIDATION_ERROR',
          details: 'experiment_ids array is required and must contain at least one ID'
        }
      });
    }

    // Validate format
    const validFormats = ['json', 'csv', 'xlsx'];
    if (!validFormats.includes(format)) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Invalid export format',
          statusCode: 400,
          code: 'VALIDATION_ERROR',
          details: `Format must be one of: ${validFormats.join(', ')} for batch exports`
        }
      });
    }

    // Check if all experiments exist
    const experiments = experiment_ids.map(id => findExperimentById(id)).filter(Boolean);
    if (experiments.length !== experiment_ids.length) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'One or more experiments not found',
          statusCode: 404,
          code: 'EXPERIMENTS_NOT_FOUND',
          details: `Found ${experiments.length} of ${experiment_ids.length} requested experiments`
        }
      });
    }

    // Generate batch export
    const batchExportData = generateBatchExport(experiments, {
      format,
      include_analysis,
      include_comparisons
    });

    // Generate mock download URL
    const exportUrl = `https://api.llm-lab.com/downloads/batch_export_${Date.now()}.${format}`;
    const expiryTime = new Date(Date.now() + 24 * 60 * 60 * 1000);

    res.json({
      success: true,
      data: {
        export_url: exportUrl,
        expires_at: expiryTime.toISOString(),
        file_size: calculateMockFileSize(batchExportData),
        format: format,
        export_id: `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        experiments_included: experiments.length,
        includes: {
          analysis: include_analysis,
          comparisons: include_comparisons
        }
      },
      meta: {
        timestamp: new Date().toISOString(),
        request_id: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to export batch data',
        statusCode: 500,
        code: 'INTERNAL_SERVER_ERROR',
        details: error.message
      }
    });
  }
});

/**
 * POST /api/export/reports
 * Generate custom reports with advanced analytics
 */
router.post('/reports', (req, res) => {
  try {
    const {
      report_type,
      experiment_ids,
      date_range,
      format = 'pdf',
      include_charts = true,
      include_recommendations = true
    } = req.body;

    // Validate required fields
    if (!report_type) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Validation failed',
          statusCode: 400,
          code: 'VALIDATION_ERROR',
          details: 'report_type is required'
        }
      });
    }

    // Validate report type
    const validReportTypes = [
      'quality_analysis',
      'parameter_optimization',
      'model_comparison',
      'experiment_summary',
      'trend_analysis'
    ];
    
    if (!validReportTypes.includes(report_type)) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Invalid report type',
          statusCode: 400,
          code: 'VALIDATION_ERROR',
          details: `Report type must be one of: ${validReportTypes.join(', ')}`
        }
      });
    }

    // Validate format for reports
    const validReportFormats = ['pdf', 'html', 'docx'];
    if (!validReportFormats.includes(format)) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Invalid report format',
          statusCode: 400,
          code: 'VALIDATION_ERROR',
          details: `Report format must be one of: ${validReportFormats.join(', ')}`
        }
      });
    }

    // Generate report data
    const reportData = generateCustomReport(report_type, {
      experiment_ids,
      date_range,
      include_charts,
      include_recommendations
    });

    // Generate mock download URL
    const reportUrl = `https://api.llm-lab.com/downloads/report_${report_type}_${Date.now()}.${format}`;
    const expiryTime = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48 hours for reports

    res.json({
      success: true,
      data: {
        report_url: reportUrl,
        expires_at: expiryTime.toISOString(),
        file_size: calculateMockFileSize(reportData),
        format: format,
        report_id: `rpt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        report_type: report_type,
        generation_time: `${(Math.random() * 30 + 10).toFixed(1)}s`,
        includes: {
          charts: include_charts,
          recommendations: include_recommendations,
          data_analysis: true
        }
      },
      meta: {
        timestamp: new Date().toISOString(),
        request_id: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to generate report',
        statusCode: 500,
        code: 'INTERNAL_SERVER_ERROR',
        details: error.message
      }
    });
  }
});

/**
 * GET /api/export/batch-experiment/:id
 * Export batch experiment data with comprehensive results
 */
router.get('/batch-experiment/:id', (req, res) => {
  try {
    const { id } = req.params;
    const {
      format = 'json',
      include_all_responses = 'false',
      include_analysis = 'true'
    } = req.query;

    // Validate format
    const validFormats = ['json', 'csv', 'xlsx'];
    if (!validFormats.includes(format)) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Invalid export format',
          statusCode: 400,
          code: 'VALIDATION_ERROR',
          details: `Format must be one of: ${validFormats.join(', ')}`
        }
      });
    }

    // Find batch experiment
    const batchExperiment = findBatchExperimentById(id);
    if (!batchExperiment) {
      return res.status(404).json({
        success: false,
        error: {
          message: `Batch experiment with ID ${id} not found`,
          statusCode: 404,
          code: 'BATCH_EXPERIMENT_NOT_FOUND'
        }
      });
    }

    // Check if batch experiment is completed
    if (batchExperiment.status !== 'completed') {
      return res.status(409).json({
        success: false,
        error: {
          message: 'Batch experiment is not completed yet',
          statusCode: 409,
          code: 'EXPERIMENT_NOT_COMPLETED',
          details: `Current status: ${batchExperiment.status}`
        }
      });
    }

    // Generate batch experiment export
    const exportData = generateBatchExperimentExport(batchExperiment, {
      format,
      include_all_responses: include_all_responses === 'true',
      include_analysis: include_analysis === 'true'
    });

    // Generate mock download URL
    const exportUrl = `https://api.llm-lab.com/downloads/batch_experiment_${id}_${Date.now()}.${format}`;
    const expiryTime = new Date(Date.now() + 24 * 60 * 60 * 1000);

    res.json({
      success: true,
      data: {
        export_url: exportUrl,
        expires_at: expiryTime.toISOString(),
        file_size: calculateMockFileSize(exportData),
        format: format,
        export_id: `bexp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        batch_experiment_id: id,
        includes: {
          all_responses: include_all_responses === 'true',
          analysis: include_analysis === 'true',
          parameter_combinations: true
        }
      },
      meta: {
        timestamp: new Date().toISOString(),
        request_id: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to export batch experiment data',
        statusCode: 500,
        code: 'INTERNAL_SERVER_ERROR',
        details: error.message
      }
    });
  }
});

/**
 * GET /api/export/status/:exportId
 * Check the status of an export operation
 */
router.get('/status/:exportId', (req, res) => {
  try {
    const { exportId } = req.params;

    // Mock export status (in real implementation, this would check actual export status)
    const mockStatus = {
      export_id: exportId,
      status: Math.random() > 0.1 ? 'completed' : 'processing',
      progress: Math.floor(Math.random() * 100) + 1,
      created_at: new Date(Date.now() - Math.random() * 10 * 60 * 1000).toISOString(),
      estimated_completion: new Date(Date.now() + Math.random() * 5 * 60 * 1000).toISOString()
    };

    if (mockStatus.status === 'completed') {
      mockStatus.download_url = `https://api.llm-lab.com/downloads/${exportId}`;
      mockStatus.expires_at = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      mockStatus.progress = 100;
    }

    res.json({
      success: true,
      data: mockStatus,
      meta: {
        timestamp: new Date().toISOString(),
        request_id: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to get export status',
        statusCode: 500,
        code: 'INTERNAL_SERVER_ERROR',
        details: error.message
      }
    });
  }
});

/**
 * Helper function to generate experiment export data
 */
function generateExperimentExport(experiment, options) {
  const exportData = {
    experiment: experiment,
    export_metadata: {
      generated_at: new Date().toISOString(),
      format: options.format,
      version: '1.0'
    }
  };

  if (options.include_responses) {
    exportData.responses = [
      { id: 445, content: 'Mock response content...', metrics: {} }
    ];
  }

  if (options.include_metrics) {
    exportData.quality_analysis = {
      overall_score: 87.3,
      breakdown: {}
    };
  }

  if (options.include_analysis) {
    exportData.insights = [
      'Parameter optimization recommendations',
      'Quality improvement suggestions'
    ];
  }

  return exportData;
}

/**
 * Helper function to generate batch export data
 */
function generateBatchExport(experiments, options) {
  return {
    experiments: experiments,
    batch_metadata: {
      generated_at: new Date().toISOString(),
      format: options.format,
      experiment_count: experiments.length
    },
    summary: {
      average_quality: 87.3,
      total_responses: experiments.reduce((sum, exp) => sum + exp.response_count, 0)
    }
  };
}

/**
 * Helper function to generate custom reports
 */
function generateCustomReport(reportType, options) {
  const baseReport = {
    report_type: reportType,
    generated_at: new Date().toISOString(),
    metadata: {
      version: '1.0',
      generator: 'LLM-LAB Analytics Engine'
    }
  };

  switch (reportType) {
    case 'quality_analysis':
      return {
        ...baseReport,
        sections: [
          'Executive Summary',
          'Quality Trends',
          'Parameter Analysis',
          'Recommendations'
        ],
        key_findings: [
          'Quality improved by 12% over the analysis period',
          'Temperature parameter shows strong correlation with creativity'
        ]
      };
    
    case 'parameter_optimization':
      return {
        ...baseReport,
        sections: [
          'Current Performance',
          'Optimization Opportunities',
          'Recommended Settings',
          'Expected Improvements'
        ],
        recommendations: [
          'Increase temperature to 0.8 for creative tasks',
          'Use top_p between 0.85-0.95 for optimal diversity'
        ]
      };
    
    default:
      return baseReport;
  }
}

/**
 * Helper function to generate batch experiment export
 */
function generateBatchExperimentExport(batchExperiment, options) {
  return {
    batch_experiment: batchExperiment,
    parameter_combinations: [
      { temperature: 0.8, top_p: 0.9, avg_quality: 94.2 },
      { temperature: 0.6, top_p: 0.8, avg_quality: 87.5 }
    ],
    export_metadata: {
      generated_at: new Date().toISOString(),
      format: options.format
    }
  };
}

/**
 * Helper function to calculate mock file size
 */
function calculateMockFileSize(data) {
  const baseSize = JSON.stringify(data).length;
  const sizeVariations = {
    json: baseSize,
    csv: Math.floor(baseSize * 0.7),
    xlsx: Math.floor(baseSize * 1.2),
    pdf: Math.floor(baseSize * 2.5),
    html: Math.floor(baseSize * 1.5),
    docx: Math.floor(baseSize * 1.8)
  };
  
  // Convert to human-readable format
  const bytes = sizeVariations[data.format] || baseSize;
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

module.exports = router;