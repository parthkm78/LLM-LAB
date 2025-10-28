const { initDatabase } = require('../config/database');

class ExperimentModel {
  static async create(experimentData) {
    const db = await initDatabase();
    
    return new Promise((resolve, reject) => {
      const {
        name,
        description = '',
        prompt,
        temperature_min = 0.1,
        temperature_max = 1.0,
        temperature_step = 0.1,
        top_p_min = 0.1,
        top_p_max = 1.0,
        top_p_step = 0.1,
        max_tokens = 150,
        response_count = 5
      } = experimentData;

      const sql = `
        INSERT INTO experiments (
          name, description, prompt, temperature_min, temperature_max, temperature_step,
          top_p_min, top_p_max, top_p_step, max_tokens, response_count, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft')
      `;

      db.run(sql, [
        name, description, prompt, temperature_min, temperature_max, temperature_step,
        top_p_min, top_p_max, top_p_step, max_tokens, response_count
      ], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: this.lastID, ...experimentData });
        }
        db.close();
      });
    });
  }

  static async findAll() {
    const db = await initDatabase();
    
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT e.*, 
               COUNT(r.id) as response_count,
               MAX(r.created_at) as last_response_at
        FROM experiments e
        LEFT JOIN responses r ON e.id = r.experiment_id
        GROUP BY e.id
        ORDER BY e.created_at DESC
      `;
      
      db.all(sql, [], (err, rows) => {
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
        SELECT e.*, 
               COUNT(r.id) as response_count
        FROM experiments e
        LEFT JOIN responses r ON e.id = r.experiment_id
        WHERE e.id = ?
        GROUP BY e.id
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

  static async update(id, updates) {
    const db = await initDatabase();
    
    return new Promise((resolve, reject) => {
      const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
      const values = Object.values(updates);
      
      const sql = `
        UPDATE experiments 
        SET ${fields}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `;
      
      db.run(sql, [...values, id], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id, changes: this.changes });
        }
        db.close();
      });
    });
  }

  static async delete(id) {
    const db = await initDatabase();
    
    return new Promise((resolve, reject) => {
      const sql = 'DELETE FROM experiments WHERE id = ?';
      
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

  static async getParameterCombinations(experimentId) {
    const experiment = await this.findById(experimentId);
    if (!experiment) return [];

    const combinations = [];
    
    for (let temp = experiment.temperature_min; temp <= experiment.temperature_max; temp += experiment.temperature_step) {
      for (let topP = experiment.top_p_min; topP <= experiment.top_p_max; topP += experiment.top_p_step) {
        combinations.push({
          temperature: Math.round(temp * 10) / 10, // Round to 1 decimal
          top_p: Math.round(topP * 10) / 10
        });
      }
    }
    
    return combinations;
  }
}

module.exports = ExperimentModel;
