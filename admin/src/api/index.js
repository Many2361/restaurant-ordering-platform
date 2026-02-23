import axios from 'axios';

// Admin API instance — automatically attaches JWT token to every request
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  headers: { 'Content-Type': 'application/json' },
});

// Interceptor: inject the stored token before every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('towa_admin_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Interceptor: if token expired, redirect to login
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401 && err.response?.data?.expired) {
      localStorage.removeItem('towa_admin_token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ---- AUTH ----
export const login  = (data) => api.post('/api/auth/login', data);
export const getMe  = ()     => api.get('/api/auth/me');
export const logout = ()     => api.post('/api/auth/logout');

// ---- ORDERS ----
export const getOrders      = (params) => api.get('/api/orders', { params });
export const getOrderStats  = ()       => api.get('/api/orders/stats/summary');
export const updateStatus   = (id, status) =>
  api.patch(`/api/orders/${id}/status`, { status });

// ---- MENU ----
export const getAllMenu         = ()            => api.get('/api/menu/all');
export const toggleAvailability = (id, val)    =>
  api.patch(`/api/menu/${id}/availability`, { isAvailable: val });
export const updatePrice        = (id, price)  =>
  api.patch(`/api/menu/${id}/price`, { price });
export const addMenuItem        = (data)       => api.post('/api/menu', data);
export const deleteMenuItem     = (id)         => api.delete(`/api/menu/${id}`);

export default api;