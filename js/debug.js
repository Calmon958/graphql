/**
 * Debug helper functions
 */
document.addEventListener('DOMContentLoaded', function() {
  console.log('Debug script loaded');
  
  // Check if navbar.js is loaded
  if (typeof Navigation !== 'undefined') {
    console.log('Navigation module is loaded');
  } else {
    console.error('Navigation module is not loaded - check if navbar.js is included correctly');
  }
  
  // Check if Charts module is loaded
  if (typeof Charts !== 'undefined') {
    console.log('Charts module is loaded');
  } else {
    console.error('Charts module is not loaded - check if charts.js is included correctly');
    
    // List all script elements to help debug
    const scripts = document.querySelectorAll('script');
    console.log('Loaded scripts:', Array.from(scripts).map(s => s.src));
  }
  
  // Check if logout button exists
  const logoutButton = document.getElementById('logout-button');
  if (logoutButton) {
    console.log('Logout button found:', logoutButton);
    
    // Add a test event listener
    logoutButton.addEventListener('click', function() {
      console.log('Logout button clicked (debug listener)');
      // Try to call logout directly
      if (typeof Auth !== 'undefined') {
        Auth.logout();
      } else {
        console.error('Auth module not found');
      }
    });
  } else {
    console.error('Logout button not found in DOM');
  }
});
