const express = require('express');
const router = express.Router();
const mockResponses = require('../data/mockResponses');
const mockExperiments = require('../data/mockExperiments');

// Helper function to generate mock response content
const generateMockResponseContent = (prompt, parameters, model) => {
  const templates = [
    "This is a generated response for the prompt: '{prompt}'. The content varies based on the model ({model}) and parameters used. Temperature: {temperature}, Top-p: {top_p}.",
    "Based on your request about '{prompt}', here's a comprehensive response generated using {model} with optimized parameters for quality and relevance.",
    "In response to '{prompt}', this content demonstrates the capabilities of {model} when configured with temperature {temperature} and top-p {top_p} settings."
  ];
  
  const template = templates[Math.floor(Math.random() * templates.length)];
  return template
    .replace('{prompt}', prompt.substring(0, 50) + '...')
    .replace('{model}', model)
    .replace('{temperature}', parameters.temperature)
    .replace('{top_p}', parameters.top_p);
};

// Helper function to calculate quality metrics
const calculateQualityMetrics = (content, parameters) => {
  // Simulate quality calculation based on parameters and content length
  const baseQuality = 70 + Math.random() * 20;
  const temperatureBonus = parameters.temperature > 0.7 ? 5 : 0;
  const coherenceBonus = parameters.temperature < 0.5 ? 8 : 0;
  const lengthBonus = content.length > 200 ? 3 : 0;
  
  const overall = Math.min(100, baseQuality + temperatureBonus + coherenceBonus + lengthBonus);
  
  return {
    overall_quality: Math.round(overall * 10) / 10,
    coherence_score: Math.round((overall - 5 + Math.random() * 10) * 10) / 10,
    creativity_score: Math.round((overall + temperatureBonus - 3 + Math.random() * 6) * 10) / 10,
    readability_score: Math.round((overall - 2 + Math.random() * 4) * 10) / 10,
    completeness_score: Math.round((overall - 3 + Math.random() * 6) * 10) / 10,
    factual_accuracy: Math.round((overall - 4 + Math.random() * 8) * 10) / 10,
    relevance_score: Math.round((overall - 1 + Math.random() * 2) * 10) / 10,
    engagement_score: Math.round((overall + temperatureBonus - 2 + Math.random() * 4) * 10) / 10,
    technical_depth: Math.round((overall - 6 + Math.random() * 12) * 10) / 10
  };
};

// POST /api/responses/generate - Generate responses for an experiment
router.post('/generate', (req, res) => {
  try {
    const {
      experiment_id,
      prompt,
      parameters,
      model = 'gpt-4',
      count = 1
    } = req.body;
    
    // Validation
    if (!experiment_id || !prompt) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Experiment ID and prompt are required',
          details: 'Both experiment_id and prompt must be provided'
        }
      });
    }
    
    // Check if experiment exists
    const experiment = mockExperiments.find(exp => exp.id === parseInt(experiment_id));
    if (!experiment) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Experiment not found',
          details: `No experiment found with ID ${experiment_id}`
        }
      });
    }
    
    const responses = [];
    let totalCost = 0;
    let totalTokens = 0;
    
    // Generate responses
    for (let i = 0; i < count; i++) {
      const responseId = Math.max(...mockResponses.map(r => r.id), 0) + i + 1;
      const content = generateMockResponseContent(prompt, parameters, model);
      const qualityMetrics = calculateQualityMetrics(content, parameters);
      const responseTime = 1.5 + Math.random() * 2;
      const cost = 0.008 + Math.random() * 0.004;
      const tokenCount = Math.floor(content.length / 4); // Rough token estimation
      
      const newResponse = {
        id: responseId,
        experiment_id: parseInt(experiment_id),
        content,
        model,
        parameters,
        quality_metrics: qualityMetrics,
        response_time: Math.round(responseTime * 10) / 10,
        cost: Math.round(cost * 1000) / 1000,
        token_count: tokenCount,
        status: 'completed',
        error: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      responses.push(newResponse);
      mockResponses.push(newResponse);
      
      totalCost += cost;
      totalTokens += tokenCount;
    }
    
    // Update experiment statistics
    const experimentIndex = mockExperiments.findIndex(exp => exp.id === parseInt(experiment_id));
    if (experimentIndex !== -1) {
      const allExperimentResponses = mockResponses.filter(r => r.experiment_id === parseInt(experiment_id));
      const avgQuality = allExperimentResponses.reduce((sum, r) => sum + r.quality_metrics.overall_quality, 0) / allExperimentResponses.length;
      
      mockExperiments[experimentIndex].response_count = allExperimentResponses.length;
      mockExperiments[experimentIndex].average_quality = Math.round(avgQuality * 10) / 10;
      mockExperiments[experimentIndex].total_cost += totalCost;
      mockExperiments[experimentIndex].total_tokens += totalTokens;
      mockExperiments[experimentIndex].updated_at = new Date().toISOString();
    }
    
    res.json({
      success: true,
      data: {
        experiment_id: parseInt(experiment_id),
        responses: responses,
        total_generated: responses.length,
        total_errors: 0,
        batch_summary: {
          total_cost: Math.round(totalCost * 1000) / 1000,
          total_tokens: totalTokens,
          average_response_time: Math.round((responses.reduce((sum, r) => sum + r.response_time, 0) / responses.length) * 10) / 10
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to generate responses',
        details: error.message
      }
    });
  }
});

// GET /api/responses/:id - Get response by ID
router.get('/:id', (req, res) => {
  try {
    const responseId = parseInt(req.params.id);
    const response = mockResponses.find(resp => resp.id === responseId);
    
    if (!response) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Response not found',
          details: `No response found with ID ${responseId}`
        }
      });
    }
    
    // Get associated experiment info
    const experiment = mockExperiments.find(exp => exp.id === response.experiment_id);
    
    res.json({
      success: true,
      data: {
        response: {
          ...response,
          experiment: experiment ? {
            id: experiment.id,
            name: experiment.name,
            prompt: experiment.prompt
          } : null
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch response',
        details: error.message
      }
    });
  }
});

// GET /api/experiments/:experimentId/responses - Get responses for experiment
router.get('/experiment/:experimentId', (req, res) => {
  try {
    const experimentId = parseInt(req.params.experimentId);
    const {
      page = 1,
      limit = 10,
      sort = 'created_at',
      order = 'desc',
      min_quality,
      max_quality
    } = req.query;
    
    let responses = mockResponses.filter(resp => resp.experiment_id === experimentId);
    
    // Apply quality filters
    if (min_quality) {
      responses = responses.filter(resp => resp.quality_metrics.overall_quality >= parseFloat(min_quality));
    }
    
    if (max_quality) {
      responses = responses.filter(resp => resp.quality_metrics.overall_quality <= parseFloat(max_quality));
    }
    
    // Sort responses
    responses.sort((a, b) => {
      let aVal = a[sort] || a.quality_metrics?.[sort] || a.quality_metrics?.overall_quality;
      let bVal = b[sort] || b.quality_metrics?.[sort] || b.quality_metrics?.overall_quality;
      
      if (sort === 'created_at') {
        aVal = new Date(aVal);
        bVal = new Date(bVal);
      }
      
      if (order === 'desc') {
        return bVal > aVal ? 1 : -1;
      } else {
        return aVal > bVal ? 1 : -1;
      }
    });
    
    // Paginate
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedResponses = responses.slice(startIndex, endIndex);
    
    // Calculate summary
    const totalCost = responses.reduce((sum, r) => sum + r.cost, 0);
    const totalTokens = responses.reduce((sum, r) => sum + r.token_count, 0);
    const avgQuality = responses.length > 0 ? 
      responses.reduce((sum, r) => sum + r.quality_metrics.overall_quality, 0) / responses.length : 0;
    
    res.json({
      success: true,
      data: {
        experiment_id: experimentId,
        responses: paginatedResponses,
        summary: {
          total_responses: responses.length,
          average_quality: Math.round(avgQuality * 10) / 10,
          total_cost: Math.round(totalCost * 1000) / 1000,
          total_tokens: totalTokens
        },
        pagination: {
          current_page: parseInt(page),
          total_pages: Math.ceil(responses.length / limit),
          total_items: responses.length,
          per_page: parseInt(limit),
          has_next: endIndex < responses.length,
          has_prev: startIndex > 0
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch experiment responses',
        details: error.message
      }
    });
  }
});

// POST /api/responses/compare - Compare multiple responses
router.post('/compare', (req, res) => {
  try {
    const {
      response_ids,
      comparison_criteria = ['quality', 'creativity', 'readability'],
      include_detailed_analysis = true
    } = req.body;
    
    if (!response_ids || !Array.isArray(response_ids) || response_ids.length < 2) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'At least 2 response IDs are required for comparison',
          details: 'response_ids must be an array with minimum 2 elements'
        }
      });
    }
    
    // Get responses
    const responses = response_ids.map(id => {
      const response = mockResponses.find(r => r.id === parseInt(id));
      if (!response) return null;
      
      return {
        id: response.id,
        overall_quality: response.quality_metrics.overall_quality,
        metrics: {
          coherence_score: response.quality_metrics.coherence_score,
          creativity_score: response.quality_metrics.creativity_score,
          readability_score: response.quality_metrics.readability_score,
          completeness_score: response.quality_metrics.completeness_score
        },
        content_preview: response.content.substring(0, 100) + '...',
        model: response.model,
        parameters: response.parameters,
        response_time: response.response_time,
        cost: response.cost
      };
    }).filter(r => r !== null);
    
    if (responses.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'No valid responses found for comparison'
        }
      });
    }
    
    // Find best performers
    const bestOverall = responses.reduce((best, current) => 
      current.overall_quality > best.overall_quality ? current : best
    );
    
    const bestCreativity = responses.reduce((best, current) => 
      current.metrics.creativity_score > best.metrics.creativity_score ? current : best
    );
    
    // Generate insights
    const insights = [
      "Response quality varies significantly across different parameter settings",
      `Highest overall quality achieved by response ${bestOverall.id} with ${bestOverall.overall_quality}% score`,
      `Best creativity demonstrated by response ${bestCreativity.id} with ${bestCreativity.metrics.creativity_score}% score`
    ];
    
    // Add parameter-specific insights
    const avgTemp = responses.reduce((sum, r) => sum + r.parameters.temperature, 0) / responses.length;
    if (avgTemp > 0.7) {
      insights.push("Higher temperature settings correlate with increased creativity scores");
    }
    
    const recommendations = [
      `Consider using parameters from response ${bestOverall.id} for optimal quality`,
      "Monitor temperature settings for creative vs. technical tasks",
      "Test parameter combinations systematically for best results"
    ];
    
    // Detailed comparison metrics
    let detailedComparison = {};
    if (include_detailed_analysis) {
      const creativityScores = responses.map(r => r.metrics.creativity_score);
      const coherenceScores = responses.map(r => r.metrics.coherence_score);
      const readabilityScores = responses.map(r => r.metrics.readability_score);
      
      detailedComparison = {
        quality_differences: [
          {
            metric: 'creativity_score',
            range: Math.max(...creativityScores) - Math.min(...creativityScores),
            highest: Math.max(...creativityScores),
            lowest: Math.min(...creativityScores),
            average: creativityScores.reduce((sum, s) => sum + s, 0) / creativityScores.length
          },
          {
            metric: 'coherence_score',
            range: Math.max(...coherenceScores) - Math.min(...coherenceScores),
            highest: Math.max(...coherenceScores),
            lowest: Math.min(...coherenceScores),
            average: coherenceScores.reduce((sum, s) => sum + s, 0) / coherenceScores.length
          },
          {
            metric: 'readability_score',
            range: Math.max(...readabilityScores) - Math.min(...readabilityScores),
            highest: Math.max(...readabilityScores),
            lowest: Math.min(...readabilityScores),
            average: readabilityScores.reduce((sum, s) => sum + s, 0) / readabilityScores.length
          }
        ]
      };
    }
    
    res.json({
      success: true,
      data: {
        comparison: {
          responses,
          analysis: {
            best_overall: {
              response_id: bestOverall.id,
              score: bestOverall.overall_quality
            },
            best_creativity: {
              response_id: bestCreativity.id,
              score: bestCreativity.metrics.creativity_score
            },
            parameter_insights: insights,
            recommendations
          },
          detailed_comparison: detailedComparison
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to compare responses',
        details: error.message
      }
    });
  }
});

module.exports = router;
