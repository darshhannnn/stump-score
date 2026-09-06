const rateLimit = require('express-rate-limit');
const config = require('../config/env');

const json = (message) => ({
  handler: (req, res) => res.status(429).json({ message }),
  standardHeaders: true,
  legacyHeaders: false,
});

// Global API limiter
const globalLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.globalMax,
  ...json('Too many requests, please slow down.'),
});

// Credential endpoints (brute-force protection)
const authLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.authMax,
  skipSuccessfulRequests: true,
  ...json('Too many authentication attempts. Try again in 15 minutes.'),
});

// Password reset (email abuse protection)
const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: config.rateLimit.passwordResetMax,
  ...json('Too many password reset attempts. Try again in an hour.'),
});

// Community writing endpoints (spam protection)
const commentLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: config.rateLimit.commentMax,
  ...json('You are commenting too fast. Take a breath.'),
});

module.exports = { globalLimiter, authLimiter, passwordResetLimiter, commentLimiter };
