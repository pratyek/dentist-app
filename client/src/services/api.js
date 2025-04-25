// client/src/services/api.js
import axios from 'axios';

// Base URL for API endpoints
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3002';

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_URL,
});

// Add request interceptor to include token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['x-auth-token'] = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle network errors
    if (!error.response) {
      console.error('Network Error:', error.message);
      // You can dispatch to a global error handler here
    }
    
    // Handle 401 Unauthorized errors
    if (error.response && error.response.status === 401) {
      // Clear token if it's an authentication error
      localStorage.removeItem('token');
      // Redirect to login (can be done through a global state manager)
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

// Export the configured axios instance
export default api;
