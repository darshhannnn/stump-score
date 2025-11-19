require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const config = require('./config/environment');
const logger = require('./utils/logger');
const requestLogger = require('./middleware/requestLogger');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

const app = express();

// Print configuration summary on startup
if (!config.isTest()) {
  config.printSummary();
}

// Middleware
app.use(express.json());
app.use(cors());

// Request logging
app.use(requestLogger);

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/user', require('./routes/userRoutes'));
app.use('/api/payment', require('./routes/paymentRoutes'));

// 404 handler
app.use(notFoundHandler);

// Error handling middleware (must be last)
app.use(errorHandler);

// Validate configuration before starting
const validation = config.validate();
if (!validation.valid) {
  console.error('Configuration validation failed:', validation.error);
  process.exit(1);
}

// Port validation
const validatePort = (port) => {
  const parsedPort = parseInt(port, 10);
  if (isNaN(parsedPort)) return false;
  if (parsedPort <= 0 || parsedPort >= 65536) return false;
  return parsedPort;
};

// Initialize MongoDB connection before starting server
connectDB().then(() => {
  const PORT = validatePort(config.getConfig().port) || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${config.getConfig().env}`);
    if (config.isDevelopment()) {
      console.log(`Test payment page available at: ${config.getConfig().clientUrl}/test-payment`);
    }
  });
}).catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

module.exports = app;