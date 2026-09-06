// Lightweight in-memory TTL cache. Used by the cricket proxy so repeated
// frontend polls (every 30s across all clients) cost one upstream call.

const store = new Map();

const get = (key) => {
  const entry = store.get(key);
  if (!entry) return undefined;
  if (Date.now() > entry.expiresAt) {
    store.delete(key);
    return undefined;
  }
  return entry.value;
};

const set = (key, value, ttlMs) => {
  store.set(key, { value, expiresAt: Date.now() + ttlMs });
  return value;
};

// Get-or-fetch with stale-while-error: if the fetch fails but we previously
// had data, serve the stale copy instead of failing the client request.
const wrap = async (key, ttlMs, fetcher) => {
  const cached = get(key);
  if (cached !== undefined) return { value: cached, cached: true };
  try {
    const value = await fetcher();
    set(key, value, ttlMs);
    return { value, cached: false };
  } catch (err) {
    const stale = store.get(key);
    if (stale) return { value: stale.value, cached: true, stale: true };
    throw err;
  }
};

const invalidate = (prefix) => {
  for (const key of store.keys()) {
    if (key.startsWith(prefix)) store.delete(key);
  }
};

const stats = () => ({ entries: store.size });

module.exports = { get, set, wrap, invalidate, stats };
