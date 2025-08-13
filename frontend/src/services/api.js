import axios from 'axios';
import toast from 'react-hot-toast';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
// Update the response interceptor to handle token expiration better
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data);
    
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem('token');
      // Don't show error toast for 401s during login attempts
      if (!error.config.url.includes('/auth/login')) {
        window.location.href = '/login';
      }
    } else {
      const message = error.response?.data?.message || 'An error occurred';
      // Only show toast for non-auth errors
      if (!error.config.url.includes('/auth/')) {
        toast.error(message);
      }
    }
    
    return Promise.reject(error);
  }
);


// Auth API
export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (userData) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/profile')
};

// Drivers API
export const driversAPI = {
  getAll: (params = {}) => api.get('/drivers', { params }),
  getById: (id) => api.get(`/drivers/${id}`),
  create: (data) => api.post('/drivers', data),
  update: (id, data) => api.put(`/drivers/${id}`, data),
  delete: (id) => api.delete(`/drivers/${id}`)
};

// Routes API
export const routesAPI = {
  getAll: (params = {}) => api.get('/routes', { params }),
  getById: (id) => api.get(`/routes/${id}`),
  create: (data) => api.post('/routes', data),
  update: (id, data) => api.put(`/routes/${id}`, data),
  delete: (id) => api.delete(`/routes/${id}`)
};

// Orders API
export const ordersAPI = {
  getAll: (params = {}) => api.get('/orders', { params }),
  getById: (id) => api.get(`/orders/${id}`),
  create: (data) => api.post('/orders', data),
  update: (id, data) => api.put(`/orders/${id}`, data),
  delete: (id) => api.delete(`/orders/${id}`)
};

// Simulation API
export const simulationAPI = {
  run: (data) => api.post('/simulation/run', data),
  getHistory: (limit = 10) => api.get('/simulation/history', { params: { limit } }),
  getById: (id) => api.get(`/simulation/${id}`)
};

export default api;
