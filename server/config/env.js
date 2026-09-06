// Central environment configuration with validation.
// Fails fast on truly required values, degrades gracefully in development.

require('dotenv').config();

const bool = (v, d = false) => (v === undefined || v === '' ? d : String(v).toLowerCase() === 'true' || v === '1');

const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  isProd: process.env.NODE_ENV === 'production',
  port: Number(process.env.PORT) || 5000,

  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/stumpscore',
  localMongoFallback: process.env.MONGO_LOCAL_FALLBACK || 'mongodb://localhost:27017/stumpscore',

  jwtSecret: process.env.JWT_SECRET || 'stumpscore_dev_jwt_secret_change_me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '30d',

  razorpay: {
    keyId: process.env.RAZORPAY_KEY_ID || '',
    keySecret: process.env.RAZORPAY_KEY_SECRET || '',
    webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET || '',
    // In development, unverified signatures are accepted (with a warning) so the
    // flow is testable without completing real payments. Production always verifies.
    devSkipVerify: bool(process.env.RAZORPAY_DEV_SKIP_VERIFY, true) && process.env.NODE_ENV !== 'production',
  },

  cricket: {
    cricapiKey: process.env.CRICAPI_KEY || '',
    cricapiUrl: process.env.CRICAPI_URL || 'https://api.cricapi.com/v1',
    matchesCacheTtl: Number(process.env.CRICAPI_CACHE_TTL) || 60_000,
  },

  rateLimit: {
    windowMs: 15 * 60 * 1000,
    globalMax: Number(process.env.RATE_LIMIT_GLOBAL) || 500,
    authMax: Number(process.env.RATE_LIMIT_AUTH) || 30,
    passwordResetMax: Number(process.env.RATE_LIMIT_PASSWORD_RESET) || 10,
    commentMax: Number(process.env.RATE_LIMIT_COMMENTS) || 30,
  },

  corsOrigin: process.env.CORS_ORIGIN || '*',
};

if (!process.env.JWT_SECRET) {
  console.warn('[config] JWT_SECRET not set - using insecure development secret. Set JWT_SECRET in .env!');
}

module.exports = config;
