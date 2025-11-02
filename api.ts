import axios from 'axios';

const API_BASE_URL = 'http://localhost:3002/api';  // Changed to 3002

const api = axios.create({
  baseURL: API_BASE_URL,
});

// ... rest of the file remains the same
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  register: (userData: any) => api.post('/auth/register', userData),
  login: (credentials: any) => api.post('/auth/login', credentials),
};

export const sweetsAPI = {
  getAll: () => api.get('/sweets'),
  search: (params: any) => api.get('/sweets/search', { params }),
  add: (sweetData: any) => api.post('/sweets', sweetData),
};

export const inventoryAPI = {
  purchase: (id: number, quantity: number) => 
    api.post(`/inventory/${id}/purchase`, { quantity }),
  restock: (id: number, quantity: number) => 
    api.post(`/inventory/${id}/restock`, { quantity }),
};

export default api;
