/**
 * Webhook Signature Verification Middleware
 * Verifies Razorpay webhook signatures for security
 */

const crypto = require('crypto');
const config = require('../config/environment');
const logger = require('../utils/logger');

/**
 * Verify Razorpay webhook signature
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next function
 */
function verifyRazorpaySignature(req, res, next) {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const appConfig = config.getConfig();
    const webhookSecret = appConfig.razorpay.webhookSecret;

    // Check if signature exists
    if (!signature) {
      logger.warn('Webhook signature missing', {
        ip: req.ip,
        path: req.path
      });
      return res.status(400).json({ 
        success: false,
        error: {
          message: 'Missing webhook signature',
          code: 'MISSING_SIGNATURE'
        }
      });
    }

    // Get the raw body (should be set by express.json with verify option)
    const payload = req.rawBody || JSON.stringify(req.body);

    // Calculate expected signature
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(payload.toString())
      .digest('hex');

    // Compare signatures
    if (signature !== expectedSignature) {
      logger.warn('Invalid webhook signature', {
        ip: req.ip,
        path: req.path,
        receivedSignature: signature.substring(0, 10) + '...',
        expectedSignature: expectedSignature.substring(0, 10) + '...'
      });
      return res.status(400).json({ 
        success: false,
        error: {
          message: 'Invalid webhook signature',
          code: 'INVALID_SIGNATURE'
        }
      });
    }

    // Signature is valid, proceed
    logger.info('Webhook signature verified successfully', {
      path: req.path
    });
    next();

  } catch (error) {
    logger.error('Webhook verification error', error, {
      path: req.path,
      ip: req.ip
    });
    return res.status(500).json({ 
      success: false,
      error: {
        message: 'Webhook verification failed',
        code: 'VERIFICATION_ERROR'
      }
    });
  }
}

/**
 * Generic webhook signature verification
 * Can be used for other webhook providers
 * @param {string} secret - Webhook secret
 * @param {string} headerName - Header name containing signature
 * @returns {Function} Middleware function
 */
function verifyWebhookSignature(secret, headerName = 'x-webhook-signature') {
  return (req, res, next) => {
    try {
      const signature = req.headers[headerName.toLowerCase()];

      if (!signature) {
        return res.status(400).json({ 
          success: false,
          error: {
            message: 'Missing webhook signature',
            code: 'MISSING_SIGNATURE'
          }
        });
      }

      const payload = req.rawBody || JSON.stringify(req.body);
      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(payload.toString())
        .digest('hex');

      if (signature !== expectedSignature) {
        logger.warn('Invalid webhook signature', {
          ip: req.ip,
          path: req.path
        });
        return res.status(400).json({ 
          success: false,
          error: {
            message: 'Invalid webhook signature',
            code: 'INVALID_SIGNATURE'
          }
        });
      }

      next();
    } catch (error) {
      logger.error('Webhook verification error', error);
      return res.status(500).json({ 
        success: false,
        error: {
          message: 'Webhook verification failed',
          code: 'VERIFICATION_ERROR'
        }
      });
    }
  };
}

module.exports = {
  verifyRazorpaySignature,
  verifyWebhookSignature
};
