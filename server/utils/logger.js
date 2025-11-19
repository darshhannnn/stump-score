/**
 * Logger Utility
 * Provides structured logging with environment-specific formatting
 * Production: JSON format for log aggregation
 * Development: Human-readable format
 */

class Logger {
  constructor() {
    this.env = process.env.NODE_ENV || 'development';
  }

  /**
   * Core logging method
   * @param {string} level - Log level (info, warn, error, debug)
   * @param {string} message - Log message
   * @param {Object} meta - Additional metadata
   */
  log(level, message, meta = {}) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      ...meta
    };

    if (this.env === 'production') {
      // Production: JSON format for log aggregation tools
      console.log(JSON.stringify(logEntry));
    } else {
      // Development: Human-readable format
      const metaStr = Object.keys(meta).length > 0 
        ? '\n' + JSON.stringify(meta, null, 2)
        : '';
      console.log(`[${timestamp}] ${level.toUpperCase()}: ${message}${metaStr}`);
    }
  }

  /**
   * Log informational messages
   * @param {string} message - Log message
   * @param {Object} meta - Additional metadata
   */
  info(message, meta = {}) {
    this.log('info', message, meta);
  }

  /**
   * Log error messages with stack trace
   * @param {string} message - Log message
   * @param {Error} error - Error object
   * @param {Object} meta - Additional metadata
   */
  error(message, error, meta = {}) {
    const errorMeta = {
      ...meta,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    };
    this.log('error', message, errorMeta);
  }

  /**
   * Log warning messages
   * @param {string} message - Log message
   * @param {Object} meta - Additional metadata
   */
  warn(message, meta = {}) {
    this.log('warn', message, meta);
  }

  /**
   * Log debug messages (only in non-production)
   * @param {string} message - Log message
   * @param {Object} meta - Additional metadata
   */
  debug(message, meta = {}) {
    if (this.env !== 'production') {
      this.log('debug', message, meta);
    }
  }

  /**
   * Log HTTP request
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {number} duration - Request duration in ms
   */
  logRequest(req, res, duration) {
    const meta = {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('user-agent')
    };

    if (res.statusCode >= 500) {
      this.error('HTTP Request Error', new Error(`${res.statusCode} ${req.method} ${req.path}`), meta);
    } else if (res.statusCode >= 400) {
      this.warn('HTTP Request Warning', meta);
    } else {
      this.info('HTTP Request', meta);
    }
  }

  /**
   * Log database operation
   * @param {string} operation - Operation name
   * @param {string} collection - Collection name
   * @param {Object} meta - Additional metadata
   */
  logDatabase(operation, collection, meta = {}) {
    this.debug(`Database ${operation}`, {
      collection,
      ...meta
    });
  }

  /**
   * Log authentication event
   * @param {string} event - Event type (login, logout, failed)
   * @param {string} userId - User ID
   * @param {Object} meta - Additional metadata
   */
  logAuth(event, userId, meta = {}) {
    this.info(`Authentication: ${event}`, {
      userId,
      ...meta
    });
  }

  /**
   * Log payment event
   * @param {string} event - Event type
   * @param {string} paymentId - Payment ID
   * @param {Object} meta - Additional metadata
   */
  logPayment(event, paymentId, meta = {}) {
    this.info(`Payment: ${event}`, {
      paymentId,
      ...meta
    });
  }
}

// Export singleton instance
module.exports = new Logger();
