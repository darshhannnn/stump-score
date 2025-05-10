// Frontend configuration
const config = {
    // API Configuration
    API: {
        BASE_URL: 'http://localhost:5000/api',
        ENDPOINTS: {
            MATCHES: '/matches',
            NEWS: '/news',
            AUTH: '/auth'
        }
    },

    // Application Settings
    APP: {
        THEME: 'light',  // Default theme: light/dark/system
        FONT_SIZE: 16,   // Default font size in pixels
        GRID_LAYOUT: false, // Default layout: grid/list
        COMPACT_MODE: false // Default mode: compact/normal
    },

    // Feature Flags
    FEATURES: {
        DARK_MODE: true,
        CUSTOMIZATION: true,
        NOTIFICATIONS: true,
        LIVE_UPDATES: true
    }
};

// Export configuration
export default config;
