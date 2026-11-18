import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { API_BASE_URL } from '../constants/config';

const TOKEN_KEY = 'bhojanseva_auth_token';

// Web localStorage fallback for SecureStore if web preview is opened
const storage = {
  async getItem(key) {
    if (Platform.OS === 'web') {
      try {
        return localStorage.getItem(key);
      } catch (e) {
        return null;
      }
    }
    return await SecureStore.getItemAsync(key);
  },
  async setItem(key, value) {
    if (Platform.OS === 'web') {
      try {
        localStorage.setItem(key, value);
      } catch (e) {}
      return;
    }
    await SecureStore.setItemAsync(key, value);
  },
  async removeItem(key) {
    if (Platform.OS === 'web') {
      try {
        localStorage.removeItem(key);
      } catch (e) {}
      return;
    }
    await SecureStore.deleteItemAsync(key);
  },
};

export const saveToken = async (token) => {
  await storage.setItem(TOKEN_KEY, token);
};

export const getToken = async () => {
  return await storage.getItem(TOKEN_KEY);
};

export const removeToken = async () => {
  await storage.removeItem(TOKEN_KEY);
};

// Create Axios Instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT Token
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (err) {
      console.warn('[API Interceptor] Failed to attach token:', err.message);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Format error messages & handle 401
api.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    let message = 'An unexpected error occurred. Please try again.';

    if (error.response) {
      if (error.response.status === 401) {
        console.warn('[API Interceptor] 401 Unauthorized - Token may be expired');
      }
      message = error.response.data?.message || `Server error (${error.response.status})`;
    } else if (error.request) {
      message = 'Cannot connect to BhojanSeva server. Please check your network connection.';
    } else {
      message = error.message;
    }

    const customError = new Error(message);
    customError.response = error.response;
    customError.statusCode = error.response?.status;
    return Promise.reject(customError);
  }
);

export default api;
