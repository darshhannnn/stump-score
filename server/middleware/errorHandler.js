/**
 * Error Handler Middleware
 * Centralized error handling for Express application
 * Provides appropriate error responses based on environment
 */

const logger = require('../utils/logger');

/**
 * Custom error class with status code
 */
class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Error handler middleware
 * @param {Error} err - Error object
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next function
 */
function errorHandler(err, req, res, next) {
  // Log the error
  logger.error('Request error', err, {
    method: req.method,
    path: req.path,
    ip: req.ip || req.connection.remoteAddress,
    body: req.body,
    params: req.params,
    query: req.query
  });

  // Determine status code
  const statusCode = err.statusCode || 500;

  // Determine error message
  const message = process.env.NODE_ENV === 'production' && statusCode === 500
    ? 'An error occurred'
    : err.message;

  // Build error response
  const errorResponse = {
    success: false,
    error: {
      message,
      code: err.code || 'INTERNAL_ERROR'
    }
  };

  // Include stack trace in development
  if (process.env.NODE_ENV !== 'production') {
    errorResponse.error.stack = err.stack;
    errorResponse.error.details = err.details;
  }

  // Send error response
  res.status(statusCode).json(errorResponse);
}

/**
 * 404 Not Found handler
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    error: {
      message: 'Resource not found',
      code: 'NOT_FOUND',
      path: req.path
    }
  });
}

/**
 * Async error wrapper
 * Wraps async route handlers to catch errors
 * @param {Function} fn - Async function
 * @returns {Function} Wrapped function
 */
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Validation error handler
 * @param {Object} errors - Validation errors
 * @returns {AppError} Validation error
 */
function validationError(errors) {
  return new AppError('Validation failed', 400);
}

/**
 * Authentication error
 * @param {string} message - Error message
 * @returns {AppError} Authentication error
 */
function authenticationError(message = 'Authentication required') {
  return new AppError(message, 401);
}

/**
 * Authorization error
 * @param {string} message - Error message
 * @returns {AppError} Authorization error
 */
function authorizationError(message = 'Insufficient permissions') {
  return new AppError(message, 403);
}

/**
 * Database error handler
 * @param {Error} err - Database error
 * @returns {AppError} Formatted error
 */
function handleDatabaseError(err) {
  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => e.message);
    return new AppError(`Validation failed: ${errors.join(', ')}`, 400);
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return new AppError(`Duplicate value for field: ${field}`, 409);
  }

  // Mongoose cast error
  if (err.name === 'CastError') {
    return new AppError(`Invalid ${err.path}: ${err.value}`, 400);
  }

  // Default database error
  return new AppError('Database operation failed', 500);
}

module.exports = {
  errorHandler,
  notFoundHandler,
  asyncHandler,
  AppError,
  validationError,
  authenticationError,
  authorizationError,
  handleDatabaseError
};
