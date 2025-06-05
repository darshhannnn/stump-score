# StumpScore Payment & Subscription Testing

This document provides information about the payment and subscription testing setup for StumpScore, including integration with MongoDB Atlas and Razorpay.

## Test Scripts Overview

We have created several test scripts to verify the payment and subscription flow:

1. **payment-subscription-test.js** - Basic test for payment and subscription flow using an in-memory MongoDB
2. **razorpay-mongodb-integration.js** - Tests direct integration with Razorpay and MongoDB Atlas
3. **payment-mongodb-test.js** - Comprehensive test with automatic fallback to local MongoDB if Atlas connection fails

## What These Tests Verify

The test scripts verify the following aspects of the payment and subscription system:

- User registration and storage in MongoDB
- Order creation and storage in MongoDB
- Payment processing and verification
- Subscription status updates
- Payment history tracking
- Google Authentication integration with the payment/subscription flow
- Expiry date calculation and validation

## MongoDB Atlas Connection

The tests are configured to use the MongoDB Atlas connection string from your `.env` file. 

### Current Issue with MongoDB Atlas Connection

There appears to be an issue with the MongoDB Atlas connection string:

```
mongodb+srv://stumpscore:IadsoIwq68nqVctm@cluster0.mongodb.atlas.com/stumpscore?retryWrites=true&w=majority
```

The error message indicates that the cluster address `cluster0.mongodb.atlas.com` is not valid. This is likely a placeholder and needs to be replaced with your actual MongoDB Atlas cluster address.

### How to Fix the MongoDB Atlas Connection

1. Log in to your MongoDB Atlas account
2. Navigate to your cluster
3. Click on the "Connect" button
4. Choose "Connect your application"
5. Copy the connection string
6. Replace the current connection string in your `.env` file
7. Make sure to replace `<password>` with your actual password

A valid MongoDB Atlas connection string typically looks like:
```
mongodb+srv://username:password@clustername.mongodb.net/database?retryWrites=true&w=majority
```

## Running the Tests

To run the payment and subscription tests:

```
node tests/payment-mongodb-test.js
```

This script will:
1. Attempt to connect to MongoDB Atlas
2. If the connection fails, it will automatically fall back to a local MongoDB instance
3. Run all the tests to verify the payment and subscription flow
4. Output the results to the console and a log file

## Google Authentication Integration

The tests include specific verification for Google Authentication users (implemented with Firebase) to ensure that:

1. Google-authenticated users can purchase subscriptions
2. Their subscription status is correctly stored and updated in MongoDB
3. Payment history is properly tracked for Google users
4. Google user ID is correctly associated with their subscription

## Test Results

The test results are saved to log files in the `tests` directory:
- `payment_test_results.log`
- `razorpay_integration_results.log`
- `payment_mongodb_test_results.log`

These logs contain detailed information about each test step, including success/failure status and relevant data.

## Troubleshooting

If you encounter issues with the tests:

1. **MongoDB Atlas Connection**: Verify your connection string as described above
2. **Missing Dependencies**: Run `npm install` to ensure all required packages are installed
3. **Razorpay Configuration**: Check that your Razorpay API keys are correctly set in the `.env` file
4. **JWT Secret**: Ensure the JWT_SECRET environment variable is set for token generation

## Next Steps

After confirming that the payment and subscription flow works correctly with MongoDB Atlas:

1. Test the actual user interface flow in the application
2. Verify webhook handling for Razorpay payment confirmations
3. Implement subscription renewal notifications
4. Test edge cases like payment failures and cancellations
