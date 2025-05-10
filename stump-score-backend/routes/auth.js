const express = require('express');
const router = express.Router();
const { register, login, getMe, updatePreferences } = require('../controllers/auth');
const { protect, authorize } = require('../middleware/auth');
const { validateRegistration, validateLogin, validatePreferences } = require('../middleware/validation');
const User = require('../models/User');

// Public routes
router.post('/register', validateRegistration, register);
router.post('/login', validateLogin, login);

// Protected routes
router.get('/me', protect, getMe);
router.put('/preferences', protect, validatePreferences, updatePreferences);

// Admin routes
router.get('/admin/users', protect, authorize('admin'), async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json({
            success: true,
            users
        });
    } catch (error) {
        console.error('Admin get users error:', error.message);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch users. Please try again later.'
        });
    }
});

module.exports = router;