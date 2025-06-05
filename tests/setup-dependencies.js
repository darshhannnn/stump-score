/**
 * Setup Dependencies for StumpScore Authentication Tests
 * This script installs the necessary dependencies for running the authentication tests
 * 
 * Run with: node tests/setup-dependencies.js
 */

const { execSync } = require('child_process');
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

// Main function
function setupDependencies() {
  console.log(`\n${colors.cyan}=== INSTALLING TEST DEPENDENCIES ===${colors.reset}\n`);
  
  // Check if package.json exists
  if (!fs.existsSync(path.join(process.cwd(), 'package.json'))) {
    console.error(`${colors.red}Error: package.json not found. Make sure you're running this from the project root.${colors.reset}`);
    process.exit(1);
  }
  
  // Define dependencies needed for tests
  const dependencies = [
    'axios',
    'assert',
    'jsonwebtoken'
  ];
  
  // Install dependencies
  try {
    console.log(`${colors.blue}Installing dependencies: ${dependencies.join(', ')}${colors.reset}`);
    
    // Use npm to install dependencies
    execSync(`npm install --save-dev ${dependencies.join(' ')}`, {
      stdio: 'inherit'
    });
    
    console.log(`\n${colors.green}✓ Dependencies installed successfully${colors.reset}`);
    console.log(`\n${colors.yellow}You can now run the tests with:${colors.reset}`);
    console.log(`${colors.yellow}1. Start your server: npm run server${colors.reset}`);
    console.log(`${colors.yellow}2. In another terminal: node tests/runAuthTests.js${colors.reset}`);
  } catch (error) {
    console.error(`\n${colors.red}✗ Failed to install dependencies: ${error.message}${colors.reset}`);
    process.exit(1);
  }
}

// Run the setup
setupDependencies();
