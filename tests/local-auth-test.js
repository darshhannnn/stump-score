/**
 * StumpScore Local Authentication Test
 * Uses mongodb-memory-server to test MongoDB integration locally
 */

const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// Test configuration
const PORT = 5555;
const JWT_SECRET = 'test-jwt-secret-key';
const LOG_FILE = path.join(__dirname, 'local_auth_test.log');

// Initialize log file
fs.writeFileSync(LOG_FILE, `StumpScore Local Authentication Test - ${new Date().toISOString()}\n\n`);

// Test user data
const testUser = {
  name: 'Test User',
  email: `test${Date.now()}@example.com`,
  password: 'Password123!'
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

// Logging utilities
function log(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  console.log(message);
  fs.appendFileSync(LOG_FILE, logMessage);
  
  // Force stdout flush
  if (typeof process.stdout.clearLine === 'function') {
    process.stdout.clearLine();
    process.stdout.cursorTo(0);
    process.stdout.write(message + '\n');
  }
}

function logSuccess(test, message = '') {
  log(`${colors.green}✓ ${test}${colors.reset}${message ? ': ' + message : ''}`);
}

function logError(test, message = '') {
  log(`${colors.red}✗ ${test}${colors.reset}${message ? ': ' + message : ''}`);
}

function logInfo(message) {
  log(`${colors.blue}ℹ ${message}${colors.reset}`);
}

function logSeparator() {
  log('----------------------------------------');
}

// Create a minimal User model for testing
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isPremium: { type: Boolean, default: false },
  googleId: { type: String },
  createdAt: { type: Date, default: Date.now }
});

// Add password hashing middleware
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Add password comparison method
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Setup Express server
async function setupServer() {
  // Start MongoDB memory server
  const mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  logInfo(`Starting MongoDB Memory Server at ${mongoUri}`);
  
  // Connect to the in-memory database
  await mongoose.connect(mongoUri);
  logSuccess('MongoDB Connection', 'Connected to in-memory MongoDB');
  
  // Create User model
  const User = mongoose.model('User', userSchema);
  
  // Create Express app
  const app = express();
  app.use(cors());
  app.use(express.json());
  
  // Setup routes
  
  // Test route
  app.get('/api/users/test', (req, res) => {
    res.json({ message: 'Auth API is working' });
  });
  
  // Register route
  app.post('/api/users/register', async (req, res) => {
    try {
      const { name, email, password } = req.body;
      
      // Check if user exists
      const userExists = await User.findOne({ email });
      if (userExists) {
        return res.status(400).json({ message: 'User already exists' });
      }
      
      // Create user
      const user = await User.create({
        name,
        email,
        password
      });
      
      // Generate token
      const token = jwt.sign({ id: user._id }, JWT_SECRET, {
        expiresIn: '30d'
      });
      
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isPremium: user.isPremium,
        token
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ message: 'Server error during registration' });
    }
  });
  
  // Login route
  app.post('/api/users/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      
      // Find user
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      
      // Check password
      const isMatch = await user.matchPassword(password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      
      // Generate token
      const token = jwt.sign({ id: user._id }, JWT_SECRET, {
        expiresIn: '30d'
      });
      
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isPremium: user.isPremium,
        token
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Server error during login' });
    }
  });
  
  // Google auth route
  app.post('/api/users/google', async (req, res) => {
    try {
      const { user: googleUser } = req.body;
      
      if (!googleUser || !googleUser.email) {
        return res.status(400).json({ message: 'Invalid Google user data' });
      }
      
      // Check if user exists
      let user = await User.findOne({ email: googleUser.email });
      
      if (!user) {
        // Create user if doesn't exist
        user = await User.create({
          name: googleUser.displayName || 'Google User',
          email: googleUser.email,
          password: bcrypt.hashSync(Math.random().toString(36).slice(-8), 10),
          googleId: googleUser.uid
        });
      } else {
        // Update googleId if not already set
        if (!user.googleId) {
          user.googleId = googleUser.uid;
          await user.save();
        }
      }
      
      // Generate token
      const token = jwt.sign({ id: user._id }, JWT_SECRET, {
        expiresIn: '30d'
      });
      
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isPremium: user.isPremium,
        token
      });
    } catch (error) {
      console.error('Google auth error:', error);
      res.status(500).json({ message: 'Server error during Google authentication' });
    }
  });
  
  // Auth middleware
  const protect = async (req, res, next) => {
    try {
      let token;
      
      if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
      }
      
      if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token' });
      }
      
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = await User.findById(decoded.id).select('-password');
        
        if (!req.user) {
          return res.status(401).json({ message: 'User not found' });
        }
        
        next();
      } catch (error) {
        console.error('Token verification error:', error);
        res.status(401).json({ message: 'Not authorized, token failed' });
      }
    } catch (error) {
      console.error('Auth middleware error:', error);
      res.status(500).json({ message: 'Server error in auth middleware' });
    }
  };
  
  // Protected profile route
  app.get('/api/users/profile', protect, async (req, res) => {
    res.json(req.user);
  });
  
  // Start server
  const server = app.listen(PORT, () => {
    logSuccess('Express Server', `Server running on port ${PORT}`);
  });
  
  return {
    app,
    server,
    User,
    mongoServer
  };
}

// Run tests
async function runTests() {
  logInfo('Starting StumpScore Authentication Tests with Local MongoDB');
  logSeparator();
  
  let server, mongoServer;
  let authToken;
  
  try {
    // Setup test server
    const setup = await setupServer();
    server = setup.server;
    mongoServer = setup.mongoServer;
    
    // Give the server time to start
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Base URL for API requests
    const API_URL = `http://localhost:${PORT}/api`;
    
    // Test 1: Server Connection
    try {
      const response = await axios.get(`${API_URL}/users/test`);
      logSuccess('Server Connection', 'API is responsive');
    } catch (error) {
      logError('Server Connection', error.message);
      throw new Error('Server connection failed');
    }
    
    // Test 2: User Registration
    try {
      const response = await axios.post(`${API_URL}/users/register`, testUser);
      
      if (response.status === 201 && response.data.token) {
        logSuccess('User Registration', `User created with ID: ${response.data._id}`);
        authToken = response.data.token;
      } else {
        logError('User Registration', 'No token received or incorrect status code');
        throw new Error('Registration failed');
      }
    } catch (error) {
      logError('User Registration', error.response?.data?.message || error.message);
      throw new Error('Registration failed');
    }
    
    // Test 3: User Login
    try {
      const response = await axios.post(`${API_URL}/users/login`, {
        email: testUser.email,
        password: testUser.password
      });
      
      if (response.status === 200 && response.data.token) {
        logSuccess('User Login', 'Login successful');
        authToken = response.data.token; // Update token
      } else {
        logError('User Login', 'No token received or incorrect status code');
        throw new Error('Login failed');
      }
    } catch (error) {
      logError('User Login', error.response?.data?.message || error.message);
      throw new Error('Login failed');
    }
    
    // Test 4: Token Validation
    try {
      const response = await axios.get(`${API_URL}/users/profile`, {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      });
      
      if (response.status === 200 && response.data.email === testUser.email) {
        logSuccess('Token Validation', 'Token is valid and user profile was retrieved');
      } else {
        logError('Token Validation', 'Profile data incorrect or missing');
        throw new Error('Token validation failed');
      }
    } catch (error) {
      logError('Token Validation', error.response?.data?.message || error.message);
      throw new Error('Token validation failed');
    }
    
    // Test 5: Invalid Token
    try {
      await axios.get(`${API_URL}/users/profile`, {
        headers: {
          Authorization: 'Bearer invalid-token'
        }
      });
      
      logError('Invalid Token Rejection', 'Server accepted invalid token');
      throw new Error('Invalid token test failed');
    } catch (error) {
      if (error.response && error.response.status === 401) {
        logSuccess('Invalid Token Rejection', 'Server correctly rejected invalid token');
      } else {
        logError('Invalid Token Rejection', error.message);
        throw new Error('Invalid token test failed with unexpected error');
      }
    }
    
    // Test 6: Google Authentication
    try {
      const mockGoogleUser = {
        uid: `google-${Date.now()}`,
        displayName: 'Google Test User',
        email: `google.test.${Date.now()}@gmail.com`,
        photoURL: 'https://example.com/photo.jpg',
        emailVerified: true,
        providerData: [{
          providerId: 'google.com',
          uid: `google-${Date.now()}`,
          displayName: 'Google Test User',
          email: `google.test.${Date.now()}@gmail.com`,
          photoURL: 'https://example.com/photo.jpg'
        }]
      };
      
      const response = await axios.post(`${API_URL}/users/google`, {
        user: mockGoogleUser,
        credential: { accessToken: 'mock-token' }
      });
      
      if (response.status === 200 && response.data.token) {
        const googleAuthToken = response.data.token;
        
        // Verify Google token works for protected routes
        const profileResponse = await axios.get(`${API_URL}/users/profile`, {
          headers: {
            Authorization: `Bearer ${googleAuthToken}`
          }
        });
        
        if (profileResponse.status === 200) {
          logSuccess('Google Authentication', 'Google user created and authenticated successfully');
        } else {
          logError('Google Authentication', 'Google token validation failed');
          throw new Error('Google authentication failed');
        }
      } else {
        logError('Google Authentication', 'No token received');
        throw new Error('Google authentication failed');
      }
    } catch (error) {
      logError('Google Authentication', error.response?.data?.message || error.message);
      throw new Error('Google authentication failed');
    }
    
    logSeparator();
    logSuccess('All Tests', 'All authentication tests passed successfully!');
    
  } catch (error) {
    logSeparator();
    logError('Test Suite', `Tests failed: ${error.message}`);
  } finally {
    // Cleanup
    if (server) server.close();
    if (mongoServer) await mongoServer.stop();
    await mongoose.disconnect();
    
    logInfo(`Test results saved to: ${LOG_FILE}`);
  }
}

// Run the tests
runTests();
