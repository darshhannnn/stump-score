/**
 * End-to-end smoke test: boots an in-memory MongoDB, starts server.js against it,
 * and exercises register -> login -> create-order -> verify -> subscription flows.
 * Run: node tests/e2e-smoke-test.js
 */
const { spawn } = require('child_process');
const { MongoMemoryServer } = require('mongodb-memory-server');

const PORT = 5050;
const BASE = `http://localhost:${PORT}/api`;

const request = async (path, { method = 'GET', body, token } = {}) => {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: body ? JSON.stringify(body) : undefined
  });
  const data = await res.json().catch(() => null);
  return { status: res.status, data };
};

const assert = (cond, label) => {
  if (!cond) throw new Error(`FAILED: ${label}`);
  console.log(`  ok - ${label}`);
};

(async () => {
  console.log('Starting in-memory MongoDB...');
  const mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri('stumpscore');
  console.log('Memory MongoDB at:', uri);

  const server = spawn(process.execPath, ['server.js'], {
    cwd: require('path').resolve(__dirname, '..'),
    env: { ...process.env, MONGO_URI: uri, JWT_SECRET: 'test-secret', PORT: String(PORT) },
    stdio: ['ignore', 'pipe', 'pipe']
  });
  server.stdout.on('data', d => process.stdout.write(`[server] ${d}`));
  server.stderr.on('data', d => process.stdout.write(`[server:err] ${d}`));

  try {
    // wait for the server to listen
    await new Promise((resolve, reject) => {
      const started = Date.now();
      const ping = async () => {
        try {
          await fetch(`http://localhost:${PORT}/api/nonexistent`);
          resolve();
        } catch {
          if (Date.now() - started > 20000) return reject(new Error('server did not start'));
          setTimeout(ping, 500);
        }
      };
      ping();
    });
    console.log('Server is up.\n');

    let res;

    // 1. Register
    res = await request('/users/register', { method: 'POST', body: { name: 'Smoke Test', email: 'smoke@test.com', password: 'password123' } });
    assert(res.status === 201 && res.data.token, 'register returns 201 + token');
    const token = res.data.token;

    // 2. Duplicate register rejected
    res = await request('/users/register', { method: 'POST', body: { name: 'Smoke Test', email: 'smoke@test.com', password: 'password123' } });
    assert(res.status === 400, 'duplicate register rejected with 400');

    // 3. Login
    res = await request('/users/login', { method: 'POST', body: { email: 'smoke@test.com', password: 'password123' } });
    assert(res.status === 200 && res.data.isPremium === false, 'login returns user with isPremium false');

    // 4. Wrong password rejected
    res = await request('/users/login', { method: 'POST', body: { email: 'smoke@test.com', password: 'wrongpass' } });
    assert(res.status === 401, 'wrong password rejected with 401');

    // 5. Subscription (before payment)
    res = await request('/users/subscription', { token });
    assert(res.status === 200 && res.data.plan?.name === 'Monthly', 'subscription returns derived Monthly plan');

    // 6. Create order
    res = await request('/payments/create-order', { method: 'POST', token, body: { amount: 50, currency: 'INR', planType: 'monthly' } });
    assert(res.status === 200 && res.data.id, 'create-order returns order id');
    const orderId = res.data.id;

    // 7. Verify payment (dev mode: signature check skipped server-side)
    res = await request('/payments/verify', {
      method: 'POST', token,
      body: { razorpay_payment_id: 'pay_test_123', razorpay_order_id: orderId, razorpay_signature: 'sig', planType: 'annual', amount: 20000 }
    });
    assert(res.status === 200 && res.data.user?.isPremium === true, 'verify upgrades user to premium');

    // 8. Subscription (after payment) - now rich Annual plan
    res = await request('/users/subscription', { token });
    assert(res.status === 200 && res.data.plan?.name === 'Annual', 'subscription now returns Annual plan');
    assert(res.data.status === 'active' && res.data.nextBillingDate, 'subscription has active status + nextBillingDate');
    assert(Array.isArray(res.data.billingHistory) && res.data.billingHistory.length === 1, 'billing history has 1 entry');

    // 9. Cancel subscription
    res = await request('/users/subscription/cancel', { method: 'POST', token });
    assert(res.status === 200 && res.data.user?.isPremium === false, 'cancel sets isPremium false');

    // 10. Reactivate subscription
    res = await request('/users/subscription/reactivate', { method: 'POST', token });
    assert(res.status === 200 && res.data.user?.isPremium === true, 'reactivate restores premium');

    // 11. Auth required
    res = await request('/users/subscription', {});
    assert(res.status === 401, 'subscription without token rejected with 401');

    console.log('\nALL SMOKE TESTS PASSED');
  } finally {
    server.kill();
    await mongod.stop();
  }
})().catch(err => {
  console.error('\nSMOKE TEST FAILURE:', err.message);
  process.exit(1);
});
