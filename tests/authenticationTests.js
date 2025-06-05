/**
 * Authentication Flow Testing Script for StumpScore
 * This script tests the complete authentication flow with MongoDB Atlas
 * 
 * Run with: node tests/authenticationTests.js
 */

const axios = require('axios');
const assert = require('assert').strict;
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');

// Load environment variables
dotenv.config();

// API base URL
const API_BASE_URL = 'http://localhost:5000/api';

// Test user credentials
const TEST_USER = {
  name: 'Test User',
  email: `test${Date.now()}@example.com`, // Ensure unique email
  password: 'Password123!'
};

// Test Google user (simulated)
const TEST_GOOGLE_USER = {
  name: 'Google Test User',
  email: `google.test.${Date.now()}@gmail.com`,
  googleId: `google-test-id-${Date.now()}`
};

// Store tokens and user data
let authToken;
let userId;
let googleAuthToken;
let googleUserId;

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

/**
 * Logs a test result with appropriate color
 */
function logTest(name, passed, message = '') {
  const status = passed ? `${colors.green}PASSED` : `${colors.red}FAILED`;
  console.log(`${status}${colors.reset} - ${name} ${message ? `- ${message}` : ''}`);
  
  if (!passed) process.exitCode = 1;
}

/**
 * Runs all tests sequentially
 */
async function runTests() {
  console.log(`\n${colors.blue}=== STUMPSCORE AUTHENTICATION TESTS ===${colors.reset}`);
  console.log(`${colors.yellow}Testing with ${API_BASE_URL}${colors.reset}`);
  console.log(`${colors.yellow}Test user: ${TEST_USER.email}${colors.reset}\n`);
  
  try {
    await testConnection();
    await testRegistration();
    await testLogin();
    await testTokenValidation();
    await testProfileAccess();
    await testInvalidToken();
    await testTokenExpiration();
    await testGoogleAuthentication();
    await testUserCleanup();
    
    console.log(`\n${colors.green}All tests completed successfully!${colors.reset}`);
  } catch (error) {
    console.error(`\n${colors.red}Tests failed with error: ${error.message}${colors.reset}`);
    process.exitCode = 1;
  }
}

/**
 * Test server connection
 */
async function testConnection() {
  try {
    // Try to hit the server - if routes aren't set up for a test endpoint,
    // we'll create a different check
    try {
      await axios.get(`${API_BASE_URL}/users/test`);
      logTest('Server connection', true);
    } catch (error) {
      if (error.response && error.response.status) {
        // If we get any response from the server, it's running
        logTest('Server connection', true, 'Server is running but /test endpoint not available');
      } else {
        throw error; // Re-throw if it's a connection error
      }
    }
  } catch (error) {
    logTest('Server connection', false, 
      'Could not connect to server. Is it running? Error: ' + error.message);
    throw new Error('Server connection failed');
  }
}

/**
 * Test user registration
 */
async function testRegistration() {
  try {
    const response = await axios.post(`${API_BASE_URL}/users/register`, TEST_USER);
    
    assert.ok([200, 201].includes(response.status), 'Status code should be 200 or 201');
    assert.ok(response.data._id, 'Response should include a user ID');
    assert.strictEqual(response.data.name, TEST_USER.name, 'Name should match');
    assert.strictEqual(response.data.email, TEST_USER.email, 'Email should match');
    assert.ok(response.data.token, 'Response should include a JWT token');
    
    userId = response.data._id;
    authToken = response.data.token;
    
    // Verify the token structure
    const decodedToken = jwt.decode(authToken);
    assert.ok(decodedToken.id, 'Token should contain user ID');
    
    logTest('User registration', true);
  } catch (error) {
    logTest('User registration', false, 
      error.response?.data?.message || error.message);
    throw new Error('Registration test failed');
  }
}

/**
 * Test user login
 */
async function testLogin() {
  try {
    const response = await axios.post(`${API_BASE_URL}/users/login`, {
      email: TEST_USER.email,
      password: TEST_USER.password
    });
    
    assert.strictEqual(response.status, 200, 'Status code should be 200 OK');
    assert.ok(response.data._id, 'Response should include a user ID');
    assert.strictEqual(response.data.email, TEST_USER.email, 'Email should match');
    assert.ok(response.data.token, 'Response should include a JWT token');
    
    // Replace token with fresh one
    authToken = response.data.token;
    
    logTest('User login', true);
  } catch (error) {
    logTest('User login', false, 
      error.response?.data?.message || error.message);
    throw new Error('Login test failed');
  }
}

/**
 * Test token validation
 */
async function testTokenValidation() {
  try {
    const response = await axios.get(`${API_BASE_URL}/users/profile`, {
      headers: {
        Authorization: `Bearer ${authToken}`
      }
    });
    
    assert.strictEqual(response.status, 200, 'Status code should be 200 OK');
    assert.strictEqual(response.data.email, TEST_USER.email, 'Email should match');
    
    logTest('Token validation', true);
  } catch (error) {
    logTest('Token validation', false, 
      error.response?.data?.message || error.message);
    throw new Error('Token validation test failed');
  }
}

/**
 * Test access to protected profile endpoint
 */
async function testProfileAccess() {
  try {
    const response = await axios.get(`${API_BASE_URL}/users/profile`, {
      headers: {
        Authorization: `Bearer ${authToken}`
      }
    });
    
    assert.strictEqual(response.status, 200, 'Status code should be 200 OK');
    assert.strictEqual(response.data.email, TEST_USER.email, 'Email should match');
    assert.strictEqual(response.data.name, TEST_USER.name, 'Name should match');
    
    logTest('Profile access', true);
  } catch (error) {
    logTest('Profile access', false, 
      error.response?.data?.message || error.message);
    throw new Error('Profile access test failed');
  }
}

/**
 * Test access with invalid token
 */
async function testInvalidToken() {
  try {
    await axios.get(`${API_BASE_URL}/users/profile`, {
      headers: {
        Authorization: `Bearer invalidtoken123`
      }
    });
    
    // If we get here, the test failed
    logTest('Invalid token rejection', false, 'Server accepted invalid token');
    throw new Error('Invalid token test failed');
  } catch (error) {
    if (error.response && error.response.status === 401) {
      logTest('Invalid token rejection', true);
    } else {
      logTest('Invalid token rejection', false, 
        'Unexpected error: ' + (error.response?.data?.message || error.message));
      throw new Error('Invalid token test failed with unexpected error');
    }
  }
}

/**
 * Test token expiration (simulated)
 * Note: This is a simplified test since we can't wait for real expiration
 */
async function testTokenExpiration() {
  try {
    // Create an expired token (with exp in the past)
    const payload = { id: userId, exp: Math.floor(Date.now() / 1000) - 3600 };
    const expiredToken = jwt.sign(payload, process.env.JWT_SECRET);
    
    await axios.get(`${API_BASE_URL}/users/profile`, {
      headers: {
        Authorization: `Bearer ${expiredToken}`
      }
    });
    
    // If we get here, the test failed
    logTest('Token expiration', false, 'Server accepted expired token');
    throw new Error('Token expiration test failed');
  } catch (error) {
    if (error.response && error.response.status === 401) {
      logTest('Token expiration', true);
    } else {
      logTest('Token expiration', false, 
        'Unexpected error: ' + (error.response?.data?.message || error.message));
      throw new Error('Token expiration test failed with unexpected error');
    }
  }
}

/**
 * Test Google authentication
 */
async function testGoogleAuthentication() {
  try {
    // Since we can't do a real Google OAuth flow in this script,
    // we'll test the Google auth endpoint directly with simulated data
    
    // Create a mock Firebase user object similar to what would be returned by Firebase auth
    const mockFirebaseUser = {
      uid: TEST_GOOGLE_USER.googleId,
      displayName: TEST_GOOGLE_USER.name,
      email: TEST_GOOGLE_USER.email,
      photoURL: 'https://example.com/photo.jpg',  // Mock photo URL
      // Additional fields that might be present in a real Firebase user
      emailVerified: true,
      isAnonymous: false,
      providerData: [
        {
          providerId: 'google.com',
          uid: TEST_GOOGLE_USER.googleId,
          displayName: TEST_GOOGLE_USER.name,
          email: TEST_GOOGLE_USER.email,
          photoURL: 'https://example.com/photo.jpg'
        }
      ]
    };
    
    // Send this to our Google auth endpoint
    const response = await axios.post(`${API_BASE_URL}/users/google`, {
      user: mockFirebaseUser,
      credential: {
        accessToken: 'mock-google-access-token-' + Date.now()
      }
    });
    
    assert.ok([200, 201].includes(response.status), 'Status code should be 200 or 201');
    assert.ok(response.data._id, 'Response should include a user ID');
    assert.strictEqual(response.data.email, TEST_GOOGLE_USER.email, 'Email should match');
    assert.ok(response.data.token, 'Response should include a JWT token');
    
    googleUserId = response.data._id;
    googleAuthToken = response.data.token;
    
    // Verify the token and check that it contains Google auth information
    const decodedToken = jwt.decode(googleAuthToken);
    assert.ok(decodedToken.id, 'Token should contain user ID');
    
    // Test that we can access protected routes with the Google auth token
    const profileResponse = await axios.get(`${API_BASE_URL}/users/profile`, {
      headers: {
        Authorization: `Bearer ${googleAuthToken}`
      }
    });
    
    assert.strictEqual(profileResponse.status, 200, 'Status code should be 200 OK');
    assert.strictEqual(profileResponse.data.email, TEST_GOOGLE_USER.email, 'Email should match');
    
    // Check if the user has Google auth data in their profile
    assert.ok(profileResponse.data.googleId || 
              profileResponse.data.authProvider === 'google' ||
              profileResponse.data.providerData?.some(p => p.providerId === 'google.com'),
              'User should have Google authentication data');
    
    logTest('Google authentication', true);
  } catch (error) {
    logTest('Google authentication', false, 
      error.response?.data?.message || error.message);
    throw new Error('Google authentication test failed');
  }
}

/**
 * Test user cleanup (delete test users)
 * Note: This requires a special admin endpoint that might not exist
 * If it fails, it's not critical - you might need to clean up manually
 */
async function testUserCleanup() {
  try {
    // Try to delete the test users - this is optional and may not be supported
    // We'll attempt it but won't fail the tests if it doesn't work
    
    try {
      await axios.delete(`${API_BASE_URL}/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      });
      
      await axios.delete(`${API_BASE_URL}/users/${googleUserId}`, {
        headers: {
          Authorization: `Bearer ${googleAuthToken}`
        }
      });
      
      logTest('User cleanup', true);
    } catch (error) {
      // If deletion endpoints don't exist, that's okay
      logTest('User cleanup', true, 'User deletion not supported or not needed');
    }
  } catch (error) {
    // Non-critical test, so we'll log but not throw
    logTest('User cleanup', false, 'Non-critical error: ' + error.message);
  }
}

// Run all tests
runTests();
