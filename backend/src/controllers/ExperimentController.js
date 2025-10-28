/**
 * @fileoverview Experiment Controller
 * @description Handles all experiment-related HTTP requests with proper error handling,
 * validation, and business logic separation following production standards.
 * 
 * @author LLM-LAB Team
 * @version 1.0.0
 * @since 2025-10-28
 */

const ExperimentModel = require('../models/Experiment');
const ResponseModel = require('../models/Response');
const { ValidationError, NotFoundError, DatabaseError } = require('../utils/errors');
const { validateExperimentData } = require('../utils/validators');
const logger = require('../utils/logger');

/**
 * ExperimentController class handles all experiment-related operations
 * Following SOLID principles and dependency injection patterns
 */
class ExperimentController {
  /**
   * Constructor for ExperimentController
   * @param {Object} experimentModel - Experiment model instance for dependency injection
   * @param {Object} responseModel - Response model instance for dependency injection
   */
  constructor(experimentModel = ExperimentModel, responseModel = ResponseModel) {
    this.experimentModel = experimentModel;
    this.responseModel = responseModel;
  }

  /**
   * Get all experiments with pagination and filtering support
   * @route GET /api/experiments
   * @access Public
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   * @returns {Promise<void>}
   */
  async getAllExperiments(req, res, next) {
    try {
      logger.info('Fetching all experiments', { 
        query: req.query, 
        timestamp: new Date().toISOString() 
      });

      // Extract query parameters with defaults
      const {
        page = 1,
        limit = 10,
        sortBy = 'created_at',
        sortOrder = 'DESC',
        status,
        search
      } = req.query;

      // Validate pagination parameters
      const pageNum = Math.max(1, parseInt(page, 10));
      const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10))); // Max 100 items per page

      const experiments = await this.experimentModel.findAll({
        page: pageNum,
        limit: limitNum,
        sortBy,
        sortOrder,
        status,
        search
      });

      const total = await this.experimentModel.count({ status, search });

      const response = {
        success: true,
        data: {
          experiments,
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

      logger.info('Successfully fetched experiments', { 
        count: experiments.length, 
        page: pageNum 
      });

      res.status(200).json(response);
    } catch (error) {
      logger.error('Error fetching experiments:', error);
      next(new DatabaseError('Failed to fetch experiments', error));
    }
  }

  /**
   * Get a specific experiment by ID with related data
   * @route GET /api/experiments/:id
   * @access Public
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   * @returns {Promise<void>}
   */
  async getExperimentById(req, res, next) {
    try {
      const { id } = req.params;

      // Validate ID parameter
      if (!id || isNaN(parseInt(id, 10))) {
        return next(new ValidationError('Invalid experiment ID provided'));
      }

      const experimentId = parseInt(id, 10);

      logger.info('Fetching experiment by ID', { experimentId });

      const experiment = await this.experimentModel.findById(experimentId);

      if (!experiment) {
        return next(new NotFoundError(`Experiment with ID ${experimentId} not found`));
      }

      // Get related data
      const [responses, parameterCombinations] = await Promise.all([
        this.responseModel.findByExperiment(experimentId),
        this.experimentModel.getParameterCombinations(experimentId)
      ]);

      const response = {
        success: true,
        data: {
          experiment,
          responses,
          parameter_combinations: parameterCombinations,
          statistics: {
            total_responses: responses.length,
            total_combinations: parameterCombinations.length,
            completion_rate: parameterCombinations.length > 0 
              ? (responses.length / (parameterCombinations.length * experiment.response_count)) * 100 
              : 0
          }
        },
        meta: {
          timestamp: new Date().toISOString(),
          version: '1.0.0'
        }
      };

      logger.info('Successfully fetched experiment', { experimentId, responseCount: responses.length });

      res.status(200).json(response);
    } catch (error) {
      logger.error('Error fetching experiment by ID:', error);
      next(new DatabaseError('Failed to fetch experiment', error));
    }
  }

  /**
   * Create a new experiment with comprehensive validation
   * @route POST /api/experiments
   * @access Public
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   * @returns {Promise<void>}
   */
  async createExperiment(req, res, next) {
    try {
      logger.info('Creating new experiment', { body: req.body });

      // Validate request data
      const validationResult = validateExperimentData(req.body);
      if (!validationResult.isValid) {
        return next(new ValidationError('Validation failed', validationResult.errors));
      }

      // Prepare experiment data with defaults
      const experimentData = {
        name: req.body.name.trim(),
        description: req.body.description?.trim() || '',
        prompt: req.body.prompt.trim(),
        temperature_min: req.body.temperature_min || 0.1,
        temperature_max: req.body.temperature_max || 1.0,
        temperature_step: req.body.temperature_step || 0.1,
        top_p_min: req.body.top_p_min || 0.1,
        top_p_max: req.body.top_p_max || 1.0,
        top_p_step: req.body.top_p_step || 0.1,
        frequency_penalty_min: req.body.frequency_penalty_min || 0.0,
        frequency_penalty_max: req.body.frequency_penalty_max || 0.0,
        presence_penalty_min: req.body.presence_penalty_min || 0.0,
        presence_penalty_max: req.body.presence_penalty_max || 0.0,
        max_tokens: req.body.max_tokens || 150,
        response_count: req.body.response_count || 5,
        model: req.body.model || 'gpt-3.5-turbo'
      };

      const experiment = await this.experimentModel.create(experimentData);

      // Generate parameter combinations
      const parameterCombinations = await this.experimentModel.getParameterCombinations(experiment.id);

      const response = {
        success: true,
        data: {
          experiment,
          parameter_combinations: parameterCombinations,
          statistics: {
            total_combinations: parameterCombinations.length,
            estimated_responses: parameterCombinations.length * experiment.response_count,
            estimated_time_minutes: Math.ceil((parameterCombinations.length * experiment.response_count * 2) / 60)
          }
        },
        meta: {
          timestamp: new Date().toISOString(),
          version: '1.0.0'
        }
      };

      logger.info('Successfully created experiment', { 
        experimentId: experiment.id, 
        combinationsCount: parameterCombinations.length 
      });

      res.status(201).json(response);
    } catch (error) {
      logger.error('Error creating experiment:', error);
      next(new DatabaseError('Failed to create experiment', error));
    }
  }

  /**
   * Update an existing experiment
   * @route PUT /api/experiments/:id
   * @access Public
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   * @returns {Promise<void>}
   */
  async updateExperiment(req, res, next) {
    try {
      const { id } = req.params;

      if (!id || isNaN(parseInt(id, 10))) {
        return next(new ValidationError('Invalid experiment ID provided'));
      }

      const experimentId = parseInt(id, 10);

      logger.info('Updating experiment', { experimentId, body: req.body });

      // Check if experiment exists
      const existingExperiment = await this.experimentModel.findById(experimentId);
      if (!existingExperiment) {
        return next(new NotFoundError(`Experiment with ID ${experimentId} not found`));
      }

      // Validate update data
      const validationResult = validateExperimentData(req.body, true); // true for update mode
      if (!validationResult.isValid) {
        return next(new ValidationError('Validation failed', validationResult.errors));
      }

      const updateData = {
        name: req.body.name?.trim(),
        description: req.body.description?.trim(),
        prompt: req.body.prompt?.trim(),
        temperature_min: req.body.temperature_min,
        temperature_max: req.body.temperature_max,
        temperature_step: req.body.temperature_step,
        top_p_min: req.body.top_p_min,
        top_p_max: req.body.top_p_max,
        top_p_step: req.body.top_p_step,
        max_tokens: req.body.max_tokens,
        response_count: req.body.response_count,
        status: req.body.status
      };

      // Remove undefined values
      Object.keys(updateData).forEach(key => 
        updateData[key] === undefined && delete updateData[key]
      );

      const result = await this.experimentModel.update(experimentId, updateData);

      const updatedExperiment = await this.experimentModel.findById(experimentId);

      const response = {
        success: true,
        data: {
          experiment: updatedExperiment,
          changes: result.changes
        },
        meta: {
          timestamp: new Date().toISOString(),
          version: '1.0.0'
        }
      };

      logger.info('Successfully updated experiment', { experimentId, changes: result.changes });

      res.status(200).json(response);
    } catch (error) {
      logger.error('Error updating experiment:', error);
      next(new DatabaseError('Failed to update experiment', error));
    }
  }

  /**
   * Delete an experiment and all related data
   * @route DELETE /api/experiments/:id
   * @access Public
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   * @returns {Promise<void>}
   */
  async deleteExperiment(req, res, next) {
    try {
      const { id } = req.params;

      if (!id || isNaN(parseInt(id, 10))) {
        return next(new ValidationError('Invalid experiment ID provided'));
      }

      const experimentId = parseInt(id, 10);

      logger.info('Deleting experiment', { experimentId });

      // Check if experiment exists
      const existingExperiment = await this.experimentModel.findById(experimentId);
      if (!existingExperiment) {
        return next(new NotFoundError(`Experiment with ID ${experimentId} not found`));
      }

      const result = await this.experimentModel.delete(experimentId);

      const response = {
        success: true,
        data: {
          deleted: result.deleted,
          experiment_id: experimentId
        },
        meta: {
          timestamp: new Date().toISOString(),
          version: '1.0.0'
        }
      };

      logger.info('Successfully deleted experiment', { experimentId });

      res.status(200).json(response);
    } catch (error) {
      logger.error('Error deleting experiment:', error);
      next(new DatabaseError('Failed to delete experiment', error));
    }
  }

  /**
   * Get experiment statistics and analytics
   * @route GET /api/experiments/:id/stats
   * @access Public
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   * @returns {Promise<void>}
   */
  async getExperimentStats(req, res, next) {
    try {
      const { id } = req.params;

      if (!id || isNaN(parseInt(id, 10))) {
        return next(new ValidationError('Invalid experiment ID provided'));
      }

      const experimentId = parseInt(id, 10);

      logger.info('Fetching experiment statistics', { experimentId });

      const experiment = await this.experimentModel.findById(experimentId);
      if (!experiment) {
        return next(new NotFoundError(`Experiment with ID ${experimentId} not found`));
      }

      const stats = await this.responseModel.getStatsByExperiment(experimentId);

      const response = {
        success: true,
        data: {
          experiment_id: experimentId,
          statistics: stats
        },
        meta: {
          timestamp: new Date().toISOString(),
          version: '1.0.0'
        }
      };

      logger.info('Successfully fetched experiment statistics', { experimentId });

      res.status(200).json(response);
    } catch (error) {
      logger.error('Error fetching experiment statistics:', error);
      next(new DatabaseError('Failed to fetch experiment statistics', error));
    }
  }
}

module.exports = ExperimentController;
