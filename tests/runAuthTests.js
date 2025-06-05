/**
 * Auth Test Runner for StumpScore
 * This script sets up and runs the authentication tests
 * 
 * Run with: node tests/runAuthTests.js
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Define colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

// Main test runner
async function runTests() {
  console.log(`\n${colors.cyan}=== STUMPSCORE AUTH TEST RUNNER ===${colors.reset}\n`);
  
  // Step 1: Check if the server is running
  await checkServerStatus();
  
  // Step 2: Run the authentication tests
  await runAuthTests();
}

// Check if the server is running
function checkServerStatus() {
  return new Promise((resolve) => {
    console.log(`${colors.blue}Step 1: Checking if server is running...${colors.reset}`);
    
    const axios = require('axios');
    axios.get('http://localhost:5000/api/users/test')
      .then(() => {
        console.log(`${colors.green}✓ Server is running${colors.reset}`);
        resolve();
      })
      .catch((error) => {
        if (error.response) {
          // We got a response, so the server is running
          console.log(`${colors.green}✓ Server is running${colors.reset}`);
          resolve();
        } else {
          // No response, server might not be running
          console.log(`${colors.yellow}! Server might not be running. Check details below.${colors.reset}`);
          console.log(`${colors.yellow}Error: ${error.message}${colors.reset}`);
          console.log(`${colors.yellow}Make sure your server is running on http://localhost:5000${colors.reset}`);
          console.log(`${colors.yellow}You can start it with: npm run server${colors.reset}`);
          console.log(`${colors.yellow}Attempting to continue with tests anyway...${colors.reset}\n`);
          resolve();
        }
      });
  });
}

// Run the authentication tests
function runAuthTests() {
  return new Promise((resolve, reject) => {
    console.log(`\n${colors.blue}Step 2: Running authentication tests...${colors.reset}`);
    
    const testProcess = spawn('node', ['tests/authenticationTests.js'], {
      stdio: 'inherit',
      shell: true
    });
    
    testProcess.on('close', (code) => {
      if (code === 0) {
        console.log(`\n${colors.green}✓ Authentication tests completed successfully${colors.reset}`);
        resolve();
      } else {
        console.log(`\n${colors.red}✗ Authentication tests failed with code ${code}${colors.reset}`);
        reject(new Error(`Tests failed with code ${code}`));
      }
    });
    
    testProcess.on('error', (err) => {
      console.log(`\n${colors.red}✗ Failed to run tests: ${err.message}${colors.reset}`);
      reject(err);
    });
  });
}

// Run all steps
runTests()
  .then(() => {
    console.log(`\n${colors.green}All test steps completed successfully!${colors.reset}`);
  })
  .catch((error) => {
    console.error(`\n${colors.red}Testing failed: ${error.message}${colors.reset}`);
    process.exit(1);
  });
