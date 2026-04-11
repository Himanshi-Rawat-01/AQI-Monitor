const API_BASE_URL = import.meta.env.PROD
  ? `${window.location.protocol}//${window.location.hostname}:5000`
  : '';  // Vite proxy handles /api in dev

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
  DASHBOARD_URL: '/frontend/dashboard.html',
};

export default CONFIG;
