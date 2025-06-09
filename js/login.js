document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const errorMessage = document.getElementById('login-error');
    
    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
    }
    
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        errorMessage.style.display = 'none';
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        try {
            // Create Basic Auth credentials
            const credentials = btoa(`${username}:${password}`);
            
            // Try to login using the local proxy
            const response = await fetch('/api/auth/signin', {
                method: 'POST',
                headers: {
                    'Authorization': `Basic ${credentials}`
                }
            });
            
            if (response.ok) {
                const token = await response.text();
                if (token) {
                    // Save token and redirect to profile page
                    localStorage.setItem('jwt', token.trim());
                    window.location.href = 'profile.html';
                } else {
                    showError('Invalid response from server');
                }
            } else {
                if (response.status === 401) {
                    showError('Invalid username or password');
                } else {
                    showError(`Login failed with status: ${response.status}`);
                }
            }
        } catch (error) {
            console.error('Login request failed:', error);
            showError('Connection error. Please try again');
        }
    });
});