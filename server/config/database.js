/**
 * Database Connection Manager
 * Handles MongoDB connections with retry logic, exponential backoff,
 * automatic reconnection, and connection pooling
 */

const mongoose = require('mongoose');
const config = require('./environment');

class DatabaseManager {
  constructor(configObj) {
    this.config = configObj || config.getConfig();
    this.maxRetries = 5;
    this.retryDelay = 5000; // 5 seconds base delay
    this.connection = null;
    this.isConnecting = false;
    this.reconnectAttempts = 0;
  }

  /**
   * Connect to MongoDB with retry logic and exponential backoff
   * @returns {Promise<Connection>} Mongoose connection
   */
  async connect() {
    if (this.isConnecting) {
      console.log('Connection attempt already in progress...');
      return this.connection;
    }

    this.isConnecting = true;
    let retries = 0;

    while (retries < this.maxRetries) {
      try {
        const connectionOptions = {
          maxPoolSize: 10,
          serverSelectionTimeoutMS: 5000,
          socketTimeoutMS: 45000,
          family: 4 // Use IPv4, skip trying IPv6
        };

        // Try Atlas connection first if configured
        if (this.config.mongoAtlasUri && retries === 0) {
          try {
            this.connection = await mongoose.connect(
              this.config.mongoAtlasUri,
              connectionOptions
            );
            console.log('Database connected successfully (Atlas)');
            this.setupEventHandlers();
            this.isConnecting = false;
            this.reconnectAttempts = 0;
            return this.connection;
          } catch (atlasError) {
            console.log('Atlas connection failed, trying local database...');
          }
        }

        // Connect to local MongoDB
        this.connection = await mongoose.connect(
          this.config.mongoUri,
          connectionOptions
        );
        console.log('Database connected successfully (Local)');
        this.setupEventHandlers();
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        return this.connection;

      } catch (error) {
        retries++;
        console.error(`Database connection attempt ${retries}/${this.maxRetries} failed:`, error.message);
        
        if (retries < this.maxRetries) {
          // Exponential backoff: delay increases with each retry
          const delay = this.retryDelay * retries;
          console.log(`Retrying in ${delay / 1000} seconds...`);
          await this.sleep(delay);
        }
      }
    }

    this.isConnecting = false;
    throw new Error(`Failed to connect to database after ${this.maxRetries} attempts`);
  }

  /**
   * Set up event handlers for connection monitoring
   */
  setupEventHandlers() {
    // Handle disconnection
    mongoose.connection.on('disconnected', () => {
      console.warn('Database disconnected. Attempting to reconnect...');
      this.reconnectAttempts++;
      
      // Attempt to reconnect
      if (this.reconnectAttempts <= this.maxRetries) {
        setTimeout(() => {
          this.connect().catch(err => {
            console.error('Reconnection failed:', err.message);
          });
        }, this.retryDelay * this.reconnectAttempts);
      } else {
        console.error('Maximum reconnection attempts reached. Manual intervention required.');
      }
    });

    // Handle connection errors
    mongoose.connection.on('error', (err) => {
      console.error('Database error:', err.message);
    });

    // Handle successful reconnection
    mongoose.connection.on('reconnected', () => {
      console.log('Database reconnected successfully');
      this.reconnectAttempts = 0;
    });

    // Handle connection
    mongoose.connection.on('connected', () => {
      console.log('Database connection established');
    });
  }

  /**
   * Gracefully disconnect from database
   * @returns {Promise<void>}
   */
  async disconnect() {
    if (this.connection) {
      try {
        await mongoose.connection.close();
        console.log('Database connection closed gracefully');
        this.connection = null;
      } catch (error) {
        console.error('Error closing database connection:', error.message);
        throw error;
      }
    }
  }

  /**
   * Sleep utility for retry delays
   * @param {number} ms - Milliseconds to sleep
   * @returns {Promise<void>}
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get current connection status
   * @returns {string} Connection status
   */
  getStatus() {
    const state = mongoose.connection.readyState;
    const states = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };
    return states[state] || 'unknown';
  }

  /**
   * Check if database is connected
   * @returns {boolean}
   */
  isConnected() {
    return mongoose.connection.readyState === 1;
  }

  /**
   * Get connection statistics
   * @returns {Object} Connection stats
   */
  getStats() {
    if (!this.isConnected()) {
      return {
        connected: false,
        status: this.getStatus()
      };
    }

    return {
      connected: true,
      status: this.getStatus(),
      host: mongoose.connection.host,
      port: mongoose.connection.port,
      name: mongoose.connection.name,
      models: Object.keys(mongoose.connection.models).length
    };
  }
}

// Export singleton instance
module.exports = new DatabaseManager();
