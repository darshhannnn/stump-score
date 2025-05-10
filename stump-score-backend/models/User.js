// models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');

// Custom validation functions
const validatePassword = (password) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (password.length < minLength) {
        return false;
    }
    if (!hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecialChar) {
        return false;
    }
    return true;
};

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Username is required'],
        unique: true,
        trim: true,
        minlength: [3, 'Username must be at least 3 characters long'],
        maxlength: [30, 'Username cannot exceed 30 characters'],
        match: [/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        validate: {
            validator: validator.isEmail,
            message: 'Please provide a valid email'
        }
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [8, 'Password must be at least 8 characters long'],
        select: false,
        validate: {
            validator: validatePassword,
            message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
        }
    },
    role: {
        type: String,
        enum: {
            values: ['user', 'admin'],
            message: 'Role must be either user or admin'
        },
        default: 'user'
    },
    preferences: {
        theme: {
            type: String,
            enum: {
                values: ['light', 'dark', 'system'],
                message: 'Theme must be either light, dark, or system'
            },
            default: 'light'
        },
        notifications: {
            type: Boolean,
            default: true
        },
        liveUpdates: {
            type: Boolean,
            default: true
        }
    },
    createdAt: {
        type: Date,
        default: Date.now,
        immutable: true
    },
    lastLogin: {
        type: Date
    },
    isActive: {
        type: Boolean,
        default: true
    },
    failedLoginAttempts: {
        type: Number,
        default: 0
    },
    lockUntil: {
        type: Date
    }
}, {
    timestamps: true,
    toJSON: {
        transform: function(doc, ret) {
            delete ret.password;
            delete ret.failedLoginAttempts;
            delete ret.lockUntil;
            return ret;
        }
    }
});

// Indexes for better query performance
// (Removed duplicate index for email)
// (Removed duplicate index for username)
userSchema.index({ createdAt: -1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
    try {
        if (!this.isModified('password')) return next();
        
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
    try {
        if (!this.password) {
            throw new Error('Password field is not selected');
        }
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
        throw error;
    }
};

// Method to handle failed login attempts
userSchema.methods.incrementLoginAttempts = async function() {
    if (this.lockUntil && this.lockUntil > Date.now()) {
        return false;
    }
    
    this.failedLoginAttempts += 1;
    
    if (this.failedLoginAttempts >= 5) {
        this.lockUntil = Date.now() + 15 * 60 * 1000; // Lock for 15 minutes
    }
    
    await this.save();
    return true;
};

// Method to reset login attempts
userSchema.methods.resetLoginAttempts = async function() {
    this.failedLoginAttempts = 0;
    this.lockUntil = undefined;
    await this.save();
};

// Static method to find user by credentials
userSchema.statics.findByCredentials = async function(email, password) {
    const user = await this.findOne({ email }).select('+password');
    if (!user) {
        throw new Error('Invalid credentials');
    }

    if (user.lockUntil && user.lockUntil > Date.now()) {
        throw new Error('Account is temporarily locked. Please try again later.');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
        await user.incrementLoginAttempts();
        throw new Error('Invalid credentials');
    }

    await user.resetLoginAttempts();
    return user;
};

// Error handling middleware
userSchema.post('save', function(error, doc, next) {
    if (error.name === 'MongoError' && error.code === 11000) {
        next(new Error('Email or username already exists'));
    } else {
        next(error);
    }
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

module.exports = User;
