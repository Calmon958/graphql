/**
 * Application Configuration
 */
const APP_CONFIG = {
  // API endpoints
  API: {
    DOMAIN: "learn.zone01kisumu.ke",
    BASE_URL: "/api",
    AUTH_URL: "/api/login",  // Try a different endpoint
    GRAPHQL_URL: "/api/graphql-engine/v1/graphql",
  },
  
  // Local storage keys
  STORAGE: {
    AUTH_TOKEN: "user_jwt_token",
    USER_THEME: "user_theme",
  },
  
  // Navigation sections
  SECTIONS: ["dashboard", "profile", "statistics"],
  
  // Debounce delay for search inputs (in milliseconds)
  DEBOUNCE_DELAY: 300,
  
  // Chart colors that match theme variables
  CHART_COLORS: [
    "#50B498",
    "#468585",
    "#9CDBA6",
    "#DEF9C4",
    "#E87A7A",
  ],
};
