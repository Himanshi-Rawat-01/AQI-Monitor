const API_BASE_URL = ''; // Use relative paths for Vercel

const CONFIG = {
  API_BASE_URL,
  API_ENDPOINTS: {
    AUTH: {
      LOGIN: `${API_BASE_URL}/api/login`,
      REGISTER: `${API_BASE_URL}/api/register`,
      TEST: `${API_BASE_URL}/api/test`,
    },
    AQI: {
      GET: `${API_BASE_URL}/api/aqi`,
      PREDICT: `${API_BASE_URL}/api/predict`,
      GENERATE_HISTORY: `${API_BASE_URL}/api/generate-history`,
    },
    CHARTS: {
      TREND: `${API_BASE_URL}/api/chart/trend`,
      BREAKDOWN: `${API_BASE_URL}/api/chart/breakdown`,
      RISK: `${API_BASE_URL}/api/chart/risk`,
    },
    HEALTH: `${API_BASE_URL}/api/health`,
  },
  STORAGE_KEYS: {
    TOKEN: 'aqi_token',
    USER: 'aqi_user',
    MOTION_PREFERENCE: 'prefers_reduced_motion',
  },
  DASHBOARD_URL: (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'))
    ? 'http://127.0.0.1:5001/dashboard'
    : '/dashboard',
};

export default CONFIG;
