const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const { auth } = require('../middleware/auth');
const { asyncHandler } = require('../utils/asyncHandler');

// @route   GET /api/notifications
// @desc    List the user's notifications (newest first)
// @access  Private
router.get('/', auth, asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 15));

  const [notifications, total, unread] = await Promise.all([
    Notification.find({ user: req.user._id }).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
    Notification.countDocuments({ user: req.user._id }),
    Notification.countDocuments({ user: req.user._id, read: false }),
  ]);

  res.json({ success: true, page, total, unread, data: notifications });
}));

// @route   POST /api/notifications/:id/read
// @desc    Mark one notification as read
// @access  Private
router.post('/:id/read', auth, asyncHandler(async (req, res) => {
  const n = await Notification.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    { read: true },
    { new: true }
  );
  if (!n) return res.status(404).json({ message: 'Notification not found' });
  res.json({ success: true, data: n });
}));

// @route   POST /api/notifications/read-all
// @desc    Mark all notifications as read
// @access  Private
router.post('/read-all', auth, asyncHandler(async (req, res) => {
  await Notification.updateMany({ user: req.user._id, read: false }, { read: true });
  res.json({ success: true, message: 'All notifications marked as read' });
}));

module.exports = router;
