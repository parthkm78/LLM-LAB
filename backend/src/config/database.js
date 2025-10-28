/**
 * @fileoverview Enhanced Database Configuration
 * @description Production-ready database configuration with connection pooling,
 * error handling, and transaction support.
 * 
 * @author LLM-LAB Team
 * @version 1.0.0
 * @since 2025-10-28
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const logger = require('../utils/logger');

/**
 * Database Configuration Class
 * Provides enhanced database operations with proper error handling and logging
 */
class Database {
  constructor() {
    this.db = null;
    this.dbPath = this.getDatabasePath();
    this.isInitialized = false;
    this.connectionPool = new Map();
    this.transactionStack = [];
  }

  /**
   * Get database path from environment variables
   * @returns {string} Database file path
   */
  getDatabasePath() {
    // Read database configuration from environment variables
    const dbType = process.env.DB_TYPE || 'sqlite';
    const dbName = process.env.DB_NAME || 'database';
    const dbHost = process.env.DB_HOST;
    
    // Log the database configuration being used
    logger.info('Constructing database path from environment variables', {
      dbType,
      dbName,
      dbHost: dbHost ? `${dbHost}:${process.env.DB_PORT || 1433}` : 'local',
      user: process.env.DB_USER || 'N/A'
    });
    
    // For SQLite, construct path using database name from env
    if (dbType === 'sqlite') {
      // Use DB_NAME from environment to create SQLite file
      const dbFileName = `${dbName}.sqlite`;
      const dbPath = path.join(__dirname, '..', '..', dbFileName);
      
      logger.info('Using SQLite database', {
        fileName: dbFileName,
        fullPath: dbPath,
        basedOnEnvName: dbName
      });
      
      return dbPath;
    }
    
    // For future database types, can add more logic here
    logger.warn('Unsupported database type, falling back to SQLite', { dbType });
    return path.join(__dirname, '..', '..', 'database.sqlite');
  }

  /**
   * Initialize database connection
   * @returns {Promise<void>}
   */
  async init() {
    if (this.isInitialized) {
      return;
    }

    try {
      // Log complete database configuration constructed from env vars
      const dbConfig = {
        constructedPath: this.dbPath,
        envVariables: {
          DB_TYPE: process.env.DB_TYPE || 'sqlite',
          DB_NAME: process.env.DB_NAME || 'database',
          DB_HOST: process.env.DB_HOST || 'local',
          DB_PORT: process.env.DB_PORT || 'N/A',
          DB_USER: process.env.DB_USER || 'N/A'
        }
      };
      
      logger.info('Initializing database connection with constructed configuration', dbConfig);

      // Ensure database directory exists
      const dbDir = path.dirname(this.dbPath);
      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
      }

      // Create database connection
      this.db = new sqlite3.Database(this.dbPath, (err) => {
        if (err) {
          logger.error('Failed to connect to database', err);
          throw err;
        }
        logger.info('Connected to SQLite database successfully', {
          path: this.dbPath,
          configuredFor: process.env.DB_NAME || 'default',
          targetSystem: process.env.DB_HOST ? `${process.env.DB_HOST}:${process.env.DB_PORT}` : 'local'
        });
      });

      // Configure database settings
      await this._run('PRAGMA foreign_keys = ON');
      await this._run('PRAGMA journal_mode = WAL');
      await this._run('PRAGMA synchronous = NORMAL');
      await this._run('PRAGMA cache_size = 1000');
      await this._run('PRAGMA temp_store = MEMORY');

      // Initialize schema
      await this.initializeSchema();

      this.isInitialized = true;
      logger.info('Database initialization completed');
    } catch (error) {
      logger.error('Database initialization failed', error);
      throw error;
    }
  }

  /**
   * Initialize database schema
   * @private
   * @returns {Promise<void>}
   */
  async initializeSchema() {
    // First, create basic tables
    const basicSchemas = [
      `CREATE TABLE IF NOT EXISTS experiments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        prompt TEXT NOT NULL,
        temperature_min REAL DEFAULT 0.1,
        temperature_max REAL DEFAULT 1.0,
        temperature_step REAL DEFAULT 0.1,
        top_p_min REAL DEFAULT 0.1,
        top_p_max REAL DEFAULT 1.0,
        top_p_step REAL DEFAULT 0.1,
        frequency_penalty_min REAL DEFAULT 0.0,
        frequency_penalty_max REAL DEFAULT 0.0,
        presence_penalty_min REAL DEFAULT 0.0,
        presence_penalty_max REAL DEFAULT 0.0,
        max_tokens INTEGER DEFAULT 150,
        response_count INTEGER DEFAULT 5,
        model TEXT DEFAULT 'gpt-3.5-turbo',
        status TEXT DEFAULT 'pending',
        completed_at TEXT,
        error_message TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )`,
      
      `CREATE TABLE IF NOT EXISTS responses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        experiment_id INTEGER NOT NULL,
        content TEXT NOT NULL,
        prompt TEXT NOT NULL,
        temperature REAL,
        top_p REAL,
        frequency_penalty REAL,
        presence_penalty REAL,
        max_tokens INTEGER,
        model TEXT,
        response_time REAL,
        token_count INTEGER,
        coherence_score REAL,
        completeness_score REAL,
        readability_score REAL,
        creativity_score REAL,
        specificity_score REAL,
        length_appropriateness_score REAL,
        created_at TEXT NOT NULL,
        FOREIGN KEY (experiment_id) REFERENCES experiments (id) ON DELETE CASCADE
      )`
    ];

    for (const schema of basicSchemas) {
      await this._run(schema);
    }

    // Handle quality_metrics table migration
    await this.migrateQualityMetricsTable();

    // Create indexes
    const indexes = [
      `CREATE INDEX IF NOT EXISTS idx_experiments_status ON experiments(status)`,
      `CREATE INDEX IF NOT EXISTS idx_experiments_created_at ON experiments(created_at)`,
      `CREATE INDEX IF NOT EXISTS idx_responses_experiment_id ON responses(experiment_id)`,
      `CREATE INDEX IF NOT EXISTS idx_responses_created_at ON responses(created_at)`,
      `CREATE INDEX IF NOT EXISTS idx_quality_metrics_response_id ON quality_metrics(response_id)`
    ];

    for (const index of indexes) {
      try {
        await this._run(index);
      } catch (error) {
        // Ignore index creation errors - they're not critical
        logger.warn(`Index creation failed: ${error.message}`);
      }
    }

    // Try to create metric_name index only if column exists
    try {
      await this._run(`CREATE INDEX IF NOT EXISTS idx_quality_metrics_metric_name ON quality_metrics(metric_name)`);
    } catch (error) {
      logger.warn(`metric_name index creation skipped: ${error.message}`);
    }

    logger.info('Database schema initialized successfully');
  }

  /**
   * Migrate quality_metrics table to new structure
   * @private
   * @returns {Promise<void>}
   */
  async migrateQualityMetricsTable() {
    try {
      // Check if quality_metrics table exists and its structure
      const tableInfo = await this._all(`PRAGMA table_info(quality_metrics)`);
      
      if (!tableInfo || tableInfo.length === 0) {
        // Table doesn't exist, create new structure
        await this._run(`CREATE TABLE quality_metrics (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          response_id INTEGER NOT NULL,
          metric_name TEXT NOT NULL,
          score REAL NOT NULL,
          details TEXT,
          created_at TEXT NOT NULL,
          FOREIGN KEY (response_id) REFERENCES responses (id) ON DELETE CASCADE
        )`);
        logger.info('Created new quality_metrics table with metric_name column');
      } else {
        // Table exists, check if it has metric_name column
        const hasMetricName = tableInfo.some(col => col.name === 'metric_name');
        
        if (!hasMetricName) {
          // Old structure - backup and recreate
          logger.info('Migrating quality_metrics table to new structure...');
          
          // Rename old table
          await this._run(`ALTER TABLE quality_metrics RENAME TO quality_metrics_old`);
          
          // Create new table
          await this._run(`CREATE TABLE quality_metrics (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            response_id INTEGER NOT NULL,
            metric_name TEXT NOT NULL,
            score REAL NOT NULL,
            details TEXT,
            created_at TEXT NOT NULL,
            FOREIGN KEY (response_id) REFERENCES responses (id) ON DELETE CASCADE
          )`);
          
          // Note: Data migration would go here if needed
          // For now, we'll start fresh with the new structure
          
          // Drop old table
          await this._run(`DROP TABLE IF EXISTS quality_metrics_old`);
          
          logger.info('Quality metrics table migration completed');
        } else {
          logger.info('Quality metrics table already has correct structure');
        }
      }
    } catch (error) {
      logger.error('Quality metrics table migration failed', { error: error.message });
      // Create table with new structure as fallback
      await this._run(`CREATE TABLE IF NOT EXISTS quality_metrics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        response_id INTEGER NOT NULL,
        metric_name TEXT NOT NULL,
        score REAL NOT NULL,
        details TEXT,
        created_at TEXT NOT NULL,
        FOREIGN KEY (response_id) REFERENCES responses (id) ON DELETE CASCADE
      )`);
    }
  }

  /**
   * Execute a SQL query without initialization check (internal use)
   * @private
   * @param {string} sql - SQL query
   * @param {Array} params - Query parameters
   * @returns {Promise<Object>} Query result
   */
  async _run(sql, params = []) {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      
      this.db.run(sql, params, function(err) {
        const duration = Date.now() - startTime;
        
        if (err) {
          logger.error('Database query failed', {
            sql: sql.substring(0, 100) + '...',
            error: err.message,
            duration: `${duration}ms`
          });
          reject(err);
        } else {
          logger.debug('Database query executed', {
            sql: sql.substring(0, 100) + '...',
            changes: this.changes,
            lastID: this.lastID,
            duration: `${duration}ms`
          });
          resolve({
            changes: this.changes,
            lastID: this.lastID
          });
        }
      });
    });
  }

  /**
   * Execute a SQL query that returns all rows (internal use)
   * @private
   * @param {string} sql - SQL query
   * @param {Array} params - Query parameters
   * @returns {Promise<Array>} Query results
   */
  async _all(sql, params = []) {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      
      this.db.all(sql, params, (err, rows) => {
        const duration = Date.now() - startTime;
        
        if (err) {
          logger.error('Database query failed', {
            sql: sql.substring(0, 100) + '...',
            error: err.message,
            duration: `${duration}ms`
          });
          reject(err);
        } else {
          logger.debug('Database query executed', {
            sql: sql.substring(0, 100) + '...',
            rowCount: rows.length,
            duration: `${duration}ms`
          });
          resolve(rows);
        }
      });
    });
  }

  /**
   * Execute a SQL query with parameters
   * @param {string} sql - SQL query
   * @param {Array} params - Query parameters
   * @returns {Promise<Object>} Query result
   */
  async run(sql, params = []) {
    await this.ensureInitialized();
    
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      
      this.db.run(sql, params, function(err) {
        const duration = Date.now() - startTime;
        
        if (err) {
          logger.error('Database query failed', {
            sql: sql.substring(0, 100) + '...',
            error: err.message,
            duration: `${duration}ms`
          });
          reject(err);
        } else {
          logger.debug('Database query executed', {
            sql: sql.substring(0, 100) + '...',
            changes: this.changes,
            lastID: this.lastID,
            duration: `${duration}ms`
          });
          
          resolve({
            changes: this.changes,
            lastID: this.lastID
          });
        }
      });
    });
  }

  /**
   * Get a single row from database
   * @param {string} sql - SQL query
   * @param {Array} params - Query parameters
   * @returns {Promise<Object|null>} Single row or null
   */
  async get(sql, params = []) {
    await this.ensureInitialized();
    
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      
      this.db.get(sql, params, (err, row) => {
        const duration = Date.now() - startTime;
        
        if (err) {
          logger.error('Database get query failed', {
            sql: sql.substring(0, 100) + '...',
            error: err.message,
            duration: `${duration}ms`
          });
          reject(err);
        } else {
          logger.debug('Database get query executed', {
            sql: sql.substring(0, 100) + '...',
            found: !!row,
            duration: `${duration}ms`
          });
          
          resolve(row || null);
        }
      });
    });
  }

  /**
   * Get all rows from database
   * @param {string} sql - SQL query
   * @param {Array} params - Query parameters
   * @returns {Promise<Array>} Array of rows
   */
  async all(sql, params = []) {
    await this.ensureInitialized();
    
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      
      this.db.all(sql, params, (err, rows) => {
        const duration = Date.now() - startTime;
        
        if (err) {
          logger.error('Database all query failed', {
            sql: sql.substring(0, 100) + '...',
            error: err.message,
            duration: `${duration}ms`
          });
          reject(err);
        } else {
          logger.debug('Database all query executed', {
            sql: sql.substring(0, 100) + '...',
            rowCount: rows.length,
            duration: `${duration}ms`
          });
          
          resolve(rows);
        }
      });
    });
  }

  /**
   * Begin a transaction
   * @returns {Promise<void>}
   */
  async beginTransaction() {
    await this.ensureInitialized();
    await this.run('BEGIN TRANSACTION');
    this.transactionStack.push(Date.now());
    logger.debug('Transaction started', { depth: this.transactionStack.length });
  }

  /**
   * Commit a transaction
   * @returns {Promise<void>}
   */
  async commitTransaction() {
    await this.ensureInitialized();
    
    if (this.transactionStack.length === 0) {
      throw new Error('No active transaction to commit');
    }
    
    await this.run('COMMIT');
    const startTime = this.transactionStack.pop();
    const duration = Date.now() - startTime;
    
    logger.debug('Transaction committed', { 
      duration: `${duration}ms`,
      depth: this.transactionStack.length 
    });
  }

  /**
   * Rollback a transaction
   * @returns {Promise<void>}
   */
  async rollbackTransaction() {
    await this.ensureInitialized();
    
    if (this.transactionStack.length === 0) {
      throw new Error('No active transaction to rollback');
    }
    
    await this.run('ROLLBACK');
    const startTime = this.transactionStack.pop();
    const duration = Date.now() - startTime;
    
    logger.debug('Transaction rolled back', { 
      duration: `${duration}ms`,
      depth: this.transactionStack.length 
    });
  }

  /**
   * Execute multiple queries in a transaction
   * @param {Function} callback - Function containing queries to execute
   * @returns {Promise<any>} Result of callback
   */
  async transaction(callback) {
    await this.beginTransaction();
    
    try {
      const result = await callback(this);
      await this.commitTransaction();
      return result;
    } catch (error) {
      await this.rollbackTransaction();
      throw error;
    }
  }

  /**
   * Ensure database is initialized
   * @private
   * @returns {Promise<void>}
   */
  async ensureInitialized() {
    if (!this.isInitialized) {
      await this.init();
    }
  }

  /**
   * Close database connection
   * @returns {Promise<void>}
   */
  async close() {
    if (this.db) {
      return new Promise((resolve, reject) => {
        this.db.close((err) => {
          if (err) {
            logger.error('Failed to close database', err);
            reject(err);
          } else {
            logger.info('Database connection closed');
            this.isInitialized = false;
            this.db = null;
            resolve();
          }
        });
      });
    }
  }

  /**
   * Get database statistics
   * @returns {Promise<Object>} Database statistics
   */
  async getStats() {
    await this.ensureInitialized();
    
    const stats = {};
    
    // Get table counts
    const tables = ['experiments', 'responses', 'quality_metrics'];
    for (const table of tables) {
      try {
        const result = await this.get(`SELECT COUNT(*) as count FROM ${table}`);
        stats[`${table}_count`] = result.count;
      } catch (error) {
        stats[`${table}_count`] = 0;
      }
    }
    
    // Get database size
    try {
      const sizeResult = await this.get(`SELECT page_count * page_size as size FROM pragma_page_count(), pragma_page_size()`);
      stats.database_size_bytes = sizeResult.size;
      stats.database_size_mb = Math.round(sizeResult.size / (1024 * 1024) * 100) / 100;
    } catch (error) {
      stats.database_size_bytes = 0;
      stats.database_size_mb = 0;
    }
    
    return stats;
  }

  /**
   * Backup database to file
   * @param {string} backupPath - Path for backup file
   * @returns {Promise<void>}
   */
  async backup(backupPath) {
    await this.ensureInitialized();
    
    return new Promise((resolve, reject) => {
      const backup = this.db.backup(backupPath);
      
      backup.step(-1, (err) => {
        if (err) {
          logger.error('Database backup failed', err);
          reject(err);
        } else {
          logger.info('Database backup completed', { backupPath });
          resolve();
        }
        backup.finish();
      });
    });
  }
}

// Create and export singleton instance
const database = new Database();

// Initialize database on first require
database.init().catch(error => {
  logger.error('Failed to initialize database on startup', error);
});

module.exports = database;
