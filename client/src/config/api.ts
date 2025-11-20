// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

export const API_URL = `${API_BASE_URL}/api`;

export const config = {
  apiUrl: API_URL,
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
};

console.log('🔧 API Configuration:', {
  baseUrl: API_BASE_URL,
  apiUrl: API_URL,
  environment: process.env.NODE_ENV
});

