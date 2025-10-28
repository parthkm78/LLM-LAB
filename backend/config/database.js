const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database file path
const dbPath = path.join(__dirname, '..', 'database.sqlite');

// Initialize database connection
const initDatabase = () => {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Error opening database:', err);
        reject(err);
      } else {
        console.log('📊 Connected to SQLite database');
        resolve(db);
      }
    });
  });
};

// Create tables if they don't exist
const createTables = (db) => {
  return new Promise((resolve, reject) => {
    const tables = [
      // Experiments table
      `CREATE TABLE IF NOT EXISTS experiments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        prompt TEXT NOT NULL,
        temperature_min REAL NOT NULL DEFAULT 0.1,
        temperature_max REAL NOT NULL DEFAULT 1.0,
        temperature_step REAL NOT NULL DEFAULT 0.1,
        top_p_min REAL NOT NULL DEFAULT 0.1,
        top_p_max REAL NOT NULL DEFAULT 1.0,
        top_p_step REAL NOT NULL DEFAULT 0.1,
        max_tokens INTEGER DEFAULT 150,
        response_count INTEGER DEFAULT 5,
        status TEXT DEFAULT 'draft',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      
      // Responses table
      `CREATE TABLE IF NOT EXISTS responses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        experiment_id INTEGER NOT NULL,
        content TEXT NOT NULL,
        temperature REAL NOT NULL,
        top_p REAL NOT NULL,
        max_tokens INTEGER,
        model TEXT DEFAULT 'gpt-3.5-turbo',
        prompt_tokens INTEGER,
        completion_tokens INTEGER,
        total_tokens INTEGER,
        response_time REAL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (experiment_id) REFERENCES experiments (id) ON DELETE CASCADE
      )`,
      
      // Quality metrics table
      `CREATE TABLE IF NOT EXISTS quality_metrics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        response_id INTEGER NOT NULL,
        coherence_score REAL,
        completeness_score REAL,
        readability_score REAL,
        length_appropriateness_score REAL,
        overall_score REAL,
        word_count INTEGER,
        sentence_count INTEGER,
        paragraph_count INTEGER,
        avg_sentence_length REAL,
        lexical_diversity REAL,
        calculated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (response_id) REFERENCES responses (id) ON DELETE CASCADE
      )`,
      
      // Parameter combinations table (for tracking which combinations were tested)
      `CREATE TABLE IF NOT EXISTS parameter_combinations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        experiment_id INTEGER NOT NULL,
        temperature REAL NOT NULL,
        top_p REAL NOT NULL,
        status TEXT DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (experiment_id) REFERENCES experiments (id) ON DELETE CASCADE
      )`
    ];

    let completed = 0;
    const total = tables.length;

    tables.forEach((tableSQL) => {
      db.run(tableSQL, (err) => {
        if (err) {
          console.error('Error creating table:', err);
          reject(err);
        } else {
          completed++;
          if (completed === total) {
            console.log('✅ Database tables created successfully');
            resolve();
          }
        }
      });
    });
  });
};

// Initialize database with tables
const setupDatabase = async () => {
  try {
    const db = await initDatabase();
    await createTables(db);
    return db;
  } catch (error) {
    console.error('Database setup failed:', error);
    throw error;
  }
};

module.exports = {
  initDatabase,
  createTables,
  setupDatabase,
  dbPath
};
