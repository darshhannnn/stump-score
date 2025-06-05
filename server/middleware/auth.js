const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to verify JWT token
const auth = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No authentication token, access denied' });
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user by id
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({ message: 'Token is valid, but user no longer exists' });
    }
    
    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error.message);
    res.status(401).json({ message: 'Token verification failed' });
  }
};

// Middleware to check if user has premium subscription
const requirePremium = async (req, res, next) => {
  if (!req.user.isPremium) {
    return res.status(403).json({ message: 'Premium subscription required for this feature' });
  }
  
  // Check if premium subscription has expired
  if (req.user.premiumUntil && new Date(req.user.premiumUntil) < new Date()) {
    // Update user premium status to false
    req.user.isPremium = false;
    await req.user.save();
    
    return res.status(403).json({ 
      message: 'Your premium subscription has expired',
      expired: true
    });
  }
  
  next();
};

module.exports = { auth, requirePremium };
