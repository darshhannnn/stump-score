document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('form');
    let messageDiv = document.getElementById('signup-message');
    if (!messageDiv) {
        messageDiv = document.createElement('div');
        messageDiv.id = 'signup-message';
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

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        clearMessage();
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Signing up...';
        }
        const username = form.querySelector('input[type="text"]').value.trim();
        const email = form.querySelector('input[type="email"]').value.trim();
        const password = form.querySelector('input[type="password"]').value.trim();
        const robot = form.querySelector('input[type="checkbox"]');
        if (!name || !email || !password) {
            showMessage('Please fill all fields.');
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Sign Up';
            }
            return;
        }
        if (!robot.checked) {
            showMessage('Please confirm you are not a robot.');
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Sign Up';
            }
            return;
        }
        try {
            const response = await fetch('http://localhost:5000/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password })
            });
            const data = await response.json();
            if (response.ok) {
                showMessage('Account created successfully! Logging you in...', 'success');
                // Auto-login after signup
                setTimeout(async () => {
                    try {
                        const loginResp = await fetch('http://localhost:5000/api/auth/login', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ email, password })
                        });
                        const loginData = await loginResp.json();
                        if (loginResp.ok) {
                            localStorage.setItem('accessToken', loginData.accessToken);
                            localStorage.setItem('refreshToken', loginData.refreshToken);
                            localStorage.setItem('user', JSON.stringify(loginData.user));
                            // No longer store credentials for Remember Me (security improvement)
                            window.location.href = 'index.html';
                        } else {
                            showMessage(loginData.msg || 'Signup succeeded but login failed. Please log in manually.');
                        }
                    } catch (err) {
                        showMessage('Signup succeeded but login failed. Please log in manually.');
                    }
                }, 1000);
            } else {
                showMessage(data.msg || 'Signup failed. Please try again.');
            }
        } catch (error) {
            showMessage('Error connecting to server. Please try again later.');
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Sign Up';
            }
        }
    });
});
