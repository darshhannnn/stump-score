// Helper functions to manage tokens and API calls with refresh token mechanism
// Use fetchWithAuth for all authenticated requests.

// Get access token from localStorage
function getAccessToken() {
    return localStorage.getItem('accessToken');
}

// Get refresh token from localStorage
function getRefreshToken() {
    return localStorage.getItem('refreshToken');
}

// Save tokens to localStorage
function saveTokens(accessToken, refreshToken) {
    localStorage.setItem('accessToken', accessToken);
    if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
    }
}

// Clear tokens from localStorage
function clearTokens() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
}

// Function to refresh access token using refresh token
async function refreshAccessToken() {
    const refreshToken = getRefreshToken();
    if (!refreshToken) {
        throw new Error('No refresh token available');
    }
    const response = await fetch('http://localhost:5000/api/auth/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: refreshToken })
    });
    if (!response.ok) {
        clearTokens();
        throw new Error('Failed to refresh token');
    }
    const data = await response.json();
    saveTokens(data.accessToken);
    return data.accessToken;
}

// Wrapper for fetch API to include token and handle refresh
async function fetchWithAuth(url, options = {}) {
    let accessToken = getAccessToken();
    if (!options.headers) options.headers = {};
    options.headers['Authorization'] = 'Bearer ' + accessToken;

    let response = await fetch(url, options);
    if (response.status === 401) {
        // Try refreshing token
        try {
            accessToken = await refreshAccessToken();
            options.headers['Authorization'] = 'Bearer ' + accessToken;
            response = await fetch(url, options);
        } catch (err) {
            // Refresh failed, redirect to login
            clearTokens();
            window.location.href = 'login.html';
            throw err;
        }
    }
    return response;
}

// Logout function to call backend and clear tokens
async function logout() {
    const refreshToken = getRefreshToken();
    if (refreshToken) {
        await fetch('http://localhost:5000/api/auth/logout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: refreshToken })
        });
    }
    clearTokens();
    window.location.href = 'login.html';
}
