const loginForm = document.getElementById('login-form');
const submitButton = loginForm.querySelector('button[type="submit"]');

// Create a container for error messages and loading spinner
const feedbackContainer = document.createElement('div');
feedbackContainer.className = 'feedback-container';
loginForm.insertBefore(feedbackContainer, loginForm.firstChild);

// Create and style the loading spinner
const loadingSpinner = document.createElement('div');
loadingSpinner.className = 'loading-spinner';
loadingSpinner.style.display = 'none';
feedbackContainer.appendChild(loadingSpinner);

// Create the error message element
const errorDiv = document.createElement('div');
errorDiv.className = 'error-message';
errorDiv.style.display = 'none';
feedbackContainer.appendChild(errorDiv);

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;

    // Basic validation
    if (!username || !password) {
        showError('Username and password are required');
        return;
    }

    // Clear previous error and show spinner
    errorDiv.style.display = 'none';
    loadingSpinner.style.display = 'block';
    submitButton.disabled = true;
    
    try {
        const credentials = btoa(`${username}:${password}`);
        const response = await fetch('https://learn.zone01kisumu.ke/api/auth/signin', {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${credentials}`
            }
        });

        // Always hide spinner and re-enable button after fetch
        loadingSpinner.style.display = 'none';
        submitButton.disabled = false;

        if (response.ok) {
            const data = await response.json();
            if (data && typeof data === 'string') {
                localStorage.setItem('hasura_jwt_token', data);
                window.location.href = '/profile.html';
            } else {
                showError('An unexpected error occurred. Please try again');
            }
        } else {
            // Handle non-OK responses
            const errorData = await response.json().catch(() => null); // Catch if no JSON body
            handleLoginError(response.status, errorData);
        }
    } catch (error) {
        // Handle network or other fetch errors
        loadingSpinner.style.display = 'none';
        submitButton.disabled = false;
        console.error('Login request failed:', error);
        showError('Unable to connect to the server. Please check your internet connection and try again');
    }
});

function handleLoginError(status, errorData) {
    let message = 'An unknown error occurred. Please try again later';

    if (status === 401) {
        message = 'Incorrect username or password. Please double-check your credentials';
    } else if (status === 429) {
        message = 'Too many login attempts. For security, your account is temporarily locked. Please try again in a few minutes';
    } else if (errorData && errorData.message) {
        message = errorData.message;
    } else if (status >= 500) {
        message = 'Server error. We are working to resolve the issue. Please try again later';
    }

    showError(message);
}

function showError(message) {
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    errorDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
}
