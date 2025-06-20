/**
 * Theme Manager Module
 */
const ThemeManager = (function() {
  const { USER_THEME } = APP_CONFIG.STORAGE;
  const { DEFAULT_THEME } = APP_CONFIG;
  
  /**
   * Get the current theme
   * @return {string} Current theme ('light' or 'dark')
   */
  function getCurrentTheme() {
    return localStorage.getItem(USER_THEME) || DEFAULT_THEME;
  }
  
  /**
   * Apply theme to document
   * @param {string} theme - Theme to apply ('light' or 'dark')
   */
  function applyTheme(theme) {
    document.body.classList.remove('light-theme', 'dark-theme');
    document.body.classList.add(`${theme}-theme`);
    localStorage.setItem(USER_THEME, theme);
    
    console.log(`Theme applied: ${theme}`);
  }
  
  /**
   * Toggle between light and dark themes
   */
  function toggleTheme() {
    const currentTheme = getCurrentTheme();
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    applyTheme(newTheme);
    
    console.log(`Theme toggled from ${currentTheme} to ${newTheme}`);
  }
  
  /**
   * Initialize theme based on user preference or system preference
   */
  function initTheme() {
    const savedTheme = localStorage.getItem(USER_THEME);
    
    if (savedTheme) {
      applyTheme(savedTheme);
    } else {
      // Check if user prefers dark mode
      const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const initialTheme = prefersDarkMode ? 'dark' : 'light';
      applyTheme(initialTheme);
    }
    
    // Add event listener to theme toggle button
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
      themeToggle.addEventListener('click', toggleTheme);
    }
    
    console.log('Theme initialized:', getCurrentTheme());
  }
  
  // Public API
  return {
    initTheme,
    toggleTheme,
    getCurrentTheme,
    applyTheme
  };
})();
