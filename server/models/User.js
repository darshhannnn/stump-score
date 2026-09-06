const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 60
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  isPremium: {
    type: Boolean,
    default: false
  },
  premiumUntil: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLoginAt: {
    type: Date,
    default: null
  },
  paymentHistory: [
    {
      planType: String,
      amount: Number,
      date: { type: Date, default: Date.now },
      paymentId: String
    }
  ],
  // Favorited team ids (see src/data/teams.js slugs)
  favorites: {
    type: [String],
    default: []
  },
  // User preferences (theme, notification toggles, favorite team shortcut)
  preferences: {
    theme: { type: String, enum: ['light', 'dark', 'system'], default: 'system' },
    favoriteTeamId: { type: String, default: null },
    notifyMatches: { type: Boolean, default: true },
    notifyPredictions: { type: Boolean, default: true },
    notifyWeeklyDigest: { type: Boolean, default: false }
  },
  // Password reset flow
  resetPasswordToken: { type: String, default: null },
  resetPasswordExpires: { type: Date, default: null },
  // For users who sign in with Google
  googleId: {
    type: String,
    sparse: true
  },
  profilePicture: {
    type: String,
    default: null
  }
}, {
  toJSON: {
    virtuals: false,
    transform: (doc, ret) => {
      delete ret.password;
      delete ret.resetPasswordToken;
      delete ret.resetPasswordExpires;
      delete ret.__v;
      return ret;
    }
  }
});

// Method to compare password for login
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Premium validity helper (single source of truth for expiry)
userSchema.methods.hasActivePremium = function() {
  if (!this.isPremium) return false;
  if (this.premiumUntil && new Date(this.premiumUntil) < new Date()) return false;
  return true;
};

// Middleware to hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }

  // Skip password hashing for Google users
  if (this.password === 'GOOGLE_AUTH_USER') {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

const User = mongoose.model('User', userSchema);

module.exports = User;
