/**
 * GraphQL Client Module
 */
const GraphQL = (function() {
  // Use the full URL for GraphQL endpoint
  const GRAPHQL_URL = APP_CONFIG.API.BASE_URL + APP_CONFIG.API.GRAPHQL_URL;
  
  /**
   * Execute a GraphQL query or mutation
   * @param {string} query - GraphQL query or mutation string
   * @param {Object} variables - Variables for the query (optional)
   * @param {string} token - JWT token for authentication
   * @return {Promise} - Promise resolving to query result
   */
  async function execute(query, variables = {}, token) {
    try {
      if (!token) {
        throw new Error('Authentication token is required');
      }
      
      console.log(`Making GraphQL request to: ${GRAPHQL_URL}`);
      
      const response = await fetch(GRAPHQL_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          query,
          variables
        })
      });
      
      // First check if we got a JSON response
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        // If not JSON, it's likely an HTML error page or other non-GraphQL response
        const errorText = await response.text();
        console.error('Non-JSON response received:', errorText.substring(0, 150) + '...');
        throw new Error('Invalid GraphQL endpoint or authentication issue');
      }
      
      const data = await response.json();
      console.log('GraphQL response:', data);
      
      if (data.errors) {
        // Check if it's a JWT error
        const errorMessage = data.errors[0].message || 'GraphQL query returned errors';
        if (errorMessage.includes('JWT') || errorMessage.includes('token')) {
          // Clear the invalid token
          localStorage.removeItem(APP_CONFIG.STORAGE.AUTH_TOKEN);
          console.error('JWT token error detected, token cleared');
        }
        throw new Error(errorMessage);
      }
      
      return { success: true, data: data.data };
    } catch (error) {
      console.error('GraphQL error:', error);
      return { 
        success: false, 
        error: error.message || 'An error occurred during the GraphQL operation' 
      };
    }
  }
  
  /**
   * Fetch user profile data
   * @param {string} token - JWT token
   * @return {Promise} - Promise resolving to user data
   */
  function fetchUserProfile(token) {
    const query = `
      query {
        user {
          id
          login
          email
          firstName
          lastName
          auditRatio
          totalUp
          totalDown
          createdAt
          profile {
            xps {
              amount
              path
              createdAt
            }
            audits {
              amount
              path
              createdAt
            }
          }
        }
      }
    `;
    
    return execute(query, {}, token);
  }
  
  /**
   * Fetch basic user info
   * @param {string} token - JWT token
   * @return {Promise} - Promise resolving to basic user info
   */
  function fetchBasicUserInfo(token) {
    const query = `
      query {
        user {
          id
          login
        }
      }
    `;
    
    return execute(query, {}, token);
  }
  
  /**
   * Update user attributes
   * @param {string} token - JWT token
   * @param {Object} attrs - User attributes to update
   * @return {Promise} - Promise resolving to update result
   */
  function updateUserAttributes(token, attrs) {
    const mutation = `
      mutation UpdateUserAttrs($attrs: json!) {
        updateUser(attrs: $attrs) {
          id
          attrs
        }
      }
    `;
    
    return execute(mutation, { attrs }, token);
  }
  
  /**
   * Fetch all user data
   * @param {string} token - JWT token
   * @return {Promise} - Promise resolving to all user data
   */
  function fetchAllUserData(token) {
    return fetchUserProfile(token);
  }
  
  // Public API
  return {
    execute,
    fetchUserProfile,
    fetchBasicUserInfo,
    updateUserAttributes,
    fetchAllUserData
  };
})();
