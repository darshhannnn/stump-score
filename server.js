const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const path = require('path');

const config = require('./server/config/env');
const routes = require('./server/routes');
const { globalLimiter } = require('./server/middleware/rateLimiter');
const { notFound, errorHandler } = require('./server/middleware/errorHandler');

const app = express();

// ===== Security & performance middleware =====
app.use(helmet({
  // The API also serves the CRA production build, which needs inline scripts
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
app.use(compression());
app.use(cors({ origin: config.corsOrigin === '*' ? true : config.corsOrigin.split(','), credentials: false }));

// Stash the raw body so Razorpay webhook HMAC verification has the exact bytes
app.use(express.json({
  limit: '1mb',
  verify: (req, res, buf) => { req.rawBody = buf; }
}));

if (!config.isProd) {
  app.use(morgan('dev'));
}

// Global rate limit for the whole API
app.use('/api', globalLimiter);

// ===== Database =====
const connectDB = async () => {
  try {
    await mongoose.connect(config.mongoUri);
    console.log('MongoDB connected:', config.isProd ? '(uri hidden)' : config.mongoUri.replace(/\/\/.*@/, '//***@'));
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    if (config.mongoUri !== config.localMongoFallback) {
      console.log('Attempting to connect to local MongoDB...');
      try {
        await mongoose.connect(config.localMongoFallback);
        console.log('Connected to local MongoDB successfully');
      } catch (localErr) {
        console.error('Local MongoDB connection error:', localErr.message);
        console.error('API routes depending on the database will return 500s until a DB is reachable.');
      }
    }
  }
};
connectDB();
mongoose.connection.on('disconnected', () => console.warn('[db] disconnected'));
mongoose.connection.on('reconnected', () => console.log('[db] reconnected'));

// ===== Routes =====
app.use('/api', routes);

// Unknown API routes -> JSON 404
app.use('/api', notFound);

// Serve static assets in production
if (config.isProd) {
  app.use(express.static(path.join(__dirname, 'build')));

  // Terminal middleware (Express 5 removed the '*' wildcard route syntax)
  app.use((req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
  });
}

// Central error handler (must be last)
app.use(errorHandler);

// ===== Boot =====
const server = app.listen(config.port, () => {
  console.log(`StumpScore API running on port ${config.port} (${config.nodeEnv})`);
  console.log(`  Health:   http://localhost:${config.port}/api/health`);
  console.log(`  Stats:    http://localhost:${config.port}/api/stats`);
});

// ===== Graceful shutdown =====
const shutdown = (signal) => {
  console.log(`\n${signal} received - shutting down gracefully...`);
  server.close(async () => {
    try {
      await mongoose.connection.close();
      console.log('HTTP server and database connection closed. Goodbye.');
      process.exit(0);
    } catch (err) {
      console.error('Error during shutdown:', err.message);
      process.exit(1);
    }
  });
  // Force-exit if connections hang
  setTimeout(() => process.exit(1), 10000).unref();
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

// Keep the process alive on unexpected errors instead of crashing
process.on('unhandledRejection', (reason) => {
  console.error('[unhandledRejection]', reason);
});
