/**
 * Navigation Component
 */
const Navigation = (function() {
  /**
   * Initialize navigation component
   */
  function init() {
    console.log('Navigation component initialized');
    
    // Setup theme toggle
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle && typeof ThemeManager !== 'undefined') {
      themeToggle.addEventListener('click', ThemeManager.toggleTheme);
    }
  }
  
  /**
   * Setup user avatar with user data
   * @param {Object} userData - User data from GraphQL
   */
  function setupUserAvatar(userData) {
    const userAvatar = document.getElementById('user-avatar');
    
    if (userAvatar && userData) {
      // Get first letter of login/username
      const initial = userData.login ? userData.login.charAt(0).toUpperCase() : 'U';
      userAvatar.textContent = initial;
      
      // Set title attribute for hover tooltip
      userAvatar.title = userData.login || 'User';
      
      console.log('User avatar updated with:', userData.login);
    } else {
      console.warn('Could not update user avatar - element or data missing');
    }
  }
  
  // Public API
  return {
    init,
    setupUserAvatar
  };
})();
