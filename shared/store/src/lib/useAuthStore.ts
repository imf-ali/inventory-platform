import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi, apiClient } from '@inventory-platform/api';
import type { User, LoginDto, SignupDto } from '@inventory-platform/api';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginDto) => Promise<void>;
  signup: (data: SignupDto) => Promise<void>;
  logout: () => Promise<void>;
  fetchCurrentUser: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (credentials: LoginDto) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.login(credentials);
          // Token is already set by authApi.login via apiClient.setToken
          set({
            user: response.user,
            token: response.accessToken,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
          const errorMessage = error?.message || 'Login failed';
          set({
            isLoading: false,
            error: errorMessage,
            isAuthenticated: false,
          });
          throw error;
        }
      },

      signup: async (data: SignupDto) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.signup(data);
          // Token is already set by authApi.signup via apiClient.setToken
          set({
            user: response.user,
            token: response.accessToken,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
          const errorMessage = error?.message || 'Signup failed';
          set({
            isLoading: false,
            error: errorMessage,
            isAuthenticated: false,
          });
          throw error;
        }
      },

      logout: async () => {
        set({ isLoading: true });
        try {
          const state = get();
          if (state.user?.userId && state.token) {
            await authApi.logout({
              userId: state.user.userId,
              accessToken: state.token,
            });
          }
        } catch {
          // Continue with logout even if API call fails
        } finally {
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        }
      },

      fetchCurrentUser: async () => {
        set({ isLoading: true });
        try {
          const user = await authApi.getCurrentUser();
          const state = get();
          // Ensure API client has the token from store
          if (state.token) {
            apiClient.setToken(state.token);
          }
          set({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
          const errorMessage = error?.message || 'Failed to fetch user';
          set({
            isLoading: false,
            error: errorMessage,
            isAuthenticated: false,
            user: null,
            token: null,
          });
          apiClient.setToken(null);
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        // Sync API client token when store is rehydrated from localStorage
        if (state?.token) {
          apiClient.setToken(state.token);
        }
      },
    }
  )
);

