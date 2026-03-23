const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { auth } = require('../middleware/auth');

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'stumpscore_jwt_secret', {
    expiresIn: '30d'
  });
};

// @route   POST /api/users/register
// @desc    Register a new user
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Create new user
    const user = await User.create({
      name,
      email,
      password
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isPremium: user.isPremium,
        token: generateToken(user._id)
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/users/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    
    // Check if user exists and password matches
    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isPremium: user.isPremium,
        premiumUntil: user.premiumUntil,
        token: generateToken(user._id)
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/users/google
// @desc    Handle Google login/registration
// @access  Public
router.post('/google', async (req, res) => {
  try {
    const { name, email, googleId, profilePicture } = req.body;

    // Find user by email
    let user = await User.findOne({ email });

    if (!user) {
      // Create a new user if one doesn't exist
      user = await User.create({
        name,
        email,
        password: 'GOOGLE_AUTH_USER', // Placeholder password for Google users
        googleId,
        profilePicture
      });
    } else {
      // Update Google ID if user exists but doesn't have one
      if (!user.googleId) {
        user.googleId = googleId;
        if (profilePicture) {
          user.profilePicture = profilePicture;
        }
        await user.save();
      }
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isPremium: user.isPremium,
      premiumUntil: user.premiumUntil,
      profilePicture: user.profilePicture,
      token: generateToken(user._id)
    });
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/users/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', auth, async (req, res) => {
  try {
    res.json(req.user);
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      
      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        isPremium: updatedUser.isPremium,
        premiumUntil: updatedUser.premiumUntil,
        token: generateToken(updatedUser._id)
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/users/subscription
// @desc    Get user subscription details
// @access  Private
router.get('/subscription', auth, async (req, res) => {
  try {
    const user = req.user;

    res.json({
      isPremium: user.isPremium,
      premiumUntil: user.premiumUntil,
      paymentHistory: user.paymentHistory
    });
  } catch (error) {
    console.error('Subscription check error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/users/subscription/cancel
// @desc    Cancel user subscription (sets isPremium to false but keeps premiumUntil date)
// @access  Private
router.post('/subscription/cancel', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.isPremium) {
      return res.status(400).json({ message: 'No active subscription to cancel' });
    }

    // Mark subscription as cancelled but keep premiumUntil date for access until expiry
    user.isPremium = false;
    await user.save();

    res.json({
      success: true,
      message: 'Subscription cancelled successfully. You will have access until the end of your billing period.',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isPremium: user.isPremium,
        premiumUntil: user.premiumUntil
      }
    });
  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/users/subscription/reactivate
// @desc    Reactivate a cancelled subscription
// @access  Private
router.post('/subscription/reactivate', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if there's an active premium period
    const now = new Date();
    if (user.premiumUntil && user.premiumUntil > now) {
      user.isPremium = true;
      await user.save();

      res.json({
        success: true,
        message: 'Subscription reactivated successfully',
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          isPremium: user.isPremium,
          premiumUntil: user.premiumUntil
        }
      });
    } else {
      return res.status(400).json({ message: 'Your subscription has expired. Please purchase a new plan.' });
    }
  } catch (error) {
    console.error('Reactivate subscription error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/users/subscription/change-plan
// @desc    Change subscription plan (upgrades premium period)
// @access  Private
router.post('/subscription/change-plan', auth, async (req, res) => {
  try {
    const { planId } = req.body;

    if (!planId || !['monthly', 'annual'].includes(planId)) {
      return res.status(400).json({ message: 'Invalid plan type. Must be "monthly" or "annual"' });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Calculate new premium expiration date
    const now = new Date();
    let premiumUntil;

    if (planId === 'monthly') {
      premiumUntil = new Date(now.setMonth(now.getMonth() + 1));
    } else if (planId === 'annual') {
      premiumUntil = new Date(now.setFullYear(now.getFullYear() + 1));
    }

    user.isPremium = true;
    user.premiumUntil = premiumUntil;
    await user.save();

    res.json({
      success: true,
      message: `Subscription changed to ${planId} plan successfully`,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isPremium: user.isPremium,
        premiumUntil: user.premiumUntil
      }
    });
  } catch (error) {
    console.error('Change plan error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
