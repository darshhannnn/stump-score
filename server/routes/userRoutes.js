const express = require('express');
const crypto = require('crypto');
const router = express.Router();
const User = require('../models/User');
const Game = require('../models/Game');
const Comment = require('../models/Comment');
const Notification = require('../models/Notification');
const jwt = require('jsonwebtoken');
const { auth } = require('../middleware/auth');
const { asyncHandler } = require('../utils/asyncHandler');
const { authLimiter, passwordResetLimiter } = require('../middleware/rateLimiter');
const config = require('../config/env');

const generateToken = (id) =>
  jwt.sign({ id }, config.jwtSecret, { expiresIn: config.jwtExpiresIn });

const sha256 = (v) => crypto.createHash('sha256').update(v).digest('hex');

// @route   POST /api/users/register
// @desc    Register a new user
// @access  Public
router.post('/register', authLimiter, asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email and password are required' });
  }
  if (String(password).length < 8) {
    return res.status(400).json({ message: 'Password must be at least 8 characters' });
  }

  const userExists = await User.findOne({ email: String(email).toLowerCase() });
  if (userExists) {
    return res.status(400).json({ message: 'User already exists with this email' });
  }

  const user = await User.create({ name, email, password });
  Notification.notify(user._id, 'welcome', 'Welcome to StumpScore! 🏏',
    'Your account is ready. Explore live scores, track games in the Scorekeeper, and go Premium for AI predictions.');

  res.status(201).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    isPremium: user.isPremium,
    token: generateToken(user._id)
  });
}));

// @route   POST /api/users/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', authLimiter, asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: String(email || '').toLowerCase() });

  if (user && (await user.matchPassword(password))) {
    user.lastLoginAt = new Date();
    await user.save();
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isPremium: user.hasActivePremium(),
      premiumUntil: user.premiumUntil,
      token: generateToken(user._id)
    });
  } else {
    res.status(401).json({ message: 'Invalid email or password' });
  }
}));

// @route   POST /api/users/google
// @desc    Handle Google login/registration
// @access  Public
router.post('/google', authLimiter, asyncHandler(async (req, res) => {
  const { name, email, googleId, profilePicture } = req.body;

  let user = await User.findOne({ email: String(email || '').toLowerCase() });

  if (!user) {
    user = await User.create({
      name: name || 'Google User',
      email,
      password: 'GOOGLE_AUTH_USER',
      googleId,
      profilePicture
    });
    Notification.notify(user._id, 'welcome', 'Welcome to StumpScore! 🏏',
      'Your account is ready. Explore live scores, track games in the Scorekeeper, and go Premium for AI predictions.');
  } else if (!user.googleId) {
    user.googleId = googleId;
    if (profilePicture) user.profilePicture = profilePicture;
    await user.save();
  }

  res.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    isPremium: user.hasActivePremium(),
    premiumUntil: user.premiumUntil,
    profilePicture: user.profilePicture,
    token: generateToken(user._id)
  });
}));

// @route   GET /api/users/profile
// @desc    Get full user profile
// @access  Private
router.get('/profile', auth, asyncHandler(async (req, res) => {
  res.json(req.user);
}));

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', auth, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) return res.status(404).json({ message: 'User not found' });

  user.name = req.body.name || user.name;
  user.email = req.body.email || user.email;
  if (req.body.profilePicture) user.profilePicture = req.body.profilePicture;

  const updatedUser = await user.save();
  res.json(updatedUser);
}));

// @route   PATCH /api/users/preferences
// @desc    Update user preferences (theme, notifications, favorite team)
// @access  Private
router.patch('/preferences', auth, asyncHandler(async (req, res) => {
  const allowed = ['theme', 'favoriteTeamId', 'notifyMatches', 'notifyPredictions', 'notifyWeeklyDigest'];
  for (const key of allowed) {
    if (key in req.body) {
      req.user.preferences[key] = req.body[key];
    }
  }
  await req.user.save();
  res.json({ success: true, preferences: req.user.preferences });
}));

// @route   POST /api/users/change-password
// @desc    Change password (requires current password)
// @access  Private
router.post('/change-password', auth, asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: 'Current and new password are required' });
  }
  if (String(newPassword).length < 8) {
    return res.status(400).json({ message: 'New password must be at least 8 characters' });
  }

  const user = await User.findById(req.user._id);
  if (!(await user.matchPassword(currentPassword))) {
    return res.status(401).json({ message: 'Current password is incorrect' });
  }

  user.password = newPassword;
  await user.save();
  Notification.notify(user._id, 'system', 'Password changed', 'Your password was changed successfully. If this wasn\'t you, contact support immediately.');
  res.json({ success: true, message: 'Password updated successfully' });
}));

// @route   POST /api/users/forgot-password
// @desc    Generate a password reset token for the email
// @access  Public
router.post('/forgot-password', passwordResetLimiter, asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email: String(email || '').toLowerCase() });

  // Always return success (do not leak which emails are registered)
  if (!user) {
    return res.json({ success: true, message: 'If an account exists for this email, a reset link has been sent.' });
  }

  const token = crypto.randomBytes(32).toString('hex');
  user.resetPasswordToken = sha256(token);
  user.resetPasswordExpires = Date.now() + 30 * 60 * 1000; // 30 minutes
  await user.save();

  // Production: email the token (mail service not wired yet).
  // Development: return it so the flow is fully testable.
  const payload = { success: true, message: 'If an account exists for this email, a reset link has been sent.' };
  if (!config.isProd) payload.resetToken = token;
  res.json(payload);
}));

// @route   POST /api/users/reset-password
// @desc    Consume a reset token and set a new password
// @access  Public
router.post('/reset-password', passwordResetLimiter, asyncHandler(async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password) {
    return res.status(400).json({ message: 'Reset token and new password are required' });
  }
  if (String(password).length < 8) {
    return res.status(400).json({ message: 'Password must be at least 8 characters' });
  }

  const user = await User.findOne({
    resetPasswordToken: sha256(token),
    resetPasswordExpires: { $gt: Date.now() }
  });

  if (!user) {
    return res.status(400).json({ message: 'Reset link is invalid or has expired' });
  }

  user.password = password;
  user.resetPasswordToken = null;
  user.resetPasswordExpires = null;
  await user.save();

  res.json({ success: true, message: 'Password has been reset. You can now log in.' });
}));

// @route   GET /api/users/favorites
// @desc    List favorited team ids
// @access  Private
router.get('/favorites', auth, asyncHandler(async (req, res) => {
  res.json({ favorites: req.user.favorites });
}));

// @route   POST /api/users/favorites/:teamId
// @desc    Toggle a favorite team
// @access  Private
router.post('/favorites/:teamId', auth, asyncHandler(async (req, res) => {
  const { teamId } = req.params;
  if (!teamId || teamId.length > 60) {
    return res.status(400).json({ message: 'Invalid team id' });
  }
  if (req.user.favorites.includes(teamId)) {
    req.user.favorites = req.user.favorites.filter((t) => t !== teamId);
  } else {
    if (req.user.favorites.length >= 20) {
      return res.status(400).json({ message: 'Favorite limit reached (20)' });
    }
    req.user.favorites.push(teamId);
  }
  await req.user.save();
  res.json({ success: true, favorited: req.user.favorites.includes(teamId), favorites: req.user.favorites });
}));

// @route   DELETE /api/users/account
// @desc    Delete account and all associated data
// @access  Private
router.delete('/account', auth, asyncHandler(async (req, res) => {
  await Promise.all([
    Game.deleteMany({ user: req.user._id }),
    Comment.deleteMany({ user: req.user._id }),
    Notification.deleteMany({ user: req.user._id }),
  ]);
  await User.deleteOne({ _id: req.user._id });
  res.json({ success: true, message: 'Account and all associated data deleted' });
}));

// ===== Subscription management =====

// @route   GET /api/users/subscription
// @desc    Get user subscription details
// @access  Private
router.get('/subscription', auth, asyncHandler(async (req, res) => {
  const user = req.user;

  const history = user.paymentHistory || [];
  const lastPayment = history.length > 0 ? history[history.length - 1] : null;
  const planType = lastPayment?.planType || 'monthly';

  const plan = planType === 'annual'
    ? { id: 'annual', name: 'Annual', description: 'Annual premium subscription (Save 67%)', price: 200, currency: '₹', period: 'year' }
    : { id: 'monthly', name: 'Monthly', description: 'Monthly premium subscription', price: 50, currency: '₹', period: 'month' };

  const now = new Date();
  const expired = user.premiumUntil && new Date(user.premiumUntil) < now;

  res.json({
    isPremium: user.hasActivePremium(),
    status: user.hasActivePremium() ? 'active' : 'cancelled',
    startDate: lastPayment?.date || user.createdAt,
    nextBillingDate: user.premiumUntil,
    premiumUntil: user.premiumUntil,
    autoRenew: user.isPremium,
    discount: planType === 'annual' ? 400 : 0,
    plan,
    paymentMethod: {
      type: 'Razorpay',
      brand: 'Razorpay',
      last4: '0000',
      expiryMonth: '--',
      expiryYear: '----'
    },
    billingHistory: history.map((p) => ({
      date: p.date,
      description: `${p.planType === 'annual' ? 'Annual' : 'Monthly'} Premium Subscription`,
      amount: `₹${p.amount}`,
      status: 'paid'
    }))
  });
}));

// @route   POST /api/users/subscription/cancel
// @desc    Cancel user subscription
// @access  Private
router.post('/subscription/cancel', auth, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  if (!user.isPremium) return res.status(400).json({ message: 'No active subscription to cancel' });

  user.isPremium = false;
  await user.save();
  Notification.notify(user._id, 'subscription', 'Subscription cancelled',
    'Your premium subscription was cancelled. You can reactivate any time before the period ends.');

  res.json({
    success: true,
    message: 'Subscription cancelled successfully.',
    user: { _id: user._id, name: user.name, email: user.email, isPremium: user.isPremium, premiumUntil: user.premiumUntil }
  });
}));

// @route   POST /api/users/subscription/reactivate
// @desc    Reactivate a cancelled subscription
// @access  Private
router.post('/subscription/reactivate', auth, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) return res.status(404).json({ message: 'User not found' });

  if (user.premiumUntil && user.premiumUntil > new Date()) {
    user.isPremium = true;
    await user.save();
    Notification.notify(user._id, 'subscription', 'Subscription reactivated', 'Welcome back! Your premium benefits are active again.');

    res.json({
      success: true,
      message: 'Subscription reactivated successfully',
      user: { _id: user._id, name: user.name, email: user.email, isPremium: user.isPremium, premiumUntil: user.premiumUntil }
    });
  } else {
    return res.status(400).json({ message: 'Your subscription has expired. Please purchase a new plan.' });
  }
}));

// @route   POST /api/users/subscription/change-plan
// @desc    Change subscription plan (upgrades premium period)
// @access  Private
router.post('/subscription/change-plan', auth, asyncHandler(async (req, res) => {
  const { planId } = req.body;

  if (!planId || !['monthly', 'annual'].includes(planId)) {
    return res.status(400).json({ message: 'Invalid plan type. Must be "monthly" or "annual"' });
  }

  const user = await User.findById(req.user._id);
  if (!user) return res.status(404).json({ message: 'User not found' });

  const now = new Date();
  let premiumUntil;
  if (planId === 'monthly') {
    premiumUntil = new Date(now.setMonth(now.getMonth() + 1));
  } else {
    premiumUntil = new Date(now.setFullYear(now.getFullYear() + 1));
  }

  user.isPremium = true;
  user.premiumUntil = premiumUntil;
  await user.save();
  Notification.notify(user._id, 'subscription', `Plan changed to ${planId}`,
    `Your subscription is now on the ${planId} plan until ${premiumUntil.toLocaleDateString()}.`);

  res.json({
    success: true,
    message: `Subscription changed to ${planId} plan successfully`,
    user: { _id: user._id, name: user.name, email: user.email, isPremium: user.isPremium, premiumUntil: user.premiumUntil }
  });
}));

module.exports = router;
