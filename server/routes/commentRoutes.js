const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment');
const { auth } = require('../middleware/auth');
const { asyncHandler } = require('../utils/asyncHandler');
const { commentLimiter } = require('../middleware/rateLimiter');

// @route   GET /api/matches/:matchId/comments
// @desc    Match discussion feed (paginated, newest first)
// @access  Public
router.get('/:matchId/comments', asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));

  const [comments, total] = await Promise.all([
    Comment.find({ matchId: req.params.matchId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Comment.countDocuments({ matchId: req.params.matchId }),
  ]);

  res.json({
    success: true,
    page,
    pages: Math.ceil(total / limit),
    total,
    data: comments,
  });
}));

// @route   POST /api/matches/:matchId/comments
// @desc    Post a comment on a match
// @access  Private
router.post('/:matchId/comments', auth, commentLimiter, asyncHandler(async (req, res) => {
  const text = String(req.body.text || '').trim();
  if (!text) return res.status(400).json({ message: 'Comment text is required' });
  if (text.length > 500) return res.status(400).json({ message: 'Comment must be 500 characters or fewer' });

  const comment = await Comment.create({
    matchId: req.params.matchId,
    user: req.user._id,
    userName: req.user.name,
    text,
  });

  res.status(201).json({ success: true, data: comment });
}));

// @route   DELETE /api/matches/:matchId/comments/:commentId
// @desc    Delete your own comment
// @access  Private
router.delete('/:matchId/comments/:commentId', auth, asyncHandler(async (req, res) => {
  const comment = await Comment.findById(req.params.commentId);
  if (!comment || comment.matchId !== req.params.matchId) {
    return res.status(404).json({ message: 'Comment not found' });
  }
  if (String(comment.user) !== String(req.user._id)) {
    return res.status(403).json({ message: 'You can only delete your own comments' });
  }
  await comment.deleteOne();
  res.json({ success: true, message: 'Comment deleted' });
}));

module.exports = router;
