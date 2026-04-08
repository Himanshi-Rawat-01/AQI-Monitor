/**
 * AQI Monitor - Configuration
 * Centralized API endpoint configuration
 */

// Detect the environment and set the base API URL
let API_BASE_URL = 'http://localhost:5000';

// If running in production (domain is not localhost)
if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    // For production deployment, adjust this based on your server setup
    API_BASE_URL = `${window.location.protocol}//${window.location.hostname}:5000`;
}

// Environment-specific configurations
const CONFIG = {
    API_BASE_URL: API_BASE_URL,
    API_ENDPOINTS: {
        AUTH: {
            LOGIN: `${API_BASE_URL}/api/login`,
            REGISTER: `${API_BASE_URL}/api/register`,
            TEST: `${API_BASE_URL}/api/test`
        },
        AQI: {
            GET: `${API_BASE_URL}/api/aqi`,
            PREDICT: `${API_BASE_URL}/api/predict`,
            GENERATE_HISTORY: `${API_BASE_URL}/api/generate-history`
        },
        CHARTS: {
            TREND: `${API_BASE_URL}/api/chart/trend`,
            BREAKDOWN: `${API_BASE_URL}/api/chart/breakdown`,
            RISK: `${API_BASE_URL}/api/chart/risk`
        },
        HEALTH: `${API_BASE_URL}/api/health`
    },
    STORAGE_KEYS: {
        TOKEN: 'aqi_token',
        USER: 'aqi_user',
        MOTION_PREFERENCE: 'prefers_reduced_motion'
    },
    TIMEOUTS: {
        SHORT: 5000,      // 5 seconds for quick requests
        NORMAL: 15000,    // 15 seconds for API calls
        LONG: 30000       // 30 seconds for data generation
    },
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000
};

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}
