/**
 * CORS Configuration Middleware
 * Production-ready CORS with origin validation
 */

const cors = require('cors');
const config = require('../config/environment');

/**
 * CORS options for production
 */
const corsOptions = {
  origin: function (origin, callback) {
    const appConfig = config.getConfig();
    const allowedOrigins = appConfig.allowedOrigins;

    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

/**
 * Export CORS middleware based on environment
 */
module.exports = config.isProduction()
  ? cors(corsOptions)
  : cors(); // Allow all origins in development
