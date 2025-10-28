/**
 * @fileoverview QualityMetric Model
 * @description Production-ready QualityMetric model for managing quality metrics data
 * 
 * @author LLM-LAB Team
 * @version 1.0.0
 * @since 2025-10-28
 */

const Database = require('../config/database');
const { DatabaseError, ValidationError } = require('../utils/errors');
const logger = require('../utils/logger');

/**
 * QualityMetric Model Class
 * Handles all database operations for quality metrics
 */
class QualityMetricModel {
  constructor() {
    this.db = Database;
  }

  /**
   * Create a new quality metric record
   * @param {Object} metricData - The metric data
   * @returns {Promise<Object>} Created metric
   */
  async create(metricData) {
    try {
      const {
        response_id,
        coherence,
        completeness,
        readability,
        creativity,
        specificity,
        length_appropriateness
      } = metricData;

      if (!response_id) {
        throw new ValidationError('Response ID is required');
      }

      const sql = `
        INSERT INTO quality_metrics (
          response_id, metric_name, score, details, created_at
        ) VALUES (?, ?, ?, ?, ?)
      `;

      const timestamp = new Date().toISOString();
      const metrics = [
        { name: 'coherence', score: coherence },
        { name: 'completeness', score: completeness },
        { name: 'readability', score: readability },
        { name: 'creativity', score: creativity },
        { name: 'specificity', score: specificity },
        { name: 'length_appropriateness', score: length_appropriateness }
      ];

      const results = [];
      for (const metric of metrics) {
        if (metric.score !== undefined && metric.score !== null) {
          const result = await this.db.run(sql, [
            response_id,
            metric.name,
            metric.score,
            JSON.stringify(metricData),
            timestamp
          ]);
          results.push({
            id: result.lastID,
            response_id,
            metric_name: metric.name,
            score: metric.score,
            created_at: timestamp
          });
        }
      }

      logger.info('Quality metrics created', { 
        responseId: response_id, 
        metricsCount: results.length 
      });

      return results;
    } catch (error) {
      logger.error('Error creating quality metrics:', error);
      throw new DatabaseError('Failed to create quality metrics');
    }
  }

  /**
   * Find quality metrics by response ID
   * @param {number} responseId - The response ID
   * @returns {Promise<Array>} Array of metrics
   */
  async findByResponseId(responseId) {
    try {
      if (!responseId) {
        throw new ValidationError('Response ID is required');
      }

      const sql = `
        SELECT * FROM quality_metrics
        WHERE response_id = ?
        ORDER BY created_at DESC
      `;

      const metrics = await this.db.all(sql, [responseId]);
      
      logger.debug('Quality metrics retrieved', { 
        responseId, 
        count: metrics.length 
      });

      return metrics;
    } catch (error) {
      logger.error('Error finding quality metrics:', error);
      throw new DatabaseError('Failed to retrieve quality metrics');
    }
  }

  /**
   * Find quality metric by ID
   * @param {number} id - The metric ID
   * @returns {Promise<Object|null>} The metric or null
   */
  async findById(id) {
    try {
      if (!id) {
        throw new ValidationError('Metric ID is required');
      }

      const sql = `SELECT * FROM quality_metrics WHERE id = ?`;
      const metric = await this.db.get(sql, [id]);
      
      if (metric) {
        logger.debug('Quality metric retrieved', { id });
      }

      return metric;
    } catch (error) {
      logger.error('Error finding quality metric:', error);
      throw new DatabaseError('Failed to retrieve quality metric');
    }
  }

  /**
   * Get aggregate metrics for a response
   * @param {number} responseId - The response ID
   * @returns {Promise<Object>} Aggregated metrics
   */
  async getAggregateMetrics(responseId) {
    try {
      if (!responseId) {
        throw new ValidationError('Response ID is required');
      }

      const sql = `
        SELECT 
          metric_name,
          AVG(score) as average_score,
          MIN(score) as min_score,
          MAX(score) as max_score,
          COUNT(*) as count
        FROM quality_metrics 
        WHERE response_id = ?
        GROUP BY metric_name
      `;

      const aggregates = await this.db.all(sql, [responseId]);
      
      // Convert to object format
      const result = {};
      aggregates.forEach(agg => {
        result[agg.metric_name] = {
          average: agg.average_score,
          min: agg.min_score,
          max: agg.max_score,
          count: agg.count
        };
      });

      logger.debug('Aggregate metrics calculated', { 
        responseId, 
        metricsCount: aggregates.length 
      });

      return result;
    } catch (error) {
      logger.error('Error calculating aggregate metrics:', error);
      throw new DatabaseError('Failed to calculate aggregate metrics');
    }
  }

  /**
   * Delete quality metrics for a response
   * @param {number} responseId - The response ID
   * @returns {Promise<Object>} Deletion result
   */
  async deleteByResponseId(responseId) {
    try {
      if (!responseId) {
        throw new ValidationError('Response ID is required');
      }

      const sql = `DELETE FROM quality_metrics WHERE response_id = ?`;
      const result = await this.db.run(sql, [responseId]);

      logger.info('Quality metrics deleted', { 
        responseId, 
        deletedCount: result.changes 
      });

      return {
        deleted: result.changes,
        response_id: responseId
      };
    } catch (error) {
      logger.error('Error deleting quality metrics:', error);
      throw new DatabaseError('Failed to delete quality metrics');
    }
  }

  /**
   * Get all quality metrics with pagination
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Paginated results
   */
  async findAll(options = {}) {
    try {
      const {
        page = 1,
        limit = 50,
        metric_name = null,
        min_score = null,
        max_score = null
      } = options;

      let sql = `
        SELECT qm.*, r.content as response_content, r.experiment_id
        FROM quality_metrics qm
        LEFT JOIN responses r ON qm.response_id = r.id
        WHERE 1=1
      `;
      const params = [];

      if (metric_name) {
        sql += ` AND qm.metric_name = ?`;
        params.push(metric_name);
      }

      if (min_score !== null) {
        sql += ` AND qm.score >= ?`;
        params.push(min_score);
      }

      if (max_score !== null) {
        sql += ` AND qm.score <= ?`;
        params.push(max_score);
      }

      sql += ` ORDER BY qm.created_at DESC`;

      if (limit > 0) {
        const offset = (page - 1) * limit;
        sql += ` LIMIT ? OFFSET ?`;
        params.push(limit, offset);
      }

      const metrics = await this.db.all(sql, params);

      // Get total count
      let countSql = `SELECT COUNT(*) as total FROM quality_metrics qm WHERE 1=1`;
      const countParams = [];

      if (metric_name) {
        countSql += ` AND metric_name = ?`;
        countParams.push(metric_name);
      }

      if (min_score !== null) {
        countSql += ` AND score >= ?`;
        countParams.push(min_score);
      }

      if (max_score !== null) {
        countSql += ` AND score <= ?`;
        countParams.push(max_score);
      }

      const countResult = await this.db.get(countSql, countParams);
      const total = countResult.total;

      logger.debug('Quality metrics listed', { 
        count: metrics.length, 
        total, 
        page, 
        limit 
      });

      return {
        metrics,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      logger.error('Error listing quality metrics:', error);
      throw new DatabaseError('Failed to list quality metrics');
    }
  }
}

module.exports = QualityMetricModel;
