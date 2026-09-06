const mongoose = require('mongoose');

// Cloud-synced Scorekeeper games. The payload mirrors the client's game object
// so sync is a straight JSON round-trip.
const gameSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  gameId: { type: String, required: true },
  data: { type: mongoose.Schema.Types.Mixed, required: true },
  updatedAt: { type: Date, default: Date.now }
});

gameSchema.index({ user: 1, gameId: 1 }, { unique: true });

const Game = mongoose.model('Game', gameSchema);
module.exports = Game;
