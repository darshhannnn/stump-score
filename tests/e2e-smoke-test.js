/**
 * End-to-end smoke test: boots an in-memory MongoDB, starts server.js against it,
 * and exercises the full API surface:
 *   health/stats, auth, profile, preferences, favorites, password reset,
 *   cloud game sync, match comments, notifications, premium gating,
 *   payment order/verify, subscription lifecycle.
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

let passed = 0;
const assert = (cond, label) => {
  if (!cond) throw new Error(`FAILED: ${label}`);
  passed++;
  console.log(`  ok - ${label}`);
};

(async () => {
  console.log('Starting in-memory MongoDB...');
  const mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri('stumpscore');

  const server = spawn(process.execPath, ['server.js'], {
    cwd: require('path').resolve(__dirname, '..'),
    // DEV_SKIP_VERIFY is forced on for tests so the suite can exercise the
    // payment flow without completing a real Razorpay transaction.
    env: { ...process.env, MONGO_URI: uri, JWT_SECRET: 'test-secret', PORT: String(PORT), RAZORPAY_DEV_SKIP_VERIFY: 'true' },
    stdio: ['ignore', 'pipe', 'pipe']
  });
  server.stdout.on('data', d => process.stdout.write(`[server] ${d}`));
  server.stderr.on('data', d => process.stdout.write(`[server:err] ${d}`));

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
    console.log('Server is up.\n');

    let res;

    // ===== Health & stats =====
    res = await request('/health');
    assert(res.status === 200 && res.data.status === 'ok' && res.data.database === 'connected', 'health reports ok + db connected');
    res = await request('/stats');
    assert(res.status === 200 && typeof res.data.data.users === 'number', 'public stats endpoint works');

    // ===== Auth =====
    res = await request('/users/register', { method: 'POST', body: { name: 'Smoke Test', email: 'smoke@test.com', password: 'password123' } });
    assert(res.status === 201 && res.data.token, 'register returns 201 + token');
    const token = res.data.token;

    res = await request('/users/register', { method: 'POST', body: { name: 'X', email: 'smoke@test.com', password: 'password123' } });
    assert(res.status === 400, 'duplicate register rejected');

    res = await request('/users/login', { method: 'POST', body: { email: 'smoke@test.com', password: 'wrongpass' } });
    assert(res.status === 401, 'wrong password rejected with 401');

    res = await request('/users/login', { method: 'POST', body: { email: 'smoke@test.com', password: 'password123' } });
    assert(res.status === 200 && res.data.isPremium === false, 'login works');

    // ===== Profile & preferences =====
    res = await request('/users/profile', { token });
    assert(res.status === 200 && res.data.preferences && !res.data.password, 'profile returns preferences, strips password');

    res = await request('/users/preferences', { method: 'PATCH', token, body: { theme: 'dark', favoriteTeamId: 'india' } });
    assert(res.status === 200 && res.data.preferences.theme === 'dark', 'preferences update works');

    // ===== Favorites =====
    res = await request('/users/favorites/india', { method: 'POST', token });
    assert(res.status === 200 && res.data.favorited === true, 'favorite toggle adds team');
    res = await request('/users/favorites', { token });
    assert(res.data.favorites.includes('india'), 'favorites list contains india');
    res = await request('/users/favorites/india', { method: 'POST', token });
    assert(res.data.favorited === false, 'favorite toggle removes team');

    // ===== Cloud game sync =====
    res = await request('/games', { method: 'POST', token, body: { gameId: 'game-abc', data: { id: 'game-abc', players: [{ id: 1, name: 'A', score: 50 }], currentRound: 2 } } });
    assert(res.status === 200 && res.data.data.gameId === 'game-abc', 'cloud game upsert works');
    res = await request('/games', { method: 'POST', token, body: { gameId: 'game-abc', data: { id: 'game-abc', players: [{ id: 1, name: 'A', score: 90 }], currentRound: 3 } } });
    assert(res.status === 200 && res.data.data.data.players[0].score === 90, 'cloud game upsert overwrites (true upsert)');
    res = await request('/games', { token });
    assert(res.status === 200 && res.data.count === 1, 'cloud game list works');
    res = await request('/games/game-abc', { token });
    assert(res.status === 200, 'cloud game get works');

    // ===== Match comments =====
    const matchId = 'mock-odi-ind-aus';
    res = await request(`/matches/${matchId}/comments`, { method: 'POST', token, body: { text: 'What a match!' } });
    assert(res.status === 201 && res.data.data.text === 'What a match!', 'comment post works');
    const commentId = res.data.data._id;

    res = await request(`/matches/${matchId}/comments`, { method: 'POST', body: { text: 'nope' } });
    assert(res.status === 401, 'comment post without token rejected');

    res = await request(`/matches/${matchId}/comments`);
    assert(res.status === 200 && res.data.total === 1 && res.data.data[0].userName === 'Smoke Test', 'comment list works (public)');

    res = await request(`/matches/${matchId}/comments/${commentId}`, { method: 'DELETE', token });
    assert(res.status === 200, 'own comment delete works');

    // ===== Notifications =====
    res = await request('/notifications', { token });
    assert(res.status === 200 && res.data.total >= 1, 'welcome notification created on register');
    res = await request('/notifications/read-all', { method: 'POST', token });
    assert(res.status === 200, 'read-all notifications works');
    res = await request('/notifications', { token });
    assert(res.data.unread === 0, 'unread count is zero after read-all');

    // ===== Premium gating =====
    res = await request(`/cricket/predictions/${matchId}`, { token });
    assert(res.status === 403, 'predictions blocked for free users (requirePremium)');

    // ===== Cricket proxy (falls back to mock without valid upstream key) =====
    res = await request('/cricket/matches');
    assert(res.status === 200 && res.data.success && res.data.count > 0, 'cricket matches endpoint serves data');
    res = await request(`/cricket/match/${matchId}`);
    assert(res.status === 200 && res.data.data.id === matchId, 'cricket match details endpoint works');
    res = await request('/cricket/search?q=india');
    assert(res.status === 200 && res.data.success, 'cricket search endpoint works');

    // ===== Password reset flow =====
    res = await request('/users/forgot-password', { method: 'POST', body: { email: 'smoke@test.com' } });
    assert(res.status === 200 && res.data.resetToken, 'forgot-password returns dev reset token');
    const resetToken = res.data.resetToken;

    res = await request('/users/reset-password', { method: 'POST', body: { token: 'bogus-token', password: 'newpassword123' } });
    assert(res.status === 400, 'invalid reset token rejected');

    res = await request('/users/reset-password', { method: 'POST', body: { token: resetToken, password: 'newpassword123' } });
    assert(res.status === 200 && res.data.success, 'reset-password works');

    res = await request('/users/login', { method: 'POST', body: { email: 'smoke@test.com', password: 'newpassword123' } });
    assert(res.status === 200, 'login works with new password');

    // ===== Google auth endpoint =====
    res = await request('/users/google', { method: 'POST', body: { name: 'Google User', email: 'google.user@gmail.com', googleId: 'gid-123', profilePicture: 'https://example.com/pic.png' } });
    assert(res.status === 200 && res.data.token && res.data.isPremium === false, 'google auth creates user + returns token');
    const googleId = res.data._id;

    res = await request('/users/google', { method: 'POST', body: { name: 'Google User', email: 'google.user@gmail.com', googleId: 'gid-123' } });
    assert(res.status === 200 && res.data._id === googleId, 'google auth upserts (same user on re-login)');

    // ===== Payments & subscription =====
    res = await request('/payments/config');
    assert(res.status === 200 && res.data.enabled === true && String(res.data.keyId).startsWith('rzp_'), 'payments config exposes publishable key');

    res = await request('/payments/create-order', { method: 'POST', token, body: { amount: 50, currency: 'INR', planType: 'monthly' } });
    assert(res.status === 200 && res.data.id, 'create-order returns order id');
    const orderId = res.data.id;

    res = await request('/payments/verify', {
      method: 'POST', token,
      body: { razorpay_payment_id: 'pay_test_123', razorpay_order_id: orderId, razorpay_signature: 'sig', planType: 'annual', amount: 20000 }
    });
    assert(res.status === 200 && res.data.user?.isPremium === true, 'verify upgrades user to premium');

    res = await request(`/cricket/predictions/${matchId}`, { token });
    assert(res.status === 200 && res.data.data.winProbability, 'predictions unlocked for premium users');

    res = await request('/users/subscription', { token });
    assert(res.status === 200 && res.data.plan?.name === 'Annual' && res.data.status === 'active', 'subscription returns rich Annual plan');
    assert(Array.isArray(res.data.billingHistory) && res.data.billingHistory.length === 1, 'billing history has 1 entry');

    res = await request('/payments/orders', { token });
    assert(res.status === 200 && res.data.length === 1 && res.data[0].status === 'paid', 'order audit trail updated to paid');

    res = await request('/users/subscription/cancel', { method: 'POST', token });
    assert(res.status === 200 && res.data.user?.isPremium === false, 'cancel sets isPremium false');

    res = await request('/users/subscription/reactivate', { method: 'POST', token });
    assert(res.status === 200 && res.data.user?.isPremium === true, 'reactivate restores premium');

    res = await request('/users/subscription', {});
    assert(res.status === 401, 'subscription without token rejected with 401');

    // ===== Unknown route =====
    res = await request('/does-not-exist');
    assert(res.status === 404, 'unknown API route returns JSON 404');

    console.log(`\nALL ${passed} SMOKE TESTS PASSED`);
  } finally {
    server.kill();
    await mongod.stop();
  }
})().catch(err => {
  console.error('\nSMOKE TEST FAILURE:', err.message);
  process.exit(1);
});
