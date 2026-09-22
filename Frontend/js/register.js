document.addEventListener('DOMContentLoaded', () => {
    // If already logged in, redirect to dashboard
    if (getToken()) {
        window.location.href = 'dashboard.html';
        return;
    }

    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const role = parseInt(document.getElementById('role').value);
            
            const submitBtn = registerForm.querySelector('button[type="submit"]');
            
            const payload = {
                name,
                email,
                password,
                role
            };
            
            try {
                submitBtn.disabled = true;
                submitBtn.textContent = 'Registering...';
                
                const response = await fetch(`${API_BASE_URL}/auth/register`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(payload)
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    showToast('Registration successful! Redirecting to login...', 'success');
                    setTimeout(() => {
                        window.location.href = 'login.html';
                    }, 2000);
                } else {
                    showToast(data.message || 'Registration failed', 'error');
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Register';
                }
            } catch (error) {
                console.error('Registration error:', error);
                showToast('Network error or server unavailable', 'error');
                submitBtn.disabled = false;
                submitBtn.textContent = 'Register';
            }
        });
    }
});
