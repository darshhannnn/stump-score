# StumpScore Authentication Testing

This directory contains scripts for testing the authentication flow with MongoDB Atlas integration.

## Test Files

- **authenticationTests.js**: Tests the API endpoints directly including registration, login, token validation, and Google authentication
- **authenticator.js**: Simulates user interaction with the authentication system and verifies correct behavior
- **runAuthTests.js**: A helper script to run the tests and check server status
- **setup-dependencies.js**: Installs required dependencies for testing

## Prerequisites

Before running the tests, make sure:

1. The MongoDB Atlas connection is properly configured in your `.env` file
2. The Express server is running (start with `npm run server`)
3. Required test dependencies are installed (run `node tests/setup-dependencies.js`)

## Running the Tests

### Option 1: Test the API endpoints directly

```bash
# Install dependencies first
node tests/setup-dependencies.js

# Start the server in one terminal
npm run server

# Run the tests in another terminal
node tests/authenticationTests.js
```

### Option 2: Test user authentication flow simulation

```bash
# Install dependencies first
node tests/setup-dependencies.js

# Start the server in one terminal
npm run server

# Run the authentication flow test in another terminal
node tests/authenticator.js
```

## What These Tests Verify

### 1. User Registration
- Tests creating a new user in MongoDB Atlas
- Verifies user data is saved correctly
- Confirms JWT token is generated

### 2. User Login
- Tests authentication with email/password
- Verifies JWT token generation
- Confirms correct user data is returned

### 3. Token Validation
- Tests that valid tokens can access protected routes
- Verifies token contains correct user information

### 4. Token Security
- Tests that invalid tokens are rejected
- Verifies expired tokens are not accepted

### 5. Google Authentication
- Tests Google OAuth integration
- Verifies Google user data is stored in MongoDB
- Confirms token generation for Google users

## Troubleshooting

If tests fail, check:

1. **MongoDB Connection**: Ensure your MongoDB Atlas connection string in `.env` is correct
2. **Server Status**: Make sure the Express server is running on port 5000
3. **Network Issues**: Check for any network connectivity problems with MongoDB Atlas
4. **JWT Secret**: Ensure the JWT_SECRET in `.env` is properly set

## Test Logs

Test results are saved to:
- `tests/auth_test_results.log` (for authenticator.js)

This provides a record of test runs and any issues encountered.
