// Fetch user info from localStorage and display
const user = JSON.parse(localStorage.getItem('user'));
if (user) {
    document.getElementById('userName').textContent = user.name || '';
    document.getElementById('userEmail').textContent = user.email || '';
}

// Handle password reset
const form = document.getElementById('resetPasswordForm');
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    let messageDiv = document.getElementById('resetMessage');
    if (!messageDiv) {
        messageDiv = document.createElement('div');
        messageDiv.id = 'resetMessage';
        messageDiv.style.marginTop = '1rem';
        form.parentNode.insertBefore(messageDiv, form.nextSibling);
    }
    const submitBtn = form.querySelector('button[type="submit"]') || form.querySelector('input[type="submit"]');
    function showMessage(msg, type = 'error') {
        messageDiv.innerHTML = `<div class="${type === 'success' ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-600'} px-4 py-3 rounded relative" role="alert"><span class="block sm:inline">${msg}</span></div>`;
    }
    function clearMessage() { messageDiv.innerHTML = ''; }
    clearMessage();
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Updating...';
    }
    const newPassword = document.getElementById('newPassword').value;
    if (!newPassword || newPassword.length < 6) {
        showMessage('Password must be at least 6 characters.');
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Update Password';
        }
        return;
    }
    try {
        const response = await fetchWithAuth('http://localhost:5000/api/auth/reset-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ newPassword })
        });
        const data = await response.json();
        if (response.ok) {
            showMessage('Password updated successfully!', 'success');
            form.reset();
        } else {
            showMessage(data.msg || 'Failed to update password.');
        }
    } catch (err) {
        showMessage('Error updating password.');
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Update Password';
        }
    }
});
