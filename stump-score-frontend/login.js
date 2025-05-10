import { isTokenExpired, refreshAccessToken, getStoredTokens, storeTokens, clearTokens } from './auth.js';
document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('form');
    let messageDiv = document.getElementById('login-message');
    if (!messageDiv) {
        messageDiv = document.createElement('div');
        messageDiv.id = 'login-message';
        messageDiv.style.marginTop = '1rem';
        form.parentNode.insertBefore(messageDiv, form.nextSibling);
    }
    const submitBtn = form.querySelector('button[type="submit"]') || form.querySelector('input[type="submit"]');

    function showMessage(msg, type = 'error') {
        messageDiv.innerHTML = `<div class="${type === 'success' ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-600'} px-4 py-3 rounded relative" role="alert"><span class="block sm:inline">${msg}</span></div>`;
    }
    function clearMessage() {
        messageDiv.innerHTML = '';
    }

    // Auto-login using tokens (no password storage)

    (async function autoLoginWithRefresh() {
        const { accessToken, refreshToken, user } = getStoredTokens();
        if (accessToken && user && !isTokenExpired(accessToken)) {
            window.location.href = 'index.html';
            return;
        }
        if (refreshToken) {
            const refreshed = await refreshAccessToken(refreshToken);
            if (refreshed && refreshed.accessToken && refreshed.user) {
                storeTokens(refreshed);
                window.location.href = 'index.html';
                return;
            } else {
                clearTokens();
            }
        }
    })();
    // Optionally, you can keep the Remember Me checkbox for UI, but it won't store passwords.
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        clearMessage();
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Logging in...';
        }
        const email = form.querySelector('input[type="email"]').value.trim();
        const password = form.querySelector('input[type="password"]').value.trim();
        const robot = form.querySelector('input[type="checkbox"]');

        if (!email || !password) {
            showMessage('Please fill all fields.');
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Login';
            }
            return;
        }
        if (!robot?.checked) {
            showMessage('Please confirm you are not a robot.');
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Login';
            }
            return;
        }
        const requestData = { email, password };
        try {
            const response = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestData)
            });
            const data = await response.json();
            if (response.ok) {
                showMessage('Login successful! Redirecting...', 'success');
                localStorage.setItem('accessToken', data.accessToken);
                localStorage.setItem('refreshToken', data.refreshToken);
                localStorage.setItem('user', JSON.stringify(data.user));
                // No longer store credentials for Remember Me (security improvement)
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1000);
            } else {
                showMessage(data.msg || 'Invalid credentials. Please try again.');
            }
        } catch (error) {
            showMessage('Error connecting to server. Please try again later.');
            console.error('Login error:', error);
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Login';
            }
        }
    });
});
