const express = require('express');
const router = express.Router();
const { getLiveMatches, getMatchDetails, getLatestNews } = require('../controllers/external');
const { protect } = require('../middleware/auth');
const rateLimit = require('express-rate-limit');
const { validateMatchId } = require('../middleware/validation');

// Rate limiting configuration
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: {
        success: false,
        error: 'Too many requests, please try again later.'
    }
});

// Apply rate limiting to all routes
router.use(apiLimiter);

// Cricket match routes
router.get('/matches/live', getLiveMatches);
router.get('/matches/:id', validateMatchId, getMatchDetails);

// News routes
router.get('/news/latest', getLatestNews);


module.exports = router;
