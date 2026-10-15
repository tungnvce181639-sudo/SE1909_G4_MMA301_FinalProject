import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Base API URL from environment variable or fallback to localhost
const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api';

export const TOKEN_STORAGE_KEY = 'userToken';
export const USER_DATA_KEY = 'userData';

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach bearer token to authenticated requests
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem(TOKEN_STORAGE_KEY);
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.warn('[apiClient] Error retrieving auth token from storage:', error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for consistent response data handling and error parsing
apiClient.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const errorResponse = error.response?.data;
    const errorMessage = errorResponse?.message || error.message || 'Network request failed';

    // 401 Unauthorized handling: clear expired token
    if (error.response?.status === 401) {
      try {
        await AsyncStorage.multiRemove([TOKEN_STORAGE_KEY, USER_DATA_KEY]);
      } catch (storageError) {
        console.warn('[apiClient] Error removing token on 401:', storageError);
      }
    }

    return Promise.reject({
      statusCode: error.response?.status || 500,
      message: errorMessage,
      data: errorResponse,
      originalError: error,
    });
  }
);

export default apiClient;
