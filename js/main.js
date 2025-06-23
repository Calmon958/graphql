/**
 * Main Application Module
 */
// Set to false to use the actual GraphQL API
const isDevelopment = false;

(function() {
  // Main application state
  let isInitialized = false;
  
  // Add loading state management:
  const LoadingManager = {
    show() {
      const overlay = document.getElementById('loading-overlay');
      if (overlay) overlay.classList.remove('hidden');
    },
    
    hide() {
      const overlay = document.getElementById('loading-overlay');
      if (overlay) overlay.classList.add('hidden');
    }
  };

  /**
   * Initialize the application
   */
  function init() {
    if (isInitialized) return;
    
    console.log('Initializing application in ' + (isDevelopment ? 'DEVELOPMENT' : 'PRODUCTION') + ' mode');
    
    // Initialize theme
    if (typeof ThemeManager !== 'undefined') {
      ThemeManager.initTheme();
    }
    
    // Check authentication state
    if (Auth.isAuthenticated()) {
      showMainApp();
      loadUserData();
    } else {
      showLoginPage();
    }
    
    // Setup login form
    setupLoginForm();
    
    // Setup logout button
    setupLogoutButton();
    
    isInitialized = true;
    console.log('Application initialized');
  }
  
  /**
   * Setup login form event handlers
   */
  function setupLoginForm() {
    const loginForm = document.getElementById('login-form');
    
    if (loginForm) {
      loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const errorEl = document.getElementById('login-error');
        const submitBtn = loginForm.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn ? submitBtn.textContent : 'Login';
        
        if (!username || !password) {
          if (errorEl) {
            errorEl.textContent = 'Please enter both username and password.';
            errorEl.style.display = 'block';
          }
          return;
        }
        
        // Show loading state
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.textContent = 'Logging in...';
        }
        
        // Hide previous error
        if (errorEl) {
          errorEl.style.display = 'none';
        }
        
        try {
          console.log('Attempting login with:', username);
          const result = await Auth.login(username, password);
          
          if (result.success) {
            console.log('Login successful, showing main app');
            showMainApp();
            loadUserData();
          } else {
            if (errorEl) {
              // Display the specific error message from the API
              errorEl.textContent = result.error || 'Login failed. Please check your credentials.';
              errorEl.style.display = 'block';
              console.error('Login failed:', result.error);
            }
          }
        } catch (error) {
          handleError(error, 'Login');
        } finally {
          // Restore button state
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = originalBtnText;
          }
        }
      });
    }
  }
  
  /**
   * Setup logout button
   */
  function setupLogoutButton() {
    const logoutBtn = document.getElementById('logout-button');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', function() {
        Auth.logout();
        showLoginPage();
      });
    }
  }
  
  /**
   * Show the main application UI
   */
  function showMainApp() {
    const loginPage = document.getElementById('login-page');
    const mainApp = document.getElementById('main-app');
    
    if (loginPage) {
      loginPage.classList.add('hidden');
    }
    
    if (mainApp) {
      mainApp.classList.remove('hidden');
    }
    
    // Initialize components
    if (typeof Navigation !== 'undefined') {
      Navigation.init();
    }
    
    if (typeof Sidebar !== 'undefined') {
      Sidebar.init();
    }
    
    if (typeof Profile !== 'undefined') {
      Profile.init();
    }
  }
  
  /**
   * Show the login page
   */
  function showLoginPage() {
    const loginPage = document.getElementById('login-page');
    const mainApp = document.getElementById('main-app');
    
    if (loginPage) {
      loginPage.classList.remove('hidden');
    }
    
    if (mainApp) {
      mainApp.classList.add('hidden');
    }
  }
  
  /**
   * Load user data from GraphQL API
   */
  async function loadUserData() {
    // Show loading overlay
    const loadingOverlay = document.getElementById('loading-overlay');
    if (loadingOverlay) {
      loadingOverlay.classList.remove('hidden');
    }
    
    try {
      const token = Auth.getToken();
      
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      // Check if token appears to be a valid JWT
      if (token.split('.').length !== 3) {
        console.error('Invalid JWT token format:', token);
        throw new Error('Invalid authentication token format');
      }
      
      // Check if GraphQL module is defined
      if (typeof GraphQL === 'undefined') {
        throw new Error('GraphQL module is not defined. Check if graphql.js is loaded correctly.');
      }
      
      console.log('Using token for GraphQL requests:', token);
      
      // First get basic user info to update UI quickly
      const basicInfoResult = await GraphQL.fetchBasicUserInfo(token);
      
      if (basicInfoResult.success && basicInfoResult.data && basicInfoResult.data.user) {
        // Update user avatar with basic info
        if (typeof Navigation !== 'undefined') {
          try {
            Navigation.setupUserAvatar(basicInfoResult.data.user[0]);
          } catch (e) {
            console.error('Error setting up user avatar:', e);
          }
        }
      } else {
        console.error('Failed to fetch basic user info:', basicInfoResult.error);
        if (basicInfoResult.error && basicInfoResult.error.includes('JWT')) {
          // If there's a JWT error, clear the token and show login page
          Auth.logout();
          showLoginPage();
          throw new Error('Authentication token is invalid. Please login again.');
        }
      }
      
      // Then fetch all user data
      const allDataResult = await GraphQL.fetchAllUserData(token);
      
      if (allDataResult.success && allDataResult.data) {
        // Update profile display
        if (typeof Profile !== 'undefined') {
          try {
            Profile.displayProfile(allDataResult.data);
          } catch (e) {
            console.error('Error displaying profile:', e);
          }
        }
      } else {
        console.error('Failed to fetch user data:', allDataResult.error);
        // Show error message
        const errorEl = document.createElement('div');
        errorEl.className = 'error-message';
        errorEl.textContent = 'Failed to load user data: ' + (allDataResult.error || 'Unknown error');
        errorEl.style.display = 'block';
        document.body.appendChild(errorEl);
        
        // If there's a JWT error, clear the token and show login page
        if (allDataResult.error && allDataResult.error.includes('JWT')) {
          Auth.logout();
          showLoginPage();
        }
      }
    } catch (error) {
      handleError(error, 'Load User Data');
    } finally {
      // Hide loading overlay
      if (loadingOverlay) {
        loadingOverlay.classList.add('hidden');
      }
    }
  }
  
  /**
   * Handle errors and display appropriate messages
   */
  function handleError(error, context) {
    console.error(`Error in ${context}:`, error);
    
    // Check for authentication errors
    if (error.message?.includes('JWT') || error.message?.includes('token')) {
      Auth.logout();
      showLoginPage();
      showError('Your session has expired. Please login again.');
      return;
    }
    
    // Show error message to user
    showError(error.message || 'An unexpected error occurred');
  }

  /**
   * Show error message to the user
   */
  function showError(message) {
    const errorEl = document.getElementById('error-message');
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.style.display = 'block';
      
      // Auto-hide after 5 seconds
      setTimeout(() => {
        errorEl.style.display = 'none';
      }, 5000);
    }
  }
  
  // Initialize application when DOM is ready
  document.addEventListener('DOMContentLoaded', init);
})();
