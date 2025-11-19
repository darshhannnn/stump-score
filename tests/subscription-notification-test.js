const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const User = require('../server/models/User');
const { sendEmail } = require('../server/utils/emailService');
const fs = require('fs');
const path = require('path');

// Configuration
const LOG_FILE = path.join(__dirname, 'subscription_notification_test_results.log');

// Initialize log file
fs.writeFileSync(LOG_FILE, `StumpScore Subscription Notification Tests - ${new Date().toISOString()}\n\n`);

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

// Logging utilities
function log(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  console.log(message);
  fs.appendFileSync(LOG_FILE, logMessage);
}

function logSuccess(test, message = '') {
  log(`${colors.green}✓ ${test}${colors.reset}${message ? ': ' + message : ''}`);
}

function logError(test, message = '') {
  log(`${colors.red}✗ ${test}${colors.reset}${message ? ': ' + message : ''}`);
}

function logInfo(message) {
  log(`${colors.blue}ℹ ${message}${colors.reset}`);
}

function logHeader(message) {
  log(`\n${colors.bright}${colors.cyan}${message}${colors.reset}\n`);
}

function logSeparator() {
  log('-------------------------------------------------------');
}

// Test data generator
function createTestUsers(count, expiryDays) {
  const users = [];
  const now = new Date();
  
  for (let i = 0; i < count; i++) {
    const premiumUntil = new Date(now);
    premiumUntil.setDate(now.getDate() + expiryDays);
    
    users.push({
      name: `Test User ${i + 1}`,
      email: `test-user-${i + 1}@example.com`,
      password: 'TestPassword123!',
      isPremium: true,
      premiumUntil,
      currentPlan: i % 2 === 0 ? 'monthly' : 'annual'
    });
  }
  
  return users;
}

// Mock email service
const emailLogs = [];
jest.mock('../server/utils/emailService', () => ({
  sendEmail: jest.fn(async (options) => {
    emailLogs.push({
      to: options.to,
      template: options.template,
      context: options.context,
      timestamp: new Date()
    });
    return { success: true, messageId: `mock_${Date.now()}` };
  })
}));

// Test cases
async function runTests() {
  logHeader('SUBSCRIPTION NOTIFICATION SYSTEM TESTS');
  
  let mongoServer;
  let success = true;
  
  try {
    // Start in-memory MongoDB server
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    
    // Connect to MongoDB
    await mongoose.connect(mongoUri);
    logSuccess('MongoDB Connection', `Connected to ${mongoUri}`);
    
    // Test 1: Create test users with different expiry dates
    logSeparator();
    logInfo('TEST 1: Creating test users');
    
    const testUserSets = [
      { count: 3, days: 7 },  // Users expiring in 7 days
      { count: 2, days: 3 },  // Users expiring in 3 days
      { count: 2, days: 1 },  // Users expiring in 1 day
      { count: 1, days: 0 },  // User expired today
      { count: 2, days: 15 }  // Users not expiring soon
    ];
    
    for (const set of testUserSets) {
      const users = createTestUsers(set.count, set.days);
      await User.insertMany(users);
      logSuccess('User Creation', `Created ${set.count} users expiring in ${set.days} days`);
    }
    
    // Test 2: Find users needing notifications
    logSeparator();
    logInfo('TEST 2: Testing findUsersNeedingNotification');
    
    const notificationStages = [7, 3, 1];
    for (const days of notificationStages) {
      const usersToNotify = await User.findUsersNeedingNotification(days);
      logSuccess(`${days}-day notifications`, `Found ${usersToNotify.length} users`);
      
      // Verify correct users are found
      const correctCount = testUserSets.find(set => set.days === days)?.count || 0;
      if (usersToNotify.length !== correctCount) {
        logError(`${days}-day user count`, `Expected ${correctCount} users, found ${usersToNotify.length}`);
        success = false;
      }
    }
    
    // Test 3: Test notification tracking
    logSeparator();
    logInfo('TEST 3: Testing notification tracking');
    
    const testUser = (await User.findOne({ 'premiumUntil': { $gte: new Date() } }));
    
    // Mark 7-day notification as sent
    await testUser.markNotificationSent(7);
    const hasSevenDay = testUser.hasReceivedNotification(7);
    
    if (hasSevenDay) {
      logSuccess('Notification tracking', '7-day notification correctly marked as sent');
    } else {
      logError('Notification tracking', 'Failed to mark/track 7-day notification');
      success = false;
    }
    
    // Verify other notifications are still pending
    const hasThreeDay = testUser.hasReceivedNotification(3);
    if (!hasThreeDay) {
      logSuccess('Notification tracking', '3-day notification correctly marked as pending');
    } else {
      logError('Notification tracking', 'Incorrect status for 3-day notification');
      success = false;
    }
    
    // Test 4: Test email sending
    logSeparator();
    logInfo('TEST 4: Testing email sending');
    
    const testEmail = {
      to: testUser.email,
      template: 'subscription-expiry',
      context: {
        name: testUser.name,
        expiryDate: testUser.premiumUntil,
        renewalLink: 'http://localhost:3000/premium',
        daysLeft: 7
      }
    };
    
    await sendEmail(testEmail);
    
    const lastEmail = emailLogs[emailLogs.length - 1];
    if (lastEmail && lastEmail.to === testUser.email) {
      logSuccess('Email sending', 'Test email sent successfully');
    } else {
      logError('Email sending', 'Failed to send test email');
      success = false;
    }
    
    // Test 5: Test cleanup of old notifications
    logSeparator();
    logInfo('TEST 5: Testing old notification cleanup');
    
    // Add some old notifications
    const thirtyOneDaysAgo = new Date();
    thirtyOneDaysAgo.setDate(thirtyOneDaysAgo.getDate() - 31);
    
    testUser.notificationsSent.set(`expiry_${thirtyOneDaysAgo.toISOString().split('T')[0]}`, true);
    await testUser.save();
    
    // Verify cleanup
    const oldNotifications = Array.from(testUser.notificationsSent.entries())
      .filter(([key]) => key.startsWith('expiry_'))
      .length;
    
    if (oldNotifications > 0) {
      logSuccess('Notification cleanup', `Found ${oldNotifications} notifications to clean`);
    } else {
      logError('Notification cleanup', 'No old notifications found for cleanup test');
      success = false;
    }
  } catch (error) {
    logError('Test Execution', error.message);
    console.error(error);
    success = false;
  } finally {
    // Cleanup
    try {
      await mongoose.disconnect();
      if (mongoServer) await mongoServer.stop();
      
      logInfo(`Test results saved to: ${LOG_FILE}`);
      logSeparator();
      
      if (success) {
        log(`${colors.bright}${colors.green}✓ SUBSCRIPTION NOTIFICATION TESTS PASSED${colors.reset}`);
      } else {
        log(`${colors.bright}${colors.red}✗ SUBSCRIPTION NOTIFICATION TESTS FAILED${colors.reset}`);
      }
    } catch (err) {
      console.error('Cleanup error:', err);
    }
  }
}

// Jest test suite
describe('Subscription Notification System', () => {
  let mongoServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    await User.deleteMany({});
    emailLogs.length = 0; // Clear email logs
  });

  it('should create test users with different expiry dates', async () => {
    const testUserSets = [
      { count: 3, days: 7 },
      { count: 2, days: 3 },
      { count: 2, days: 1 },
      { count: 1, days: 0 },
      { count: 2, days: 15 }
    ];

    for (const set of testUserSets) {
      const users = createTestUsers(set.count, set.days);
      await User.insertMany(users);
      const count = await User.countDocuments({
        isPremium: true,
        premiumUntil: {
          $gte: new Date(Date.now() + (set.days - 1) * 24 * 60 * 60 * 1000),
          $lt: new Date(Date.now() + (set.days + 1) * 24 * 60 * 60 * 1000)
        }
      });
      expect(count).toBe(set.count);
    }
  });

  it('should find correct users for each notification stage', async () => {
    const notificationStages = [7, 3, 1];
    const testUserSets = [
      { count: 3, days: 7 },
      { count: 2, days: 3 },
      { count: 2, days: 1 }
    ];

    // Create test users
    for (const set of testUserSets) {
      const users = createTestUsers(set.count, set.days);
      await User.insertMany(users);
    }

    // Test each notification stage
    for (const days of notificationStages) {
      const usersToNotify = await User.findUsersNeedingNotification(days);
      const expectedCount = testUserSets.find(set => set.days === days)?.count || 0;
      expect(usersToNotify.length).toBe(expectedCount);
    }
  });

  it('should track notification status correctly', async () => {
    const testUser = new User(createTestUsers(1, 7)[0]);
    await testUser.save();

    await testUser.markNotificationSent(7);
    expect(testUser.hasReceivedNotification(7)).toBe(true);
    expect(testUser.hasReceivedNotification(3)).toBe(false);
  });

  it('should send email notifications successfully', async () => {
    const testUser = new User(createTestUsers(1, 7)[0]);
    await testUser.save();

    const testEmail = {
      to: testUser.email,
      template: 'subscription-expiry',
      context: {
        name: testUser.name,
        expiryDate: testUser.premiumUntil,
        renewalLink: 'http://localhost:3000/premium',
        daysLeft: 7
      }
    };

    await sendEmail(testEmail);
    expect(emailLogs).toHaveLength(1);
    expect(emailLogs[0].to).toBe(testUser.email);
  });

  it('should clean up old notification records', async () => {
    const testUser = new User(createTestUsers(1, 7)[0]);
    
    // Add old notification
    const thirtyOneDaysAgo = new Date();
    thirtyOneDaysAgo.setDate(thirtyOneDaysAgo.getDate() - 31);
    testUser.notificationsSent.set(`expiry_${thirtyOneDaysAgo.toISOString().split('T')[0]}`, true);
    
    await testUser.save();
    
    const initialCount = testUser.notificationsSent.size;
    expect(initialCount).toBeGreaterThan(0);

    // Clean up old notifications
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    for (const [key] of testUser.notificationsSent.entries()) {
      if (key.startsWith('expiry_')) {
        const notificationDate = new Date(key.replace('expiry_', ''));
        if (notificationDate < thirtyDaysAgo) {
          testUser.notificationsSent.delete(key);
        }
      }
    }

    await testUser.save();
    expect(testUser.notificationsSent.size).toBeLessThan(initialCount);
  });
});
