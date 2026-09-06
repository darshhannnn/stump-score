const express = require('express');
const router = express.Router();

const userRoutes = require('./userRoutes');
const paymentRoutes = require('./paymentRoutes');
const cricketRoutes = require('./cricketRoutes');
const gameRoutes = require('./gameRoutes');
const commentRoutes = require('./commentRoutes');
const notificationRoutes = require('./notificationRoutes');
const User = require('../models/User');
const Game = require('../models/Game');
const Comment = require('../models/Comment');
const cache = require('../utils/cache');
const { asyncHandler } = require('../utils/asyncHandler');
const mongoose = require('mongoose');

// Mount all route modules
router.use('/users', userRoutes);
router.use('/payments', paymentRoutes);
router.use('/cricket', cricketRoutes);
router.use('/games', gameRoutes);
router.use('/matches', commentRoutes);
router.use('/notifications', notificationRoutes);

// @route   GET /api/health
// @desc    Service health probe (db status, uptime, cache stats)
// @access  Public
router.get('/health', (req, res) => {
  const dbState = mongoose.connection.readyState; // 0=disconnected 1=connected 2=connecting 3=disconnecting
  res.json({
    status: 'ok',
    service: 'stumpscore-api',
    database: dbState === 1 ? 'connected' : dbState === 2 ? 'connecting' : 'disconnected',
    dbReady: dbState,
    cache: cache.stats(),
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

// @route   GET /api/stats
// @desc    Public platform stats
// @access  Public
router.get('/stats', asyncHandler(async (req, res) => {
  const [users, games, comments] = await Promise.all([
    User.countDocuments(),
    Game.countDocuments(),
    Comment.countDocuments(),
  ]);
  res.json({ success: true, data: { users, games, comments } });
}));

module.exports = router;
