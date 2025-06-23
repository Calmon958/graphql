/**
 * Authentication Module
 */
const Auth = (function() {
  const { AUTH_TOKEN } = APP_CONFIG.STORAGE;
  
  async function login(username, password) {
    try {
      let response;
      // Use Basic Auth for the real API
      if (APP_CONFIG.API.BASE_URL.includes("01.kood.tech")) {
        const base64Credentials = btoa(`${username}:${password}`);
        response = await fetch(`${APP_CONFIG.API.BASE_URL}${APP_CONFIG.API.AUTH_URL}`, {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${base64Credentials}`,
            'Content-Type': 'application/json'
          }
        });
      } else {
        // Local test endpoint expects JSON body
        response = await fetch(`${APP_CONFIG.API.BASE_URL}${APP_CONFIG.API.AUTH_URL}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ username, password })
        });
      }

      if (!response.ok) {
        throw new Error(`Login failed: ${response.status}`);
      }

      // Expect JSON response with { token }
      const data = await response.json();
      const token = data.token || data;

      localStorage.setItem(AUTH_TOKEN, token);
      return { success: true };
      
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: error.message 
      };
    }
  }

  function isAuthenticated() {
    return !!getToken();
  }

  function getToken() {
    return localStorage.getItem(AUTH_TOKEN);
  }

  function logout() {
    localStorage.removeItem(AUTH_TOKEN);
  }

  return {
    login,
    isAuthenticated,
    getToken,
    logout
  };
})();
