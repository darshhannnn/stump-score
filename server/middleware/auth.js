const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Enhanced error responses
const AuthError = {
  NO_TOKEN: 'No authentication token provided',
  INVALID_TOKEN: 'Invalid or expired authentication token',
  USER_NOT_FOUND: 'User account not found',
  TOKEN_EXPIRED: 'Authentication token has expired',
  NOT_PREMIUM: 'Premium subscription required for this feature',
  PREMIUM_EXPIRED: 'Your premium subscription has expired'
};

// Helper to validate token expiration
const isTokenExpired = (decoded) => {
  if (!decoded.exp) return false;
  const now = Math.floor(Date.now() / 1000);
  return decoded.exp < now;
};

// Middleware to verify JWT token
const auth = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        message: AuthError.NO_TOKEN,
        code: 'AUTH_NO_TOKEN'
      });
    }
    
    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Check token expiration
      if (isTokenExpired(decoded)) {
        return res.status(401).json({
          message: AuthError.TOKEN_EXPIRED,
          code: 'AUTH_TOKEN_EXPIRED'
        });
      }
      
      // Find user by id
      const user = await User.findById(decoded.id)
        .select('-password')
        .lean()
        .cache(60); // Cache for 60 seconds if you're using mongoose-cache
      
      if (!user) {
        return res.status(401).json({
          message: AuthError.USER_NOT_FOUND,
          code: 'AUTH_USER_NOT_FOUND'
        });
      }
      
      // Add user and token info to request object
      req.user = user;
      req.token = token;
      req.tokenExp = decoded.exp;
      
      next();
    } catch (jwtError) {
      console.error('JWT verification error:', jwtError);
      return res.status(401).json({
        message: AuthError.INVALID_TOKEN,
        code: 'AUTH_INVALID_TOKEN'
      });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ 
      message: 'Internal server error during authentication',
      code: 'AUTH_INTERNAL_ERROR'
    });
  }
};

// Middleware to check if user has premium subscription
const requirePremium = async (req, res, next) => {
  try {
    if (!req.user.isPremium) {
      return res.status(403).json({ 
        message: AuthError.NOT_PREMIUM,
        code: 'PREMIUM_REQUIRED'
      });
    }
    
    // Check if premium subscription has expired
    if (req.user.premiumUntil && new Date(req.user.premiumUntil) < new Date()) {
      // Update user premium status to false
      await User.findByIdAndUpdate(req.user._id, {
        isPremium: false,
        currentPlan: null
      });
      
      return res.status(403).json({ 
        message: AuthError.PREMIUM_EXPIRED,
        code: 'PREMIUM_EXPIRED',
        expired: true
      });
    }
    
    // Add premium info to request
    req.premiumExpiry = req.user.premiumUntil;
    req.premiumPlan = req.user.currentPlan;
    
    next();
  } catch (error) {
    console.error('Premium check error:', error);
    res.status(500).json({ 
      message: 'Internal server error during premium validation',
      code: 'PREMIUM_CHECK_ERROR'
    });
  }
};

module.exports = { auth, requirePremium };
