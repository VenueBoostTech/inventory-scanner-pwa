import axios, { AxiosInstance, AxiosError } from 'axios';
import { authStore } from '@/stores/authStore';

const OMNI_GATEWAY_URL = import.meta.env.VITE_OMNI_GATEWAY_URL || 'https://apigtw.omnistackhub.xyz/';
const API_BASE_URL = `${OMNI_GATEWAY_URL}inventory-app`;
const OMNI_GATEWAY_API_KEY = import.meta.env.VITE_OMNI_GATEWAY_API_KEY || 'gwy_3kjg9KdJ37sdL4hF8Tk2sXnY5LzW8Rv';

// Token refresh threshold (5 minutes before expiry)
const TOKEN_REFRESH_THRESHOLD = 5 * 60 * 1000;

/**
 * Creates an API client instance with authentication headers
 */
function createApiClient(): AxiosInstance {
  const client = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': OMNI_GATEWAY_API_KEY,
    },
  });

  // Request interceptor - add auth token
  client.interceptors.request.use(
    async (config) => {
      const state = authStore.getState();
      
      // Check if token needs refresh
      if (state.tokenExpiresAt) {
        const timeUntilExpiry = state.tokenExpiresAt - Date.now();
        if (timeUntilExpiry < TOKEN_REFRESH_THRESHOLD && state.refreshToken) {
          try {
            await refreshAccessToken();
          } catch (error) {
            // If refresh fails, logout
            authStore.getState().logout();
            return Promise.reject(error);
          }
        }
      }

      // Add access token to request
      if (state.accessToken) {
        config.headers.Authorization = `Bearer ${state.accessToken}`;
      }

      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor - handle 401 and refresh token
  client.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as any;

      // If 401 and not already retried, try to refresh token
      if (error.response?.status === 401 && !originalRequest?._retry) {
        originalRequest._retry = true;

        try {
          const refreshToken = authStore.getState().refreshToken;
          if (!refreshToken) {
            authStore.getState().logout();
            return Promise.reject(error);
          }

          // Refresh the token
          await refreshAccessToken();

          // Retry original request with new token
          const newToken = authStore.getState().accessToken;
          if (newToken) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return client(originalRequest);
          }
        } catch (refreshError) {
          // Refresh failed, logout user
          authStore.getState().logout();
          return Promise.reject(refreshError);
        }
      }

      return Promise.reject(error);
    }
  );

  return client;
}

/**
 * Refreshes the access token using the refresh token
 */
async function refreshAccessToken(): Promise<void> {
  const refreshToken = authStore.getState().refreshToken;
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  try {
    const response = await axios.post<{
      accessToken: string;
      expiresIn: number;
    }>(
      `${API_BASE_URL}/auth/refresh`,
      { refreshToken },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': OMNI_GATEWAY_API_KEY,
        },
      }
    );

    const { accessToken, expiresIn } = response.data;
    const expiresAt = Date.now() + (expiresIn * 1000);

    authStore.getState().setTokens(accessToken, refreshToken, expiresAt);
  } catch (error) {
    // Refresh failed, clear tokens
    authStore.getState().logout();
    throw error;
  }
}

// Export the API client instance
export const apiClient = createApiClient();

// Export refresh function for manual use if needed
export { refreshAccessToken };
