const { initDatabase } = require('../config/database');

class QualityMetricModel {
  static async create(metricsData) {
    const db = await initDatabase();
    
    return new Promise((resolve, reject) => {
      const {
        response_id,
        coherence_score,
        completeness_score,
        readability_score,
        length_appropriateness_score,
        overall_score,
        word_count,
        sentence_count,
        paragraph_count,
        avg_sentence_length,
        lexical_diversity
      } = metricsData;

      const sql = `
        INSERT INTO quality_metrics (
          response_id, coherence_score, completeness_score, readability_score,
          length_appropriateness_score, overall_score, word_count, sentence_count,
          paragraph_count, avg_sentence_length, lexical_diversity
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      db.run(sql, [
        response_id, coherence_score, completeness_score, readability_score,
        length_appropriateness_score, overall_score, word_count, sentence_count,
        paragraph_count, avg_sentence_length, lexical_diversity
      ], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: this.lastID, ...metricsData });
        }
        db.close();
      });
    });
  }

  static async findByResponse(responseId) {
    const db = await initDatabase();
    
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM quality_metrics WHERE response_id = ?';
      
      db.get(sql, [responseId], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
        db.close();
      });
    });
  }

  static async findByExperiment(experimentId) {
    const db = await initDatabase();
    
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT qm.*, r.temperature, r.top_p, r.content
        FROM quality_metrics qm
        JOIN responses r ON qm.response_id = r.id
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

  static async update(responseId, updates) {
    const db = await initDatabase();
    
    return new Promise((resolve, reject) => {
      const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
      const values = Object.values(updates);
      
      const sql = `
        UPDATE quality_metrics 
        SET ${fields}, calculated_at = CURRENT_TIMESTAMP
        WHERE response_id = ?
      `;
      
      db.run(sql, [...values, responseId], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ responseId, changes: this.changes });
        }
        db.close();
      });
    });
  }

  static async getAveragesByParameters(experimentId) {
    const db = await initDatabase();
    
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT 
          r.temperature,
          r.top_p,
          AVG(qm.coherence_score) as avg_coherence,
          AVG(qm.completeness_score) as avg_completeness,
          AVG(qm.readability_score) as avg_readability,
          AVG(qm.length_appropriateness_score) as avg_length_appropriateness,
          AVG(qm.overall_score) as avg_overall,
          COUNT(*) as response_count
        FROM quality_metrics qm
        JOIN responses r ON qm.response_id = r.id
        WHERE r.experiment_id = ?
        GROUP BY r.temperature, r.top_p
        ORDER BY r.temperature, r.top_p
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

  static async delete(responseId) {
    const db = await initDatabase();
    
    return new Promise((resolve, reject) => {
      const sql = 'DELETE FROM quality_metrics WHERE response_id = ?';
      
      db.run(sql, [responseId], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ responseId, deleted: this.changes > 0 });
        }
        db.close();
      });
    });
  }
}

module.exports = QualityMetricModel;
