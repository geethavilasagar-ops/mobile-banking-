import axios from 'axios';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

const getHostIp = (): string => {
  if (Platform.OS === 'web') {
    return 'localhost';
  }

  // Extract Metro Bundler host IP dynamically from Expo Constants
  const hostUri =
    Constants.expoConfig?.hostUri ||
    (Constants.manifest as any)?.debuggerHost ||
    (Constants.manifest2 as any)?.extra?.expoGo?.developer?.manifest?.debuggerHost;

  if (hostUri) {
    const ip = hostUri.split(':')[0];
    if (ip && ip !== 'localhost' && ip !== '127.0.0.1') {
      return ip;
    }
  }

  // Fallback for Android Emulator or LAN default
  return Platform.OS === 'android' ? '10.0.2.2' : '192.168.1.21';
};

const BASE_URL = `http://${getHostIp()}:5000/api`;

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
    let message = 'Network error. Please try again.';
    
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      if (error.response.status === 401) {
        message = 'Session expired. Please log in again.';
        // We could dispatch a logout action here if connected to store
      } else {
        message = error.response.data?.message || `Server error (${error.response.status})`;
      }
    } else if (error.request) {
      // The request was made but no response was received
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        message = 'Request timed out. Please check your internet connection.';
      } else {
        message = 'Could not connect to the server.';
      }
    } else {
      // Something happened in setting up the request that triggered an Error
      message = error.message;
    }

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
