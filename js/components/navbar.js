/**
 * Navigation Component
 */
const Navigation = (function() {
    let activeSection = 'dashboard';
    
    /**
     * Initialize navigation
     */
    function init() {
      setupEventListeners();
      setupAppLogo();
      setupUserAvatar();
    }
    
    /**
     * Setup event listeners for navigation elements
     */
    function setupEventListeners() {
      // Theme toggle button
      const themeToggle = document.getElementById('theme-toggle');
      if (themeToggle) {
        themeToggle.addEventListener('click', ThemeManager.toggleTheme);
      }
      
      // Logout button
      const logoutButton = document.getElementById('logout-button');
      if (logoutButton) {
        logoutButton.addEventListener('click', Auth.logout);
      }
      
      // Navigation links
      const navLinks = document.querySelectorAll('.nav-link');
      navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          const section = link.getAttribute('data-section');
          changeSection(section);
        });
      });
    }
    
    /**
     * Change the active section
     * @param {string} sectionId - ID of the section to activate
     */
    function changeSection(sectionId) {
      if (!APP_CONFIG.SECTIONS.includes(sectionId)) {
        console.error(`Section "${sectionId}" is not valid`);
        return;
      }
      
      // Update active section
      activeSection = sectionId;
      
      // Update navigation links
      const navLinks = document.querySelectorAll('.nav-link');
      navLinks.forEach(link => {
        const linkSection = link.getAttribute('data-section');
        if (linkSection === sectionId) {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      });
      
      // Update visible section
      const sections = document.querySelectorAll('.content-section');
      sections.forEach(section => {
        if (section.id === `${sectionId}-section`) {
          section.classList.add('active');
        } else {
          section.classList.remove('active');
        }
      });
    }
    
    /**
     * Setup application logo and header text
     * @param {Object} userData - Optional user data for personalization
     */
    function setupAppLogo(userData) {
      const appLogo = document.getElementById('app-logo');
      const loginLogo = document.getElementById('login-logo');
      const headerTitle = document.querySelector('.nav-left h1');
      
      if (appLogo) {
        appLogo.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`;
      }
      
      if (loginLogo) {
        loginLogo.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`;
      }
      
      // Update header title with personalized greeting if user data is available
      if (headerTitle && userData && userData[0] && userData[0].login) {
        headerTitle.textContent = `Hello, ${userData[0].login}`;
      }
    }
    
    /**
     * Setup user avatar with initials
     * @param {Object} userData - User data from GraphQL
     */
    function setupUserAvatar(userData) {
      const userAvatar = document.getElementById('user-avatar');
      const headerTitle = document.querySelector('.nav-left h1');
      
      if (userAvatar) {
        if (userData && userData[0] && userData[0].login) {
          // Get first letter of login/username
          const initial = userData[0].login.charAt(0).toUpperCase();
          userAvatar.textContent = initial;
        }
      }
      
      // Update header title with personalized greeting
      if (headerTitle && userData && userData[0] && userData[0].login) {
        headerTitle.textContent = `Hello, ${userData[0].login}`;
      }
    }
    
    /**
     * Get the currently active section
     * @return {string} Active section ID
     */
    function getActiveSection() {
      return activeSection;
    }
    
    // Public API
    return {
      init,
      changeSection,
      getActiveSection,
      setupUserAvatar,
      setupAppLogo
    };
  })();
