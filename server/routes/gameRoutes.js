const express = require('express');
const router = express.Router();
const Game = require('../models/Game');
const { auth } = require('../middleware/auth');
const { asyncHandler } = require('../utils/asyncHandler');

// @route   GET /api/games
// @desc    List the user's cloud-synced Scorekeeper games
// @access  Private
router.get('/', auth, asyncHandler(async (req, res) => {
  const games = await Game.find({ user: req.user._id }).sort({ updatedAt: -1 }).limit(100);
  res.json({ success: true, count: games.length, data: games });
}));

// @route   POST /api/games
// @desc    Upsert a Scorekeeper game (cloud save)
// @access  Private
router.post('/', auth, asyncHandler(async (req, res) => {
  const { gameId, data } = req.body;
  if (!gameId || !data || typeof data !== 'object') {
    return res.status(400).json({ message: 'gameId and data are required' });
  }

  const game = await Game.findOneAndUpdate(
    { user: req.user._id, gameId },
    { data, updatedAt: new Date() },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  res.status(game.isNew ? 201 : 200).json({ success: true, data: game });
}));

// @route   GET /api/games/:gameId
// @desc    Fetch one synced game
// @access  Private
router.get('/:gameId', auth, asyncHandler(async (req, res) => {
  const game = await Game.findOne({ user: req.user._id, gameId: req.params.gameId });
  if (!game) return res.status(404).json({ message: 'Game not found' });
  res.json({ success: true, data: game });
}));

// @route   DELETE /api/games/:gameId
// @desc    Delete a synced game
// @access  Private
router.delete('/:gameId', auth, asyncHandler(async (req, res) => {
  const result = await Game.deleteOne({ user: req.user._id, gameId: req.params.gameId });
  if (result.deletedCount === 0) return res.status(404).json({ message: 'Game not found' });
  res.json({ success: true, message: 'Game deleted' });
}));

module.exports = router;
