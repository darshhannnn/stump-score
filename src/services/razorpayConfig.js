// Razorpay configuration for StumpScore
// The publishable key id is served by the backend (GET /api/payments/config)
// so enabling/rotating keys is a server-side change only. The static values
// below are just build-time fallbacks.

import { API_BASE_URL } from './apiConfig';

export const RAZORPAY_CONFIG = {
  key_id: process.env.REACT_APP_RAZORPAY_KEY_ID || "rzp_test_aWZEdMdEHsxHCg",
  currency: "INR",
  name: "StumpScore",
  description: "Premium Cricket Analytics Subscription",
  image: "/logo192.png",
  theme: {
    color: "#2563eb"
  }
};

let cachedKeyId = null;

// Resolve the publishable key at checkout time from our backend
export const resolveKeyId = async () => {
  if (cachedKeyId) return cachedKeyId;
  try {
    const res = await fetch(`${API_BASE_URL}/payments/config`);
    const payload = await res.json();
    if (payload?.enabled && payload?.keyId) {
      cachedKeyId = payload.keyId;
      return cachedKeyId;
    }
  } catch {
    // Backend unreachable - fall back to build-time env value
  }
  return RAZORPAY_CONFIG.key_id;
};

// Never expose key_secret on the client side.
export default RAZORPAY_CONFIG;
