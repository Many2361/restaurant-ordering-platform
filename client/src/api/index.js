import axios from 'axios';

// All API calls go through this base instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  headers: { 'Content-Type': 'application/json' },
});

// ---- MENU ----
export const getMenu     = ()   => api.get('/api/menu');
export const getFeatured = ()   => api.get('/api/menu/featured');

// ---- ORDERS ----
export const createPaymentIntent = (data) =>
  api.post('/api/orders/create-payment-intent', data);

export const placeOrder = (data) =>
  api.post('/api/orders', data);

export default api;