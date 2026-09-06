const express = require('express');
const router = express.Router();
const { auth, requirePremium } = require('../middleware/auth');
const { asyncHandler } = require('../utils/asyncHandler');
const provider = require('../utils/cricketProvider');

// @route   GET /api/cricket/matches
// @desc    Live + recent matches (cached server-side; key never leaves the backend)
// @access  Public
router.get('/matches', asyncHandler(async (req, res) => {
  const { matches, cached, stale } = await provider.getCurrentMatches();
  res.json({ success: true, source: stale ? 'cache-stale' : cached ? 'cache' : 'upstream', count: matches.length, data: matches });
}));

// @route   GET /api/cricket/match/:id
// @desc    Detailed info for one match (cached)
// @access  Public
router.get('/match/:id', asyncHandler(async (req, res) => {
  const { match, cached, stale } = await provider.getMatchInfo(req.params.id);
  res.json({ success: true, source: stale ? 'cache-stale' : cached ? 'cache' : 'upstream', data: match });
}));

// @route   GET /api/cricket/search?q=
// @desc    Server-side search across currently tracked matches
// @access  Public
router.get('/search', asyncHandler(async (req, res) => {
  const matches = await provider.searchMatches(req.query.q);
  res.json({ success: true, query: req.query.q || '', count: matches.length, data: matches });
}));

// @route   GET /api/cricket/predictions/:matchId
// @desc    AI-style advanced prediction for a match (deterministic per match)
// @access  Private + Premium (this is what the subscription pays for)
router.get('/predictions/:matchId', auth, requirePremium, asyncHandler(async (req, res) => {
  const { match } = await provider.getMatchInfo(req.params.matchId);
  res.json({ success: true, data: provider.buildPrediction(match) });
}));

module.exports = router;
