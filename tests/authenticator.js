/**
 * StumpScore Authentication Flow Tester
 * 
 * This script tests the authentication flow by simulating user interactions
 * with the authentication endpoints and verifying correct token handling.
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Configuration
const API_URL = 'http://localhost:5000/api';
const LOG_FILE = path.join(__dirname, 'auth_test_results.log');
const TOKENS_FILE = path.join(__dirname, 'auth_tokens.json');

// Test user data
const testUser = {
  name: `Test User ${Math.floor(Math.random() * 10000)}`,
  email: `test${Date.now()}@example.com`,
  password: 'Test@123',
};

// Google test user data (for simulated Google auth)
const googleUser = {
  name: `Google User ${Math.floor(Math.random() * 10000)}`,
  email: `google.test${Date.now()}@gmail.com`,
  googleId: `google-id-${Date.now()}`,
};

// Create an authenticated axios instance
const createAuthClient = (token) => {
  return axios.create({
    baseURL: API_URL,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });
};

// Logging utilities
const logger = {
  log: (message) => {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}\n`;
    console.log(message);
    fs.appendFileSync(LOG_FILE, logMessage);
  },
  
  success: (test, message) => {
    logger.log(`✅ ${test}: ${message}`);
  },
  
  error: (test, message) => {
    logger.log(`❌ ${test}: ${message}`);
  },
  
  info: (message) => {
    logger.log(`ℹ️ ${message}`);
  },
  
  separator: () => {
    logger.log('--------------------------------------');
  }
};

// Test functions
const tests = {
  async register() {
    try {
      logger.info(`Registering test user: ${testUser.email}`);
      const response = await axios.post(`${API_URL}/users/register`, testUser);
      
      if (response.data && response.data.token) {
        logger.success('Registration', `User registered successfully with ID: ${response.data._id}`);
        // Save the token for subsequent tests
        fs.writeFileSync(TOKENS_FILE, JSON.stringify({
          token: response.data.token,
          userId: response.data._id,
          email: response.data.email
        }, null, 2));
        return true;
      } else {
        logger.error('Registration', 'No token received');
        return false;
      }
    } catch (error) {
      logger.error('Registration', `Error: ${error.response?.data?.message || error.message}`);
      return false;
    }
  },
  
  async login() {
    try {
      logger.info(`Logging in test user: ${testUser.email}`);
      const response = await axios.post(`${API_URL}/users/login`, {
        email: testUser.email,
        password: testUser.password
      });
      
      if (response.data && response.data.token) {
        logger.success('Login', 'User logged in successfully');
        // Update the token for subsequent tests
        const tokenData = JSON.parse(fs.readFileSync(TOKENS_FILE));
        tokenData.token = response.data.token;
        fs.writeFileSync(TOKENS_FILE, JSON.stringify(tokenData, null, 2));
        return true;
      } else {
        logger.error('Login', 'No token received');
        return false;
      }
    } catch (error) {
      logger.error('Login', `Error: ${error.response?.data?.message || error.message}`);
      return false;
    }
  },
  
  async verifyToken() {
    try {
      if (!fs.existsSync(TOKENS_FILE)) {
        logger.error('Token Verification', 'No token file found');
        return false;
      }
      
      const { token } = JSON.parse(fs.readFileSync(TOKENS_FILE));
      logger.info('Verifying token by accessing protected endpoint');
      
      const authClient = createAuthClient(token);
      const response = await authClient.get('/users/profile');
      
      if (response.status === 200) {
        logger.success('Token Verification', 'Token is valid');
        return true;
      } else {
        logger.error('Token Verification', `Unexpected response: ${response.status}`);
        return false;
      }
    } catch (error) {
      logger.error('Token Verification', `Error: ${error.response?.data?.message || error.message}`);
      return false;
    }
  },
  
  async testInvalidToken() {
    try {
      logger.info('Testing invalid token rejection');
      
      const authClient = createAuthClient('invalid-token-test');
      await authClient.get('/users/profile');
      
      // If we reach here, the test failed because the invalid token was accepted
      logger.error('Invalid Token', 'Server accepted invalid token');
      return false;
    } catch (error) {
      if (error.response && error.response.status === 401) {
        logger.success('Invalid Token', 'Server correctly rejected invalid token');
        return true;
      } else {
        logger.error('Invalid Token', `Unexpected error: ${error.message}`);
        return false;
      }
    }
  },
  
  async googleAuth() {
    try {
      logger.info(`Testing Google authentication with simulated user: ${googleUser.email}`);
      
      // Create a mock Firebase user similar to what would be returned by Firebase auth
      const mockFirebaseUser = {
        uid: googleUser.googleId,
        displayName: googleUser.name,
        email: googleUser.email,
        photoURL: 'https://example.com/photo.jpg',
        emailVerified: true,
        providerData: [{
          providerId: 'google.com',
          uid: googleUser.googleId,
          displayName: googleUser.name,
          email: googleUser.email
        }]
      };
      
      const response = await axios.post(`${API_URL}/users/google`, {
        user: mockFirebaseUser,
        credential: { accessToken: `mock-token-${Date.now()}` }
      });
      
      if (response.data && response.data.token) {
        logger.success('Google Auth', `User authenticated successfully with ID: ${response.data._id}`);
        
        // Save the Google token
        fs.writeFileSync(path.join(__dirname, 'google_auth_token.json'), JSON.stringify({
          token: response.data.token,
          userId: response.data._id,
          email: response.data.email
        }, null, 2));
        
        // Verify the Google token works
        const googleAuthClient = createAuthClient(response.data.token);
        const profileResponse = await googleAuthClient.get('/users/profile');
        
        if (profileResponse.status === 200) {
          logger.success('Google Auth', 'Google token is valid for accessing protected endpoints');
          return true;
        } else {
          logger.error('Google Auth', 'Google token validation failed');
          return false;
        }
      } else {
        logger.error('Google Auth', 'No token received');
        return false;
      }
    } catch (error) {
      logger.error('Google Auth', `Error: ${error.response?.data?.message || error.message}`);
      return false;
    }
  }
};

// Main test runner
async function runTests() {
  // Initialize log file
  fs.writeFileSync(LOG_FILE, `StumpScore Authentication Tests - ${new Date().toISOString()}\n\n`);
  
  logger.info('Starting StumpScore Authentication Flow Tests');
  logger.separator();
  
  let success = true;
  
  // Registration test
  const regSuccess = await tests.register();
  success = success && regSuccess;
  logger.separator();
  
  // Login test
  const loginSuccess = await tests.login();
  success = success && loginSuccess;
  logger.separator();
  
  // Token verification test
  const tokenSuccess = await tests.verifyToken();
  success = success && tokenSuccess;
  logger.separator();
  
  // Invalid token test
  const invalidTokenSuccess = await tests.testInvalidToken();
  success = success && invalidTokenSuccess;
  logger.separator();
  
  // Google authentication test
  const googleSuccess = await tests.googleAuth();
  success = success && googleSuccess;
  logger.separator();
  
  // Final results
  if (success) {
    logger.info('🎉 All authentication tests passed!');
    logger.info(`Detailed logs saved to: ${LOG_FILE}`);
  } else {
    logger.info('⚠️ Some authentication tests failed. Check the logs for details.');
    logger.info(`Detailed logs saved to: ${LOG_FILE}`);
  }
  
  return success;
}

// Run the tests
runTests()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    logger.error('Test Runner', `Unhandled error: ${error.message}`);
    process.exit(1);
  });
