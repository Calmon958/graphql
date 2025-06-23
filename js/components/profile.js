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
      const errorCard = document.createElement('div');
      errorCard.className = 'card alert alert-error';
      errorCard.textContent = 'No profile data available';
      profileDisplay.appendChild(errorCard);
      return;
    }
    
    const user = data.user[0];
    
    // Create profile card
    const card = document.createElement('div');
    card.className = 'card';
    
    // Card header with user info
    const cardHeader = document.createElement('div');
    cardHeader.className = 'card-header';
    
    const userInfo = document.createElement('div');
    userInfo.className = 'user-info';
    
    const username = document.createElement('h3');
    username.className = 'text-primary mb-2';
    username.textContent = user.login || 'Unknown User';
    
    const userId = document.createElement('span');
    userId.className = 'badge badge-secondary';
    userId.textContent = `ID: ${user.id || 'N/A'}`;
    
    cardHeader.appendChild(username);
    cardHeader.appendChild(userId);
    card.appendChild(cardHeader);
    
    // Card content
    const cardContent = document.createElement('div');
    cardContent.className = 'card-content';
    
    // User details section
    const detailsSection = document.createElement('div');
    detailsSection.className = 'mb-4';
    
    if (user.email) {
      const email = document.createElement('div');
      email.className = 'form-group mb-2';
      email.innerHTML = `<label class="form-label">Email</label><div class="form-control">${user.email}</div>`;
      detailsSection.appendChild(email);
    }
    
    // Audit ratio display
    const auditRatio = document.createElement('div');
    auditRatio.className = 'form-group';
    auditRatio.innerHTML = `<label class="form-label">Audit Ratio</label><div class="form-control">${user.auditRatio ? user.auditRatio.toFixed(1) : 'N/A'}</div>`;
    detailsSection.appendChild(auditRatio);
    
    cardContent.appendChild(detailsSection);
    
    // Stats section
    if (user.stats) {
      const statsSection = document.createElement('div');
      statsSection.className = 'card bg-light';
      
      const statsHeader = document.createElement('div');
      statsHeader.className = 'card-header';
      statsHeader.innerHTML = '<h3 class="text-secondary">Statistics</h3>';
      statsSection.appendChild(statsHeader);
      
      const statsContent = document.createElement('div');
      statsContent.className = 'card-content';
      
      // Create stats grid
      const statsGrid = document.createElement('div');
      statsGrid.className = 'dashboard-grid';
      
      // XP Progress
      if (user.stats.totalXP) {
        const xpCard = document.createElement('div');
        xpCard.className = 'card';
        xpCard.innerHTML = `
          <div class="card-content text-center">
            <h4 class="text-primary mb-2">Total XP</h4>
            <span class="badge badge-primary">${user.stats.totalXP}</span>
          </div>
        `;
        statsGrid.appendChild(xpCard);
      }
      
      // Level Progress
      if (user.stats.level) {
        const levelCard = document.createElement('div');
        levelCard.className = 'card';
        levelCard.innerHTML = `
          <div class="card-content text-center">
            <h4 class="text-primary mb-2">Level</h4>
            <span class="badge badge-primary">${user.stats.level}</span>
          </div>
        `;
        statsGrid.appendChild(levelCard);
      }
      
      statsContent.appendChild(statsGrid);
      statsSection.appendChild(statsContent);
      cardContent.appendChild(statsSection);
    }
    
    card.appendChild(cardContent);
    profileDisplay.appendChild(card);
  }
  
  // Public API
  return {
    init,
    displayProfile,
    updateProfileDisplay,
    updateUserOverview
  };
})();


