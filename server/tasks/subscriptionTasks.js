const cron = require('node-cron');
const User = require('../models/User');
const { sendEmail } = require('../utils/emailService');

// Helper to retry failed operations
async function withRetry(operation, maxRetries = 3, delay = 1000) {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      console.error(`Attempt ${attempt}/${maxRetries} failed:`, error);
      
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, delay * attempt));
      }
    }
  }
  
  throw lastError;
}

// Enhanced logging with timestamp
function log(type, message, error = null) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${type}: ${message}`;
  
  switch (type) {
    case 'INFO':
      console.log(logMessage);
      break;
    case 'ERROR':
      console.error(logMessage, error || '');
      break;
    case 'SUCCESS':
      console.log('\x1b[32m%s\x1b[0m', logMessage); // Green color
      break;
    case 'WARNING':
      console.log('\x1b[33m%s\x1b[0m', logMessage); // Yellow color
      break;
  }
}

// Schedule tasks to run daily at midnight
cron.schedule('0 0 * * *', async () => {
  log('INFO', 'Starting daily subscription maintenance tasks...');
  
  try {
    // Clean up expired subscriptions with retry
    const cleanupCount = await withRetry(async () => {
      return await User.cleanupExpiredSubscriptions();
    });
    
    log('SUCCESS', `Cleaned up ${cleanupCount} expired subscriptions`);    // Notification stages: 7 days, 3 days, and 1 day before expiry
    const notificationStages = [7, 3, 1];
    let totalNotificationsSent = 0;
    let totalNotificationsFailed = 0;

    for (const daysBeforeExpiry of notificationStages) {
      // Find users needing notification for this stage
      const usersToNotify = await withRetry(async () => {
        return await User.findUsersNeedingNotification(daysBeforeExpiry);
      });

      log('INFO', `Found ${usersToNotify.length} users to notify ${daysBeforeExpiry} days before expiry`);

      for (const user of usersToNotify) {
        try {
          await sendEmail({
            to: user.email,
            template: 'subscription-expiry',
            context: {
              name: user.name,
              expiryDate: user.premiumUntil,
              renewalLink: `${process.env.CLIENT_URL}/premium`,
              daysLeft: daysBeforeExpiry
            }
          });

          // Mark notification as sent
          await user.markNotificationSent(daysBeforeExpiry);
          
          totalNotificationsSent++;
          log('SUCCESS', `Sent ${daysBeforeExpiry}-day expiry notification to user ${user._id}`);
        } catch (error) {
          totalNotificationsFailed++;
          log('ERROR', `Failed to send ${daysBeforeExpiry}-day notification to user ${user._id}`, error);
        }
      }
    }

    log('INFO', `Notification summary: ${notificationsSent} sent, ${notificationsFailed} failed`);
  } catch (error) {
    log('ERROR', 'Error in subscription tasks', error);
  }
});

// Schedule weekly cleanup of old notification records (older than 30 days)
cron.schedule('0 0 * * 0', async () => {
  log('INFO', 'Starting weekly notification record cleanup...');
  
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const users = await withRetry(async () => {
      return await User.find({
        notificationsSent: { $exists: true, $ne: {} }
      });
    });

    log('INFO', `Found ${users.length} users with notification records`);
    
    let cleanupCount = 0;
    let errorCount = 0;

    for (const user of users) {
      try {
        const notifications = user.notificationsSent;
        let modified = false;

        for (const [key, value] of notifications.entries()) {
          if (key.startsWith('expiry_')) {
            const notificationDate = new Date(key.replace('expiry_', ''));
            if (notificationDate < thirtyDaysAgo) {
              notifications.delete(key);
              modified = true;
            }
          }
        }

        if (modified) {
          await withRetry(async () => {
            user.markModified('notificationsSent');
            await user.save();
          });
          cleanupCount++;
        }
      } catch (error) {
        errorCount++;
        log('ERROR', `Failed to cleanup notifications for user ${user._id}`, error);
      }
    }

    log('SUCCESS', `Cleaned up notifications for ${cleanupCount} users, ${errorCount} failures`);
  } catch (error) {
    log('ERROR', 'Error cleaning up notification records', error);
  }
});
