/**
 * Health Check Routes
 * Provides endpoints for monitoring application health
 */

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const databaseManager = require('../config/database');

/**
 * Main health check endpoint
 * Returns comprehensive health status
 * GET /health
 */
router.get('/health', async (req, res) => {
  const startTime = Date.now();
  
  const health = {
    uptime: process.uptime(),
    timestamp: Date.now(),
    status: 'healthy',
    checks: {}
  };

  // Database check
  try {
    const dbState = mongoose.connection.readyState;
    const dbStatus = databaseManager.getStatus();
    
    health.checks.database = {
      status: dbState === 1 ? 'connected' : 'disconnected',
      state: dbStatus,
      host: mongoose.connection.host || 'unknown',
      name: mongoose.connection.name || 'unknown'
    };

    if (dbState !== 1) {
      health.status = 'unhealthy';
    }
  } catch (error) {
    health.checks.database = {
      status: 'error',
      error: error.message
    };
    health.status = 'unhealthy';
  }

  // Memory check
  const memUsage = process.memoryUsage();
  health.checks.memory = {
    heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024) + ' MB',
    heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024) + ' MB',
    rss: Math.round(memUsage.rss / 1024 / 1024) + ' MB',
    external: Math.round(memUsage.external / 1024 / 1024) + ' MB'
  };

  // Response time check
  const responseTime = Date.now() - startTime;
  health.checks.responseTime = `${responseTime}ms`;

  // Warn if response time is too slow
  if (responseTime > 2000) {
    health.status = 'degraded';
    health.checks.responseTime += ' (slow)';
  }

  // Environment info
  health.environment = process.env.NODE_ENV || 'development';
  health.version = process.env.npm_package_version || 'unknown';

  const statusCode = health.status === 'healthy' ? 200 : 503;
  res.status(statusCode).json(health);
});

/**
 * Readiness check endpoint
 * Used by container orchestration systems (Kubernetes, Docker Swarm)
 * GET /health/ready
 */
router.get('/health/ready', (req, res) => {
  const isReady = mongoose.connection.readyState === 1;
  
  if (isReady) {
    res.status(200).json({ 
      ready: true,
      message: 'Application is ready to accept traffic'
    });
  } else {
    res.status(503).json({ 
      ready: false,
      message: 'Application is not ready',
      database: databaseManager.getStatus()
    });
  }
});

/**
 * Liveness check endpoint
 * Used by container orchestration systems
 * GET /health/live
 */
router.get('/health/live', (req, res) => {
  res.status(200).json({ 
    alive: true,
    uptime: process.uptime(),
    timestamp: Date.now()
  });
});

/**
 * Detailed status endpoint (for internal monitoring)
 * GET /health/status
 */
router.get('/health/status', (req, res) => {
  const dbStats = databaseManager.getStats();
  
  const status = {
    application: {
      name: 'StumpScore',
      version: process.env.npm_package_version || 'unknown',
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime(),
      pid: process.pid
    },
    database: dbStats,
    memory: {
      heapUsed: process.memoryUsage().heapUsed,
      heapTotal: process.memoryUsage().heapTotal,
      rss: process.memoryUsage().rss,
      external: process.memoryUsage().external
    },
    cpu: process.cpuUsage()
  };

  res.json(status);
});

module.exports = router;
