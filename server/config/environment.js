/**
 * Environment Configuration Module
 * Centralized management of environment-specific configuration
 * Validates all required environment variables on startup
 */

class EnvironmentConfig {
  constructor() {
    this.env = process.env.NODE_ENV || 'development';
    this.config = null;
    
    // Load and validate configuration on initialization
    try {
      this.config = this.loadConfig();
    } catch (error) {
      console.error('Configuration Error:', error.message);
      throw error;
    }
  }

  /**
   * Load all configuration from environment variables
   * @returns {Object} Configuration object
   */
  loadConfig() {
    return {
      // Environment
      env: this.env,
      
      // Server
      port: this.getRequired('PORT'),
      
      // Database
      mongoUri: this.getRequired('MONGO_URI'),
      mongoAtlasUri: this.get('MONGO_ATLAS_URI'),
      
      // Authentication
      jwtSecret: this.getRequired('JWT_SECRET'),
      
      // Razorpay Payment Integration
      razorpay: {
        keyId: this.getRequired('RAZORPAY_KEY_ID'),
        keySecret: this.getRequired('RAZORPAY_KEY_SECRET'),
        webhookSecret: this.getRequired('RAZORPAY_WEBHOOK_SECRET')
      },
      
      // Email Configuration
      smtp: {
        host: this.get('SMTP_HOST', 'smtp.gmail.com'),
        port: parseInt(this.get('SMTP_PORT', '587'), 10),
        secure: this.get('SMTP_SECURE', 'false') === 'true',
        user: this.getRequired('SMTP_USER'),
        pass: this.getRequired('SMTP_PASS'),
        from: this.get('SMTP_FROM', 'StumpScore <noreply@stumpscore.com>')
      },
      
      // Frontend URL
      clientUrl: this.get('CLIENT_URL', 'http://localhost:3000'),
      
      // External APIs
      cricketApiKey: this.get('CRICKET_API_KEY', '00ba4444-6577-435e-a241-02719e3c82e5'),
      
      // CORS
      allowedOrigins: this.get('ALLOWED_ORIGINS', 'http://localhost:3000').split(',')
    };
  }

  /**
   * Get a required environment variable
   * Throws error if not found
   * @param {string} key - Environment variable name
   * @returns {string} Environment variable value
   */
  getRequired(key) {
    const value = process.env[key];
    if (!value || value.trim() === '') {
      throw new Error(`Required environment variable ${key} is not set`);
    }
    return value;
  }

  /**
   * Get an optional environment variable with default value
   * @param {string} key - Environment variable name
   * @param {string} defaultValue - Default value if not found
   * @returns {string} Environment variable value or default
   */
  get(key, defaultValue = '') {
    return process.env[key] || defaultValue;
  }

  /**
   * Validate configuration
   * @returns {Object} Validation result
   */
  validate() {
    try {
      this.loadConfig();
      return { 
        valid: true,
        message: 'All required environment variables are present'
      };
    } catch (error) {
      return { 
        valid: false, 
        error: error.message 
      };
    }
  }

  /**
   * Get the current configuration
   * @returns {Object} Configuration object
   */
  getConfig() {
    if (!this.config) {
      throw new Error('Configuration not loaded. Call loadConfig() first.');
    }
    return this.config;
  }

  /**
   * Check if running in production
   * @returns {boolean}
   */
  isProduction() {
    return this.env === 'production';
  }

  /**
   * Check if running in development
   * @returns {boolean}
   */
  isDevelopment() {
    return this.env === 'development';
  }

  /**
   * Check if running in test
   * @returns {boolean}
   */
  isTest() {
    return this.env === 'test';
  }

  /**
   * Print configuration summary (without sensitive data)
   */
  printSummary() {
    console.log('\n=== Environment Configuration ===');
    console.log(`Environment: ${this.config.env}`);
    console.log(`Port: ${this.config.port}`);
    console.log(`MongoDB URI: ${this.maskSensitive(this.config.mongoUri)}`);
    console.log(`Client URL: ${this.config.clientUrl}`);
    console.log(`SMTP Host: ${this.config.smtp.host}`);
    console.log(`Allowed Origins: ${this.config.allowedOrigins.join(', ')}`);
    console.log('=================================\n');
  }

  /**
   * Mask sensitive information for logging
   * @param {string} value - Value to mask
   * @returns {string} Masked value
   */
  maskSensitive(value) {
    if (!value) return '[not set]';
    if (value.length <= 8) return '***';
    return value.substring(0, 4) + '***' + value.substring(value.length - 4);
  }
}

// Export singleton instance
module.exports = new EnvironmentConfig();
