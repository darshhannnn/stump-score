const config = require('../config/env');

// 404 for unknown API routes (mounted after all API routes)
const notFound = (req, res) => {
  res.status(404).json({ message: `API route not found: ${req.method} ${req.originalUrl}` });
};

// Central error handler - consistent JSON errors, no stack leaks in production
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  const status = err.status || err.statusCode || 500;
  const payload = {
    message: status >= 500 ? 'Internal server error' : err.message,
    error: config.isProd ? undefined : err.message,
  };
  if (status >= 500) {
    console.error(`[error] ${req.method} ${req.originalUrl}:`, err.message);
  }
  res.status(status).json(payload);
};

module.exports = { notFound, errorHandler };
