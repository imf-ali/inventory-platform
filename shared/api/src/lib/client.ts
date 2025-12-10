// API Client configuration
import axios, { AxiosInstance, AxiosError } from 'axios';
import { EventSourcePolyfill } from 'event-source-polyfill';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

// Log API base URL in development
if (import.meta.env.DEV) {
  console.log('API Base URL:', API_BASE_URL);
}

class ApiClient {
  private axiosInstance: AxiosInstance;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.axiosInstance = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Load token from localStorage if available
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token');
      if (this.token) {
        this.axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${this.token}`;
      }
    }

    // Request interceptor to add token
    this.axiosInstance.interceptors.request.use(
      (config) => {
        // Always get the latest token from localStorage in case it was updated
        const currentToken = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : this.token;
        if (currentToken) {
          this.token = currentToken;
          config.headers.Authorization = `Bearer ${currentToken}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response) {
          // Server responded with error status
          const errorData = error.response.data as {
            message?: string;
            error?: string;
            data?: { message?: string };
            errors?: Record<string, string[]>
          };
          // Extract error message from various possible locations
          const errorMessage =
            errorData?.data?.message ||
            errorData?.error ||
            errorData?.message ||
            error.response.statusText;
          const apiError = new Error(errorMessage) as Error & {
            status?: number;
            errors?: Record<string, string[]>;
          };
          apiError.status = error.response.status;
          apiError.errors = errorData?.errors;
          throw apiError;
        } else if (error.request) {
          // Request made but no response received
          const networkError = new Error('Network error. Please check your connection.') as Error & {
            status?: number;
          };
          networkError.status = 0;
          throw networkError;
        } else {
          // Something else happened
          throw new Error(error.message || 'An unexpected error occurred');
        }
      }
    );
  }

  setToken(token: string | null) {
    this.token = token;
    if (token && typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
      this.axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
      }
      delete this.axiosInstance.defaults.headers.common['Authorization'];
    }
  }

  async get<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
    try {
      if (import.meta.env.DEV) {
        console.log('API GET:', `${this.axiosInstance.defaults.baseURL}${endpoint}`, params);
      }
      const response = await this.axiosInstance.get<T>(endpoint, { params });
      if (import.meta.env.DEV) {
        console.log('API GET Response:', endpoint, response.data);
      }
      return response.data;
    } catch (error) {
      console.error('API GET Error:', endpoint, error);
      throw error;
    }
  }

  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    try {
      if (import.meta.env.DEV) {
        console.log('API POST:', `${this.axiosInstance.defaults.baseURL}${endpoint}`, data);
      }
      const response = await this.axiosInstance.post<T>(endpoint, data);
      if (import.meta.env.DEV) {
        console.log('API POST Response:', endpoint, response.data);
      }
      return response.data;
    } catch (error) {
      console.error('API POST Error:', endpoint, error);
      throw error;
    }
  }

  async put<T>(endpoint: string, data?: unknown): Promise<T> {
    const response = await this.axiosInstance.put<T>(endpoint, data);
    return response.data;
  }

  async patch<T>(endpoint: string, data?: unknown): Promise<T> {
    const response = await this.axiosInstance.patch<T>(endpoint, data);
    return response.data;
  }

  async delete<T>(endpoint: string): Promise<T> {
    const response = await this.axiosInstance.delete<T>(endpoint);
    return response.data;
  }
}

export const apiClient = new ApiClient(API_BASE_URL);

/**
 * Create an SSE connection with Authorization header.
 * Backend stays unchanged and still reads Authorization as usual.
 */
export function createSseConnection(path: string): EventSource {
  const base = API_BASE_URL.replace(/\/$/, ''); // strip trailing slash
  const token =
    typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;

  const url = `${base}${path}`;

  if (token) {
    // EventSourcePolyfill supports headers
    return new EventSourcePolyfill(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      withCredentials: false,
    }) as unknown as EventSource;
  }

  // Fallback: no token → plain EventSource (will likely 401, but that's fine)
  return new EventSource(url);
}