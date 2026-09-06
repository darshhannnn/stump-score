/**
 * Live Razorpay integration test.
 * Uses the REAL keys from .env and an in-memory MongoDB:
 *   1. create-order must hit the real Razorpay API (source: 'razorpay')
 *   2. /verify with a correctly-computed HMAC signature must succeed
 *      (this is exactly what Razorpay's checkout sends after a real payment)
 *   3. /verify with a forged signature must be rejected (400)
 *   4. Real signature verification must be ENFORCED (dev-skip off)
 * Run: node tests/razorpay-live-test.js
 */
const { spawn } = require('child_process');
const crypto = require('crypto');
const { MongoMemoryServer } = require('mongodb-memory-server');
require('dotenv').config();

const PORT = 5051;
const BASE = `http://localhost:${PORT}/api`;
const KEY_ID = process.env.RAZORPAY_KEY_ID;
const KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

if (!KEY_ID || !KEY_SECRET) {
  console.error('RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET missing from .env');
  process.exit(1);
}

const request = async (path, { method = 'GET', body, token } = {}) => {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: body ? JSON.stringify(body) : undefined
  });
  return { status: res.status, data: await res.json().catch(() => null) };
};

let passed = 0;
const assert = (cond, label) => {
  if (!cond) throw new Error(`FAILED: ${label}`);
  passed++;
  console.log(`  ok - ${label}`);
};

(async () => {
  const mongod = await MongoMemoryServer.create();
  const server = spawn(process.execPath, ['server.js'], {
    cwd: require('path').resolve(__dirname, '..'),
    env: {
      ...process.env,
      MONGO_URI: mongod.getUri('stumpscore'),
      JWT_SECRET: 'test-secret',
      PORT: String(PORT),
      RAZORPAY_DEV_SKIP_VERIFY: 'false', // ENFORCE real signature verification
    },
    stdio: ['ignore', 'pipe', 'pipe']
  });
  server.stdout.on('data', d => process.stdout.write(`[server] ${d}`));

  try {
    await new Promise((resolve, reject) => {
      const started = Date.now();
      const ping = async () => {
        try {
          const res = await fetch(`${BASE}/health`);
          if (res.ok) return resolve();
          throw new Error('not ready');
        } catch {
          if (Date.now() - started > 20000) return reject(new Error('server did not start'));
          setTimeout(ping, 500);
        }
      };
      ping();
    });

    let res = await request('/users/register', { method: 'POST', body: { name: 'Pay Test', email: 'pay@test.com', password: 'password123' } });
    const token = res.data.token;

    // 1. Real order creation through the Razorpay SDK
    res = await request('/payments/create-order', { method: 'POST', token, body: { amount: 50, currency: 'INR', planType: 'monthly' } });
    assert(res.status === 200 && res.data.source === 'razorpay', `create-order hit the REAL Razorpay API (source=${res.data?.source}, id=${res.data?.id})`);
    assert(String(res.data.id).startsWith('order_'), 'order id matches Razorpay order_* format');
    const orderId = res.data.id;

    // 2. Real checkout signature verification
    const paymentId = 'pay_TEST_SIMULATED_1';
    // This is exactly how Razorpay computes the signature sent to the client handler:
    const signature = crypto.createHmac('sha256', KEY_SECRET).update(`${orderId}|${paymentId}`).digest('hex');
    res = await request('/payments/verify', {
      method: 'POST', token,
      body: { razorpay_payment_id: paymentId, razorpay_order_id: orderId, razorpay_signature: signature, planType: 'monthly', amount: 5000 }
    });
    assert(res.status === 200 && res.data.user?.isPremium === true, 'verify with REAL HMAC signature upgrades to premium');

    // 3. Forged signature must be rejected
    res = await request('/payments/verify', {
      method: 'POST', token,
      body: { razorpay_payment_id: 'pay_FORGED', razorpay_order_id: orderId, razorpay_signature: 'deadbeef', planType: 'monthly', amount: 5000 }
    });
    assert(res.status === 400, 'forged signature rejected with 400');

    // 4. Signature verification is enforced in this mode
    res = await request('/payments/config');
    assert(res.data.enabled === true, 'payments config reports Razorpay enabled');

    console.log(`\nALL ${passed} LIVE RAZORPAY TESTS PASSED (keys valid, verification enforced)`);
  } finally {
    server.kill();
    await mongod.stop();
  }
})().catch(err => {
  console.error('\nLIVE RAZORPAY TEST FAILURE:', err.message);
  process.exit(1);
});
