/**
 * Main Application Module
 */
(function() {
  // Main application state
  let isInitialized = false;
  let isLoading = false;
  
  /**
   * Initialize the application
   */
  function init() {
    if (isInitialized) return;
    
    // Setup logout button directly
    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) {
      console.log('Setting up logout button in main.js');
      logoutButton.addEventListener('click', function(e) {
        e.preventDefault();
        console.log('Logout button clicked from main.js');
        Auth.logout();
      });
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
    
    isInitialized = true;
  }
  
  /**
   * Setup login form event handlers
   */
  function setupLoginForm() {
    const loginForm = document.getElementById('login-form');
    
    if (loginForm) {
      loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        const errorEl = document.getElementById('login-error');
        
        if (!username || !password) {
          if (errorEl) {
            errorEl.textContent = 'Please enter both username and password';
            errorEl.style.display = 'block';
          }
          return;
        }
        
        // Show loading overlay
        const loadingOverlay = document.getElementById('loading-overlay');
        if (loadingOverlay) {
          loadingOverlay.classList.remove('hidden');
        }
        
        try {
          console.log('Attempting login with credentials...');
          const result = await Auth.login(username, password);
          
          if (result.success) {
            console.log('Login successful, showing main app');
            showMainApp();
            loadUserData();
          } else {
            console.error('Login failed:', result.error);
            if (errorEl) {
              // Display a more user-friendly error message
              if (result.error && result.error.includes('HTML')) {
                errorEl.textContent = 'Authentication server error. Please try again later.';
              } else if (result.error && result.error.includes('endpoint')) {
                errorEl.textContent = 'Unable to connect to authentication server. Please try again later.';
              } else {
                errorEl.textContent = result.error || 'Login failed. Please check your credentials.';
              }
              errorEl.style.display = 'block';
            }
          }
        } catch (error) {
          console.error('Login error:', error);
          if (errorEl) {
            errorEl.textContent = 'An unexpected error occurred. Please try again.';
            errorEl.style.display = 'block';
          }
        } finally {
          // Hide loading overlay
          if (loadingOverlay) {
            loadingOverlay.classList.add('hidden');
          }
        }
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
    Navigation.init();
    Sidebar.init();
    Profile.init();
    
    // Update header with username if available
    const username = Auth.getUsername();
    if (username) {
      const headerTitle = document.querySelector('.nav-left h1');
      if (headerTitle) {
        headerTitle.textContent = `Hello, ${username}`;
      }
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
    if (isLoading) return;
    isLoading = true;
    
    // Show loading overlay
    const loadingOverlay = document.getElementById('loading-overlay');
    if (loadingOverlay) {
      loadingOverlay.classList.remove('hidden');
    }
    
    try {
      const token = Auth.getToken();
      
      if (!token) {
        console.error('No authentication token found');
        throw new Error('No authentication token found');
      }
      
      console.log('Fetching user profile data with token:', token);
      
      // Fetch user profile data
      const result = await GraphQL.fetchUserProfile(token);
      
      if (result.success && result.data) {
        console.log('User data fetched successfully:', result.data);
        
        // Update profile display
        if (result.data.user) {
          console.log('Updating profile with user data:', result.data.user);
          
          // Update header with username
          if (result.data.user[0] && result.data.user[0].login) {
            const headerTitle = document.querySelector('.nav-left h1');
            if (headerTitle) {
              headerTitle.textContent = `Hello, ${result.data.user[0].login}`;
              // Also update stored username
              localStorage.setItem('user_username', result.data.user[0].login);
            }
          }
          
          Profile.displayProfile(result.data);
        } else {
          console.error('No user data found in the response');
        }
        
        // Create XP chart
        if (result.data.transaction) {
          console.log('Updating XP chart with transaction data');
          Charts.createXPChart(result.data.transaction);
        }
      } else {
        console.error('Failed to load user data:', result.error);
        throw new Error(result.error || 'Failed to load user data');
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      
      // Check if the error is related to JWT validation
      if (error.message && (
        error.message.includes('JWT') || 
        error.message.includes('token') ||
        error.message.includes('authentication')
      )) {
        console.log('Authentication error detected, logging out...');
        // Clear any invalid tokens
        localStorage.removeItem(APP_CONFIG.STORAGE.AUTH_TOKEN);
        // Show login page
        showLoginPage();
        // Show friendly error message
        const errorEl = document.getElementById('login-error');
        if (errorEl) {
          errorEl.textContent = 'Your session has expired. Please log in again.';
          errorEl.style.display = 'block';
        }
      } else if (error.message && error.message.includes('404')) {
        // For 404 errors in test mode, use mock data
        console.log('GraphQL endpoint not found, using mock data...');
        const mockData = {
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
              }
            ]
          }]
        };
        
        // Update profile with mock data
        Profile.displayProfile({ user: mockData.user });
        
        // Update header with username
        const headerTitle = document.querySelector('.nav-left h1');
        if (headerTitle) {
          headerTitle.textContent = `Hello, ${mockData.user[0].login}`;
        }
      } else {
        // For other errors, show a generic message
        alert(`Error loading user data: ${error.message}`);
      }
    } finally {
      // Hide loading overlay
      if (loadingOverlay) {
        loadingOverlay.classList.add('hidden');
      }
      isLoading = false;
    }
  }
  
  // Initialize application when DOM is ready
  document.addEventListener('DOMContentLoaded', init);
})();
