// API Configuration
export const API_CONFIG = {
  baseURL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api/v1',
  timeout: parseInt(process.env.EXPO_PUBLIC_API_TIMEOUT || '10000', 10),
  headers: {
    'Content-Type': 'application/json',
  },
};

export const API_ENDPOINTS = {
  auth: {
    register: '/auth/register',
    login: '/auth/login',
  },
  users: {
    list: '/users',
    getById: (id: number) => `/users/${id}`,
    create: '/users',
    update: (id: number) => `/users/${id}`,
    delete: (id: number) => `/users/${id}`,
  },
}; 