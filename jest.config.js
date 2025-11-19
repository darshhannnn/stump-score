module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js', '**/tests/**/*-test.js'],
  setupFiles: ['dotenv/config', '<rootDir>/tests/setup/test-env.js'],
  verbose: true,
  forceExit: true,
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
  testTimeout: 30000,
  // Handle ES modules
  transform: {
    '^.+\\.jsx?$': 'babel-jest'
  },
  // Module name mapper for path aliases
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/server/$1'
  }
};
