/**
 * @fileoverview Response Controller
 * @description Handles all response-related HTTP requests with LLM integration,
 * quality metrics calculation, and comprehensive error handling.
 * 
 * @author LLM-LAB Team
 * @version 1.0.0
 * @since 2025-10-28
 */

const ResponseModel = require('../models/Response');
const ExperimentModel = require('../models/Experiment');
const llmService = require('../services/llmService');
const qualityMetricsService = require('../services/qualityMetricsService');
const { ValidationError, NotFoundError, DatabaseError, ExternalAPIError } = require('../utils/errors');
const { validateResponseData } = require('../utils/validators');
const logger = require('../utils/logger');

/**
 * ResponseController class handles all response generation and management operations
 * Integrates with LLM services and quality metrics calculation
 */
class ResponseController {
  /**
   * Constructor for ResponseController
   * @param {Object} responseModel - Response model instance for dependency injection
   * @param {Object} experimentModel - Experiment model instance for dependency injection
   */
  constructor(responseModel = ResponseModel, experimentModel = ExperimentModel) {
    this.responseModel = responseModel;
    this.experimentModel = experimentModel;
  }

  /**
   * Get all responses for a specific experiment with filtering and pagination
   * @route GET /api/experiments/:experimentId/responses
   * @access Public
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   * @returns {Promise<void>}
   */
  async getResponsesByExperiment(req, res, next) {
    try {
      const { experimentId } = req.params;
      const {
        page = 1,
        limit = 20,
        sortBy = 'created_at',
        sortOrder = 'DESC',
        temperature,
        top_p,
        model
      } = req.query;

      if (!experimentId || isNaN(parseInt(experimentId, 10))) {
        return next(new ValidationError('Invalid experiment ID provided'));
      }

      const expId = parseInt(experimentId, 10);

      logger.info('Fetching responses for experiment', { 
        experimentId: expId, 
        query: req.query 
      });

      // Verify experiment exists
      const experiment = await this.experimentModel.findById(expId);
      if (!experiment) {
        return next(new NotFoundError(`Experiment with ID ${expId} not found`));
      }

      // Validate pagination parameters
      const pageNum = Math.max(1, parseInt(page, 10));
      const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));

      const responses = await this.responseModel.findByExperiment(expId, {
        page: pageNum,
        limit: limitNum,
        sortBy,
        sortOrder,
        filters: { temperature, top_p, model }
      });

      const total = await this.responseModel.countByExperiment(expId, {
        temperature, top_p, model
      });

      const response = {
        success: true,
        data: {
          experiment_id: expId,
          responses,
          pagination: {
            page: pageNum,
            limit: limitNum,
            total,
            totalPages: Math.ceil(total / limitNum),
            hasNextPage: pageNum * limitNum < total,
            hasPrevPage: pageNum > 1
          }
        },
        meta: {
          timestamp: new Date().toISOString(),
          version: '1.0.0'
        }
      };

      logger.info('Successfully fetched responses', { 
        experimentId: expId, 
        count: responses.length 
      });

      res.status(200).json(response);
    } catch (error) {
      logger.error('Error fetching responses:', error);
      next(new DatabaseError('Failed to fetch responses', error));
    }
  }

  /**
   * Generate responses for an experiment with comprehensive parameter testing
   * @route POST /api/experiments/:experimentId/generate
   * @access Public
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   * @returns {Promise<void>}
   */
  async generateResponses(req, res, next) {
    try {
      const { experimentId } = req.params;

      if (!experimentId || isNaN(parseInt(experimentId, 10))) {
        return next(new ValidationError('Invalid experiment ID provided'));
      }

      const expId = parseInt(experimentId, 10);

      logger.info('Starting response generation', { experimentId: expId });

      // Verify experiment exists and get details
      const experiment = await this.experimentModel.findById(expId);
      if (!experiment) {
        return next(new NotFoundError(`Experiment with ID ${expId} not found`));
      }

      // Check if experiment is already completed
      if (experiment.status === 'completed') {
        return next(new ValidationError('Experiment is already completed'));
      }

      // Update experiment status to running
      await this.experimentModel.update(expId, { status: 'running' });

      // Calculate parameter combinations
      const parameterCombinations = this._generateParameterCombinations(experiment);
      const totalResponses = parameterCombinations.length * experiment.response_count;

      logger.info('Parameter combinations calculated', { 
        experimentId: expId, 
        combinations: parameterCombinations.length,
        totalResponses 
      });

      // Initialize progress tracking
      let completedResponses = 0;
      const results = [];

      // Set up SSE headers for real-time progress updates
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Cache-Control'
      });

      // Send initial progress
      this._sendProgress(res, {
        experimentId: expId,
        progress: 0,
        completed: 0,
        total: totalResponses,
        status: 'starting'
      });

      try {
        // Generate responses for each parameter combination
        for (const combination of parameterCombinations) {
          for (let responseIndex = 0; responseIndex < experiment.response_count; responseIndex++) {
            try {
              // Generate LLM response
              const llmResponse = await llmService.generateResponse(
                experiment.prompt,
                combination
              );

              // Calculate quality metrics
              const qualityMetrics = await qualityMetricsService.calculateMetrics(
                llmResponse.content,
                experiment.prompt
              );

              // Save response to database
              const responseData = {
                experiment_id: expId,
                content: llmResponse.content,
                prompt: experiment.prompt,
                temperature: combination.temperature,
                top_p: combination.top_p,
                frequency_penalty: combination.frequency_penalty || 0,
                presence_penalty: combination.presence_penalty || 0,
                max_tokens: experiment.max_tokens,
                model: experiment.model,
                response_time: llmResponse.response_time,
                token_count: llmResponse.usage?.total_tokens || 0,
                coherence_score: qualityMetrics.coherence,
                completeness_score: qualityMetrics.completeness,
                readability_score: qualityMetrics.readability,
                creativity_score: qualityMetrics.creativity,
                specificity_score: qualityMetrics.specificity,
                length_appropriateness_score: qualityMetrics.length_appropriateness
              };

              const savedResponse = await this.responseModel.create(responseData);
              results.push(savedResponse);

              completedResponses++;

              // Send progress update
              const progress = Math.round((completedResponses / totalResponses) * 100);
              this._sendProgress(res, {
                experimentId: expId,
                progress,
                completed: completedResponses,
                total: totalResponses,
                status: 'generating',
                current_combination: combination,
                latest_response: {
                  id: savedResponse.id,
                  content_preview: llmResponse.content.substring(0, 100) + '...',
                  quality_scores: qualityMetrics
                }
              });

              // Small delay to prevent API rate limiting
              await new Promise(resolve => setTimeout(resolve, 100));

            } catch (responseError) {
              logger.error('Error generating individual response:', responseError);
              
              // Send error update but continue with other responses
              this._sendProgress(res, {
                experimentId: expId,
                progress: Math.round((completedResponses / totalResponses) * 100),
                completed: completedResponses,
                total: totalResponses,
                status: 'error',
                error: `Failed to generate response for combination: ${JSON.stringify(combination)}`
              });
            }
          }
        }

        // Update experiment status to completed
        await this.experimentModel.update(expId, { 
          status: 'completed',
          completed_at: new Date().toISOString()
        });

        // Send final completion update
        this._sendProgress(res, {
          experimentId: expId,
          progress: 100,
          completed: completedResponses,
          total: totalResponses,
          status: 'completed',
          summary: {
            total_responses: results.length,
            parameter_combinations: parameterCombinations.length,
            avg_quality_scores: await this._calculateAverageQualityScores(results)
          }
        });

        logger.info('Response generation completed', { 
          experimentId: expId, 
          totalGenerated: results.length 
        });

      } catch (generationError) {
        logger.error('Error during response generation:', generationError);
        
        // Update experiment status to failed
        await this.experimentModel.update(expId, { 
          status: 'failed',
          error_message: generationError.message
        });

        this._sendProgress(res, {
          experimentId: expId,
          progress: Math.round((completedResponses / totalResponses) * 100),
          completed: completedResponses,
          total: totalResponses,
          status: 'failed',
          error: generationError.message
        });
      }

      res.end();

    } catch (error) {
      logger.error('Error in response generation setup:', error);
      next(new DatabaseError('Failed to generate responses', error));
    }
  }

  /**
   * Get a specific response by ID with detailed metrics
   * @route GET /api/responses/:id
   * @access Public
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   * @returns {Promise<void>}
   */
  async getResponseById(req, res, next) {
    try {
      const { id } = req.params;

      if (!id || isNaN(parseInt(id, 10))) {
        return next(new ValidationError('Invalid response ID provided'));
      }

      const responseId = parseInt(id, 10);

      logger.info('Fetching response by ID', { responseId });

      const response = await this.responseModel.findById(responseId);

      if (!response) {
        return next(new NotFoundError(`Response with ID ${responseId} not found`));
      }

      const result = {
        success: true,
        data: {
          response,
          quality_analysis: {
            coherence: response.coherence_score,
            completeness: response.completeness_score,
            readability: response.readability_score,
            creativity: response.creativity_score,
            specificity: response.specificity_score,
            length_appropriateness: response.length_appropriateness_score,
            overall_score: this._calculateOverallScore(response)
          }
        },
        meta: {
          timestamp: new Date().toISOString(),
          version: '1.0.0'
        }
      };

      logger.info('Successfully fetched response', { responseId });

      res.status(200).json(result);
    } catch (error) {
      logger.error('Error fetching response by ID:', error);
      next(new DatabaseError('Failed to fetch response', error));
    }
  }

  /**
   * Compare multiple responses with detailed analysis
   * @route POST /api/responses/compare
   * @access Public
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   * @returns {Promise<void>}
   */
  async compareResponses(req, res, next) {
    try {
      const { responseIds } = req.body;

      if (!responseIds || !Array.isArray(responseIds) || responseIds.length < 2) {
        return next(new ValidationError('At least 2 response IDs are required for comparison'));
      }

      if (responseIds.length > 10) {
        return next(new ValidationError('Maximum 10 responses can be compared at once'));
      }

      logger.info('Comparing responses', { responseIds });

      const responses = await Promise.all(
        responseIds.map(id => this.responseModel.findById(parseInt(id, 10)))
      );

      // Check if all responses exist
      const missingResponses = responses
        .map((response, index) => response ? null : responseIds[index])
        .filter(id => id !== null);

      if (missingResponses.length > 0) {
        return next(new NotFoundError(`Responses not found: ${missingResponses.join(', ')}`));
      }

      // Perform comparison analysis
      const comparison = this._performComparisonAnalysis(responses);

      const result = {
        success: true,
        data: {
          responses: responses.map(response => ({
            id: response.id,
            content: response.content,
            parameters: {
              temperature: response.temperature,
              top_p: response.top_p,
              frequency_penalty: response.frequency_penalty,
              presence_penalty: response.presence_penalty,
              model: response.model
            },
            quality_scores: {
              coherence: response.coherence_score,
              completeness: response.completeness_score,
              readability: response.readability_score,
              creativity: response.creativity_score,
              specificity: response.specificity_score,
              length_appropriateness: response.length_appropriateness_score,
              overall: this._calculateOverallScore(response)
            },
            response_time: response.response_time,
            token_count: response.token_count
          })),
          comparison_analysis: comparison
        },
        meta: {
          timestamp: new Date().toISOString(),
          version: '1.0.0'
        }
      };

      logger.info('Successfully compared responses', { count: responses.length });

      res.status(200).json(result);
    } catch (error) {
      logger.error('Error comparing responses:', error);
      next(new DatabaseError('Failed to compare responses', error));
    }
  }

  /**
   * Generate parameter combinations for testing
   * @private
   * @param {Object} experiment - Experiment configuration
   * @returns {Array} Array of parameter combinations
   */
  _generateParameterCombinations(experiment) {
    const combinations = [];
    
    // Generate temperature values
    const temperatures = [];
    for (let temp = experiment.temperature_min; temp <= experiment.temperature_max; temp += experiment.temperature_step) {
      temperatures.push(Math.round(temp * 100) / 100); // Round to 2 decimal places
    }

    // Generate top_p values
    const topPValues = [];
    for (let topP = experiment.top_p_min; topP <= experiment.top_p_max; topP += experiment.top_p_step) {
      topPValues.push(Math.round(topP * 100) / 100);
    }

    // Generate combinations
    temperatures.forEach(temperature => {
      topPValues.forEach(top_p => {
        combinations.push({
          temperature,
          top_p,
          frequency_penalty: experiment.frequency_penalty_min || 0,
          presence_penalty: experiment.presence_penalty_min || 0,
          max_tokens: experiment.max_tokens,
          model: experiment.model
        });
      });
    });

    return combinations;
  }

  /**
   * Send progress update via Server-Sent Events
   * @private
   * @param {Object} res - Express response object
   * @param {Object} data - Progress data
   */
  _sendProgress(res, data) {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  }

  /**
   * Calculate overall quality score from individual metrics
   * @private
   * @param {Object} response - Response object with quality scores
   * @returns {number} Overall quality score
   */
  _calculateOverallScore(response) {
    const scores = [
      response.coherence_score,
      response.completeness_score,
      response.readability_score,
      response.creativity_score,
      response.specificity_score,
      response.length_appropriateness_score
    ];
    
    const validScores = scores.filter(score => score !== null && score !== undefined);
    return validScores.length > 0 
      ? Math.round((validScores.reduce((sum, score) => sum + score, 0) / validScores.length) * 100) / 100
      : 0;
  }

  /**
   * Calculate average quality scores for a set of responses
   * @private
   * @param {Array} responses - Array of response objects
   * @returns {Object} Average quality scores
   */
  async _calculateAverageQualityScores(responses) {
    if (responses.length === 0) return {};

    const sums = {
      coherence: 0,
      completeness: 0,
      readability: 0,
      creativity: 0,
      specificity: 0,
      length_appropriateness: 0
    };

    responses.forEach(response => {
      sums.coherence += response.coherence_score || 0;
      sums.completeness += response.completeness_score || 0;
      sums.readability += response.readability_score || 0;
      sums.creativity += response.creativity_score || 0;
      sums.specificity += response.specificity_score || 0;
      sums.length_appropriateness += response.length_appropriateness_score || 0;
    });

    const count = responses.length;
    return {
      coherence: Math.round((sums.coherence / count) * 100) / 100,
      completeness: Math.round((sums.completeness / count) * 100) / 100,
      readability: Math.round((sums.readability / count) * 100) / 100,
      creativity: Math.round((sums.creativity / count) * 100) / 100,
      specificity: Math.round((sums.specificity / count) * 100) / 100,
      length_appropriateness: Math.round((sums.length_appropriateness / count) * 100) / 100
    };
  }

  /**
   * Perform detailed comparison analysis between responses
   * @private
   * @param {Array} responses - Array of response objects
   * @returns {Object} Comparison analysis results
   */
  _performComparisonAnalysis(responses) {
    const analysis = {
      best_performing: {},
      parameter_insights: {},
      quality_trends: {},
      recommendations: []
    };

    // Find best performing response for each metric
    const metrics = ['coherence', 'completeness', 'readability', 'creativity', 'specificity', 'length_appropriateness'];
    
    metrics.forEach(metric => {
      const scoreField = `${metric}_score`;
      const best = responses.reduce((prev, current) => 
        (current[scoreField] || 0) > (prev[scoreField] || 0) ? current : prev
      );
      analysis.best_performing[metric] = {
        response_id: best.id,
        score: best[scoreField],
        parameters: {
          temperature: best.temperature,
          top_p: best.top_p
        }
      };
    });

    // Analyze parameter impact
    const parameterGroups = {
      temperature: {},
      top_p: {}
    };

    responses.forEach(response => {
      ['temperature', 'top_p'].forEach(param => {
        const value = response[param];
        if (!parameterGroups[param][value]) {
          parameterGroups[param][value] = {
            responses: [],
            avg_scores: {}
          };
        }
        parameterGroups[param][value].responses.push(response);
      });
    });

    // Calculate average scores for each parameter value
    Object.keys(parameterGroups).forEach(param => {
      Object.keys(parameterGroups[param]).forEach(value => {
        const group = parameterGroups[param][value];
        metrics.forEach(metric => {
          const scoreField = `${metric}_score`;
          const scores = group.responses.map(r => r[scoreField] || 0);
          group.avg_scores[metric] = scores.reduce((sum, score) => sum + score, 0) / scores.length;
        });
      });
    });

    analysis.parameter_insights = parameterGroups;

    // Generate recommendations
    if (responses.length >= 3) {
      analysis.recommendations.push(
        'Consider using the best-performing parameter combinations for production use',
        'Test edge cases with extreme parameter values',
        'Monitor response consistency across different parameter ranges'
      );
    }

    return analysis;
  }

  /**
   * Generate a single response without creating an experiment
   * Used for quick testing and parameter exploration
   * @param {Object} params - Response parameters
   * @param {string} params.prompt - The prompt to generate response for
   * @param {number} params.temperature - Temperature parameter
   * @param {number} params.top_p - Top-p parameter
   * @param {number} params.frequency_penalty - Frequency penalty parameter
   * @param {number} params.presence_penalty - Presence penalty parameter
   * @param {number} params.max_tokens - Maximum tokens
   * @param {string} params.model - Model to use
   * @returns {Promise<Object>} Generated response with quality metrics
   */
  async generateSingleResponse(params) {
    try {
      const {
        prompt,
        temperature = 0.7,
        top_p = 0.9,
        frequency_penalty = 0.0,
        presence_penalty = 0.0,
        max_tokens = 150,
        model = 'gpt-3.5-turbo'
      } = params;

      logger.info('Generating single response without experiment', {
        prompt: prompt.substring(0, 50) + '...',
        temperature,
        top_p,
        model
      });

      const startTime = Date.now();

      // Generate response using LLM service
      const llmResponse = await llmService.generateResponse(prompt, {
        temperature,
        top_p,
        frequency_penalty,
        presence_penalty,
        max_tokens,
        model
      });

      const responseTime = (Date.now() - startTime) / 1000;

      // Calculate quality metrics
      const qualityMetrics = await qualityMetricsService.calculateMetrics(llmResponse.content, prompt);

      // Prepare response object
      const response = {
        id: `temp_${Date.now()}`,
        content: llmResponse.content,
        prompt,
        temperature,
        top_p,
        frequency_penalty,
        presence_penalty,
        max_tokens,
        model,
        response_time: responseTime,
        token_count: llmResponse.usage?.total_tokens || 0,
        coherence_score: qualityMetrics.coherence || 0,
        completeness_score: qualityMetrics.completeness || 0,
        readability_score: qualityMetrics.readability || 0,
        creativity_score: qualityMetrics.creativity || 0,
        specificity_score: qualityMetrics.specificity || 0,
        length_appropriateness_score: qualityMetrics.length_appropriateness || 0,
        created_at: new Date().toISOString()
      };

      logger.info('Single response generated successfully', {
        responseId: response.id,
        responseTime,
        tokenCount: response.token_count
      });

      return response;
    } catch (error) {
      logger.error('Failed to generate single response', error);
      throw new ExternalAPIError('Failed to generate response: ' + error.message);
    }
  }
}

module.exports = ResponseController;
