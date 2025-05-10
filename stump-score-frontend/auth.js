// auth.js
// Utility functions for token management and refresh logic

const API_BASE_URL = 'http://localhost:5000/api/auth';

// Parse JWT and check expiration
export function isTokenExpired(token) {
    if (!token) return true;
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (!payload.exp) return true;
        // exp is in seconds since epoch
        return Date.now() >= payload.exp * 1000;
    } catch {
        return true;
    }
}

export async function refreshAccessToken(refreshToken) {
    try {
        const response = await fetch(`${API_BASE_URL}/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken })
        });
        if (!response.ok) throw new Error('Failed to refresh token');
        return await response.json();
    } catch (err) {
        return null;
    }
}

export function getStoredTokens() {
    return {
        accessToken: localStorage.getItem('accessToken'),
        refreshToken: localStorage.getItem('refreshToken'),
        user: JSON.parse(localStorage.getItem('user') || 'null'),
    };
}

export function storeTokens({ accessToken, refreshToken, user }) {
    if (accessToken) localStorage.setItem('accessToken', accessToken);
    if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
    if (user) localStorage.setItem('user', JSON.stringify(user));
}

export function clearTokens() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
}
