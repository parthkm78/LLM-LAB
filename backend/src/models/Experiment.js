/**
 * @fileoverview Enhanced Experiment Model
 * @description Production-ready Experiment model with comprehensive database operations,
 * validation, caching, and relationship management.
 * 
 * @author LLM-LAB Team
 * @version 1.0.0
 * @since 2025-10-28
 */

const Database = require('../config/database');
const { DatabaseError, ValidationError } = require('../utils/errors');
const logger = require('../utils/logger');

/**
 * Experiment Model Class
 * Handles all database operations for experiments with caching and validation
 */
class ExperimentModel {
  constructor() {
    this.tableName = 'experiments';
    this.cache = new Map(); // Simple in-memory cache
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  /**
   * Find all experiments with advanced filtering and pagination
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of experiments
   */
  async findAll(options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = 'created_at',
        sortOrder = 'DESC',
        status,
        search,
        startDate,
        endDate
      } = options;

      let query = `SELECT * FROM ${this.tableName} WHERE 1=1`;
      const params = [];

      // Add status filter
      if (status) {
        query += ` AND status = ?`;
        params.push(status);
      }

      // Add search filter
      if (search) {
        query += ` AND (name LIKE ? OR description LIKE ? OR prompt LIKE ?)`;
        const searchTerm = `%${search}%`;
        params.push(searchTerm, searchTerm, searchTerm);
      }

      // Add date range filters
      if (startDate) {
        query += ` AND created_at >= ?`;
        params.push(startDate);
      }

      if (endDate) {
        query += ` AND created_at <= ?`;
        params.push(endDate);
      }

      // Add sorting
      const validSortColumns = ['id', 'name', 'created_at', 'updated_at', 'status'];
      const sortColumn = validSortColumns.includes(sortBy) ? sortBy : 'created_at';
      const order = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
      query += ` ORDER BY ${sortColumn} ${order}`;

      // Add pagination
      const offset = (page - 1) * limit;
      query += ` LIMIT ? OFFSET ?`;
      params.push(limit, offset);

      logger.debug('Executing findAll query', { query, params });

      const experiments = await Database.all(query, params);
      
      // Transform database results
      return experiments.map(exp => this._transformFromDB(exp));
    } catch (error) {
      logger.error('Error in findAll:', error);
      throw new DatabaseError('Failed to fetch experiments', error);
    }
  }

  /**
   * Count experiments with filters
   * @param {Object} filters - Filter options
   * @returns {Promise<number>} Total count
   */
  async count(filters = {}) {
    try {
      const { status, search, startDate, endDate } = filters;

      let query = `SELECT COUNT(*) as count FROM ${this.tableName} WHERE 1=1`;
      const params = [];

      // Add filters (same logic as findAll)
      if (status) {
        query += ` AND status = ?`;
        params.push(status);
      }

      if (search) {
        query += ` AND (name LIKE ? OR description LIKE ? OR prompt LIKE ?)`;
        const searchTerm = `%${search}%`;
        params.push(searchTerm, searchTerm, searchTerm);
      }

      if (startDate) {
        query += ` AND created_at >= ?`;
        params.push(startDate);
      }

      if (endDate) {
        query += ` AND created_at <= ?`;
        params.push(endDate);
      }

      const result = await Database.get(query, params);
      return result.count;
    } catch (error) {
      logger.error('Error in count:', error);
      throw new DatabaseError('Failed to count experiments', error);
    }
  }

  /**
   * Find experiment by ID with caching
   * @param {number} id - Experiment ID
   * @returns {Promise<Object|null>} Experiment object or null
   */
  async findById(id) {
    try {
      // Check cache first
      const cacheKey = `experiment:${id}`;
      const cached = this._getFromCache(cacheKey);
      if (cached) {
        logger.debug('Experiment found in cache', { id });
        return cached;
      }

      const query = `SELECT * FROM ${this.tableName} WHERE id = ?`;
      const experiment = await Database.get(query, [id]);

      if (!experiment) {
        return null;
      }

      const transformed = this._transformFromDB(experiment);
      
      // Cache the result
      this._setCache(cacheKey, transformed);
      
      return transformed;
    } catch (error) {
      logger.error('Error in findById:', error);
      throw new DatabaseError('Failed to fetch experiment', error);
    }
  }

  /**
   * Create new experiment
   * @param {Object} data - Experiment data
   * @returns {Promise<Object>} Created experiment
   */
  async create(data) {
    try {
      logger.info('Creating new experiment', { name: data.name });

      const now = new Date().toISOString();
      const experimentData = {
        name: data.name,
        description: data.description || '',
        prompt: data.prompt,
        temperature_min: data.temperature_min || 0.1,
        temperature_max: data.temperature_max || 1.0,
        temperature_step: data.temperature_step || 0.1,
        top_p_min: data.top_p_min || 0.1,
        top_p_max: data.top_p_max || 1.0,
        top_p_step: data.top_p_step || 0.1,
        frequency_penalty_min: data.frequency_penalty_min || 0.0,
        frequency_penalty_max: data.frequency_penalty_max || 0.0,
        presence_penalty_min: data.presence_penalty_min || 0.0,
        presence_penalty_max: data.presence_penalty_max || 0.0,
        max_tokens: data.max_tokens || 150,
        response_count: data.response_count || 5,
        model: data.model || 'gpt-3.5-turbo',
        status: 'pending',
        created_at: now,
        updated_at: now
      };

      const query = `
        INSERT INTO ${this.tableName} (
          name, description, prompt, temperature_min, temperature_max, temperature_step,
          top_p_min, top_p_max, top_p_step, frequency_penalty_min, frequency_penalty_max,
          presence_penalty_min, presence_penalty_max, max_tokens, response_count,
          model, status, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const params = [
        experimentData.name, experimentData.description, experimentData.prompt,
        experimentData.temperature_min, experimentData.temperature_max, experimentData.temperature_step,
        experimentData.top_p_min, experimentData.top_p_max, experimentData.top_p_step,
        experimentData.frequency_penalty_min, experimentData.frequency_penalty_max,
        experimentData.presence_penalty_min, experimentData.presence_penalty_max,
        experimentData.max_tokens, experimentData.response_count, experimentData.model,
        experimentData.status, experimentData.created_at, experimentData.updated_at
      ];

      const result = await Database.run(query, params);
      
      logger.info('Experiment created successfully', { id: result.lastID });

      // Return the created experiment
      return await this.findById(result.lastID);
    } catch (error) {
      logger.error('Error in create:', error);
      throw new DatabaseError('Failed to create experiment', error);
    }
  }

  /**
   * Update existing experiment
   * @param {number} id - Experiment ID
   * @param {Object} data - Update data
   * @returns {Promise<Object>} Update result
   */
  async update(id, data) {
    try {
      logger.info('Updating experiment', { id, data });

      const updateFields = [];
      const params = [];

      // Build dynamic update query
      const allowedFields = [
        'name', 'description', 'prompt', 'temperature_min', 'temperature_max', 'temperature_step',
        'top_p_min', 'top_p_max', 'top_p_step', 'frequency_penalty_min', 'frequency_penalty_max',
        'presence_penalty_min', 'presence_penalty_max', 'max_tokens', 'response_count',
        'model', 'status', 'completed_at', 'error_message'
      ];

      for (const field of allowedFields) {
        if (data[field] !== undefined) {
          updateFields.push(`${field} = ?`);
          params.push(data[field]);
        }
      }

      if (updateFields.length === 0) {
        throw new ValidationError('No valid fields to update');
      }

      // Always update the updated_at field
      updateFields.push('updated_at = ?');
      params.push(new Date().toISOString());

      // Add ID parameter
      params.push(id);

      const query = `UPDATE ${this.tableName} SET ${updateFields.join(', ')} WHERE id = ?`;
      
      const result = await Database.run(query, params);
      
      if (result.changes === 0) {
        throw new ValidationError('Experiment not found or no changes made');
      }

      // Clear cache for this experiment
      this._clearCache(`experiment:${id}`);

      logger.info('Experiment updated successfully', { id, changes: result.changes });

      return { changes: result.changes, id };
    } catch (error) {
      logger.error('Error in update:', error);
      throw new DatabaseError('Failed to update experiment', error);
    }
  }

  /**
   * Delete experiment and all related data
   * @param {number} id - Experiment ID
   * @returns {Promise<Object>} Delete result
   */
  async delete(id) {
    try {
      logger.info('Deleting experiment', { id });

      // Start transaction
      await Database.run('BEGIN TRANSACTION');

      try {
        // Delete related responses first
        await Database.run('DELETE FROM responses WHERE experiment_id = ?', [id]);
        
        // Delete the experiment
        const result = await Database.run(`DELETE FROM ${this.tableName} WHERE id = ?`, [id]);
        
        if (result.changes === 0) {
          throw new ValidationError('Experiment not found');
        }

        // Commit transaction
        await Database.run('COMMIT');

        // Clear cache
        this._clearCache(`experiment:${id}`);

        logger.info('Experiment deleted successfully', { id });

        return { deleted: true, id };
      } catch (error) {
        // Rollback transaction on error
        await Database.run('ROLLBACK');
        throw error;
      }
    } catch (error) {
      logger.error('Error in delete:', error);
      throw new DatabaseError('Failed to delete experiment', error);
    }
  }

  /**
   * Get parameter combinations for an experiment
   * @param {number} experimentId - Experiment ID
   * @returns {Promise<Array>} Array of parameter combinations
   */
  async getParameterCombinations(experimentId) {
    try {
      const experiment = await this.findById(experimentId);
      if (!experiment) {
        throw new ValidationError('Experiment not found');
      }

      const combinations = [];
      
      // Generate temperature values
      const temperatures = [];
      for (let temp = experiment.temperature_min; temp <= experiment.temperature_max; temp += experiment.temperature_step) {
        temperatures.push(Math.round(temp * 100) / 100);
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
            frequency_penalty: experiment.frequency_penalty_min,
            presence_penalty: experiment.presence_penalty_min,
            max_tokens: experiment.max_tokens,
            model: experiment.model
          });
        });
      });

      logger.debug('Generated parameter combinations', { 
        experimentId, 
        count: combinations.length 
      });

      return combinations;
    } catch (error) {
      logger.error('Error generating parameter combinations:', error);
      throw new DatabaseError('Failed to generate parameter combinations', error);
    }
  }

  /**
   * Get experiment statistics
   * @param {number} experimentId - Experiment ID
   * @returns {Promise<Object>} Experiment statistics
   */
  async getStatistics(experimentId) {
    try {
      const experiment = await this.findById(experimentId);
      if (!experiment) {
        throw new ValidationError('Experiment not found');
      }

      // Get response count
      const responseCountQuery = 'SELECT COUNT(*) as count FROM responses WHERE experiment_id = ?';
      const responseCountResult = await Database.get(responseCountQuery, [experimentId]);

      // Get parameter combinations count
      const combinations = await this.getParameterCombinations(experimentId);

      // Get average quality scores
      const qualityQuery = `
        SELECT 
          AVG(coherence_score) as avg_coherence,
          AVG(completeness_score) as avg_completeness,
          AVG(readability_score) as avg_readability,
          AVG(creativity_score) as avg_creativity,
          AVG(specificity_score) as avg_specificity,
          AVG(length_appropriateness_score) as avg_length_appropriateness,
          AVG(response_time) as avg_response_time
        FROM responses 
        WHERE experiment_id = ?
      `;
      
      const qualityResult = await Database.get(qualityQuery, [experimentId]);

      const statistics = {
        experiment_id: experimentId,
        status: experiment.status,
        total_responses: responseCountResult.count,
        expected_responses: combinations.length * experiment.response_count,
        completion_percentage: combinations.length > 0 
          ? Math.round((responseCountResult.count / (combinations.length * experiment.response_count)) * 100)
          : 0,
        parameter_combinations: combinations.length,
        average_quality_scores: {
          coherence: qualityResult.avg_coherence || 0,
          completeness: qualityResult.avg_completeness || 0,
          readability: qualityResult.avg_readability || 0,
          creativity: qualityResult.avg_creativity || 0,
          specificity: qualityResult.avg_specificity || 0,
          length_appropriateness: qualityResult.avg_length_appropriateness || 0
        },
        average_response_time: qualityResult.avg_response_time || 0,
        created_at: experiment.created_at,
        updated_at: experiment.updated_at
      };

      return statistics;
    } catch (error) {
      logger.error('Error getting experiment statistics:', error);
      throw new DatabaseError('Failed to get experiment statistics', error);
    }
  }

  /**
   * Transform database row to application object
   * @private
   * @param {Object} row - Database row
   * @returns {Object} Transformed object
   */
  _transformFromDB(row) {
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      prompt: row.prompt,
      temperature_min: parseFloat(row.temperature_min),
      temperature_max: parseFloat(row.temperature_max),
      temperature_step: parseFloat(row.temperature_step),
      top_p_min: parseFloat(row.top_p_min),
      top_p_max: parseFloat(row.top_p_max),
      top_p_step: parseFloat(row.top_p_step),
      frequency_penalty_min: parseFloat(row.frequency_penalty_min),
      frequency_penalty_max: parseFloat(row.frequency_penalty_max),
      presence_penalty_min: parseFloat(row.presence_penalty_min),
      presence_penalty_max: parseFloat(row.presence_penalty_max),
      max_tokens: parseInt(row.max_tokens),
      response_count: parseInt(row.response_count),
      model: row.model,
      status: row.status,
      completed_at: row.completed_at,
      error_message: row.error_message,
      created_at: row.created_at,
      updated_at: row.updated_at
    };
  }

  /**
   * Simple caching mechanism
   * @private
   * @param {string} key - Cache key
   * @returns {any} Cached value or null
   */
  _getFromCache(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.value;
    }
    this.cache.delete(key);
    return null;
  }

  /**
   * Set cache value
   * @private
   * @param {string} key - Cache key
   * @param {any} value - Value to cache
   */
  _setCache(key, value) {
    this.cache.set(key, {
      value,
      timestamp: Date.now()
    });
  }

  /**
   * Clear cache entry
   * @private
   * @param {string} key - Cache key
   */
  _clearCache(key) {
    this.cache.delete(key);
  }

  /**
   * Clear all cache
   */
  clearCache() {
    this.cache.clear();
  }
}

module.exports = new ExperimentModel();
