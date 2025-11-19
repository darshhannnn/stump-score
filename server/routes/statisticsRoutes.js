const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const Statistics = require('../models/Statistics');

router.get('/user', auth, async (req, res) => {
  try {
    const stats = await Statistics.findOne({ userId: req.user._id });
    if (!stats) {
      return res.status(404).json({ message: 'Statistics not found' });
    }
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/summary', auth, async (req, res) => {
  try {
    const stats = await Statistics.aggregate([
      { $match: { userId: req.user._id } },
      {
        $group: {
          _id: null,
          totalMatches: { $sum: '$matches.total' },
          totalRuns: { $sum: '$scoring.totalRuns' },
          avgScore: { $avg: '$scoring.totalRuns' }
        }
      }
    ]);
    res.json(stats[0] || {});
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
