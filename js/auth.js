/**
 * Authentication Module
 */
const Auth = (function() {
  const { AUTH_URL } = APP_CONFIG.API;
  const { AUTH_TOKEN } = APP_CONFIG.STORAGE;
  
  /**
   * Login user with credentials
   * @param {string} username - Username or email
   * @param {string} password - User password
   * @return {Promise<Object>} Login result
   */
  async function login(username, password) {
    try {
      console.log('Attempting login with:', username);
      
      // First, test if basic POST requests are working
      console.log('Testing POST endpoint...');
      const testResponse = await fetch('/test-post', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ test: 'data', username, password }),
      });
      
      console.log('Test response status:', testResponse.status);
      if (testResponse.ok) {
        const testData = await testResponse.json();
        console.log('Test response data:', testData);
      } else {
        console.error('Test endpoint failed with status:', testResponse.status);
      }
      
      // Now try the actual login
      console.log('Using special login endpoint...');
      const response = await fetch('/api/try-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password }),
        credentials: 'include'
      });
      
      console.log('Login response status:', response.status);
      
      // Check if we got a successful response
      if (response.ok) {
        const data = await response.json();
        console.log('Login response data:', data);
        
        if (data.success) {
          console.log('Login successful');
          
          // Store token if available
          if (data.token) {
            localStorage.setItem(AUTH_TOKEN, data.token);
          } else if (data.jwt) {
            localStorage.setItem(AUTH_TOKEN, data.jwt);
          } else {
            // If no token is provided, store a session marker
            localStorage.setItem(AUTH_TOKEN, 'session-active');
          }
          
          localStorage.setItem('user_username', username);
          return { success: true, data };
        } else {
          console.log('Login failed:', data.message || 'Unknown error');
          return { 
            success: false, 
            error: data.message || 'Authentication failed. Please check your credentials.' 
          };
        }
      } else {
        // Handle error response
        let errorMessage = 'Authentication failed. Please check your credentials.';
        
        try {
          const errorData = await response.json();
          if (errorData.error) {
            errorMessage = errorData.error;
          }
        } catch (e) {
          // If not JSON, try to get text
          try {
            const errorText = await response.text();
            if (errorText) {
              errorMessage = errorText.length > 100 ? 
                errorText.substring(0, 100) + '...' : errorText;
            }
          } catch (textError) {
            // If we can't get text either, use status code
            errorMessage = `Authentication failed with status ${response.status}`;
          }
        }
        
        return { success: false, error: errorMessage };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: error.message || 'An error occurred during login. Please try again.' 
      };
    }
  }
  
  /**
   * Check if user is authenticated
   * @return {boolean} Authentication status
   */
  function isAuthenticated() {
    const token = localStorage.getItem(AUTH_TOKEN);
    return !!token;
  }
  
  /**
   * Get the authentication token
   * @return {string|null} JWT token or null if not authenticated
   */
  function getToken() {
    return localStorage.getItem(AUTH_TOKEN);
  }
  
  /**
   * Logout user by removing token
   */
  function logout() {
    console.log('Logging out user...');
    localStorage.removeItem(AUTH_TOKEN);
    console.log('Token removed from localStorage');
    
    // Force page reload to reset application state
    window.location.href = window.location.origin;
  }
  
  /**
   * Get the current username if available
   * @return {string|null} Username or null if not available
   */
  function getUsername() {
    // Try to get username from localStorage if we've stored it
    const storedUsername = localStorage.getItem('user_username');
    if (storedUsername) {
      return storedUsername;
    }
    
    return null;
  }
  
  // Public API
  return {
    login,
    logout,
    isAuthenticated,
    getToken,
    getUsername
  };
})();
