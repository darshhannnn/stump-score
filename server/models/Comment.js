const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  matchId: { type: String, required: true, index: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userName: { type: String, required: true },
  text: { type: String, required: true, trim: true, minlength: 1, maxlength: 500 },
  createdAt: { type: Date, default: Date.now, index: true }
});

commentSchema.index({ matchId: 1, createdAt: -1 });

const Comment = mongoose.model('Comment', commentSchema);
module.exports = Comment;
