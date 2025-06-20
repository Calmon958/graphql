/**
 * Authentication Module
 */
const Auth = (function() {
  /**
   * Attempt to login with username and password
   * @param {string} username - User's username
   * @param {string} password - User's password
   * @return {Promise} - Promise resolving to login result
   */
  async function login(username, password) {
    try {
      console.log(`Attempting login for user: ${username}`);
      
      // Create Basic Auth header
      const base64Credentials = btoa(`${username}:${password}`);
      
      const response = await fetch(APP_CONFIG.API.BASE_URL + APP_CONFIG.API.AUTH_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${base64Credentials}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Login response error:', errorText);
        
        // Try to parse error message
        try {
          const errorData = JSON.parse(errorText);
          if (errorData && errorData.error) {
            throw new Error(errorData.error);
          }
        } catch (e) {
          // If parsing fails, use the default error message
        }
        
        throw new Error(`Login failed: ${response.status} ${response.statusText}`);
      }
      
      // Get the response as text first to inspect it
      const responseText = await response.text();
      console.log('Raw login response:', responseText);
      
      // Try to parse as JSON if possible
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        // If it's not valid JSON, the token might be directly returned as text
        data = { token: responseText };
      }
      
      // Check if we have a token
      if (data && (data.token || typeof data === 'string')) {
        // Store token in localStorage - handle both object with token property and direct string token
        const token = data.token || data;
        localStorage.setItem(APP_CONFIG.STORAGE.AUTH_TOKEN, token);
        console.log('Login successful, token stored');
        return { success: true };
      } else {
        throw new Error('Invalid response from authentication server');
      }
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: error.message || 'An error occurred during login' 
      };
    }
  }
  
  /**
   * Check if user is authenticated
   * @return {boolean} - True if authenticated
   */
  function isAuthenticated() {
    const token = getToken();
    return !!token;
  }
  
  /**
   * Get authentication token
   * @return {string|null} - JWT token or null
   */
  function getToken() {
    return localStorage.getItem(APP_CONFIG.STORAGE.AUTH_TOKEN);
  }
  
  /**
   * Logout user
   */
  function logout() {
    localStorage.removeItem(APP_CONFIG.STORAGE.AUTH_TOKEN);
    console.log('User logged out, token removed');
  }
  
  // Public API
  return {
    login,
    isAuthenticated,
    getToken,
    logout
  };
})();
