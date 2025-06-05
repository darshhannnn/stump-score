const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true 
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
  paymentHistory: [
    {
      planType: String,
      amount: Number,
      date: { type: Date, default: Date.now },
      paymentId: String
    }
  ],
  // For users who sign in with Google
  googleId: { 
    type: String, 
    sparse: true 
  },
  profilePicture: { 
    type: String, 
    default: null 
  }
});

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

const User = mongoose.model('User', userSchema);

module.exports = User;
