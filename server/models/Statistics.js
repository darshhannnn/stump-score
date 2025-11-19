const mongoose = require('mongoose');

const statisticsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  matches: {
    total: { type: Number, default: 0 },
    live: { type: Number, default: 0 },
    completed: { type: Number, default: 0 }
  },
  scoring: {
    totalRuns: { type: Number, default: 0 },
    totalWickets: { type: Number, default: 0 },
    highestScore: { type: Number, default: 0 }
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Statistics', statisticsSchema);
