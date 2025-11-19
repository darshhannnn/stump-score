const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const paymentHistorySchema = new mongoose.Schema({
  orderId: { type: String, required: true },
  paymentId: { type: String, required: true },
  planType: { type: String, required: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  status: {
    type: String,
    enum: ['created', 'failed', 'completed', 'refunded'],
    default: 'created'
  },
  refundId: String,
  date: { type: Date, default: Date.now }
});

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6
  },
  isPremium: { 
    type: Boolean, 
    default: false 
  },
  premiumUntil: { 
    type: Date, 
    default: null 
  },
  currentPlan: {
    type: String,
    enum: ['monthly', 'annual', null],
    default: null
  },
  lastPaymentDate: {
    type: Date,
    default: null
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  paymentHistory: [paymentHistorySchema],
  // For users who sign in with Google
  googleId: { 
    type: String, 
    sparse: true 
  },
  profilePicture: { 
    type: String, 
    default: null 
  },
  // For notifications about subscription expiry
  notificationsSent: {
    type: Map,
    of: Boolean,
    default: () => new Map()
  }
}, { timestamps: true });

// Instance method to check if premium is active
userSchema.methods.isPremiumActive = function() {
  return this.isPremium && this.premiumUntil && new Date() < this.premiumUntil;
};

// Method to compare password for login
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Middleware to hash password before saving
userSchema.pre('save', async function(next) {
  // Only hash the password if it's been modified (or is new)
  if (!this.isModified('password')) {
    next();
  }

  // Skip password hashing for Google users
  if (this.password === 'GOOGLE_AUTH_USER') {
    next();
    return;
  }

  // Generate salt and hash password
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Middleware to update lastPaymentDate when payment history is updated
userSchema.pre('save', function(next) {
  if (this.isModified('paymentHistory')) {
    const lastPayment = this.paymentHistory[this.paymentHistory.length - 1];
    if (lastPayment && lastPayment.status === 'completed') {
      this.lastPaymentDate = lastPayment.date;
    }
  }
  next();
});

// Middleware to automatically check and update premium status
userSchema.pre('save', function(next) {
  if (this.premiumUntil && new Date() > this.premiumUntil) {
    this.isPremium = false;
    this.currentPlan = null;
    // Keep premiumUntil for reference
  }
  next();
});

// Static method to find users whose premium is about to expire
userSchema.statics.findExpiringSubscriptions = function(daysThreshold = 7) {
  const thresholdDate = new Date();
  thresholdDate.setDate(thresholdDate.getDate() + daysThreshold);

  return this.find({
    isPremium: true,
    premiumUntil: {
      $exists: true,
      $ne: null,
      $lte: thresholdDate,
      $gt: new Date()
    }
  });
};

// Static method to cleanup expired subscriptions
userSchema.statics.cleanupExpiredSubscriptions = async function() {
  const now = new Date();
  
  const result = await this.updateMany(
    {
      isPremium: true,
      premiumUntil: { $lt: now }
    },
    {
      $set: {
        isPremium: false,
        currentPlan: null
      }
    }
  );

  return result.modifiedCount;
};

// Static method to find users needing notifications for specific days before expiry
userSchema.statics.findUsersNeedingNotification = function(daysBeforeExpiry) {
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + daysBeforeExpiry);
  
  // Set time to start of day for date comparison
  targetDate.setHours(0, 0, 0, 0);
  
  return this.find({
    isPremium: true,
    premiumUntil: {
      $exists: true,
      $ne: null,
      // Match users whose premium expires on the target date
      $gte: targetDate,
      $lt: new Date(targetDate.getTime() + 24 * 60 * 60 * 1000)
    },
    // Check if notification hasn't been sent yet
    [`notificationsSent.expiry_${daysBeforeExpiry}d`]: { $ne: true }
  });
};

// Instance method to mark notification as sent
userSchema.methods.markNotificationSent = async function(daysBeforeExpiry) {
  this.notificationsSent.set(`expiry_${daysBeforeExpiry}d`, true);
  await this.save();
};

// Instance method to get notification status
userSchema.methods.hasReceivedNotification = function(daysBeforeExpiry) {
  return this.notificationsSent.get(`expiry_${daysBeforeExpiry}d`) === true;
};

module.exports = mongoose.model('User', userSchema);
