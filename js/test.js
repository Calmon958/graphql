/**
 * Test script to verify modules are loaded correctly
 */
document.addEventListener('DOMContentLoaded', function() {
  console.log('Test script loaded');
  console.log('Running in ' + (isDevelopment ? 'DEVELOPMENT' : 'PRODUCTION') + ' mode');
  
  // Check if config is loaded
  if (typeof APP_CONFIG !== 'undefined') {
    console.log('APP_CONFIG is loaded:', APP_CONFIG);
  } else {
    console.error('APP_CONFIG is not defined');
  }
  
  // Check if GraphQL module is loaded
  if (typeof GraphQL !== 'undefined') {
    console.log('GraphQL module is loaded');
    
    // Only test GraphQL if we have a valid token
    const token = Auth.getToken();
    if (token && token.split('.').length === 3) {
      console.log('Valid token found, testing GraphQL request');
      GraphQL.fetchBasicUserInfo(token)
        .then(result => {
          console.log('GraphQL test result:', result);
        })
        .catch(error => {
          console.error('GraphQL test error:', error);
        });
    } else {
      console.log('No valid token found, skipping GraphQL test');
    }
  } else {
    console.error('GraphQL module is not defined');
  }
  
  // Check if Auth module is loaded
  if (typeof Auth !== 'undefined') {
    console.log('Auth module is loaded');
    console.log('User is authenticated:', Auth.isAuthenticated());
  } else {
    console.error('Auth module is not defined');
  }
  
  // Check if Navigation module is loaded
  if (typeof Navigation !== 'undefined') {
    console.log('Navigation module is loaded');
    console.log('setupUserAvatar function exists:', typeof Navigation.setupUserAvatar === 'function');
  } else {
    console.error('Navigation module is not defined');
  }
});
