/**
 * GraphQL Client Module
 */
const GraphQL = (function() {
  const { GRAPHQL_URL } = APP_CONFIG.API;
  
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
      
      // Check if we're in test mode
      if (token === 'test-token-123') {
        console.log('Using test mode for GraphQL execution');
        
        // Check if this is a basic user info query
        if (query.includes('user {') && query.includes('id') && query.includes('login')) {
          return {
            success: true,
            data: {
              user: [{
                id: 'test-user-id',
                login: localStorage.getItem('user_username') || 'testuser'
              }]
            }
          };
        }
        
        // Check if this is an update user attributes mutation
        if (query.includes('mutation UpdateUserAttrs') && query.includes('updateUser')) {
          const attrs = variables.attrs || {};
          return {
            success: true,
            data: {
              updateUser: {
                id: 'test-user-id',
                attrs: attrs
              }
            }
          };
        }
        
        // Default test response
        return {
          success: true,
          data: {
            result: 'Test mode response'
          }
        };
      }
      
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
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`GraphQL request failed: ${errorText}`);
      }
      
      const data = await response.json();
      console.log('GraphQL response:', data);
      if (data.errors) {
        throw new Error(data.errors[0].message || 'GraphQL query returned errors');
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
   * Fetch user profile data from GraphQL API
   * @param {string} token - Authentication token
   * @return {Promise<Object>} GraphQL query result
   */
  async function fetchUserProfile(token) {
    try {
      console.log('Fetching user profile data...');
      
      // Check if we're in test mode (using our test token)
      if (token === 'test-token-123') {
        console.log('Using test mode for user profile data');
        return getMockUserData();
      }
      
      // If not in test mode, use the real GraphQL API
      const query = `
        query {
          user {
            id
            login
            attrs
            auditRatio
            totalUp
            totalDown
            transactions(order_by: {createdAt: desc}, limit: 10) {
              id
              type
              amount
              createdAt
              path
            }
            progresses(order_by: {createdAt: desc}, limit: 15) {
              id
              objectId
              grade
              createdAt
              path
            }
            audits(where: {grade: {_is_null: true}}, limit: 5) {
              id
              grade
              group {
                id
                path
                captainLogin
                members {
                  id
                  login
                }
              }
              private
              createdAt
              updatedAt
              closedAt
            }
          }
        }
      `;
      
      // Make the GraphQL request
      const response = await fetch(GRAPHQL_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ query })
      });
      
      if (!response.ok) {
        throw new Error(`GraphQL request failed with status ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.errors) {
        throw new Error(result.errors[0].message || 'GraphQL query returned errors');
      }
      
      console.log('GraphQL data received:', result.data);
      
      return { 
        success: true, 
        data: result.data 
      };
    } catch (error) {
      console.error('GraphQL fetch error:', error);
      
      // If we get an error, fall back to mock data in development
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        console.log('Falling back to mock data due to GraphQL error');
        return getMockUserData();
      }
      
      return { 
        success: false, 
        error: error.message 
      };
    }
  }

  /**
   * Get mock user data for testing
   * @return {Object} Mock user data
   */
  function getMockUserData() {
    return {
      success: true,
      data: {
        user: [{
          id: 'test-user-id',
          login: localStorage.getItem('user_username') || 'testuser',
          attrs: {
            firstName: 'Test',
            lastName: 'User',
            email: 'test@example.com',
            country: 'Kenya',
            phone: '+254123456789',
            gender: 'Other',
            'ID.NUMBER': 'TEST12345',
            bio: 'This is a test user profile for development purposes.'
          },
          auditRatio: 1.5,
          totalUp: 25,
          totalDown: 15,
          transactions: [
            {
              id: 'tx1',
              type: 'xp',
              amount: 50000,
              createdAt: new Date(Date.now() - 86400000).toISOString(),
              path: '/project/test-project-1'
            },
            {
              id: 'tx2',
              type: 'xp',
              amount: 75000,
              createdAt: new Date(Date.now() - 172800000).toISOString(),
              path: '/project/test-project-2'
            },
            {
              id: 'tx3',
              type: 'xp',
              amount: 120000,
              createdAt: new Date(Date.now() - 259200000).toISOString(),
              path: '/project/test-project-3'
            }
          ],
          progresses: [
            {
              id: 'prog1',
              objectId: 'obj1',
              grade: 85,
              createdAt: new Date(Date.now() - 86400000).toISOString(),
              path: '/project/test-project-1'
            },
            {
              id: 'prog2',
              objectId: 'obj2',
              grade: 92,
              createdAt: new Date(Date.now() - 172800000).toISOString(),
              path: '/project/test-project-2'
            },
            {
              id: 'prog3',
              objectId: 'obj3',
              grade: 78,
              createdAt: new Date(Date.now() - 259200000).toISOString(),
              path: '/project/test-project-3'
            },
            {
              id: 'prog4',
              objectId: 'obj4',
              grade: 88,
              createdAt: new Date(Date.now() - 345600000).toISOString(),
              path: '/project/test-project-4'
            }
          ],
          audits: [
            {
              id: 'audit1',
              grade: null,
              group: {
                id: 'group1',
                path: '/project/test-audit-1',
                captainLogin: 'captain1',
                members: [
                  { id: 'member1', login: 'member1' },
                  { id: 'member2', login: 'member2' }
                ]
              },
              private: { code: 'ABC123' },
              createdAt: new Date(Date.now() - 86400000).toISOString(),
              updatedAt: new Date(Date.now() - 43200000).toISOString(),
              closedAt: null
            }
          ]
        }]
      }
    };
  }
  
  /**
   * Fetch basic user info
   * @param {string} token - JWT token
   * @return {Promise} - Promise resolving to basic user info
   */
  function fetchBasicUserInfo(token) {
    // Check if we're in test mode
    if (token === 'test-token-123') {
      console.log('Using test mode for basic user info');
      return Promise.resolve({
        success: true,
        data: {
          user: [{
            id: 'test-user-id',
            login: localStorage.getItem('user_username') || 'testuser'
          }]
        }
      });
    }
    
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
  
  // Public API
  return {
    execute,
    fetchUserProfile,
    fetchBasicUserInfo,
    updateUserAttributes
  };
})();
