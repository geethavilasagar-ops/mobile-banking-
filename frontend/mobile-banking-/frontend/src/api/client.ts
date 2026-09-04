import axios from 'axios';
import { Platform } from 'react-native';

// On Android emulator, localhost is 10.0.2.2
// On physical device, use your machine's local IP address
const BASE_URL = 'http://192.168.1.47:5000/api';

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Bypass-Tunnel-Reminder': 'true',
  },
});

// Request interceptor — attach auth token if present
apiClient.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — normalize errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || 'Network error. Please try again.';
    return Promise.reject(new Error(message));
  }
);

export const setAuthToken = (token: string | null) => {
  if (token) {
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common['Authorization'];
  }
};

export default apiClient;
