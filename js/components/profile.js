/**
 * Profile Component
 */
const Profile = (function() {
  // Store user data
  let userData = null;
  
  /**
   * Initialize profile component
   */
  function init() {
    console.log('Profile component initialized');
  }
  
  /**
   * Display profile data
   * @param {Object} data - User data from GraphQL
   */
  function displayProfile(data) {
    console.log('Displaying profile data:', data);
    userData = data;
    
    // Update user overview
    updateUserOverview(data);
    
    // Update profile display
    updateProfileDisplay(data);
  }
  
  /**
   * Update user overview display
   * @param {Object} data - User data
   */
  function updateUserOverview(data) {
    const overviewEl = document.getElementById('user-overview');
    if (!overviewEl) return;
    
    // Clear loading text
    overviewEl.innerHTML = '';
    
    if (!data.user || !data.user[0]) {
      overviewEl.textContent = 'No user data available';
      return;
    }
    
    const user = data.user[0];
    
    // Create overview content
    const content = document.createElement('div');
    
    // Login info
    const loginInfo = document.createElement('p');
    loginInfo.innerHTML = `<strong>Username:</strong> ${user.login || 'N/A'}`;
    content.appendChild(loginInfo);
    
    // User ID
    const userId = document.createElement('p');
    userId.innerHTML = `<strong>User ID:</strong> ${user.id || 'N/A'}`;
    content.appendChild(userId);
    
    // Audit ratio if available
    if (user.auditRatio !== undefined) {
      const auditRatio = document.createElement('p');
      auditRatio.innerHTML = `<strong>Audit Ratio:</strong> ${user.auditRatio ? user.auditRatio.toFixed(1) : 'N/A'}`;
      content.appendChild(auditRatio);
    }
    
    overviewEl.appendChild(content);
  }
  
  /**
   * Update profile display
   * @param {Object} data - User data
   */
  function updateProfileDisplay(data) {
    const profileDisplay = document.getElementById('profile-display');
    if (!profileDisplay) return;
    
    // Clear loading text
    profileDisplay.innerHTML = '';
    
    if (!data.user || !data.user[0]) {
      profileDisplay.textContent = 'No profile data available';
      return;
    }
    
    const user = data.user[0];
    
    // Create profile display
    const content = document.createElement('div');
    content.className = 'profile-info';
    
    // User info
    const userInfo = document.createElement('div');
    userInfo.className = 'user-info';
    
    // Username
    const username = document.createElement('h3');
    username.textContent = user.login || 'Unknown User';
    userInfo.appendChild(username);
    
    // User ID
    const userId = document.createElement('p');
    userId.innerHTML = `<strong>ID:</strong> ${user.id || 'N/A'}`;
    userInfo.appendChild(userId);
    
    // User attributes if available
    if (user.attrs) {
      const attrs = user.attrs;
      
      if (attrs.firstName || attrs.lastName) {
        const name = document.createElement('p');
        name.innerHTML = `<strong>Name:</strong> ${attrs.firstName || ''} ${attrs.lastName || ''}`;
        userInfo.appendChild(name);
      }
      
      if (attrs.email) {
        const email = document.createElement('p');
        email.innerHTML = `<strong>Email:</strong> ${attrs.email}`;
        userInfo.appendChild(email);
      }
    }
    
    content.appendChild(userInfo);
    profileDisplay.appendChild(content);
  }
  
  // Public API
  return {
    init,
    displayProfile,
    updateProfileDisplay,
    updateUserOverview
  };
})();
