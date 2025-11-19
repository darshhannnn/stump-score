/**
 * Request Logger Middleware
 * Logs all HTTP requests with timing information
 */

const logger = require('../utils/logger');

/**
 * Request logging middleware
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next function
 */
function requestLogger(req, res, next) {
  const startTime = Date.now();

  // Log when response is finished
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    logger.logRequest(req, res, duration);
  });

  next();
}

module.exports = requestLogger;
