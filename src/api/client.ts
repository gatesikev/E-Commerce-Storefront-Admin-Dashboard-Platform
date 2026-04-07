import axios from 'axios';
import type { AuthResponse, Category, Product, ProductFormData, User } from '../types';

const BASE_URL = 'https://api.escuelajs.co/api/v1';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

apiClient.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;
    if (err.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        const { data } = await axios.post<AuthResponse>(`${BASE_URL}/auth/refresh-token`, {
          refreshToken,
        });
        localStorage.setItem('access_token', data.access_token);
        original.headers.Authorization = `Bearer ${data.access_token}`;
        return apiClient(original);
      } catch {
        localStorage.clear();
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

export const authApi = {
  login: (email: string, password: string) =>
    apiClient.post<AuthResponse>('/auth/login', { email, password }),
  getProfile: () => apiClient.get<User>('/auth/profile'),
};

export const usersApi = {
  register: (name: string, email: string, password: string) =>
    apiClient.post<User>('/users/', {
      name, email, password,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
    }),
};

export const productsApi = {
  getAll: (params?: { limit?: number; offset?: number; categoryId?: number }) =>
    apiClient.get<Product[]>('/products', { params }),
  getById: (id: number) => apiClient.get<Product>(`/products/${id}`),
  create: (data: ProductFormData) => apiClient.post<Product>('/products', data),
  update: (id: number, data: Partial<ProductFormData>) =>
    apiClient.put<Product>(`/products/${id}`, data),
  delete: (id: number) => apiClient.delete(`/products/${id}`),
};

export const categoriesApi = {
  getAll: () => apiClient.get<Category[]>('/categories'),
  create: (name: string, image: string) =>
    apiClient.post<Category>('/categories', { name, image }),
  update: (id: number, data: Partial<{ name: string; image: string }>) =>
    apiClient.patch<Category>(`/categories/${id}`, data),
  delete: (id: number) => apiClient.delete(`/categories/${id}`),
};