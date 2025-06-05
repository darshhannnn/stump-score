// Razorpay configuration for StumpScore
// This file contains the configuration for Razorpay payment gateway

// Razorpay configuration using environment variables
// In development, we're using test keys stored in .env
// The key_secret is only used on the server side
export const RAZORPAY_CONFIG = {
  key_id: process.env.REACT_APP_RAZORPAY_KEY_ID || "rzp_test_aWZEdMdEHsxHCg",
  currency: "INR",
  name: "StumpScore",
  description: "Premium Cricket Analytics Subscription",
  image: "/logo192.png", // Path to your logo
  theme: {
    color: "#2563eb" // Primary blue color matching StumpScore theme
  }
};

// Never expose key_secret on the client side in production
// This is only for development purposes
// In production, payment creation should happen on the server

export default RAZORPAY_CONFIG;
