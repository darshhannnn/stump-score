// Cloud sync for Scorekeeper games - mirrors localStorage games to the user's
// account so they can be restored on any device.
import { API_BASE_URL } from './apiConfig';

const request = async (path, { method = 'GET', body } = {}) => {
  const token = localStorage.getItem('stumpscore_auth_token');
  const res = await fetch(`${API_BASE_URL}/games${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const payload = await res.json().catch(() => null);
  if (!res.ok || !payload?.success) {
    throw new Error(payload?.message || `Cloud sync failed (${res.status})`);
  }
  return payload;
};

const cloudSync = {
  isAvailable: () => !!localStorage.getItem('stumpscore_auth_token'),

  // Push (upsert) a game to the cloud
  pushGame: async (game) => {
    const payload = await request('', {
      method: 'POST',
      body: { gameId: game.id, data: game },
    });
    return payload.data;
  },

  // List all cloud games for the logged-in user
  listGames: async () => {
    const payload = await request('');
    return payload.data;
  },

  // Fetch a single cloud game
  getGame: async (gameId) => {
    const payload = await request(`/${encodeURIComponent(gameId)}`);
    return payload.data;
  },

  // Delete a cloud game
  deleteGame: async (gameId) => {
    await request(`/${encodeURIComponent(gameId)}`, { method: 'DELETE' });
    return true;
  },
};

export default cloudSync;
