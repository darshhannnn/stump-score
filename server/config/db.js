/**
 * Database connection wrapper
 * Uses the DatabaseManager for robust connection handling
 */

const databaseManager = require('./database');

/**
 * Connect to database using DatabaseManager
 * @returns {Promise<Connection>}
 */
const connectDB = async () => {
  try {
    return await databaseManager.connect();
  } catch (error) {
    console.error('Failed to connect to database:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
