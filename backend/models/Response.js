const { initDatabase } = require('../config/database');

class ResponseModel {
  static async create(responseData) {
    const db = await initDatabase();
    
    return new Promise((resolve, reject) => {
      const {
        experiment_id,
        content,
        temperature,
        top_p,
        max_tokens,
        model = 'gpt-3.5-turbo',
        prompt_tokens = 0,
        completion_tokens = 0,
        total_tokens = 0,
        response_time = 0
      } = responseData;

      const sql = `
        INSERT INTO responses (
          experiment_id, content, temperature, top_p, max_tokens, model,
          prompt_tokens, completion_tokens, total_tokens, response_time
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      db.run(sql, [
        experiment_id, content, temperature, top_p, max_tokens, model,
        prompt_tokens, completion_tokens, total_tokens, response_time
      ], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: this.lastID, ...responseData });
        }
        db.close();
      });
    });
  }

  static async findByExperiment(experimentId) {
    const db = await initDatabase();
    
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT r.*, qm.coherence_score, qm.completeness_score, 
               qm.readability_score, qm.length_appropriateness_score, qm.overall_score
        FROM responses r
        LEFT JOIN quality_metrics qm ON r.id = qm.response_id
        WHERE r.experiment_id = ?
        ORDER BY r.created_at DESC
      `;
      
      db.all(sql, [experimentId], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
        db.close();
      });
    });
  }

  static async findById(id) {
    const db = await initDatabase();
    
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT r.*, qm.coherence_score, qm.completeness_score, 
               qm.readability_score, qm.length_appropriateness_score, qm.overall_score
        FROM responses r
        LEFT JOIN quality_metrics qm ON r.id = qm.response_id
        WHERE r.id = ?
      `;
      
      db.get(sql, [id], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
        db.close();
      });
    });
  }

  static async findByParameters(experimentId, temperature, topP) {
    const db = await initDatabase();
    
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT r.*, qm.coherence_score, qm.completeness_score, 
               qm.readability_score, qm.length_appropriateness_score, qm.overall_score
        FROM responses r
        LEFT JOIN quality_metrics qm ON r.id = qm.response_id
        WHERE r.experiment_id = ? AND r.temperature = ? AND r.top_p = ?
        ORDER BY r.created_at DESC
      `;
      
      db.all(sql, [experimentId, temperature, topP], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
        db.close();
      });
    });
  }

  static async delete(id) {
    const db = await initDatabase();
    
    return new Promise((resolve, reject) => {
      const sql = 'DELETE FROM responses WHERE id = ?';
      
      db.run(sql, [id], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id, deleted: this.changes > 0 });
        }
        db.close();
      });
    });
  }

  static async getStatsByExperiment(experimentId) {
    const db = await initDatabase();
    
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT 
          COUNT(*) as total_responses,
          AVG(qm.overall_score) as avg_quality_score,
          MIN(r.temperature) as min_temperature,
          MAX(r.temperature) as max_temperature,
          MIN(r.top_p) as min_top_p,
          MAX(r.top_p) as max_top_p,
          AVG(r.response_time) as avg_response_time,
          SUM(r.total_tokens) as total_tokens_used
        FROM responses r
        LEFT JOIN quality_metrics qm ON r.id = qm.response_id
        WHERE r.experiment_id = ?
      `;
      
      db.get(sql, [experimentId], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
        db.close();
      });
    });
  }
}

module.exports = ResponseModel;
