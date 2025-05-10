import { isTokenExpired, refreshAccessToken, getStoredTokens, storeTokens, clearTokens } from './auth.js';
document.addEventListener('DOMContentLoaded', function() {

    (async function autoDashboardLoginWithRefresh() {
        const { accessToken, refreshToken, user } = getStoredTokens();
        if (!user || !accessToken) {
            window.location.href = 'login.html';
            return;
        }
        if (isTokenExpired(accessToken)) {
            if (refreshToken) {
                const refreshed = await refreshAccessToken(refreshToken);
                if (refreshed && refreshed.accessToken && refreshed.user) {
                    storeTokens(refreshed);
                } else {
                    clearTokens();
                    window.location.href = 'login.html';
                }
            } else {
                clearTokens();
                window.location.href = 'login.html';
            }
        }
    })();

    // Simulate extra details for demo (in real app, collect these at signup or from backend)
    if (!user.favTeam) user.favTeam = 'India';
    if (!user.favFormat) user.favFormat = 'T20';
    if (!user.country) user.country = 'India';
    if (!user.lastLogin) user.lastLogin = new Date().toLocaleString();

    // Profile dropdown logic
    const profileDropdownBtn = document.getElementById('profileDropdownBtn');
    const profileDropdownMenu = document.getElementById('profileDropdownMenu');
    const dropdownUserName = document.getElementById('dropdownUserName');
    const dropdownUserEmail = document.getElementById('dropdownUserEmail');
    const profileDropdownName = document.getElementById('profileDropdownName');

    // Set user info in dropdown
    if (dropdownUserName && user.name) dropdownUserName.textContent = user.name;
    if (dropdownUserEmail && user.email) dropdownUserEmail.textContent = user.email;
    if (profileDropdownName && user.name) profileDropdownName.textContent = user.name;

    if (profileDropdownBtn && profileDropdownMenu) {
        profileDropdownBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            profileDropdownMenu.classList.toggle('hidden');
        });
        // Hide dropdown when clicking outside
        document.addEventListener('click', function(e) {
            if (!profileDropdownBtn.contains(e.target) && !profileDropdownMenu.contains(e.target)) {
                profileDropdownMenu.classList.add('hidden');
            }
        });
    }
    // Reset password (for now, just alert)
    const resetPasswordBtn = document.getElementById('resetPasswordBtn');
    if (resetPasswordBtn) {
        resetPasswordBtn.addEventListener('click', function() {
            alert('Password reset functionality coming soon!');
        });
    }

    document.getElementById('logoutBtn').addEventListener('click', async function() {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
            await fetch('http://localhost:5000/api/auth/logout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: refreshToken })
            });
        }
        localStorage.clear();
        window.location.href = 'login.html';
    });

    // Add message div for feedback
    let dashboardMsg = document.getElementById('dashboard-message');
    if (!dashboardMsg) {
        dashboardMsg = document.createElement('div');
        dashboardMsg.id = 'dashboard-message';
        dashboardMsg.style.marginTop = '1rem';
        document.querySelector('.w-full.max-w-2xl.mx-auto.p-8.bg-white.rounded-lg.shadow-md').appendChild(dashboardMsg);
    }
    function showDashboardMsg(msg, type = 'error') {
        dashboardMsg.innerHTML = `<div class="${type === 'success' ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-600'} px-4 py-3 rounded relative" role="alert"><span class="block sm:inline">${msg}</span></div>`;
    }
    function clearDashboardMsg() { dashboardMsg.innerHTML = ''; }

    document.getElementById('deleteAccountBtn').addEventListener('click', async function() {
        if (confirm('Are you sure you want to delete your account? This cannot be undone.')) {
            const deleteBtn = document.getElementById('deleteAccountBtn');
            clearDashboardMsg();
            if (deleteBtn) {
                deleteBtn.disabled = true;
                deleteBtn.textContent = 'Deleting...';
            }
            // Simulate async delete (replace with real API if needed)
            setTimeout(() => {
                localStorage.clear();
                showDashboardMsg('Account deleted. Redirecting to login...', 'success');
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 1000);
            }, 700);
        }
    });

    document.getElementById('forgotPassword').addEventListener('click', function(e) {
        e.preventDefault();
        showDashboardMsg('Password reset instructions would be sent to your email (demo only).', 'success');
    });
});
