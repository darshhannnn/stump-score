const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables first
dotenv.config();

// Load configuration and utilities
const config = require('./server/config/environment');
const logger = require('./server/utils/logger');
const requestLogger = require('./server/middleware/requestLogger');
const { errorHandler, notFoundHandler } = require('./server/middleware/errorHandler');
const corsConfig = require('./server/middleware/corsConfig');
const { apiLimiter } = require('./server/middleware/rateLimiter');
const securityHeaders = require('./server/middleware/securityHeaders');
const { sanitizeInput, preventNoSQLInjection } = require('./server/middleware/inputValidation');

// Routes
const userRoutes = require('./server/routes/userRoutes');
const paymentRoutes = require('./server/routes/paymentRoutes');
const healthRoutes = require('./server/routes/healthRoutes');

// Validate configuration before starting
const validation = config.validate();
if (!validation.valid) {
  console.error('Configuration validation failed:', validation.error);
  console.error('Please check your .env file and ensure all required variables are set.');
  process.exit(1);
}

// Print configuration summary
if (!config.isTest()) {
  config.printSummary();
}

// Initialize express
const app = express();

// Security headers (apply first)
app.use(securityHeaders);

// CORS configuration
app.use(corsConfig);

// Body parsing middleware
app.use(express.json({ 
  verify: (req, res, buf) => {
    // Store raw body for Razorpay webhook verification
    if (req.originalUrl === '/api/payments/webhook') {
      req.rawBody = buf;
    }
  }
}));

// Input sanitization and validation
app.use(sanitizeInput);
app.use(preventNoSQLInjection);

// Request logging
app.use(requestLogger);

// Rate limiting for API routes
app.use('/api/', apiLimiter);

// Connect to MongoDB
const connectDB = async () => {
  const appConfig = config.getConfig();
  
  try {
    // Try Atlas connection first if configured
    if (appConfig.mongoAtlasUri) {
      try {
        await mongoose.connect(appConfig.mongoAtlasUri);
        console.log('MongoDB Atlas connected successfully');
        
        // Start subscription tasks after DB connection
        require('./server/tasks/subscriptionTasks');
        return;
      } catch (atlasErr) {
        console.log('Atlas connection failed, trying local MongoDB...');
      }
    }
    
    // Fallback to local MongoDB
    await mongoose.connect(appConfig.mongoUri);
    console.log('Connected to local MongoDB successfully');
    
    // Start subscription tasks after DB connection
    require('./server/tasks/subscriptionTasks');
  } catch (err) {
    console.error('All MongoDB connection attempts failed:', err);
    process.exit(1);
  }
};

// Connect to database
connectDB().catch(err => {
  logger.error('Database connection failed', err);
  process.exit(1);
});

// Health check routes (before other routes for quick response)
app.use('/', healthRoutes);

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/payments', paymentRoutes);

// Serve static assets in production
if (config.isProduction()) {
  // Serve static files with caching
  app.use(express.static('build', {
    maxAge: '1y', // Cache static assets for 1 year
    etag: true,
    lastModified: true,
    setHeaders: (res, filePath) => {
      // Don't cache HTML files
      if (filePath.endsWith('.html')) {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
      }
      // Cache JS and CSS files aggressively
      else if (filePath.endsWith('.js') || filePath.endsWith('.css')) {
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      }
      // Cache images and fonts
      else if (filePath.match(/\.(jpg|jpeg|png|gif|ico|svg|woff|woff2|ttf|eot)$/)) {
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      }
    }
  }));

  // SPA fallback - serve index.html for all non-API routes
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'build', 'index.html'));
  });
}

// 404 handler
app.use(notFoundHandler);

// Error handling middleware (must be last)
app.use(errorHandler);

const PORT = config.getConfig().port || 5000;

// Start server
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${config.getConfig().env}`);
});

const databaseManager = require('./server/config/database');

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Promise Rejection', err);
  // Close server & database connection, then exit
  server.close(async () => {
    await databaseManager.disconnect();
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception', err);
  // Close server & database connection, then exit
  server.close(async () => {
    await databaseManager.disconnect();
    process.exit(1);
  });
});

// Handle graceful shutdown signals
process.on('SIGTERM', async () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  server.close(async () => {
    logger.info('HTTP server closed');
    await databaseManager.disconnect();
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  logger.info('SIGINT signal received: closing HTTP server');
  server.close(async () => {
    logger.info('HTTP server closed');
    await databaseManager.disconnect();
    process.exit(0);
  });
});
