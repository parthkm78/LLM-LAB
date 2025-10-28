/**
 * @fileoverview Enhanced Response Model
 * @description Production-ready Response model extending the original functionality
 * 
 * @author LLM-LAB Team
 * @version 1.0.0
 * @since 2025-10-28
 */

const Database = require('../config/database');
const { DatabaseError, ValidationError } = require('../utils/errors');
const logger = require('../utils/logger');

/**
 * Response Model Class
 * Handles all database operations for responses with enhanced features
 */
class ResponseModel {
  constructor() {
    this.tableName = 'responses';
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  /**
   * Create new response with quality metrics
   * @param {Object} responseData - Response data
   * @returns {Promise<Object>} Created response
   */
  async create(responseData) {
    try {
      logger.info('Creating new response', { 
        experimentId: responseData.experiment_id 
      });

      const now = new Date().toISOString();
      const data = {
        experiment_id: responseData.experiment_id,
        content: responseData.content,
        prompt: responseData.prompt,
        temperature: responseData.temperature || 0.7,
        top_p: responseData.top_p || 1.0,
        frequency_penalty: responseData.frequency_penalty || 0.0,
        presence_penalty: responseData.presence_penalty || 0.0,
        max_tokens: responseData.max_tokens || 150,
        model: responseData.model || 'gpt-3.5-turbo',
        response_time: responseData.response_time || 0,
        token_count: responseData.token_count || 0,
        coherence_score: responseData.coherence_score || 0,
        completeness_score: responseData.completeness_score || 0,
        readability_score: responseData.readability_score || 0,
        creativity_score: responseData.creativity_score || 0,
        specificity_score: responseData.specificity_score || 0,
        length_appropriateness_score: responseData.length_appropriateness_score || 0,
        created_at: now
      };

      const query = `
        INSERT INTO ${this.tableName} (
          experiment_id, content, prompt, temperature, top_p, frequency_penalty,
          presence_penalty, max_tokens, model, response_time, token_count,
          coherence_score, completeness_score, readability_score, creativity_score,
          specificity_score, length_appropriateness_score, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const params = [
        data.experiment_id, data.content, data.prompt, data.temperature,
        data.top_p, data.frequency_penalty, data.presence_penalty,
        data.max_tokens, data.model, data.response_time, data.token_count,
        data.coherence_score, data.completeness_score, data.readability_score,
        data.creativity_score, data.specificity_score, data.length_appropriateness_score,
        data.created_at
      ];

      const result = await Database.run(query, params);
      
      logger.info('Response created successfully', { id: result.lastID });

      return { id: result.lastID, ...data };
    } catch (error) {
      logger.error('Error creating response:', error);
      throw new DatabaseError('Failed to create response', error);
    }
  }

  /**
   * Find response by ID
   * @param {number} id - Response ID
   * @returns {Promise<Object|null>} Response object or null
   */
  async findById(id) {
    try {
      const cacheKey = `response:${id}`;
      const cached = this._getFromCache(cacheKey);
      if (cached) {
        return cached;
      }

      const query = `SELECT * FROM ${this.tableName} WHERE id = ?`;
      const response = await Database.get(query, [id]);

      if (!response) {
        return null;
      }

      const transformed = this._transformFromDB(response);
      this._setCache(cacheKey, transformed);
      
      return transformed;
    } catch (error) {
      logger.error('Error finding response by ID:', error);
      throw new DatabaseError('Failed to fetch response', error);
    }
  }

  /**
   * Find responses by experiment with filtering and pagination
   * @param {number} experimentId - Experiment ID
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of responses
   */
  async findByExperiment(experimentId, options = {}) {
    try {
      const {
        page = 1,
        limit = 20,
        sortBy = 'created_at',
        sortOrder = 'DESC',
        filters = {}
      } = options;

      let query = `SELECT * FROM ${this.tableName} WHERE experiment_id = ?`;
      const params = [experimentId];

      // Add filters
      if (filters.temperature !== undefined) {
        query += ` AND temperature = ?`;
        params.push(filters.temperature);
      }

      if (filters.top_p !== undefined) {
        query += ` AND top_p = ?`;
        params.push(filters.top_p);
      }

      if (filters.model) {
        query += ` AND model = ?`;
        params.push(filters.model);
      }

      // Add sorting
      const validSortColumns = ['id', 'created_at', 'response_time', 'coherence_score'];
      const sortColumn = validSortColumns.includes(sortBy) ? sortBy : 'created_at';
      const order = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
      query += ` ORDER BY ${sortColumn} ${order}`;

      // Add pagination
      if (typeof page === 'number' && typeof limit === 'number') {
        const offset = (page - 1) * limit;
        query += ` LIMIT ? OFFSET ?`;
        params.push(limit, offset);
      }

      const responses = await Database.all(query, params);
      return responses.map(response => this._transformFromDB(response));
    } catch (error) {
      logger.error('Error finding responses by experiment:', error);
      throw new DatabaseError('Failed to fetch responses', error);
    }
  }

  /**
   * Count responses by experiment with filters
   * @param {number} experimentId - Experiment ID
   * @param {Object} filters - Filter options
   * @returns {Promise<number>} Total count
   */
  async countByExperiment(experimentId, filters = {}) {
    try {
      let query = `SELECT COUNT(*) as count FROM ${this.tableName} WHERE experiment_id = ?`;
      const params = [experimentId];

      // Add filters (same logic as findByExperiment)
      if (filters.temperature !== undefined) {
        query += ` AND temperature = ?`;
        params.push(filters.temperature);
      }

      if (filters.top_p !== undefined) {
        query += ` AND top_p = ?`;
        params.push(filters.top_p);
      }

      if (filters.model) {
        query += ` AND model = ?`;
        params.push(filters.model);
      }

      const result = await Database.get(query, params);
      return result.count;
    } catch (error) {
      logger.error('Error counting responses by experiment:', error);
      throw new DatabaseError('Failed to count responses', error);
    }
  }

  /**
   * Get statistics for responses in an experiment
   * @param {number} experimentId - Experiment ID
   * @returns {Promise<Object>} Response statistics
   */
  async getStatsByExperiment(experimentId) {
    try {
      const query = `
        SELECT 
          COUNT(*) as total_responses,
          AVG(coherence_score) as avg_coherence,
          AVG(completeness_score) as avg_completeness,
          AVG(readability_score) as avg_readability,
          AVG(creativity_score) as avg_creativity,
          AVG(specificity_score) as avg_specificity,
          AVG(length_appropriateness_score) as avg_length_appropriateness,
          AVG(response_time) as avg_response_time,
          MIN(response_time) as min_response_time,
          MAX(response_time) as max_response_time,
          AVG(token_count) as avg_token_count,
          MIN(created_at) as first_response,
          MAX(created_at) as last_response
        FROM ${this.tableName} 
        WHERE experiment_id = ?
      `;

      const stats = await Database.get(query, [experimentId]);

      // Calculate overall quality score
      const qualityScores = [
        stats.avg_coherence,
        stats.avg_completeness,
        stats.avg_readability,
        stats.avg_creativity,
        stats.avg_specificity,
        stats.avg_length_appropriateness
      ].filter(score => score !== null);

      const overallQuality = qualityScores.length > 0
        ? qualityScores.reduce((sum, score) => sum + score, 0) / qualityScores.length
        : 0;

      return {
        total_responses: stats.total_responses || 0,
        average_quality_scores: {
          coherence: Math.round((stats.avg_coherence || 0) * 100) / 100,
          completeness: Math.round((stats.avg_completeness || 0) * 100) / 100,
          readability: Math.round((stats.avg_readability || 0) * 100) / 100,
          creativity: Math.round((stats.avg_creativity || 0) * 100) / 100,
          specificity: Math.round((stats.avg_specificity || 0) * 100) / 100,
          length_appropriateness: Math.round((stats.avg_length_appropriateness || 0) * 100) / 100,
          overall: Math.round(overallQuality * 100) / 100
        },
        performance_metrics: {
          avg_response_time: Math.round((stats.avg_response_time || 0) * 100) / 100,
          min_response_time: stats.min_response_time || 0,
          max_response_time: stats.max_response_time || 0,
          avg_token_count: Math.round(stats.avg_token_count || 0)
        },
        timeline: {
          first_response: stats.first_response,
          last_response: stats.last_response,
          duration: stats.first_response && stats.last_response
            ? new Date(stats.last_response) - new Date(stats.first_response)
            : 0
        }
      };
    } catch (error) {
      logger.error('Error getting response statistics:', error);
      throw new DatabaseError('Failed to get response statistics', error);
    }
  }

  /**
   * Delete responses by experiment ID
   * @param {number} experimentId - Experiment ID
   * @returns {Promise<Object>} Delete result
   */
  async deleteByExperiment(experimentId) {
    try {
      logger.info('Deleting responses for experiment', { experimentId });

      const query = `DELETE FROM ${this.tableName} WHERE experiment_id = ?`;
      const result = await Database.run(query, [experimentId]);

      logger.info('Responses deleted successfully', { 
        experimentId, 
        deletedCount: result.changes 
      });

      return { deleted: result.changes };
    } catch (error) {
      logger.error('Error deleting responses by experiment:', error);
      throw new DatabaseError('Failed to delete responses', error);
    }
  }

  /**
   * Get quality score distribution for an experiment
   * @param {number} experimentId - Experiment ID
   * @returns {Promise<Object>} Quality score distribution
   */
  async getQualityDistribution(experimentId) {
    try {
      const query = `
        SELECT 
          ROUND(coherence_score, 1) as coherence_bucket,
          ROUND(completeness_score, 1) as completeness_bucket,
          ROUND(readability_score, 1) as readability_bucket,
          ROUND(creativity_score, 1) as creativity_bucket,
          COUNT(*) as count
        FROM ${this.tableName}
        WHERE experiment_id = ?
        GROUP BY coherence_bucket, completeness_bucket, readability_bucket, creativity_bucket
        ORDER BY count DESC
      `;

      const distribution = await Database.all(query, [experimentId]);
      return distribution;
    } catch (error) {
      logger.error('Error getting quality distribution:', error);
      throw new DatabaseError('Failed to get quality distribution', error);
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
      experiment_id: row.experiment_id,
      content: row.content,
      prompt: row.prompt,
      temperature: parseFloat(row.temperature),
      top_p: parseFloat(row.top_p),
      frequency_penalty: parseFloat(row.frequency_penalty),
      presence_penalty: parseFloat(row.presence_penalty),
      max_tokens: parseInt(row.max_tokens),
      model: row.model,
      response_time: parseFloat(row.response_time),
      token_count: parseInt(row.token_count),
      coherence_score: parseFloat(row.coherence_score),
      completeness_score: parseFloat(row.completeness_score),
      readability_score: parseFloat(row.readability_score),
      creativity_score: parseFloat(row.creativity_score),
      specificity_score: parseFloat(row.specificity_score),
      length_appropriateness_score: parseFloat(row.length_appropriateness_score),
      created_at: row.created_at
    };
  }

  /**
   * Simple caching mechanism
   * @private
   */
  _getFromCache(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.value;
    }
    this.cache.delete(key);
    return null;
  }

  _setCache(key, value) {
    this.cache.set(key, {
      value,
      timestamp: Date.now()
    });
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear();
  }
}

module.exports = new ResponseModel();
