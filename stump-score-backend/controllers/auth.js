const User = require('../models/User');
const jwt = require('jsonwebtoken');
const validator = require('validator');
const bcrypt = require('bcryptjs');

// Generate JWT Token
const generateToken = (id) => {
    if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET is not configured');
    }
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });
};

// Transform user object to response format
const transformUser = (user) => ({
    id: user._id,
    username: user.username,
    email: user.email,
    role: user.role || 'user',
    preferences: user.preferences || {
        theme: 'light',
        notifications: true,
        liveUpdates: true
    }
});

// Validate password strength
const validatePassword = (password) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (password.length < minLength) {
        return 'Password must be at least 8 characters long';
    }
    if (!hasUpperCase) {
        return 'Password must contain at least one uppercase letter';
    }
    if (!hasLowerCase) {
        return 'Password must contain at least one lowercase letter';
    }
    if (!hasNumbers) {
        return 'Password must contain at least one number';
    }
    if (!hasSpecialChar) {
        return 'Password must contain at least one special character';
    }
    return null;
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Input validation
        if (!username || !email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Please provide all required fields.'
            });
        }

        // Validate username
        if (username.length < 3 || username.length > 30) {
            return res.status(400).json({
                success: false,
                error: 'Username must be between 3 and 30 characters.'
            });
        }

        if (!validator.isEmail(email)) {
            return res.status(400).json({
                success: false,
                error: 'Please provide a valid email address.'
            });
        }

        // Validate password strength
        const passwordError = validatePassword(password);
        if (passwordError) {
            return res.status(400).json({
                success: false,
                error: passwordError
            });
        }

        // Check if user exists
        const userExists = await User.findOne({ $or: [{ email }, { username }] });
        if (userExists) {
            return res.status(400).json({
                success: false,
                error: userExists.email === email ? 
                    'This email is already registered.' : 
                    'This username is already taken.'
            });
        }

        // Hash password and create user
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({
            username,
            email,
            password: hashedPassword
        });

        res.status(201).json({
            success: true,
            user: transformUser(user),
            token: generateToken(user._id)
        });
    } catch (error) {
        console.error('Register error:', error.message);
        res.status(500).json({
            success: false,
            error: 'Registration failed. Please try again later.'
        });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Input validation
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Please provide email and password'
            });
        }

        if (!validator.isEmail(email)) {
            return res.status(400).json({
                success: false,
                error: 'Please provide a valid email'
            });
        }

        // Use the new findByCredentials method
        const user = await User.findByCredentials(email, password);

        // Update last login
        user.lastLogin = Date.now();
        await user.save();

        // Generate token
        const token = generateToken(user._id);

        res.json({
            success: true,
            token,
            user: transformUser(user)
        });
    } catch (error) {
        console.error('Login error:', error.message);
        res.status(401).json({
            success: false,
            error: 'Login failed. Please check your credentials and try again.'
        });
    }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        res.json({
            success: true,
            user: transformUser(user)
        });
    } catch (error) {
        console.error('Get user error:', error.message);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch user data. Please try again later.'
        });
    }
};

// @desc    Update user preferences
// @route   PUT /api/auth/preferences
// @access  Private
exports.updatePreferences = async (req, res) => {
    try {
        const { theme, notifications, liveUpdates } = req.body;

        // Input validation
        if (theme && !['light', 'dark'].includes(theme)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid theme value'
            });
        }

        if (notifications !== undefined && typeof notifications !== 'boolean') {
            return res.status(400).json({
                success: false,
                error: 'Notifications must be a boolean value'
            });
        }

        if (liveUpdates !== undefined && typeof liveUpdates !== 'boolean') {
            return res.status(400).json({
                success: false,
                error: 'Live updates must be a boolean value'
            });
        }

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        // Update preferences
        user.preferences = {
            ...user.preferences,
            theme: theme || user.preferences.theme,
            notifications: notifications !== undefined ? notifications : user.preferences.notifications,
            liveUpdates: liveUpdates !== undefined ? liveUpdates : user.preferences.liveUpdates
        };

        await user.save();

        res.json({
            success: true,
            preferences: user.preferences
        });
    } catch (error) {
        console.error('Update preferences error:', error.message);
        res.status(500).json({
            success: false,
            error: 'Failed to update preferences. Please try again later.'
        });
    }
}; 