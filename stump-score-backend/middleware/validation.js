const validator = require('validator');

// Registration validation middleware
exports.validateRegistration = (req, res, next) => {
    const { username, email, password } = req.body;

    // Check required fields
    if (!username || !email || !password) {
        return res.status(400).json({
            success: false,
            error: 'Please provide all required fields'
        });
    }

    // Validate username
    if (username.length < 3 || username.length > 30) {
        return res.status(400).json({
            success: false,
            error: 'Username must be between 3 and 30 characters'
        });
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
        return res.status(400).json({
            success: false,
            error: 'Username can only contain letters, numbers, underscores, and hyphens'
        });
    }

    // Validate email
    if (!validator.isEmail(email)) {
        return res.status(400).json({
            success: false,
            error: 'Please provide a valid email'
        });
    }

    // Validate password
    const passwordError = validatePassword(password);
    if (passwordError) {
        return res.status(400).json({
            success: false,
            error: passwordError
        });
    }

    next();
};

// Login validation middleware
exports.validateLogin = (req, res, next) => {
    const { email, password } = req.body;

    // Check required fields
    if (!email || !password) {
        return res.status(400).json({
            success: false,
            error: 'Please provide email and password'
        });
    }

    // Validate email
    if (!validator.isEmail(email)) {
        return res.status(400).json({
            success: false,
            error: 'Please provide a valid email'
        });
    }

    next();
};

// Preferences validation middleware
exports.validatePreferences = (req, res, next) => {
    const { theme, notifications, liveUpdates } = req.body;

    // Validate theme
    if (theme && !['light', 'dark', 'system'].includes(theme)) {
        return res.status(400).json({
            success: false,
            error: 'Invalid theme value'
        });
    }

    // Validate boolean fields
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

    next();
};

// Match ID validation middleware
exports.validateMatchId = (req, res, next) => {
    const matchId = req.params.id;

    if (!matchId || !/^[a-zA-Z0-9-_]+$/.test(matchId)) {
        return res.status(400).json({
            success: false,
            error: 'Invalid match ID'
        });
    }

    next();
};

// Password validation helper function
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