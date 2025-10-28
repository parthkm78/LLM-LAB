/**
 * @fileoverview Logging Utility
 * @description Centralized logging system with multiple levels and output formats
 * 
 * @author LLM-LAB Team
 * @version 1.0.0
 * @since 2025-10-28
 */

const fs = require('fs');
const path = require('path');

/**
 * Log levels with numeric values for filtering
 */
const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3
};

/**
 * Logger class for handling application logging
 */
class Logger {
  constructor(options = {}) {
    this.level = options.level || (process.env.NODE_ENV === 'production' ? LOG_LEVELS.INFO : LOG_LEVELS.DEBUG);
    this.enableConsole = options.enableConsole !== false;
    this.enableFile = options.enableFile !== false;
    this.logDir = options.logDir || path.join(process.cwd(), 'logs');
    this.maxFileSize = options.maxFileSize || 10 * 1024 * 1024; // 10MB
    this.maxFiles = options.maxFiles || 5;
    
    // Ensure log directory exists
    if (this.enableFile) {
      this._ensureLogDirectory();
    }
  }

  /**
   * Log an error message
   * @param {string} message - Error message
   * @param {Object|Error} meta - Additional metadata or error object
   */
  error(message, meta = {}) {
    this._log('ERROR', message, meta);
  }

  /**
   * Log a warning message
   * @param {string} message - Warning message
   * @param {Object} meta - Additional metadata
   */
  warn(message, meta = {}) {
    this._log('WARN', message, meta);
  }

  /**
   * Log an info message
   * @param {string} message - Info message
   * @param {Object} meta - Additional metadata
   */
  info(message, meta = {}) {
    this._log('INFO', message, meta);
  }

  /**
   * Log a debug message
   * @param {string} message - Debug message
   * @param {Object} meta - Additional metadata
   */
  debug(message, meta = {}) {
    this._log('DEBUG', message, meta);
  }

  /**
   * Internal logging method
   * @private
   * @param {string} level - Log level
   * @param {string} message - Log message
   * @param {Object} meta - Additional metadata
   */
  _log(level, message, meta = {}) {
    const levelValue = LOG_LEVELS[level];
    
    // Skip if log level is below threshold
    if (levelValue > this.level) {
      return;
    }

    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      meta: this._sanitizeMeta(meta),
      pid: process.pid,
      environment: process.env.NODE_ENV || 'development'
    };

    // Console logging
    if (this.enableConsole) {
      this._logToConsole(logEntry);
    }

    // File logging
    if (this.enableFile) {
      this._logToFile(logEntry);
    }
  }

  /**
   * Log to console with color coding
   * @private
   * @param {Object} logEntry - Log entry object
   */
  _logToConsole(logEntry) {
    const colors = {
      ERROR: '\x1b[31m', // Red
      WARN: '\x1b[33m',  // Yellow
      INFO: '\x1b[36m',  // Cyan
      DEBUG: '\x1b[37m'  // White
    };
    
    const reset = '\x1b[0m';
    const color = colors[logEntry.level] || reset;
    
    const consoleMessage = `${color}[${logEntry.timestamp}] ${logEntry.level}: ${logEntry.message}${reset}`;
    
    // Use appropriate console method
    switch (logEntry.level) {
      case 'ERROR':
        console.error(consoleMessage, logEntry.meta);
        break;
      case 'WARN':
        console.warn(consoleMessage, logEntry.meta);
        break;
      case 'DEBUG':
        console.debug(consoleMessage, logEntry.meta);
        break;
      default:
        console.log(consoleMessage, logEntry.meta);
    }
  }

  /**
   * Log to file
   * @private
   * @param {Object} logEntry - Log entry object
   */
  _logToFile(logEntry) {
    try {
      const logLine = JSON.stringify(logEntry) + '\n';
      const logFile = this._getCurrentLogFile();
      
      fs.appendFileSync(logFile, logLine);
      
      // Check if file size exceeds limit and rotate if needed
      this._rotateLogsIfNeeded();
    } catch (error) {
      // Fallback to console if file logging fails
      console.error('Failed to write to log file:', error);
    }
  }

  /**
   * Get current log file path
   * @private
   * @returns {string} Log file path
   */
  _getCurrentLogFile() {
    const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    return path.join(this.logDir, `app-${date}.log`);
  }

  /**
   * Ensure log directory exists
   * @private
   */
  _ensureLogDirectory() {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  /**
   * Rotate logs if current file exceeds size limit
   * @private
   */
  _rotateLogsIfNeeded() {
    const currentLogFile = this._getCurrentLogFile();
    
    try {
      const stats = fs.statSync(currentLogFile);
      
      if (stats.size > this.maxFileSize) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const rotatedFile = currentLogFile.replace('.log', `-${timestamp}.log`);
        
        fs.renameSync(currentLogFile, rotatedFile);
        
        // Clean up old log files
        this._cleanupOldLogs();
      }
    } catch (error) {
      // File might not exist yet, which is fine
    }
  }

  /**
   * Clean up old log files to maintain maximum file count
   * @private
   */
  _cleanupOldLogs() {
    try {
      const files = fs.readdirSync(this.logDir)
        .filter(file => file.endsWith('.log'))
        .map(file => ({
          name: file,
          path: path.join(this.logDir, file),
          stats: fs.statSync(path.join(this.logDir, file))
        }))
        .sort((a, b) => b.stats.mtime - a.stats.mtime);

      // Remove oldest files if we exceed maxFiles
      if (files.length > this.maxFiles) {
        const filesToDelete = files.slice(this.maxFiles);
        filesToDelete.forEach(file => {
          fs.unlinkSync(file.path);
        });
      }
    } catch (error) {
      console.error('Failed to cleanup old log files:', error);
    }
  }

  /**
   * Sanitize metadata to prevent circular references and sensitive data leaks
   * @private
   * @param {any} meta - Metadata to sanitize
   * @returns {Object} Sanitized metadata
   */
  _sanitizeMeta(meta) {
    if (!meta) return {};
    
    try {
      // Convert Error objects to serializable format
      if (meta instanceof Error) {
        return {
          name: meta.name,
          message: meta.message,
          stack: meta.stack,
          code: meta.code
        };
      }
      
      // Deep clone to avoid modifying original object
      const sanitized = JSON.parse(JSON.stringify(meta, (key, value) => {
        // Remove sensitive fields
        const sensitiveFields = ['password', 'token', 'secret', 'key', 'authorization'];
        if (sensitiveFields.some(field => key.toLowerCase().includes(field))) {
          return '[REDACTED]';
        }
        
        // Handle circular references
        if (typeof value === 'object' && value !== null) {
          if (this._seenObjects && this._seenObjects.has(value)) {
            return '[Circular]';
          }
          if (!this._seenObjects) this._seenObjects = new WeakSet();
          this._seenObjects.add(value);
        }
        
        return value;
      }));
      
      this._seenObjects = null; // Clean up
      return sanitized;
    } catch (error) {
      return { error: 'Failed to sanitize metadata', originalError: error.message };
    }
  }

  /**
   * Create a child logger with additional context
   * @param {Object} context - Additional context to include in all logs
   * @returns {Logger} Child logger instance
   */
  child(context) {
    const childLogger = new Logger({
      level: this.level,
      enableConsole: this.enableConsole,
      enableFile: this.enableFile,
      logDir: this.logDir
    });
    
    // Override _log to include context
    const originalLog = childLogger._log.bind(childLogger);
    childLogger._log = (level, message, meta = {}) => {
      const mergedMeta = { ...context, ...meta };
      originalLog(level, message, mergedMeta);
    };
    
    return childLogger;
  }

  /**
   * Set log level dynamically
   * @param {string|number} level - New log level
   */
  setLevel(level) {
    if (typeof level === 'string') {
      this.level = LOG_LEVELS[level.toUpperCase()] || LOG_LEVELS.INFO;
    } else if (typeof level === 'number') {
      this.level = level;
    }
  }

  /**
   * Get current log level
   * @returns {number} Current log level
   */
  getLevel() {
    return this.level;
  }
}

// Create default logger instance
const defaultLogger = new Logger({
  level: process.env.LOG_LEVEL ? LOG_LEVELS[process.env.LOG_LEVEL.toUpperCase()] : undefined,
  enableConsole: process.env.LOG_CONSOLE !== 'false',
  enableFile: process.env.LOG_FILE !== 'false',
  logDir: process.env.LOG_DIR
});

// Export both the Logger class and default instance
module.exports = defaultLogger;
module.exports.Logger = Logger;
module.exports.LOG_LEVELS = LOG_LEVELS;
