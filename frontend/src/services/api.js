import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 15000
});

// Attach token from localStorage on every request if not already set
api.interceptors.request.use(config => {
  if (!config.headers['Authorization']) {
    const token = localStorage.getItem('busconnect_token');
    if (token) config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('busconnect_token');
      if (!window.location.pathname.includes('/login') && !window.location.pathname === '/') {
        window.location.href = '/';
      }
    }
    return Promise.reject(err);
  }
);

export default api;
