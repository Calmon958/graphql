// Save this as alternative-login.js and include it in your HTML

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const errorMessage = document.getElementById('login-error');
    const statusDiv = document.createElement('div');
    statusDiv.id = 'status-messages';
    statusDiv.style.marginTop = '20px';
    statusDiv.style.padding = '10px';
    statusDiv.style.backgroundColor = '#f0f0f0';
    statusDiv.style.borderRadius = '5px';
    document.body.appendChild(statusDiv);
    
    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
    }
    
    function logStatus(message) {
        console.log(message);
        const p = document.createElement('p');
        p.textContent = message;
        statusDiv.appendChild(p);
    }
    
    // Add alternative login methods
    const alternativesDiv = document.createElement('div');
    alternativesDiv.innerHTML = `
        <h3>Alternative Login Methods</h3>
        <button id="try-jsonp">Try JSONP Approach</button>
        <button id="try-local-proxy">Try Local Proxy</button>
        <button id="try-allorigins">Try AllOrigins Proxy</button>
    `;
    loginForm.parentNode.insertBefore(alternativesDiv, loginForm.nextSibling);
    
    // Standard login attempt
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        statusDiv.innerHTML = '';
        errorMessage.style.display = 'none';
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        logStatus(`Attempting login with username: ${username}`);
        
        try {
            const credentials = btoa(`${username}:${password}`);
            
            // Try with AllOrigins proxy
            const proxyUrl = 'https://api.allorigins.win/raw?url=';
            const targetUrl = encodeURIComponent('https://learn.zone01kisumu.ke/api/auth/signin');
            
            logStatus(`Using AllOrigins proxy: ${proxyUrl}`);
            
            const response = await fetch(`${proxyUrl}${targetUrl}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Basic ${credentials}`,
                    'Content-Type': 'application/json'
                }
            });
            
            logStatus(`Response status: ${response.status}`);
            
            if (response.ok) {
                const data = await response.text();
                logStatus(`Success! Token received (length: ${data.length})`);
                
                localStorage.setItem('jwt', data.trim());
                logStatus('Token saved to localStorage');
                
                // Redirect or show profile
                // window.location.href = 'profile.html';
            } else {
                showError(`Login failed with status: ${response.status}`);
            }
        } catch (error) {
            logStatus(`Error: ${error.message}`);
            showError(`Connection error: ${error.message}`);
        }
    });
    
    // Try AllOrigins proxy
    document.getElementById('try-allorigins').addEventListener('click', async () => {
        statusDiv.innerHTML = '';
        errorMessage.style.display = 'none';
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        if (!username || !password) {
            showError('Please enter both username and password');
            return;
        }
        
        logStatus(`Trying AllOrigins proxy with username: ${username}`);
        
        try {
            const credentials = btoa(`${username}:${password}`);
            const proxyUrl = 'https://api.allorigins.win/raw?url=';
            const targetUrl = encodeURIComponent('https://learn.zone01kisumu.ke/api/auth/signin');
            
            const response = await fetch(`${proxyUrl}${targetUrl}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Basic ${credentials}`,
                    'Content-Type': 'application/json'
                }
            });
            
            logStatus(`AllOrigins response status: ${response.status}`);
            
            if (response.ok) {
                const data = await response.text();
                logStatus(`Success with AllOrigins! Token: ${data.substring(0, 10)}...`);
                localStorage.setItem('jwt', data.trim());
            } else {
                showError(`AllOrigins request failed with status: ${response.status}`);
            }
        } catch (error) {
            logStatus(`AllOrigins error: ${error.message}`);
            showError('AllOrigins error: ' + error.message);
        }
    });
    
    // Try local proxy option
    document.getElementById('try-local-proxy').addEventListener('click', () => {
        statusDiv.innerHTML = '';
        logStatus('To use a local proxy:');
        logStatus('1. Install Node.js if you haven\'t already');
        logStatus('2. Create server.js and package.json files (see instructions)');
        logStatus('3. Run "npm install" and then "npm start"');
        logStatus('4. Access your app at http://localhost:3000');
        
        const serverCode = `
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
const app = express();
const port = 3000;

app.use(cors());
app.use(express.static('.'));

app.use('/api', createProxyMiddleware({
  target: 'https://learn.zone01kisumu.ke',
  changeOrigin: true,
  pathRewrite: {
    '^/api': '/api'
  }
}));

app.listen(port, () => {
  console.log(\`Server running at http://localhost:\${port}\`);
});`;
        
        const packageJson = `
{
  "name": "zone01-proxy",
  "version": "1.0.0",
  "main": "server.js",
  "dependencies": {
    "cors": "^2.8.5",
    "express": "^4.17.1",
    "http-proxy-middleware": "^2.0.6"
  }
}`;
        
        logStatus('server.js:');
        logStatus(serverCode);
        logStatus('package.json:');
        logStatus(packageJson);
    });
    
    // Try JSONP approach (may not work for all APIs)
    document.getElementById('try-jsonp').addEventListener('click', () => {
        statusDiv.innerHTML = '';
        errorMessage.style.display = 'none';
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        if (!username || !password) {
            showError('Please enter both username and password');
            return;
        }
        
        logStatus('JSONP approach typically doesn\'t work for authentication APIs');
        logStatus('This is just for demonstration purposes');
        
        const credentials = btoa(`${username}:${password}`);
        logStatus(`Encoded credentials: ${credentials}`);
        
        // Create a script tag for JSONP
        const script = document.createElement('script');
        script.src = `https://learn.zone01kisumu.ke/api/auth/signin?callback=handleLoginResponse&auth=${credentials}`;
        
        // Define callback function
        window.handleLoginResponse = function(data) {
            logStatus('JSONP response received');
            logStatus(JSON.stringify(data));
            
            if (typeof data === 'string' && data.length > 0) {
                localStorage.setItem('jwt', data.trim());
                logStatus('Token saved to localStorage');
            } else {
                showError('Invalid JSONP response');
            }
            
            // Clean up
            document.body.removeChild(script);
            delete window.handleLoginResponse;
        };
        
        // Handle errors
        script.onerror = function() {
            logStatus('JSONP request failed');
            showError('JSONP request failed');
            document.body.removeChild(script);
        };
        
        document.body.appendChild(script);
        logStatus('JSONP request sent (likely to fail for authentication APIs)');
    });
});