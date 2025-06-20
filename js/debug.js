/**
 * Debug helper functions
 */
document.addEventListener('DOMContentLoaded', function() {
  console.log('Debug script loaded');
  
  // Check if all required modules are loaded
  const requiredModules = [
    { name: 'APP_CONFIG', variable: APP_CONFIG },
    { name: 'Auth', variable: Auth },
    { name: 'GraphQL', variable: GraphQL },
    { name: 'ThemeManager', variable: ThemeManager },
    { name: 'Navigation', variable: Navigation },
    { name: 'Sidebar', variable: Sidebar },
    { name: 'Profile', variable: Profile },
    { name: 'Charts', variable: Charts }
  ];
  
  console.log('Checking required modules:');
  requiredModules.forEach(module => {
    if (typeof module.variable !== 'undefined') {
      console.log(`✅ ${module.name} is loaded`);
    } else {
      console.error(`❌ ${module.name} is not loaded`);
    }
  });
  
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
  
  // Add a debug panel
  const debugPanel = document.createElement('div');
  debugPanel.style.position = 'fixed';
  debugPanel.style.bottom = '10px';
  debugPanel.style.right = '10px';
  debugPanel.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
  debugPanel.style.color = 'white';
  debugPanel.style.padding = '10px';
  debugPanel.style.borderRadius = '5px';
  debugPanel.style.zIndex = '9999';
  debugPanel.style.fontSize = '12px';
  debugPanel.style.maxWidth = '300px';
  debugPanel.style.maxHeight = '200px';
  debugPanel.style.overflow = 'auto';
  
  // Add debug buttons
  const reloadButton = document.createElement('button');
  reloadButton.textContent = 'Reload Page';
  reloadButton.style.marginRight = '5px';
  reloadButton.addEventListener('click', () => window.location.reload());
  
  const clearStorageButton = document.createElement('button');
  clearStorageButton.textContent = 'Clear Storage';
  clearStorageButton.addEventListener('click', () => {
    localStorage.clear();
    alert('Local storage cleared. Reloading page...');
    window.location.reload();
  });
  
  debugPanel.appendChild(reloadButton);
  debugPanel.appendChild(clearStorageButton);
  
  // Add debug info
  const debugInfo = document.createElement('div');
  debugInfo.style.marginTop = '10px';
  debugInfo.innerHTML = `
    <p>Auth: ${typeof Auth !== 'undefined' ? '✅' : '❌'}</p>
    <p>GraphQL: ${typeof GraphQL !== 'undefined' ? '✅' : '❌'}</p>
    <p>Token: ${Auth && Auth.getToken() ? '✅' : '❌'}</p>
  `;
  
  debugPanel.appendChild(debugInfo);
  document.body.appendChild(debugPanel);
});
