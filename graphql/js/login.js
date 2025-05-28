// Ensure the error message is displayed when an error occurs

const form = document.getElementById('login-form');
const errorMessage = document.getElementById('login-error'); // Updated ID to match login.html

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const credentials = btoa(`${username}:${password}`);

    try {
        const res = await fetch('https://learn.zone01kisumu.ke/api/auth/signin', {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${credentials}`,
                'Content-Type': 'application/json',
            },
        });

        if (!res.ok) {
            throw new Error('Invalid credentials.');
        }

        const token = await res.text();
        localStorage.setItem('jwt', token);

        window.location.href = 'index.html'; // Go to profile page
    } catch (error) {
        errorMessage.textContent = error.message;
        errorMessage.style.display = 'block'; // Ensure the error message is displayed
    }
});